import { z } from "zod";
import { parse as parseCookieHeader } from "cookie";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { invokeLLM } from "./_core/llm";
import { ADMIN_DISPLAY_NAME, getAdminOpenId, validateAdminCredentials } from "./admin-auth";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { storageGetSignedUrl, storagePut } from "./storage";
import { createMercadoPagoPayment, getMercadoPagoPayment, searchMercadoPagoPayments } from "./mercadopago";
import { getDb } from "./db";
import { isGroundedAiSummary } from "./analytics-grounding";
import { products, orders } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { MelhorEnvioApiError, calculateMelhorEnvioShipping, createMelhorEnvioCartItem, downloadMelhorEnvioLabelFile, getMelhorEnvioTracking } from "./melhor-envio";
import { sendAbandonedCartReminderEmail } from "./resend";
import { STOREFRONT_ACCESS_COOKIE, createStorefrontAccessToken, hashStorefrontPassword, hasValidStorefrontAccess, verifyStorefrontPassword } from "./storefront-access";
import {
  getAdminSummary,
  getAdminProducts,
  duplicateProductData,
  deleteProductData,
  assignProductsToCategory,
  getProductWithVariations,
  getPublicProductById,
  getPublicProductBySlug,
  listNewsletterSubscribers,
  getNewsletterSubscriber,
  listProducts,
  getAdminAnalytics,
  getCategoryRevenueMetrics,
  getLowStockAlerts,
  markAllNotificationsAsRead,
  generateNextOrderNumber,
  listInventoryAuditLogs,
  logInventoryAudit,
  listAdminUsers,
  getAdminUserByEmail,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  saveProductData,
  subscribeToNewsletter,
  validateCoupon,
  listAdminCoupons,
  saveCouponData,
  toggleCouponActive,
  deleteCouponData,
  getCommercialConfig,
  saveCommercialConfig,
  getCmsPage,
  saveCmsPage,
  listCustomMenus,
  saveCustomMenu,
  deleteCustomMenu,
  getHomeContent,
  saveHomeContent,
  getStorefrontConfig,
  getStorefrontAccessPasswordHash,
  saveStorefrontConfig,
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
  listAdminCollections,
  saveCollectionData,
  archiveCollection,
  restoreCollection,
  updateInventoryStock,
  listOrders,
  listAbandonedCarts,
  createManualOrder,
  listOrdersByUser,
  getOrderById,
  getOrderByNumber,
  getOrderItems,
  createOrder,
  updateOrderPixPayment,
  updateOrderPaymentStatus,
  updateOrderTracking,
  updateOrderFulfillmentStatus,
  deleteOrderData,
  updateOrderLabelData,
  recordAnalyticsEvent,
  upsertUser,
  updateUserName,
  listShipments,
  createShipment,
  updateShipmentStatus,
  getExtraShippingDays,
  saveExtraShippingDays,
  listPromotions,
  createPromotion,
  togglePromotionStatus,
  deletePromotion,
} from "./db";
import { adminOrderEmail, newsletterWelcomeEmail, orderConfirmationEmail, paymentConfirmationEmail } from "./email-templates";
import { ENV } from "./_core/env";
import { createPixExpirationDate, isPixExpired, PIX_EXPIRATION_MINUTES } from "../shared/pix";
import { sendResendEmail } from "./resend";
import { mergeLabelPdfs } from "./label-pdf";
import { reconcileVisibleOrderPayments } from "./payment-reconciliation";

function extractPixTransactionData(payment: any) {
  const transactionData = payment?.point_of_interaction?.transaction_data;
  if (!transactionData) return null;
  return {
    qr_code: typeof transactionData.qr_code === "string" ? transactionData.qr_code : undefined,
    qr_code_base64: typeof transactionData.qr_code_base64 === "string" ? transactionData.qr_code_base64 : undefined,
    ticket_url: typeof transactionData.ticket_url === "string" ? transactionData.ticket_url : undefined,
  };
}

function getPayerNameParts(customerName: string) {
  const [firstName, ...lastNameParts] = customerName.trim().split(/\\s+/);
  return { firstName: firstName || "Cliente", lastName: lastNameParts.join(" ") || "Cliente" };
}

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

const shippingPackageInput = z.object({
  widthCm: z.number().positive("A largura deve ser maior que zero.").max(200, "A largura não pode ultrapassar 200 cm."),
  heightCm: z.number().positive("A altura deve ser maior que zero.").max(200, "A altura não pode ultrapassar 200 cm."),
  lengthCm: z.number().positive("O comprimento deve ser maior que zero.").max(300, "O comprimento não pode ultrapassar 300 cm."),
  weightGrams: z.number().positive("O peso deve ser maior que zero.").max(30000, "O peso não pode ultrapassar 30 kg."),
});

type ShippingQuoteLine = { id: string; price: number; quantity: number };
type ShippingPackage = z.infer<typeof shippingPackageInput>;

export function buildShippingQuoteProducts(items: ShippingQuoteLine[], packageConfig?: ShippingPackage) {
  const totalQuantity = Math.max(1, items.reduce((sum, item) => sum + item.quantity, 0));
  const defaultWidth = 15;
  const defaultHeight = 5;
  const defaultLength = 20;
  const defaultUnitWeightKg = 0.3;

  return items.map((item, index) => ({
    id: item.id || String(index + 1),
    width: packageConfig?.widthCm ?? defaultWidth,
    height: packageConfig?.heightCm ?? defaultHeight,
    length: packageConfig?.lengthCm ?? defaultLength,
    weight: packageConfig ? Math.max(0.001, packageConfig.weightGrams / 1000 / totalQuantity) : defaultUnitWeightKg,
    insurance_value: item.price,
    quantity: item.quantity,
  }));
}

