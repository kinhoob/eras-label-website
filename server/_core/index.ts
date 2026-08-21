import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { getMercadoPagoPayment } from "../mercadopago";
import { getDb, updateOrderPaymentStatus } from "../db";
import { orders } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { registerSitemapRoutes } from "../sitemap";
import { verifyMercadoPagoSignature } from "../mercadopago.signature";
import { ENV } from "./env";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  registerSitemapRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Webhook endpoint para notificações e validação do Melhor Envio com sincronização de status e rastreio
  app.post("/api/melhor-envio/webhook", async (req, res) => {
    try {
      const event = req.body as Record<string, any>;
      console.log("[Melhor Envio Webhook] Evento recebido:", JSON.stringify(event));

      const trackingCode = event?.tracking || event?.protocol || event?.id;
      const statusEvent = String(event?.status || event?.event || "").toLowerCase();

      if (trackingCode) {
        const db = await getDb();
        if (db) {
          const matchingOrders = await db.select().from(orders).where(eq(orders.shippingMethod, String(trackingCode))).limit(1);
          if (matchingOrders.length > 0) {
            const order = matchingOrders[0];
            let newFulfillment = order.fulfillmentStatus;
            let newStatus = order.status;

            if (statusEvent.includes("posted") || statusEvent.includes("shipped") || statusEvent.includes("enviado")) {
              newFulfillment = "shipped";
              newStatus = "Enviado";
            } else if (statusEvent.includes("delivered") || statusEvent.includes("entregue")) {
              newFulfillment = "shipped";
              newStatus = "Entregue";
            }

            await db.update(orders).set({
              fulfillmentStatus: newFulfillment,
              status: newStatus,
            }).where(eq(orders.id, order.id));
            console.log(`[Melhor Envio Webhook] Pedido #${order.orderNumber} atualizado via webhook para ${newStatus}`);
          }
        }
      }

      res.status(200).json({ received: true, status: "success" });
    } catch (err) {
      console.error("[Melhor Envio Webhook] Erro ao processar evento:", err);
      res.status(200).json({ received: true });
    }
  });

  // Webhook endpoint para notificações de pagamento do Mercado Pago.
  app.post("/api/mercadopago/webhook", async (req, res) => {
    try {
      const event = req.body as Record<string, any>;
      const paymentId = event?.data?.id ?? event?.id;

      // Validação de autenticidade: só processamos notificações assinadas pelo
      // Mercado Pago (HMAC-SHA256 com a chave secreta do webhook).
      const signatureResult = verifyMercadoPagoSignature({
        signatureHeader: req.header("x-signature"),
        requestId: req.header("x-request-id"),
        // O manifesto usa o data.id enviado na query string quando presente.
        dataId: String((req.query["data.id"] as string | undefined) ?? paymentId ?? ""),
        secret: ENV.mpWebhookSecret,
      });
      if (!signatureResult.valid) {
        console.warn(`[MercadoPago Webhook] Notificação rejeitada: ${signatureResult.reason}`);
        res.status(401).json({ received: false, error: "invalid_signature" });
        return;
      }

      if (!paymentId) {
        res.status(200).json({ received: true, ignored: true });
        return;
      }

      const payment = await getMercadoPagoPayment(paymentId);
      const paymentStatus = String(payment?.status ?? event?.status ?? "pending");
      const paymentDetail = payment?.status_detail ? `${paymentStatus}: ${String(payment.status_detail)}` : null;
      const orderNumber = payment?.external_reference ?? event?.external_reference;
      if (orderNumber) {
        const updated = await updateOrderPaymentStatus(String(orderNumber), paymentStatus, paymentDetail, paymentId);
        console.log(`[MercadoPago Webhook] Pedido ${orderNumber} sincronizado: ${paymentStatus}${updated ? "" : " (sem registo local)"}`);
      } else {
        console.warn(`[MercadoPago Webhook] Pagamento ${paymentId} sem external_reference.`);
      }

      res.status(200).json({ received: true });
    } catch (err: any) {
      console.error("[MercadoPago Webhook] Erro ao processar webhook:", err);
      // O Mercado Pago pode reenviar eventos; 200 evita uma tempestade de retries
      // quando a consulta externa estiver temporariamente indisponível.
      res.status(200).json({ received: true, processed: false });
    }
  });
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
