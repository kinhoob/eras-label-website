import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { ADMIN_DISPLAY_NAME, getAdminOpenId, validateAdminCredentials } from "./admin-auth";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import {
  getAdminSummary,
  getAdminProducts,
  duplicateProductData,
  getProductWithVariations,
  listNewsletterSubscribers,
  getNewsletterSubscriber,
  listProducts,
  getAdminAnalytics,
  listInventoryAuditLogs,
  logInventoryAudit,
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
  listClients,
  listMarketingCollections,
  listCollectionMarketingRecipients,
  listAdminCategories,
  listPublicCategories,
  saveCategoryData,
  archiveCategory,
  updateInventoryStock,
  listOrders,
  updateOrderTracking,
  upsertUser,
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
    adminLogin: publicProcedure
      .input(z.object({
        email: z.string().email().max(320),
        password: z.string().min(1).max(200),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!validateAdminCredentials(input.email, input.password)) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Credenciais administrativas inválidas." });
        }

        const adminEmail = ENV.adminLoginEmail.trim().toLowerCase();
        const openId = getAdminOpenId(adminEmail);
        await upsertUser({
          openId,
          name: ADMIN_DISPLAY_NAME,
          email: adminEmail,
          loginMethod: "admin-password",
          role: "admin",
          lastSignedIn: new Date(),
        });

        const sessionToken = await sdk.createSessionToken(openId, {
          name: ADMIN_DISPLAY_NAME,
          expiresInMs: ONE_YEAR_MS,
        });
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...getSessionCookieOptions(ctx.req),
          maxAge: ONE_YEAR_MS,
        });

        return {
          success: true as const,
          user: {
            email: adminEmail,
            name: ADMIN_DISPLAY_NAME,
            role: "admin" as const,
          },
        };
      }),
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
    categories: publicProcedure.query(() => listPublicCategories()),
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
    listCategories: adminProcedure.query(() => listAdminCategories()),
    saveCategory: adminProcedure.input(z.object({
      id: z.number().int().positive().optional(),
      name: z.string().trim().min(2).max(100),
      description: z.string().max(500).optional(),
      parentId: z.number().int().positive().nullable().optional(),
      coverImageUrl: z.string().trim().max(1000).nullable().optional(),
      active: z.number().int().min(0).max(1).default(1),
      sortOrder: z.number().int().min(0).max(10000).default(0),
    })).mutation(async ({ input }) => {
      const category = await saveCategoryData(input);
      return { success: true, category };
    }),
    archiveCategory: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      return archiveCategory(input.id);
    }),
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
      subcategory: z.string().trim().max(100).nullable().optional(),
      sku: z.string().trim().max(100).nullable().optional(),
      price: z.number().positive(),
      pixPrice: z.number().positive(),
      description: z.string(),
      images: z.array(z.string()),
      status: z.enum(["Publicado", "Rascunho", "Esgotado"]),
      variations: z.array(z.object({
        size: z.string().trim().min(1).max(20),
        stock: z.number().int().min(0).max(100000),
      })).max(20).optional(),
    })).mutation(async ({ input }) => {
      const saved = await saveProductData(input);
      return {
        success: true,
        message: input.id ? "Produto atualizado com sucesso!" : "Produto criado com sucesso!",
        product: saved,
      };
    }),
    updateInventoryStock: adminProcedure.input(z.object({
      productId: z.number().int().positive(),
      variations: z.array(z.object({
        size: z.string().trim().min(1).max(20),
        stock: z.number().int().min(0).max(100000),
      })).max(20),
    })).mutation(async ({ input, ctx }) => {
      // Registrar log de auditoria para cada variação atualizada
      try {
        const prod = await getProductWithVariations(input.productId);
        if (prod) {
          for (const newVar of input.variations) {
            const existingVar = prod.variations.find((v) => v.size === newVar.size);
            const prevStock = existingVar ? existingVar.stock : 0;
            if (prevStock !== newVar.stock) {
              await logInventoryAudit({
                productId: input.productId,
                productName: prod.name,
                size: newVar.size,
                previousStock: prevStock,
                newStock: newVar.stock,
                adminEmail: ctx.user?.email || "theeraslabel@gmail.com",
                adminName: ctx.user?.name || "Administrador",
              });
            }
          }
        }
      } catch (err) {
        console.warn("[Audit] Failed to log inventory change:", err);
      }
      return updateInventoryStock(input);
    }),
    duplicateProduct: adminProcedure.input(z.object({ productId: z.number().int().positive() })).mutation(async ({ input }) => {
      const product = await duplicateProductData(input.productId);
      return { success: true, message: "Produto duplicado com sucesso!", product };
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
    listClients: adminProcedure.query(async () => {
      return listClients();
    }),
    getAnalytics: adminProcedure.query(async () => {
      return getAdminAnalytics();
    }),
    listInventoryAudit: adminProcedure.query(async () => {
      return listInventoryAuditLogs();
    }),
    listMarketingCollections: adminProcedure.query(async () => {
      return listMarketingCollections();
    }),
    listOrders: adminProcedure.query(async () => {
      return listOrders();
    }),
    updateOrderTracking: adminProcedure.input(z.object({
      orderId: z.number().int().positive(),
      trackingCode: z.string().min(3),
      carrier: z.string().optional(),
      customerEmail: z.string().email(),
      customerName: z.string().min(2),
      orderNumber: z.string(),
    })).mutation(async ({ input }) => {
      await updateOrderTracking(input.orderId, input.trackingCode, input.carrier);
      try {
        const { orderTrackingEmail } = await import("./email-templates");
        const tpl = orderTrackingEmail(input.orderNumber, input.customerName, input.trackingCode, input.carrier);
        await sendResendEmail({
          to: input.customerEmail,
          replyTo: ENV.resendAdminEmail || undefined,
          ...tpl,
        }, "order_tracking");
      } catch (err) {
        console.warn("Failed to send tracking email:", err);
      }
      return { success: true };
    }),
    sendMarketingCampaign: adminProcedure.input(z.object({
      subject: z.string().min(3),
      htmlContent: z.string().min(10),
      targetGroup: z.enum(["all_subscribers", "all_clients", "all", "collection"]).default("all_subscribers"),
      collection: z.string().trim().min(1).max(100).optional(),
    })).mutation(async ({ input }) => {
      const subscribers = await listNewsletterSubscribers();
      const clients = await listClients();
      
      const recipientSet = new Set<string>();
      if (input.targetGroup === "collection") {
        if (!input.collection) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Selecione uma coleção para segmentar a campanha." });
        }
        for (const recipient of await listCollectionMarketingRecipients(input.collection)) {
          if (recipient.email) recipientSet.add(recipient.email);
        }
      }
      if (input.targetGroup === "all_subscribers" || input.targetGroup === "all") {
        for (const s of subscribers) if (s.email) recipientSet.add(s.email);
      }
      if (input.targetGroup === "all_clients" || input.targetGroup === "all") {
        for (const c of clients) if (c.email) recipientSet.add(c.email);
      }

      const recipients = Array.from(recipientSet);
      let sentCount = 0;
      let failedCount = 0;

      const brandedHtml = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${input.subject}</title></head><body style="margin:0;background:#0d0d0d;color:#1b1b1b;font-family:Arial,sans-serif"><main style="max-width:640px;margin:0 auto;padding:32px 16px"><section style="background:#ffffff;border-radius:6px;overflow:hidden;border:1px solid #e5e5e5"><header style="padding:32px 36px;background:#0d0d0d;color:#ffffff;border-bottom:3px solid #b22222"><p style="margin:0;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#b22222;font-weight:700">Eras Label · Campanha</p><h1 style="margin:16px 0 0;font-size:24px;font-weight:600;color:#ffffff">${input.subject}</h1></header><div style="padding:36px;background:#ffffff">${input.htmlContent}</div><footer style="padding:24px 36px;background:#f9f9f9;border-top:1px solid #eeeeee;color:#666666;font-size:12px">Reviver ou reinventar eras. Você recebeu esta mensagem porque se inscreveu na Eras Label.</footer></section></main></body></html>`;

      for (const email of recipients) {
        try {
          const res = await sendResendEmail({
            to: email,
            subject: input.subject,
            html: brandedHtml,
            text: input.htmlContent.replace(/<[^>]*>?/gm, ""),
          }, "marketing_campaign");
          if (res.sent) sentCount++;
          else failedCount++;
        } catch {
          failedCount++;
        }
      }

      return { success: true, sentCount, failedCount, totalRecipients: recipients.length };
    }),
  }),
});

export type AppRouter = typeof appRouter;
