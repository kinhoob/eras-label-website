import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import {
  getAdminSummary,
  getAdminProducts,
  getProductWithVariations,
  listNewsletterSubscribers,
  getNewsletterSubscriber,
  listProducts,
  saveProductData,
  subscribeToNewsletter,
  validateCoupon,
  getCommercialConfig,
  saveCommercialConfig,
  getHomeContent,
  saveHomeContent,
  listNotifications,
  createNotification,
  markNotificationAsRead,
  listResendEmailLogs,
} from "./db";
import { adminOrderEmail, newsletterWelcomeEmail, orderConfirmationEmail, paymentConfirmationEmail } from "./email-templates";
import { ENV } from "./_core/env";
import { sendResendEmail } from "./resend";

const newsletterInput = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email().max(320),
});

export function isValidImageUrl(value: string) {
  if (value.startsWith("/manus-storage/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const imageUrlInput = z.string().refine(isValidImageUrl, "Informe uma URL de imagem válida ou um upload interno do armazenamento.");

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  catalog: router({
    list: publicProcedure.input(z.object({ category: z.string().optional() }).optional()).query(({ input }) => listProducts(input?.category)),
    getById: publicProcedure.input(z.object({ id: z.number().int().positive() })).query(({ input }) => getProductWithVariations(input.id)),
    getConfig: publicProcedure.query(() => getCommercialConfig()),
    getHomeContent: publicProcedure.query(() => getHomeContent()),
    calculateShipping: publicProcedure.input(z.object({
      cep: z.string().min(8),
      subtotal: z.number().nonnegative(),
    })).query(async ({ input }) => {
      const config = await getCommercialConfig();
      const cleanCep = input.cep.replace(/\D/g, "");
      if (cleanCep.length !== 8) {
        throw new Error("CEP inválido");
      }
      // Frete grátis se subtotal >= freeShippingThreshold
      if (input.subtotal >= config.freeShippingThreshold) {
        return { cost: 0, service: "Frete Grátis Eras", deadline: "3 a 6 dias úteis", free: true };
      }
      // Região simulada por CEP (ex: Sudeste mais barato, Norte/Nordeste proporcional)
      const firstDigit = cleanCep.charAt(0);
      let baseCost = 25.0;
      if (["0", "1", "2"].includes(firstDigit)) baseCost = 20.0; // SP/RJ/ES
      else if (["3", "4"].includes(firstDigit)) baseCost = 25.0; // MG/BA/SE
      else if (["5", "6", "7"].includes(firstDigit)) baseCost = 32.0; // NE/N
      else baseCost = 28.0; // Sul/CO

      return { cost: baseCost, service: "SEDEX / PAC Expresso", deadline: "4 a 8 dias úteis", free: false };
    }),
  }),
  newsletter: router({
    subscribe: publicProcedure.input(newsletterInput).mutation(async ({ input }) => {
      const existing = await getNewsletterSubscriber(input.email);
      const subscriber = await subscribeToNewsletter(input.name, input.email);

      if (!existing && subscriber.couponCode) {
        try {
          const template = newsletterWelcomeEmail(subscriber.name ?? input.name, subscriber.couponCode);
          await sendResendEmail({
            to: subscriber.email,
            replyTo: ENV.resendAdminEmail || undefined,
            ...template,
          });
        } catch (error) {
          console.warn("Newsletter welcome email failed:", error instanceof Error ? error.message : "unknown error");
        }
      }

      return subscriber;
    }),
    list: adminProcedure.query(() => listNewsletterSubscribers()),
  }),
  coupons: router({
    validate: publicProcedure.input(z.object({ code: z.string().min(2), subtotal: z.number().nonnegative() })).query(({ input }) => validateCoupon(input.code, input.subtotal)),
  }),
  checkout: router({
    create: publicProcedure.input(z.object({
      customerName: z.string().min(2),
      customerEmail: z.string().email(),
      customerCpf: z.string().min(11),
      phone: z.string().min(8),
      address: z.record(z.string(), z.string()),
      items: z.array(z.object({ productId: z.number(), name: z.string().max(255).optional(), size: z.string(), quantity: z.number().int().positive(), price: z.number().nonnegative() })).min(1),
      subtotal: z.number().nonnegative(),
      shippingCost: z.number().nonnegative(),
      discount: z.number().nonnegative(),
      total: z.number().nonnegative(),
      paymentMethod: z.enum(["pix", "credit_card"]).default("pix"),
    })).mutation(async ({ input, ctx }) => {
      const orderNumber = `ER-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;
      
      // Disparar notificação estilo Nuvemshop para o Administrador
      try {
        await createNotification({
          targetRole: "admin",
          title: "Novo Pedido Realizado! 🛍️",
          message: `O cliente ${input.customerName} fez o pedido ${orderNumber} no valor de R$ ${input.total.toFixed(2)} via ${input.paymentMethod === "pix" ? "PIX" : "Cartão"}.`,
          type: "new_order",
        });

        // Simular notificação de pagamento confirmado (em ambiente real viria do webhook do gateway)
        await createNotification({
          targetRole: "admin",
          title: "Pagamento Confirmado! 💳",
          message: `O pagamento do pedido ${orderNumber} (R$ ${input.total.toFixed(2)}) foi aprovado com sucesso.`,
          type: "payment_confirmed",
        });

        if (ctx.user) {
          await createNotification({
            userId: ctx.user.id,
            targetRole: "customer",
            title: "Pedido Realizado com Sucesso!",
            message: `Recebemos o seu pedido ${orderNumber} no valor de R$ ${input.total.toFixed(2)}. Acompanhe o status na sua conta.`,
            type: "new_order",
          });
        }
      } catch (err) {
        console.warn("Failed to create automatic notification:", err);
      }

      const emailOrder = {
        ...input,
        orderNumber,
        items: input.items.map(item => ({
          ...item,
          name: item.name ?? `Produto #${item.productId}`,
        })),
      };
      const emailJobs = [
        sendResendEmail({ to: input.customerEmail, ...orderConfirmationEmail(emailOrder) }),
        sendResendEmail({ to: input.customerEmail, ...paymentConfirmationEmail(emailOrder) }),
        ...(ENV.resendAdminEmail ? [sendResendEmail({ to: ENV.resendAdminEmail, ...adminOrderEmail(emailOrder) })] : []),
      ];
      const emailResults = await Promise.allSettled(emailJobs);
      const failedEmails = emailResults.filter(result => result.status === "rejected");
      if (failedEmails.length > 0) {
        console.warn(`Resend could not deliver ${failedEmails.length} email(s) for order ${orderNumber}.`);
      }

      return {
        success: true,
        orderNumber,
        paymentStatus: "approved",
        message: "Pedido criado e pagamento confirmado com sucesso! Notificações enviadas.",
        ...input,
      };
    }),
  }),
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return listNotifications(ctx.user.id, ctx.user.role);
    }),
    markAsRead: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await markNotificationAsRead(input.id);
      return { success: true };
    }),
  }),
  orders: router({
    myOrders: protectedProcedure.query(async ({ ctx }) => {
      // Retorna histórico de pedidos do usuário autenticado ou mock estendido para demonstração
      return [
        {
          id: 1,
          orderNumber: "ER-2026-8419",
          createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 dias atrás
          status: "Enviado",
          trackingCode: "BR982734120BR",
          shippingService: "SEDEX",
          paymentMethod: "pix",
          subtotal: 390.0,
          discount: 39.0,
          shippingCost: 0.0,
          total: 351.0,
          items: [
            { id: 1, name: "Camiseta Oversized Lost Between Eras", size: "G", quantity: 1, price: 195.0, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85" },
            { id: 2, name: "Moletom Heavyweight Vintage Wash", size: "G", quantity: 1, price: 195.0, image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85" }
          ],
          address: { street: "Av. Paulista, 1000", number: "Apto 42", neighborhood: "Bela Vista", city: "São Paulo", state: "SP", cep: "01310100" }
        },
        {
          id: 2,
          orderNumber: "ER-2026-9102",
          createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7, // 7 dias atrás
          status: "Entregue",
          trackingCode: "BR129384756BR",
          shippingService: "PAC",
          paymentMethod: "credit_card",
          subtotal: 185.0,
          discount: 0.0,
          shippingCost: 25.0,
          total: 210.0,
          items: [
            { id: 4, name: "Boné Classic Eras Dad Hat", size: "Único", quantity: 1, price: 185.0, image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1200&q=85" }
          ],
          address: { street: "Rua do Imperador, 200", number: "Casa", neighborhood: "Recife Antigo", city: "Recife", state: "PE", cep: "50030230" }
        }
      ];
    }),
  }),
  admin: router({
    summary: adminProcedure.query(() => getAdminSummary()),
    listProducts: adminProcedure.query(() => getAdminProducts()),
    canAccess: protectedProcedure.query(({ ctx }) => ({ isAdmin: ctx.user.role === "admin" })),
    uploadImage: adminProcedure.input(z.object({
      fileName: z.string(),
      fileBase64: z.string(),
      contentType: z.string().default("image/png"),
    })).mutation(async ({ input }) => {
      const buffer = Buffer.from(input.fileBase64.replace(/^data:.*;base64,/, ""), "base64");
      const ext = input.fileName.split(".").pop() || "png";
      const relKey = `admin-uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const result = await storagePut(relKey, buffer, input.contentType);
      return result;
    }),
    saveProduct: adminProcedure.input(z.object({
      id: z.number().optional(),
      name: z.string().min(2),
      collection: z.string(),
      category: z.string(),
      price: z.number().positive(),
      pixPrice: z.number().positive(),
      description: z.string(),
      images: z.array(z.string()),
      status: z.enum(["Publicado", "Rascunho", "Esgotado"]),
    })).mutation(async ({ input }) => {
      const saved = await saveProductData(input);
      return {
        success: true,
        message: input.id ? "Produto atualizado com sucesso!" : "Produto criado com sucesso!",
        product: saved,
      };
    }),
    saveConfig: adminProcedure.input(z.object({
      pixDiscountPercent: z.number().min(0).max(100),
      freeShippingThreshold: z.number().nonnegative(),
    })).mutation(async ({ input }) => {
      const saved = await saveCommercialConfig(input);
      return { success: true, config: saved };
    }),
    saveHomeContent: adminProcedure.input(z.object({
      banners: z.array(z.object({
        id: z.string().min(1),
        eyebrow: z.string(),
        title: z.string(),
        subtitle: z.string(),
        imageUrl: imageUrlInput,
        href: z.string().min(1),
        cta: z.string(),
      })).min(1).max(6),
      highlights: z.array(z.object({
        id: z.string().min(1),
        productId: z.number().int().positive(),
        label: z.string().min(1).max(40),
      })).min(1).max(6),
      vipBanner: z.object({
        eyebrow: z.string(),
        title: z.string(),
        subtitle: z.string(),
        imageUrl: imageUrlInput,
        href: z.string().min(1),
        cta: z.string(),
      }),
    })).mutation(async ({ input }) => {
      const saved = await saveHomeContent(input);
      return { success: true, content: saved };
    }),
    listEmailLogs: adminProcedure.input(z.object({
      search: z.string().optional(),
      status: z.string().optional(),
      templateType: z.string().optional(),
      sort: z.enum(["newest", "oldest"]).optional(),
    }).optional()).query(async ({ input }) => {
      return listResendEmailLogs(input);
    }),
  }),
});

export type AppRouter = typeof appRouter;
