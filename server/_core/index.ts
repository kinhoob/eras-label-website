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
import { resolveMelhorEnvioWebhookUpdate } from "../melhor-envio-webhook";

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
  if (process.env.NODE_ENV === "production") {
    if (!process.env.MP_ACCESS_TOKEN?.trim() || !process.env.MP_PUBLIC_KEY?.trim()) {
      console.error("[FATAL] Credenciais do Mercado Pago ausentes em produção. Abortando inicialização.");
      process.exit(1);
    }
  }

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

  // Webhook unificado e robusto do Melhor Envio já posicionado abaixo

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

  app.post("/api/melhor-envio/webhook", async (req, res) => {
    try {
      const event = req.body as Record<string, any>;
      console.log("[Melhor Envio Webhook] Evento:", JSON.stringify(event).slice(0, 800));

      const { trackingCode, shippingOrderId, newStatus, newFulfillment } = resolveMelhorEnvioWebhookUpdate(event);

      if (trackingCode || shippingOrderId) {
        const db = await getDb();
        if (db) {
          const conditions: any[] = [];
          if (trackingCode) conditions.push(eq(orders.trackingCode, String(trackingCode)));
          if (shippingOrderId) conditions.push(eq(orders.shippingOrderId, String(shippingOrderId)));

          const matchingOrders = conditions.length
            ? await db.select().from(orders).where(or(...conditions)).limit(10)
            : [];

          for (const order of matchingOrders) {
            const updatePayload: Record<string, string> = {};
            if (trackingCode) updatePayload.trackingCode = String(trackingCode);
            if (newStatus) updatePayload.status = newStatus;
            if (newFulfillment) updatePayload.fulfillmentStatus = newFulfillment;

            if (Object.keys(updatePayload).length > 0) {
              await db.update(orders).set(updatePayload).where(eq(orders.id, order.id));
              console.log(`[Melhor Envio Webhook] Pedido ${order.orderNumber} → ${newStatus || "atualizado"}`);

              try {
                const { createNotification } = await import("../db");
                await createNotification({
                  targetRole: "admin",
                  title: `Envio atualizado — ${order.orderNumber}`,
                  message: `Status: ${newStatus || "atualizado"}${trackingCode ? ` | Rastreio: ${trackingCode}` : ""}`,
                  type: "shipping_update",
                });
              } catch (error) {
                console.warn("[Melhor Envio Webhook] Notificação falhou:", error);
              }
            }
          }
        }
      }

      res.status(200).json({ received: true, status: "success" });
    } catch (err) {
      console.error("[Melhor Envio Webhook] Erro:", err);
      res.status(200).json({ received: true });
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
