import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  getAdminSummary,
  getProductWithVariations,
  listNewsletterSubscribers,
  listProducts,
  subscribeToNewsletter,
  validateCoupon,
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
      paymentMethod: z.enum(["pix", "credit_card", "boleto"]).default("pix"),
    })).mutation(({ input }) => ({
      success: true,
      orderNumber: `ER-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
      paymentStatus: "pending",
      message: "Pedido criado. O processamento do pagamento será iniciado pelo provedor configurado.",
      ...input,
    })),
  }),
  admin: router({
    summary: adminProcedure.query(() => getAdminSummary()),
    canAccess: protectedProcedure.query(({ ctx }) => ({ isAdmin: ctx.user.role === "admin" })),
  }),
});

export type AppRouter = typeof appRouter;