function toMelhorEnvioTrpcError(error: unknown, operation: string) {
  if (error instanceof MelhorEnvioApiError && error.isUnauthorized) {
    return new TRPCError({
      code: "UNAUTHORIZED",
      message: "O Melhor Envio rejeitou a autenticação. Verifique se MELHOR_ENVIO_TOKEN é um access token de produção válido, diferente do client secret, e se os escopos de cotação e envio estão autorizados.",
    });
  }

  if (error instanceof MelhorEnvioApiError) {
    return new TRPCError({
      code: "BAD_REQUEST",
      message: `${operation}: ${error.details}`,
    });
  }

  const message = error instanceof Error ? error.message : "Erro desconhecido na integração com o Melhor Envio.";
  return new TRPCError({ code: "BAD_REQUEST", message: `${operation}: ${message}` });
}

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
        const inputEmail = input.email.trim().toLowerCase();
        let isAdminValid = validateAdminCredentials(inputEmail, input.password);
        let adminName = ADMIN_DISPLAY_NAME;
        let adminEmail = ENV.adminLoginEmail.trim().toLowerCase();

        if (!isAdminValid) {
          const subAdmin = await getAdminUserByEmail(inputEmail);
          if (subAdmin && subAdmin.isActive === 1) {
            const crypto = await import("crypto");
            const hashed = crypto.createHash("sha256").update(input.password).digest("hex");
            if (subAdmin.passwordHash === hashed) {
              isAdminValid = true;
              adminName = subAdmin.name;
              adminEmail = subAdmin.email;
            }
          }
        }

        if (!isAdminValid) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Credenciais administrativas inválidas ou conta inativa." });
        }

        const openId = getAdminOpenId(adminEmail);
        await upsertUser({
          openId,
          name: adminName,
          email: adminEmail,
          loginMethod: "admin-password",
          role: "admin",
          lastSignedIn: new Date(),
        });

        const sessionToken = await sdk.createSessionToken(openId, {
          name: adminName,
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
            name: adminName,
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
  analytics: router({
    trackVisit: publicProcedure.input(z.object({
      visitorId: z.string().trim().min(8).max(120),
      path: z.string().trim().min(1).max(255),
    })).mutation(async ({ input }) => {
      return recordAnalyticsEvent({ ...input, eventType: "page_view" });
    }),
  }),
  catalog: router({
    list: publicProcedure.input(z.object({ category: z.string().optional() }).optional()).query(({ input }) => listProducts(input?.category)),
    getById: publicProcedure.input(z.object({ id: z.number().int().positive() })).query(({ input }) => getPublicProductById(input.id)),
    getBySlug: publicProcedure.input(z.object({ slug: z.string().trim().min(1).max(180) })).query(({ input }) => getPublicProductBySlug(input.slug)),
    getConfig: publicProcedure.query(() => getCommercialConfig()),
    getHomeContent: publicProcedure.query(() => getHomeContent()),
    getStorefrontConfig: publicProcedure.query(() => getStorefrontConfig()),
    getStorefrontAccessStatus: publicProcedure.query(async ({ ctx }) => {
      const config = await getStorefrontConfig();
      const passwordHash = await getStorefrontAccessPasswordHash();
      const cookies = parseCookieHeader(ctx.req.headers.cookie ?? "");
      const unlocked = !config.maintenance.enabled || hasValidStorefrontAccess(cookies[STOREFRONT_ACCESS_COOKIE], passwordHash);
      return { locked: config.maintenance.enabled, unlocked, passwordConfigured: Boolean(passwordHash) };
    }),
    unlockStorefront: publicProcedure.input(z.object({ password: z.string().min(1).max(200) })).mutation(async ({ input, ctx }) => {
      const config = await getStorefrontConfig();
      const passwordHash = await getStorefrontAccessPasswordHash();
      if (!config.maintenance.enabled) return { unlocked: true };
      if (!passwordHash || !verifyStorefrontPassword(input.password, passwordHash)) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Palavra-passe inválida." });
      }
      const token = createStorefrontAccessToken(passwordHash);
      ctx.res.cookie(STOREFRONT_ACCESS_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: ENV.isProduction,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });
      return { unlocked: true };
    }),
    lockStorefrontAccess: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(STOREFRONT_ACCESS_COOKIE, { httpOnly: true, sameSite: "lax", secure: ENV.isProduction, path: "/" });
      return { unlocked: false };
    }),
    categories: publicProcedure.query(() => listPublicCategories()),
    getCmsPage: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
      return await getCmsPage(input.slug);
    }),
    listCustomMenus: publicProcedure.input(z.object({ location: z.string().optional() }).optional()).query(async ({ input }) => {
      return await listCustomMenus(input?.location);
    }),
    calculateShipping: publicProcedure.input(z.object({
      cep: z.string().min(8),
      subtotal: z.number().nonnegative(),
      items: z.array(z.object({
        id: z.string().min(1),
        price: z.number().nonnegative(),
        quantity: z.number().int().positive(),
      })).min(1).max(100),
      package: shippingPackageInput.optional(),
    })).query(async ({ input }) => {
      const config = await getCommercialConfig();
      const cleanCep = input.cep.replace(/\D/g, "");
      if (cleanCep.length !== 8) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "CEP inválido." });
      }

      // O valor acima do limite continua a ser gratuito, mas a opção explícita
      // mantém o contrato de seleção da sacola e do checkout.
      if (input.subtotal >= config.freeShippingThreshold) {
        const options = [{ id: "free-eras", service: "Frete Grátis Eras", cost: 0, deadline: "3 a 6 dias úteis", free: true }];
        return { ...options[0], options };
      }

      const quotePayload = {
        from: { postal_code: ENV.melhorEnvioCep || "50000000" },
        to: { postal_code: cleanCep },
        products: buildShippingQuoteProducts(input.items, input.package),
      };

      let quotes: Array<Record<string, unknown>>;
      try {
        quotes = await calculateMelhorEnvioShipping(quotePayload) as Array<Record<string, unknown>>;
      } catch (error) {
        throw toMelhorEnvioTrpcError(error, "Não foi possível calcular o frete");
      }

      const options = quotes.map((quote) => {
        const company = quote.company as { name?: unknown } | undefined;
        const price = Number(quote.custom_price ?? quote.price ?? 0);
        const deliveryRange = quote.delivery_range as { min?: unknown; max?: unknown } | undefined;
        const deliveryTime = Number(quote.delivery_time ?? quote.delivery ?? 0);
        const deadline = deliveryRange && Number(deliveryRange.min) > 0 && Number(deliveryRange.max) > 0
          ? `${Number(deliveryRange.min)} a ${Number(deliveryRange.max)} dias úteis`
          : deliveryTime > 0 ? `${deliveryTime} dias úteis` : "Prazo informado pelo transportador";
        const id = String(quote.id ?? quote.service ?? "").trim();
        const service = String(quote.name ?? company?.name ?? "Transportadora").trim();
        return { id, service, cost: Number.isFinite(price) ? Math.max(0, price) : 0, deadline, free: false };
      }).filter((option) => option.id && option.service && option.cost >= 0);

      if (!options.length) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "O Melhor Envio não retornou opções disponíveis para este CEP e carrinho." });
      }
      return { ...options[0], options };
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
    validate: publicProcedure.input(z.object({ code: z.string().min(2), subtotal: z.number().nonnegative(), customerEmail: z.string().email().optional() })).query(({ input }) => validateCoupon(input.code, input.subtotal, input.customerEmail)),
    adminList: adminProcedure.query(() => listAdminCoupons()),
    save: adminProcedure.input(z.object({
      id: z.number().int().positive().optional(),
      code: z.string().trim().min(2).max(50),
      discountType: z.string().optional(),
      discountPercent: z.number().min(0).max(100).optional(),
      fixedAmount: z.number().nonnegative().optional(),
      usageLimit: z.number().int().positive().nullable().optional(),
      minPurchase: z.number().nonnegative().optional(),
      validUntil: z.string().datetime().nullable().optional(),
      active: z.number().int().min(0).max(1).optional(),
      isFirstPurchaseOnly: z.number().int().min(0).max(1).optional(),
      applyScope: z.string().optional(),
      allowStacking: z.number().int().min(0).max(1).optional(),
    })).mutation(({ input }) => saveCouponData(input)),
    toggle: adminProcedure.input(z.object({ id: z.number().int().positive(), active: z.number().int().min(0).max(1) })).mutation(({ input }) => toggleCouponActive(input.id, input.active)),
    remove: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteCouponData(input.id)),
  }),
  promotions: router({
    list: adminProcedure.query(() => listPromotions()),
    save: adminProcedure.input(z.object({
      id: z.number().int().positive().optional(),
      name: z.string().trim().min(2).max(255),
      discountType: z.string().default("buy_x_get_y"),
      scopeType: z.string().default("store"),
      scopeIds: z.string().nullable().optional(),
      allowPromotionalPrice: z.number().int().min(0).max(1).optional(),
      combinableWithPrice: z.number().int().min(0).max(1).optional(),
      combinableWithShipping: z.number().int().min(0).max(1).optional(),
      combinableWithCart: z.number().int().min(0).max(1).optional(),
      combinableWithApps: z.number().int().min(0).max(1).optional(),
      dateLimitType: z.string().default("unlimited"),
      startDate: z.string().nullable().optional(),
      endDate: z.string().nullable().optional(),
      customBadgeEnabled: z.number().int().min(0).max(1).optional(),
      customBadgeText: z.string().max(50).nullable().optional(),
      status: z.string().default("active"),
    })).mutation(({ input }) => createPromotion(input)),
    toggle: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.string() })).mutation(({ input }) => togglePromotionStatus(input.id, input.status)),
    remove: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deletePromotion(input.id)),
  }),
  checkout: router({
    publicConfig: publicProcedure.query(async () => ({ publicKey: ENV.mpPublicKey || null, commercial: await getCommercialConfig() })),
    create: publicProcedure.input(z.object({
      customerName: z.string().min(2),
      customerEmail: z.string().email(),
      customerCpf: z.string().min(11),
      phone: z.string().min(8),
      address: z.record(z.string(), z.string()),
      items: z.array(z.object({ productId: z.number(), name: z.string().max(255).optional(), size: z.string(), quantity: z.number().int().positive(), price: z.number().nonnegative() })).min(1),
      subtotal: z.number().nonnegative(),
      shippingCost: z.number().nonnegative(),
      shippingMethod: z.string().optional(),
      discount: z.number().nonnegative(),
      total: z.number().nonnegative(),
      paymentMethod: z.enum(["pix", "credit_card"]).default("pix"),
      cardToken: z.string().optional(),
      paymentMethodId: z.string().min(2).optional(),
      installments: z.number().int().positive().optional(),
    })).mutation(async ({ input, ctx }) => {
      const orderNumber = await generateNextOrderNumber();
      const commercialConfig = await getCommercialConfig();

      // Recálculo server-side rigoroso dos preços a partir do banco de dados
      let verifiedSubtotal = 0;
      const verifiedItems = [];
      for (const item of input.items) {
        const [dbProd] = await getDb() ? await (await getDb())!.select().from(products).where(eq(products.id, item.productId)).limit(1) : [];
        const unitPrice = dbProd ? Number(dbProd.price) : Number(item.price);
        verifiedSubtotal += unitPrice * item.quantity;
        verifiedItems.push({
          ...item,
          name: dbProd?.name ?? item.name ?? `Produto #${item.productId}`,
          price: unitPrice,
        });
      }

      const verifiedDiscount = Number(input.discount || 0);
      const verifiedShippingCost = Number(input.shippingCost || 0);
      const pixDiscountRate = input.paymentMethod === "pix" ? (commercialConfig.pixDiscountPercent / 100) : 0;
      const pixSavings = verifiedSubtotal * pixDiscountRate;
      
      const baseTotal = Math.max(0, verifiedSubtotal - verifiedDiscount - pixSavings + verifiedShippingCost);
      const actualInstallments = input.paymentMethod === "credit_card"
        ? Math.min(Math.max(1, input.installments ?? 1), commercialConfig.maxInstallments)
        : 1;
      const serverTotal = input.paymentMethod === "credit_card"
        ? baseTotal * Math.pow(1 + commercialConfig.installmentInterestRate / 100, actualInstallments)
        : baseTotal;

      // Chamar a API oficial do Mercado Pago para gerar a cobrança Pix ou Cartão Transparente
      let mpResult: any = null;
      let initialPaymentStatus = "pending";
      let paymentFailureReason: string | null = null;

      const { firstName, lastName } = getPayerNameParts(input.customerName);
      const pixExpiresAt = input.paymentMethod === "pix" ? createPixExpirationDate() : undefined;

      try {
        mpResult = await createMercadoPagoPayment({
          transaction_amount: Number(serverTotal.toFixed(2)),
          description: `Pedido ${orderNumber} - Eras Label`,
          payment_method_id: input.paymentMethod === "pix" ? "pix" : input.paymentMethodId || "credit_card",
          token: input.cardToken,
          installments: actualInstallments,
          payer: {
            email: input.customerEmail,
            first_name: firstName,
            last_name: lastName,
            identification: {
              type: "CPF",
              number: input.customerCpf.replace(/\D/g, ""),
            },
            address: {
              zip_code: input.address.cep,
              street_name: input.address.street,
              street_number: input.address.number,
              neighborhood: input.address.neighborhood,
              city: input.address.city,
              federal_unit: input.address.state,
            },
          },
          external_reference: orderNumber,
          ...(input.paymentMethod === "pix" && pixExpiresAt ? { date_of_expiration: pixExpiresAt.toISOString() } : {}),
          idempotencyKey: input.paymentMethod === "pix" ? `${orderNumber}-pix-1` : `${orderNumber}-card-v1`,
        });

        if (mpResult?.status) {
          initialPaymentStatus = String(mpResult.status);
          if (initialPaymentStatus === "rejected" || mpResult.status_detail) {
            paymentFailureReason = `Status detail: ${mpResult.status_detail || "rejected"}`;
          }
        }
      } catch (mpError: any) {
        console.error("[MercadoPago] Erro ao criar pagamento transparente:", mpError);
        paymentFailureReason = mpError.message || "Erro desconhecido ao processar pagamento.";
        throw new TRPCError({ code: "BAD_REQUEST", message: mpError.message || "Erro ao processar pagamento com o Mercado Pago." });
      }

      const pixData = input.paymentMethod === "pix" ? extractPixTransactionData(mpResult) : null;
      const persistedOrder = await createOrder({
        orderNumber,
        userId: ctx.user?.id ?? null,
        customerName: input.customerName.trim(),
        customerEmail: input.customerEmail.trim(),
        customerCpf: input.customerCpf.replace(/\D/g, ""),
        phone: input.phone.trim(),
        shippingAddress: input.address,
        items: input.items.map((item) => ({ ...item, name: item.name ?? `Produto #${item.productId}` })),
        shippingMethod: input.shippingMethod ?? "Correios PAC",
        paymentMethod: input.paymentMethod,
        subtotal: input.subtotal.toFixed(2),
        shippingCost: input.shippingCost.toFixed(2),
        discount: input.discount.toFixed(2),
        total: serverTotal.toFixed(2),
        paymentStatus: initialPaymentStatus,
        paymentFailureReason,
        paymentId: mpResult?.id ? String(mpResult.id) : null,
        pixExpiresAt: input.paymentMethod === "pix" ? pixExpiresAt : null,
        pixQrCode: pixData?.qr_code ?? null,
        pixQrCodeBase64: pixData?.qr_code_base64 ?? null,
        pixTicketUrl: pixData?.ticket_url ?? null,
        pixGeneration: input.paymentMethod === "pix" ? 1 : 0,
        status: (initialPaymentStatus === "approved" || initialPaymentStatus === "authorized") ? "Processando" : initialPaymentStatus === "in_process" ? "Em análise" : "Aguardando pagamento",
      });

      // Disparar notificação estilo Nuvemshop para o Administrador
      try {
        await createNotification({
          targetRole: "admin",
          title: "Novo Pedido Realizado! 🛍️",
          message: `O cliente ${input.customerName} fez o pedido ${orderNumber} no valor de R$ ${input.total.toFixed(2)} via ${input.paymentMethod === "pix" ? "PIX" : "Cartão"}.`,
          type: "new_order",
        });

        if (initialPaymentStatus === "approved") {
          await createNotification({
            targetRole: "admin",
            title: "Pagamento Confirmado! 💳",
            message: `O pagamento do pedido ${orderNumber} (R$ ${input.total.toFixed(2)}) foi aprovado via Mercado Pago.`,
            type: "payment_confirmed",
          });
        }

        if (ctx.user) {
          await createNotification({
            userId: ctx.user.id,
            targetRole: "customer",
            title: "Pedido Realizado com Sucesso!",
            message: `Recebemos o seu pedido ${orderNumber} no valor de R$ ${input.total.toFixed(2)}. Status do pagamento: ${initialPaymentStatus}.`,
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
        ...(initialPaymentStatus === "approved" ? [sendResendEmail({ to: input.customerEmail, ...paymentConfirmationEmail(emailOrder) })] : []),
        ...(ENV.resendAdminEmail ? [sendResendEmail({ to: ENV.resendAdminEmail, ...adminOrderEmail(emailOrder) })] : []),
      ];
      await Promise.allSettled(emailJobs);

      return {
        success: true,
        orderNumber,
        orderId: persistedOrder?.id ?? null,
        paymentStatus: initialPaymentStatus,
        pixData,
        pixExpiresAt: input.paymentMethod === "pix" && pixExpiresAt ? pixExpiresAt.toISOString() : null,
        pixGeneration: input.paymentMethod === "pix" ? 1 : 0,
        message: initialPaymentStatus === "approved" ? "Pedido aprovado com sucesso!" : "Pedido gerado! Conclua o pagamento via Pix ou Cartão.",
        ...input,
      };
    }),
    regeneratePix: publicProcedure.input(z.object({
      orderNumber: z.string().regex(/^ER-\d{4}-\d{4,12}$/),
      customerEmail: z.string().email(),
    })).mutation(async ({ input }) => {
      const current = await getOrderByNumber(input.orderNumber);
      if (!current || current.customerEmail.toLowerCase() !== input.customerEmail.trim().toLowerCase()) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Não foi possível localizar este pedido." });
      }
      if (current.paymentMethod !== "pix") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Este pedido não foi criado com Pix." });
      }
      if (["approved", "authorized"].includes(String(current.paymentStatus).toLowerCase())) {
        throw new TRPCError({ code: "CONFLICT", message: "Este pedido já está pago e não precisa de um novo QR Code." });
      }

      const failedStatuses = new Set(["rejected", "cancelled", "failed", "cancelled_by_collector"]);
      const currentStatus = String(current.paymentStatus ?? "").toLowerCase();
      const expired = !current.pixExpiresAt || isPixExpired(current.pixExpiresAt);
      if (!expired && !failedStatuses.has(currentStatus) && current.pixQrCode) {
        return {
          success: true,
          orderNumber: current.orderNumber,
          paymentStatus: current.paymentStatus,
          pixData: {
            qr_code: current.pixQrCode,
            qr_code_base64: current.pixQrCodeBase64 || undefined,
            ticket_url: current.pixTicketUrl || undefined,
          },
          pixExpiresAt: current.pixExpiresAt ? new Date(current.pixExpiresAt).toISOString() : null,
          pixGeneration: current.pixGeneration ?? 1,
          regenerated: false,
          message: `O QR Code atual ainda é válido por ${PIX_EXPIRATION_MINUTES} minutos após a sua geração.`,
        };
      }

      const nextGeneration = Math.max(1, Number(current.pixGeneration ?? 0) + 1);
      const pixExpiresAt = createPixExpirationDate();
      const shippingAddress = (current.shippingAddress || {}) as Record<string, unknown>;
      const { firstName, lastName } = getPayerNameParts(current.customerName);
      const mpResult = await createMercadoPagoPayment({
        transaction_amount: Number(current.total),
        description: `Pedido ${current.orderNumber} - Eras Label`,
        payment_method_id: "pix",
        payer: {
          email: current.customerEmail,
          first_name: firstName,
          last_name: lastName,
          identification: { type: "CPF", number: current.customerCpf.replace(/\D/g, "") },
          address: {
            zip_code: String(shippingAddress.cep ?? ""),
            street_name: String(shippingAddress.street ?? ""),
            street_number: String(shippingAddress.number ?? ""),
            neighborhood: String(shippingAddress.neighborhood ?? ""),
            city: String(shippingAddress.city ?? ""),
            federal_unit: String(shippingAddress.state ?? "").toUpperCase(),
          },
        },
        external_reference: current.orderNumber,
        date_of_expiration: pixExpiresAt.toISOString(),
        idempotencyKey: `${current.orderNumber}-pix-${nextGeneration}`,
      });
      const pixData = extractPixTransactionData(mpResult);
      if (!mpResult?.id || !pixData?.qr_code) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "O Mercado Pago não devolveu um QR Code Pix válido. Tente novamente." });
      }

      const persisted = await updateOrderPixPayment({
        orderNumber: current.orderNumber,
        paymentId: String(mpResult.id),
        pixExpiresAt,
        pixQrCode: pixData.qr_code,
        pixQrCodeBase64: pixData.qr_code_base64,
        pixTicketUrl: pixData.ticket_url,
        pixGeneration: nextGeneration,
      });
      if (!persisted) {
        throw new TRPCError({ code: "NOT_FOUND", message: "O pedido deixou de estar disponível para regenerar o Pix." });
      }

      return {
        success: true,
        orderNumber: current.orderNumber,
        paymentStatus: "pending",
        pixData,
        pixExpiresAt: pixExpiresAt.toISOString(),
        pixGeneration: nextGeneration,
        regenerated: true,
        message: "Novo QR Code Pix gerado. Ele ficará válido por 30 minutos.",
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
    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      await markAllNotificationsAsRead(ctx.user.id, ctx.user.role);
      return { success: true };
    }),
  }),
  orders: router({
    myOrders: protectedProcedure.query(async ({ ctx }) => {
      const currentOrders = await listOrdersByUser(ctx.user.id);
      const changed = await reconcileVisibleOrderPayments(currentOrders);
      return changed ? listOrdersByUser(ctx.user.id) : currentOrders;
    }),
    trackOrderShipping: publicProcedure.input(z.object({
      trackingCode: z.string().trim().min(3),
    })).query(async ({ input }) => {
      try {
        const tracking = await getMelhorEnvioTracking(input.trackingCode);
        return { success: true, tracking };
      } catch (err: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: err.message || "Erro ao consultar rastreio." });
      }
    }),
  }),
  collections: router({
    list: publicProcedure.query(() => listAdminCollections()),
    save: adminProcedure.input(z.object({
      id: z.number().optional(),
      name: z.string().min(2),
      slug: z.string().optional(),
      year: z.string().min(2),
      description: z.string().optional(),
      editorialText: z.string().optional(),
      imageUrl: z.string().optional(),
      ctaLabel: z.string().optional(),
      ctaUrl: z.string().optional(),
      sortOrder: z.number().optional(),
      active: z.number().optional(),
      productIds: z.array(z.number()).optional(),
      photos: z.array(z.string()).optional(),
    })).mutation(({ input }) => saveCollectionData(input)),
    archive: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => archiveCollection(input.id)),
    restore: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => restoreCollection(input.id)),
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
      promotionalPrice: z.number().positive().nullable().optional(),
      description: z.string(),
      images: z.array(z.string()),
      status: z.enum(["Publicado", "Rascunho", "Esgotado"]),
      visibility: z.enum(["visible", "unlisted", "hidden"]).default("visible"),
      slug: z.string().trim().max(180).nullable().optional(),
      categoryIds: z.array(z.number().int().positive()).max(50).optional(),
      variations: z.array(z.object({
        size: z.string().trim().min(1).max(20),
        stock: z.number().int().min(0).max(100000),
      })).max(50).optional(),
      sizeGuide: z.array(z.object({
        size: z.string().trim().min(1).max(24),
        width: z.string().trim().max(48),
        length: z.string().trim().max(48),
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
      })).max(50),
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
    deleteProduct: adminProcedure.input(z.object({ productId: z.number().int().positive() })).mutation(async ({ input }) => {
      await deleteProductData(input.productId);
      return { success: true, message: "Produto excluído com sucesso!", productId: input.productId };
    }),
    bulkProductAction: adminProcedure.input(z.object({
      action: z.enum(["duplicate", "delete", "category"]),
      productIds: z.array(z.number().int().positive()).min(1).max(100),
      categoryId: z.number().int().positive().optional(),
    }).superRefine((input, ctx) => {
      if (input.action === "category" && !input.categoryId) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["categoryId"], message: "Escolha uma categoria." });
    })).mutation(async ({ input }) => {
      if (input.action === "category") {
        const result = await assignProductsToCategory(input.productIds, input.categoryId!);
        return { success: true, message: `${result.productIds.length} produto(s) associado(s) à categoria.`, affectedIds: result.productIds };
      }
      if (input.action === "delete") {
        for (const productId of input.productIds) await deleteProductData(productId);
        return { success: true, message: `${input.productIds.length} produto(s) excluído(s) com sucesso.`, affectedIds: input.productIds };
      }
      const duplicatedIds: number[] = [];
      for (const productId of input.productIds) {
        const product = await duplicateProductData(productId);
        if (product?.id) duplicatedIds.push(Number(product.id));
      }
      return { success: true, message: `${duplicatedIds.length} produto(s) duplicado(s) com sucesso.`, affectedIds: duplicatedIds };
    }),
    saveConfig: adminProcedure.input(z.object({
      pixDiscountPercent: z.number().min(0).max(100),
      freeShippingThreshold: z.number().nonnegative(),
      maxInstallments: z.number().int().min(1).max(24),
      interestFreeInstallments: z.number().int().min(1).max(24),
      installmentInterestRate: z.number().min(0).max(20),
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
        targetType: z.enum(["custom", "catalog", "category", "collection"]).optional(),
        targetValue: z.string().max(180).optional(),
      })).min(1),
      highlights: z.array(z.object({
        id: z.string().min(1),
        productId: z.number().int().positive(),
        label: z.string().min(1).max(40),
      })).min(0).max(6),
      productSections: z.array(z.object({
        id: z.string().min(1).max(80),
        eyebrow: z.string().max(80).optional(),
        title: z.string().trim().min(1).max(80),
        description: z.string().max(240).optional(),
        productIds: z.array(z.number().int().positive()).max(16),
      })).max(8).optional(),
      sectionTitles: z.object({
        highlights: z.string().trim().min(1).max(60).optional(),
        shop: z.string().trim().min(1).max(60).optional(),
        community: z.string().trim().min(1).max(60).optional(),
      }).optional(),
      vipBanner: z.object({
        eyebrow: z.string(),
        title: z.string(),
        subtitle: z.string(),
        imageUrl: imageUrlInput,
        href: z.string().min(1),
        cta: z.string(),
        targetType: z.enum(["custom", "catalog", "category", "collection"]).optional(),
        targetValue: z.string().max(180).optional(),
      }),
    })).mutation(async ({ input }) => {
      const saved = await saveHomeContent(input);
      return { success: true, content: saved };
    }),
    saveStorefrontConfig: adminProcedure.input(z.object({
      announcement: z.object({
        enabled: z.boolean(),
        messages: z.array(z.object({
          id: z.string().trim().min(1).max(80),
          text: z.string().trim().min(1).max(180),
          href: z.string().max(500),
        })).min(1).max(8),
        backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
        textColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
        rotationSpeedSeconds: z.number().int().min(2).max(15),
        showArrows: z.boolean(),
      }),
      maintenance: z.object({
        enabled: z.boolean(),
        title: z.string().trim().min(1).max(100),
        message: z.string().trim().min(1).max(500),
        accessLabel: z.string().trim().min(1).max(100),
      }),
      accessPassword: z.string().trim().min(6).max(200).optional(),
      clearAccessPassword: z.boolean().optional(),
      drop: z.object({
        enabled: z.boolean(),
        title: z.string().trim().min(1).max(100),
        targetAt: z.string().max(40).nullable(),
      }),
    })).mutation(async ({ input }) => {
      const { accessPassword, clearAccessPassword, ...config } = input;
      const passwordHash = clearAccessPassword ? null : accessPassword ? hashStorefrontPassword(accessPassword) : undefined;
      const saved = await saveStorefrontConfig({ ...config, maintenance: { ...config.maintenance, passwordConfigured: false } }, passwordHash);
      return { success: true, config: saved };
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
    getAnalytics: adminProcedure.input(z.object({
      periodDays: z.number().int().positive().default(7),
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    }).optional()).query(async ({ input }) => {
      const startAt = input?.startDate ? Date.parse(`${input.startDate}T00:00:00.000Z`) : undefined;
      const endAt = input?.endDate ? Date.parse(`${input.endDate}T23:59:59.999Z`) : undefined;
      return getAdminAnalytics(input?.periodDays ?? 7, { startAt, endAt });
    }),
    categoryRevenue: adminProcedure.query(async () => {
      return getCategoryRevenueMetrics();
    }),
    lowStockAlerts: adminProcedure.query(async () => {
      return getLowStockAlerts();
    }),
    aiSummary: adminProcedure.input(z.object({
      periodDays: z.number().int().positive().default(7),
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    }).optional()).query(async ({ input }) => {
      const requestedDays = input?.periodDays ?? 7;
      const startAt = input?.startDate ? Date.parse(`${input.startDate}T00:00:00.000Z`) : undefined;
      const endAt = input?.endDate ? Date.parse(`${input.endDate}T23:59:59.999Z`) : undefined;
      const analytics = await getAdminAnalytics(requestedDays, { startAt, endAt });
      const days = analytics.period.days;
      const lowStockList = await getLowStockAlerts();

      // Verificar se há dados suficientes para gerar análise (ex: vendas === 0 e sem histórico relevante)
      if (analytics.summary.sales === 0) {
        return {
          success: true,
          isInsufficientData: true,
          summary: `Ainda não existem dados de vendas suficientes no período selecionado (${days} dias) para gerar uma análise executiva fundamentada. Assim que as primeiras encomendas forem registadas, a inteligência da Eras Label cruzará o ritmo de saída, o stock e a conversão automaticamente.`,
        };
      }

      try {
        const topProductsStr = analytics.topProducts.map((p: any) => p.name + " (" + p.category + ", Estoque: " + p.stock + " un., Unidades Vendidas: " + p.unitsSold + ", Velocidade Real: " + p.velocity + "/dia)").join("; ") || "Nenhum item vendido no período";
        const lowStockStr = lowStockList.map((p: any) => p.name + " (" + p.stock + " un.)").join(", ") || "Nenhum no momento";
        const prompt = "Analise estritamente com base nos dados reais de e-commerce da marca de streetwear Eras Label para o período selecionado (" + days + " dias):\n" +
          "- Total de Pedidos/Vendas: " + analytics.summary.sales + "\n" +
          "- Receita Total: R$ " + analytics.summary.revenue.toFixed(2) + "\n" +
          "- Ticket Médio: R$ " + analytics.summary.averageTicket.toFixed(2) + "\n" +
          "- Taxa de Conversão: " + analytics.summary.conversionRate + "%\n" +
          "- Desempenho por Peça e Velocidade de Saída Real: " + topProductsStr + "\n" +
          "- Peças com Estoque Crítico (< 5 un.): " + lowStockStr + "\n\n" +
          "Por favor, forneça um resumo executivo inteligente e sofisticado em português (estilo consultoria de moda streetwear) estruturado em duas partes:\n" +
          "1. Resumo de Desempenho e Tendências de Vendas (analisando rigorosamente os dados reais fornecidos).\n" +
          "2. Previsão de Risco de Ruptura e Esgotamento (cruzando exclusivamente a velocidade de saída real e o estoque atual, projetando quais produtos esgotarão nos próximos dias com base estritamente nos números).\n" +
          "Seja objetivo, elegante, verdadeiro aos dados e direto ao ponto. Não invente números.";

        const res = await invokeLLM({
          messages: [
            { role: "system", content: "Você é um analista sênior de e-commerce e estratégia de marca para streetwear." },
            { role: "user", content: prompt },
          ],
        });
        const summaryText = String(res.choices[0].message.content || "").trim();
        const groundedNumbers = [
          0,
          1,
          2,
          days,
          analytics.summary.visits,
          analytics.summary.pageViews,
          analytics.summary.sales,
          analytics.summary.revenue,
          analytics.summary.grossRevenue,
          analytics.summary.discounts,
          analytics.summary.averageTicket,
          analytics.summary.conversionRate,
          ...analytics.topProducts.flatMap((product: any) => [product.stock, product.unitsSold, product.revenue, product.velocity]),
          ...lowStockList.map((product: any) => product.stock),
        ];
        const isGrounded = isGroundedAiSummary(summaryText, groundedNumbers, [analytics.summary.conversionRate]);
        if (!isGrounded) {
          console.warn("[AI Summary] Rejected ungrounded response: external benchmark or unsupported number detected.");
          return {
            success: true,
            summary: `A análise automática foi retida porque a resposta gerada incluiu uma referência que não pode ser comprovada pelo banco da loja. No período real de ${days} dias, foram registrados ${analytics.summary.sales} pedidos pagos, receita de R$ ${analytics.summary.revenue.toFixed(2)} e conversão de ${analytics.summary.conversionRate}%.`,
          };
        }
        return { success: true, summary: summaryText || "Resumo indisponível no momento." };
      } catch (err) {
        console.warn("[AI Summary] Failed to generate AI summary:", err);
        return {
          success: true,
          summary: `A análise automática está temporariamente indisponível. No período real de ${days} dias, foram registrados ${analytics.summary.sales} pedidos pagos, receita líquida de R$ ${analytics.summary.revenue.toFixed(2)} e conversão de ${analytics.summary.conversionRate}%. Consulte os indicadores acima para a leitura factual do desempenho.`,
        };
      }
    }),
    listInventoryAudit: adminProcedure.input(z.object({
      adminFilter: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      sortBy: z.enum(["createdAt", "productName", "size", "newStock", "adminName"]).optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
      page: z.number().int().positive().optional(),
      pageSize: z.number().int().positive().optional(),
    }).optional()).query(async ({ input }) => {
      return listInventoryAuditLogs(input);
    }),
    listMarketingCollections: adminProcedure.query(async () => {
      return listMarketingCollections();
    }),
    listOrders: adminProcedure.input(z.object({
      includeArchived: z.boolean().default(false),
    }).optional()).query(async ({ input }) => {
      const options = { includeArchived: input?.includeArchived ?? false };
      const currentOrders = await listOrders(options);
      const changed = await reconcileVisibleOrderPayments(currentOrders);
      return changed ? listOrders(options) : currentOrders;
    }),
    updateFulfillmentStatus: adminProcedure.input(z.object({
      orderId: z.number().int().positive(),
      status: z.enum(["pending_packaging", "packed", "shipped", "archived"]),
    })).mutation(async ({ input }) => {
      try {
        const updated = await updateOrderFulfillmentStatus(input.orderId, input.status);
        if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Pedido não encontrado." });
        return { success: true, order: updated };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Não foi possível actualizar o estado operacional do pedido.",
        });
      }
    }),
    deleteOrder: adminProcedure.input(z.object({
      orderId: z.number().int().positive(),
    })).mutation(async ({ input }) => {
      try {
        const deleted = await deleteOrderData(input.orderId);
        if (!deleted) throw new TRPCError({ code: "NOT_FOUND", message: "Pedido não encontrado." });
        return { success: true, order: deleted };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Não foi possível excluir o pedido.",
        });
      }
    }),
    reconcilePayment: adminProcedure.input(z.object({
      orderNumber: z.string().trim().min(3).max(100),
    })).mutation(async ({ input }) => {
      const order = await getOrderByNumber(input.orderNumber);
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Pedido não encontrado para reconciliação." });
      }

      const currentStatus = String(order.paymentStatus ?? "").toLowerCase();
      if (currentStatus === "approved" || currentStatus === "authorized") {
        return { success: true, alreadySynchronized: true, paymentStatus: currentStatus, order };
      }

      let payment: any = null;
      const paymentId = String((order as any).paymentId ?? "").trim();
      if (paymentId) {
        const directPayment = await getMercadoPagoPayment(paymentId);
        if (directPayment && (!directPayment.external_reference || String(directPayment.external_reference) === order.orderNumber)) {
          payment = directPayment;
        }
      }

      if (!payment) {
        const matches = await searchMercadoPagoPayments(order.orderNumber);
        payment = matches[0] ?? null;
      }

      if (!payment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Nenhum pagamento do Mercado Pago foi encontrado para este pedido. Verifique o external_reference antes de tentar novamente." });
      }

      const paymentStatus = String(payment.status ?? "pending").toLowerCase();
      const paymentDetail = payment.status_detail ? `${paymentStatus}: ${String(payment.status_detail)}` : null;
      const updatedOrder = await updateOrderPaymentStatus(order.orderNumber, paymentStatus, paymentDetail);

      return {
        success: paymentStatus === "approved" || paymentStatus === "authorized",
        alreadySynchronized: false,
        paymentStatus,
        paymentStatusDetail: payment.status_detail ?? null,
        paymentId: payment.id ? String(payment.id) : null,
        order: updatedOrder,
      };
    }),
    listAbandonedCarts: adminProcedure.query(async () => {
      return listAbandonedCarts();
    }),
    sendAbandonedCartEmail: adminProcedure.input(z.object({
      cartId: z.number().int().positive(),
      recipientEmail: z.string().trim().email(),
      customerName: z.string().trim().optional(),
    })).mutation(async ({ input }) => {
      const carts = await listAbandonedCarts();
      const cart = carts.find((c) => c.id === input.cartId);
      if (!cart) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Carrinho abandonado não encontrado." });
      }
      const recoveryUrl = `${process.env.VITE_APP_URL || "https://eraslabel.com"}/?recoverCart=${cart.id}`;
      const items = (cart.items as Array<any>).map((item) => ({
        productId: Number(item.productId ?? 1),
        name: String(item.name ?? "Peça Exclusiva Eras Label"),
        size: String(item.size ?? "U"),
        quantity: Number(item.quantity ?? 1),
        price: Number(item.price ?? 0),
      }));

      const res = await sendAbandonedCartReminderEmail(
        input.recipientEmail,
        input.customerName || cart.customerName || "Cliente",
        items,
        Number(cart.total),
        recoveryUrl
      );

      return {
        success: res.sent,
        message: res.sent ? "E-mail de recuperação de carrinho enviado com sucesso!" : `Não foi possível enviar o e-mail: ${res.reason || "Erro desconhecido"}`,
      };
    }),
    createManualOrder: adminProcedure.input(z.object({
      customerName: z.string().trim().min(2).max(255),
      customerEmail: z.string().trim().email(),
      customerCpf: z.string().trim().min(5).max(20),
      phone: z.string().trim().max(30).optional(),
      shippingAddress: z.object({
        street: z.string().trim().min(2).max(255),
        number: z.string().trim().min(1).max(30),
        complement: z.string().trim().max(100).optional(),
        neighborhood: z.string().trim().min(2).max(100),
        city: z.string().trim().min(2).max(100),
        state: z.string().trim().min(2).max(30),
        postalCode: z.string().trim().min(5).max(15),
      }),
      items: z.array(z.object({
        productId: z.number().int().positive(),
        name: z.string().trim().min(1).max(255),
        size: z.string().trim().min(1).max(20),
        quantity: z.number().int().positive().max(99),
        price: z.number().nonnegative(),
        image: z.string().max(1000).optional(),
      })).min(1),
      shippingMethod: z.string().trim().min(1).max(100),
      paymentMethod: z.string().trim().min(1).max(50),
      shippingCost: z.number().nonnegative(),
      discount: z.number().nonnegative(),
      notes: z.string().trim().max(1000).optional(),
      status: z.string().trim().min(1).max(50),
      paymentStatus: z.string().trim().min(1).max(50),
    })).mutation(async ({ input }) => {
      const subtotal = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const total = Math.max(0, subtotal + input.shippingCost - input.discount);
      const orderNumber = `ERAS-M${new Date().getTime().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`;
      const created = await createManualOrder({
        orderNumber,
        userId: null,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerCpf: input.customerCpf,
        phone: input.phone || null,
        shippingAddress: input.shippingAddress,
        items: input.items,
        shippingMethod: input.shippingMethod,
        paymentMethod: input.paymentMethod,
        shippingCost: input.shippingCost.toFixed(2),
        subtotal: subtotal.toFixed(2),
        discount: input.discount.toFixed(2),
        total: total.toFixed(2),
        status: input.status,
        paymentStatus: input.paymentStatus,
        notes: input.notes || null,
      });
      if (!created) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Não foi possível criar o pedido manual." });
      return { success: true, order: created, orderNumber };
    }),
    calculateShippingQuote: adminProcedure.input(z.object({
      cepDestination: z.string().min(8),
      items: z.array(z.object({
        id: z.string().optional(),
        price: z.number().nonnegative(),
        quantity: z.number().int().positive(),
      })).min(1).max(100),
      package: shippingPackageInput,
    })).mutation(async ({ input }) => {
      const { calculateMelhorEnvioShipping } = await import("./melhor-envio");
      try {
        const quotes = await calculateMelhorEnvioShipping({
          from: { postal_code: ENV.melhorEnvioCep || "50000000" },
          to: { postal_code: input.cepDestination },
          products: buildShippingQuoteProducts(input.items.map((item, index) => ({ ...item, id: item.id || String(index + 1) })), input.package),
        });
        return { success: true, quotes };
      } catch (error) {
        throw toMelhorEnvioTrpcError(error, "Não foi possível calcular o frete");
      }
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
    purgeTestData: adminProcedure.mutation(async () => {
      const db = await getDb();
      if (!db) return { success: false, message: "Base de dados indisponível." };
      try {
        await db.delete(orders);
        return { success: true, message: "Dados de teste e histórico de pedidos eliminados com sucesso para início da operação real." };
      } catch (err: any) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: err.message || "Erro ao purgar dados de teste." });
      }
    }),
    generateShippingLabel: adminProcedure.input(z.object({
      orderId: z.number(),
      serviceId: z.number(),
    })).mutation(async ({ input }) => {
      const order = await getOrderById(input.orderId);
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Pedido não encontrado." });
      }
      const address = (order.shippingAddress ?? {}) as Record<string, unknown>;
      const addressValue = (keys: string[], fallback: string) => {
        const value = keys.map((key) => address[key]).find((candidate) => candidate !== undefined && candidate !== null && String(candidate).trim() !== "");
        return value === undefined ? fallback : String(value);
      };
      const items = await getOrderItems(input.orderId);
      const totalWeight = items.reduce((sum: number, item: any) => sum + (item.quantity * 0.3), 0.3); // estimativa 300g por peça
      
      let cartResult: unknown;
      try {
        cartResult = await createMelhorEnvioCartItem({
          serviceId: input.serviceId,
          order: {
            id: String(order.id),
            order_number: order.orderNumber,
          },
        from: {
          name: "Eras Label Oficial",
          phone: "8183298369",
          email: "contato@eraslabel.com",
          document: "13985751439",
          address: "Rua Herculano Bandeira",
          number: "74",
          district: "Sítio Novo",
          city: "Olinda",
          state_abbr: "PE",
          postal_code: "53110380",
        },
        to: {
          name: order.customerName,
          phone: order.phone || "11999999999",
          email: order.customerEmail,
          document: order.customerCpf || "00000000000",
          address: addressValue(["street", "address", "logradouro"], "Rua não informada"),
          number: addressValue(["number", "numero"], "1"),
          complement: addressValue(["complement", "complemento"], "") || undefined,
          district: addressValue(["neighborhood", "district", "bairro"], "Centro"),
          city: addressValue(["city", "cidade"], "São Paulo"),
          state_abbr: addressValue(["state", "state_abbr", "estado"], "SP"),
          postal_code: addressValue(["cep", "postal_code", "postalCode"], "01001000"),
        },
        products: items.map((item: any) => ({
          name: item.productName || "Peça Eras Label",
          quantity: item.quantity,
          unitary_value: Number(item.unitPrice),
          weight: 0.3,
          width: 15,
          height: 5,
          length: 20,
        })),
          volumes: [
            {
              height: 10,
              width: 20,
              length: 25,
              weight: Math.max(totalWeight, 0.3),
            },
          ],
        });
      } catch (error) {
        throw toMelhorEnvioTrpcError(error, "Não foi possível criar o envio");
      }

      const cart = cartResult as { id?: unknown };
      const shippingOrderId = typeof cart.id === "string" ? cart.id : "";
      if (!shippingOrderId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "O Melhor Envio não retornou o ID da etiqueta." });
      }
      await updateOrderLabelData(input.orderId, { shippingOrderId });
      return { success: true, shippingOrderId, cartResult };
    }),

    downloadShippingLabel: adminProcedure.input(z.object({
      orderId: z.number(),
      shipmentId: z.string().trim().min(3).optional(),
    })).mutation(async ({ input }) => {
      const order = await getOrderById(input.orderId);
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Pedido não encontrado." });
      }

      const shippingOrderId = input.shipmentId?.trim() || order.shippingOrderId;
      if (!shippingOrderId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Esta venda ainda não possui um ID de etiqueta do Melhor Envio." });
      }
      if (!input.shipmentId && order.labelPdfUrl) {
        return { success: true, shippingOrderId, labelPdfUrl: order.labelPdfUrl };
      }

      try {
        const file = await downloadMelhorEnvioLabelFile(shippingOrderId);
        const labelPdfUrl = file.kind === "url"
          ? file.url
          : (await storagePut(`orders/${order.orderNumber}/label.pdf`, file.bytes, file.contentType)).url;
        await updateOrderLabelData(input.orderId, { shippingOrderId, labelPdfUrl });
        return { success: true, shippingOrderId, labelPdfUrl };
      } catch (error) {
        throw toMelhorEnvioTrpcError(error, "Não foi possível obter o PDF da etiqueta");
      }
    }),

    saveCmsPage: adminProcedure.input(z.object({
      slug: z.string().min(2),
      title: z.string().min(2),
      subtitle: z.string().optional(),
      content: z.string().min(5),
      bannerUrl: z.string().optional(),
    })).mutation(async ({ input }) => {
      return await saveCmsPage(input.slug, input);
    }),
    saveCustomMenu: adminProcedure.input(z.object({
      id: z.number().int().positive().optional(),
      location: z.string().default("header"),
      label: z.string().min(1),
      url: z.string().min(1),
      sortOrder: z.number().int().default(0),
      isVisible: z.number().int().min(0).max(1).default(1),
    })).mutation(async ({ input }) => {
      return await saveCustomMenu(input);
    }),
    deleteCustomMenu: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      return await deleteCustomMenu(input.id);
    }),

    downloadBulkShippingLabels: adminProcedure.input(z.object({
      orderIds: z.array(z.number().int().positive()).min(1).max(50),
    })).mutation(async ({ input }) => {
      const uniqueOrderIds = Array.from(new Set(input.orderIds));
      const pdfBuffers: Uint8Array[] = [];
      const includedOrderIds: number[] = [];
      const skippedOrders: Array<{ orderId: number; orderNumber?: string; reason: string }> = [];

      /**
       * Baixa uma etiqueta que já foi persistida no storage interno ou num
       * URL externo. A validação do content-type e da assinatura PDF impede
       * que um arquivo arbitrário seja publicado como etiqueta consolidada.
       */
      const downloadStoredLabel = async (labelUrl: string) => {
        let resolvedUrl = labelUrl;
        if (labelUrl.startsWith("/manus-storage/")) {
          const storageKey = decodeURIComponent(labelUrl.slice("/manus-storage/".length));
          resolvedUrl = await storageGetSignedUrl(storageKey);
        }

        const response = await fetch(resolvedUrl, { headers: { Accept: "application/pdf, application/octet-stream" } });
        if (!response.ok) throw new Error(`Falha ao baixar a etiqueta persistida (${response.status}).`);
        const bytes = new Uint8Array(await response.arrayBuffer());
        if (bytes.length < 4 || new TextDecoder().decode(bytes.slice(0, 4)) !== "%PDF") {
          throw new Error("O arquivo persistido não é um PDF válido.");
        }
        return bytes;
      };

      for (const orderId of uniqueOrderIds) {
        const order = await getOrderById(orderId);
        if (!order) {
          skippedOrders.push({ orderId, reason: "Pedido não encontrado." });
          continue;
        }

        try {
          let pdfBytes: Uint8Array | null = null;
          if (order.labelPdfUrl) {
            // Reutiliza a etiqueta já armazenada para reduzir chamadas ao
            // provedor e manter o mesmo arquivo usado no fluxo individual.
            pdfBytes = await downloadStoredLabel(order.labelPdfUrl);
          } else if (order.shippingOrderId) {
            const file = await downloadMelhorEnvioLabelFile(order.shippingOrderId);
            pdfBytes = file.kind === "binary" ? file.bytes : await downloadStoredLabel(file.url);
          }

          if (!pdfBytes) {
            skippedOrders.push({ orderId, orderNumber: order.orderNumber, reason: "Etiqueta ainda não disponível." });
            continue;
          }

          pdfBuffers.push(pdfBytes);
          includedOrderIds.push(orderId);
        } catch (error) {
          skippedOrders.push({
            orderId,
            orderNumber: order.orderNumber,
            reason: error instanceof Error ? error.message : "Não foi possível obter a etiqueta.",
          });
        }
      }

      if (pdfBuffers.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Nenhuma das vendas selecionadas possui uma etiqueta PDF disponível.",
        });
      }

      try {
        const mergedPdf = await mergeLabelPdfs(pdfBuffers);
        const filename = `etiquetas-${new Date().toISOString().replace(/[:.]/g, "-")}.pdf`;
        const uploaded = await storagePut(`bulk-labels/${filename}`, mergedPdf, "application/pdf");
        return {
          success: true,
          labelPdfUrl: uploaded.url,
          includedOrderIds,
          skippedOrders,
          pageCount: pdfBuffers.length,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Não foi possível consolidar as etiquetas em PDF.";
        throw new TRPCError({ code: "BAD_REQUEST", message });
      }
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
    listSubAdmins: adminProcedure.query(async () => {
      const admins = await listAdminUsers();
      return admins.map(a => ({
        id: a.id,
        email: a.email,
        name: a.name,
        roleTitle: a.roleTitle,
        permissions: a.permissions,
        isActive: a.isActive,
        createdAt: a.createdAt,
      }));
    }),
    createSubAdmin: adminProcedure.input(z.object({
      email: z.string().email(),
      name: z.string().min(2),
      password: z.string().min(6),
      roleTitle: z.string().min(2),
      permissions: z.string(),
    })).mutation(async ({ input }) => {
      const existing = await getAdminUserByEmail(input.email);
      if (existing) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Já existe um administrador cadastrado com este e-mail." });
      }
      const crypto = await import("crypto");
      const passwordHash = crypto.createHash("sha256").update(input.password).digest("hex");
      await createAdminUser({
        email: input.email,
        name: input.name,
        passwordHash,
        roleTitle: input.roleTitle,
        permissions: input.permissions,
        isActive: 1,
      });
      return { success: true };
    }),
    updateSubAdmin: adminProcedure.input(z.object({
      id: z.number().int().positive(),
      name: z.string().min(2).optional(),
      roleTitle: z.string().min(2).optional(),
      permissions: z.string().optional(),
      isActive: z.number().int().min(0).max(1).optional(),
      password: z.string().min(6).optional(),
    })).mutation(async ({ input }) => {
      const updateData: any = {};
      if (input.name) updateData.name = input.name;
      if (input.roleTitle) updateData.roleTitle = input.roleTitle;
      if (input.permissions) updateData.permissions = input.permissions;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;
      if (input.password) {
        const crypto = await import("crypto");
        updateData.passwordHash = crypto.createHash("sha256").update(input.password).digest("hex");
      }
      await updateAdminUser(input.id, updateData);
      return { success: true };
    }),
    deleteSubAdmin: adminProcedure.input(z.object({
      id: z.number().int().positive(),
    })).mutation(async ({ input }) => {
      await deleteAdminUser(input.id);
      return { success: true };
    }),
    updateMyAdminProfile: adminProcedure.input(z.object({
      name: z.string().trim().min(2, "Informe pelo menos 2 caracteres.").max(100),
      avatarUrl: z.string().max(1000).nullable().optional(),
    })).mutation(async ({ ctx, input }) => {
      const email = (ctx.user?.email || "").toLowerCase().trim();
      const name = input.name.trim();
      const avatarUrl = input.avatarUrl !== undefined ? input.avatarUrl : null;
      await updateUserName(ctx.user.openId, name);
      const subAdmin = await getAdminUserByEmail(email);
      if (subAdmin) {
        await updateAdminUser(subAdmin.id, { name, avatarUrl });
      }
      return { success: true, name, avatarUrl };
    }),
    myAdminDetails: adminProcedure.query(async ({ ctx }) => {
      const email = (ctx.user?.email || "").toLowerCase().trim();
      const isSuperAdmin = email === (process.env.ADMIN_LOGIN_EMAIL || "theeraslabel@gmail.com").toLowerCase().trim();
      const subAdmin = await getAdminUserByEmail(email);
      if (isSuperAdmin) {
        return {
          email,
          name: ctx.user?.name || subAdmin?.name || ADMIN_DISPLAY_NAME,
          roleTitle: subAdmin?.roleTitle || "Superadministrador",
          permissions: "products,inventory,categories,stats,emails,settings",
          avatarUrl: subAdmin?.avatarUrl || null,
          isSuperAdmin: true,
        };
      }
      return {
        email,
        name: ctx.user?.name || subAdmin?.name || "Administrador",
        roleTitle: subAdmin?.roleTitle || "Assistente",
        permissions: subAdmin?.permissions || "",
        avatarUrl: subAdmin?.avatarUrl || null,
        isSuperAdmin: false,
      };
    }),

    shipmentsList: adminProcedure.query(async () => {
      return listShipments();
    }),
    shipmentsCreate: adminProcedure.input(z.object({
      type: z.string().default("Avulso"),
      recipientName: z.string().min(2),
      recipientAddress: z.string().min(5),
      carrier: z.string().default("Jadlog Econômico"),
      trackingCode: z.string().optional(),
      shippingCost: z.number().nonnegative().optional(),
      estimatedDays: z.number().int().min(1).max(60).optional(),
      notes: z.string().optional(),
    })).mutation(async ({ input }) => {
      const created = await createShipment(input);
      return { success: true, shipment: created };
    }),
    shipmentsUpdateStatus: adminProcedure.input(z.object({
      id: z.number().int().positive(),
      status: z.string().min(2),
      trackingCode: z.string().optional(),
    })).mutation(async ({ input }) => {
      await updateShipmentStatus(input.id, input.status, input.trackingCode);
      return { success: true };
    }),
    extraShippingDaysGet: publicProcedure.query(async () => {
      return getExtraShippingDays();
    }),
    extraShippingDaysSave: adminProcedure.input(z.object({
      extraDays: z.number().int().min(0).max(60),
    })).mutation(async ({ input }) => {
      const saved = await saveExtraShippingDays(input.extraDays);
      return { success: true, extraDays: saved };
    })
  }),
});

export type AppRouter = typeof appRouter;


