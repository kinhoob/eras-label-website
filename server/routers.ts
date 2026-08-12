import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import {
  getAdminSummary,
  getProductWithVariations,
  listNewsletterSubscribers,
  listProducts,
  saveProductData,
  subscribeToNewsletter,
  validateCoupon,
  getCommercialConfig,
  saveCommercialConfig,
} from "./db";

const newsletterInput = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email().max(320),
});

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
    subscribe: publicProcedure.input(newsletterInput).mutation(({ input }) => subscribeToNewsletter(input.name, input.email)),
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
      items: z.array(z.object({ productId: z.number(), size: z.string(), quantity: z.number().int().positive(), price: z.number().nonnegative() })).min(1),
      subtotal: z.number().nonnegative(),
      shippingCost: z.number().nonnegative(),
      discount: z.number().nonnegative(),
      total: z.number().nonnegative(),
      paymentMethod: z.enum(["pix", "credit_card"]).default("pix"),
    })).mutation(({ input }) => ({
      success: true,
      orderNumber: `ER-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
      paymentStatus: "pending",
      message: "Pedido criado. O processamento do pagamento será iniciado pelo provedor configurado.",
      ...input,
    })),
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
  }),
});

export type AppRouter = typeof appRouter;
