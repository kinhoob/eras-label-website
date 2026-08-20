import { eq, desc, asc, like, or, and, sql, isNull, ne, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { nanoid } from "nanoid";
import {
  InsertUser,
  InsertCoupon,
  users,
  products,
  productVariations,
  newsletterSubscribers,
  coupons,
  orders,
  abandonedCarts,
  siteAppearance,
  notifications,
  InsertNotification,
  resendEmailLogs,
  categories,
  productCategories,
  inventoryAuditLogs,
  adminUsers,
  cmsPages,
  customMenus,
  collections,
  shipments,
  promotions,
  analyticsEvents,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { collectCollectionRecipients } from "./marketing-audience";
import { normalizeInventoryVariations, sumInventoryStock } from "../shared/inventory";
import { normalizeCategoryName, slugifyCategory } from "../shared/categories";
import { DEFAULT_STOREFRONT_CONFIG, type StorefrontConfig, type StorefrontAnnouncementMessage } from "../shared/storefront";

let _db: ReturnType<typeof drizzle> | null = null;

/**
 * Tests must never write to the shared preview database. The explicit
 * ERAS_TEST_MODE flag is set by the test script; VITEST/NODE_ENV are
 * additional safeguards for direct Vitest invocations.
 */
function isDatabaseDisabledForTests() {
  return process.env.ERAS_TEST_MODE === "1" || process.env.VITEST === "true" || process.env.NODE_ENV === "test";
}

export async function getDb() {
  if (isDatabaseDisabledForTests()) return null;
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function updateUserName(openId: string, name: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ name: name.trim() }).where(eq(users.openId, openId));
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      const value = user[field] ?? null;
      values[field] = value;
      updateSet[field] = value;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  values.lastSignedIn ??= new Date();
  updateSet.lastSignedIn ??= new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

async function getProductSalesCountMap(db: NonNullable<Awaited<ReturnType<typeof getDb>>>) {
  // A popularidade deve representar unidades presentes nos pedidos reais,
  // sem criar registros ou depender de dados de demonstração.
  const orderRows = await db.select({ items: orders.items }).from(orders);
  const salesMap = new Map<number, number>();

  for (const order of orderRows) {
    try {
      const items = typeof order.items === "string" ? JSON.parse(order.items) : (order.items ?? []);
      if (!Array.isArray(items)) continue;
      for (const item of items as Array<Record<string, unknown>>) {
        const productId = Number(item.productId ?? item.id ?? 0);
        const quantity = Number(item.quantity ?? 1);
        if (productId > 0 && Number.isFinite(quantity) && quantity > 0) {
          salesMap.set(productId, (salesMap.get(productId) ?? 0) + quantity);
        }
      }
    } catch {
      // Pedidos com itens legados inválidos não podem quebrar o catálogo.
    }
  }

  return salesMap;
}

export async function listProducts(category?: string) {
  const db = await getDb();
  if (!db) return [];
  const productSalesCount = await getProductSalesCountMap(db);
  const resolvedCategory = category && category !== "Todos" ? await resolveCategoryName(category) : undefined;
  let categoryProductIds: number[] = [];
  if (resolvedCategory) {
    const matchingCategory = await db.select({ id: categories.id }).from(categories).where(eq(categories.name, resolvedCategory)).limit(1);
    if (matchingCategory[0]) {
      const relationRows = await db.select({ productId: productCategories.productId }).from(productCategories).where(eq(productCategories.categoryId, matchingCategory[0].id));
      categoryProductIds = relationRows.map((row) => Number(row.productId));
    }
  }
  // Inclui produtos com status "active" ou "soldout" para garantir que esgotados apareçam no catálogo público
  const baseRows = await db.select().from(products).where(and(or(eq(products.status, "active"), eq(products.status, "soldout")), eq(products.visibility, "visible")));
  const rows = resolvedCategory
    ? baseRows.filter((product) => product.category === resolvedCategory || product.subcategory === resolvedCategory || categoryProductIds.includes(product.id))
    : baseRows;
  // The storefront needs available sizes to filter accurately. Keep this enrichment
  // server-side so the UI does not have to guess from a product category.
  return Promise.all(rows.map(async (product) => {
    const variations = await db
      .select({ id: productVariations.id, size: productVariations.size, color: productVariations.color, stock: productVariations.stock })
      .from(productVariations)
      .where(eq(productVariations.productId, product.id));
    const relationRows = await db
      .select({ categoryId: productCategories.categoryId })
      .from(productCategories)
      .where(eq(productCategories.productId, product.id));
    const categoryIds = relationRows.map((row) => Number(row.categoryId));
    const categoryNames = (await Promise.all(categoryIds.map(async (categoryId) => {
      const categoryRow = await db.select({ name: categories.name }).from(categories).where(eq(categories.id, categoryId)).limit(1);
      return categoryRow[0]?.name;
    }))).filter((name): name is string => Boolean(name));
    return {
      ...product,
      variations,
      categoryIds,
      categoryNames,
      // O catálogo consome este campo para ordenar por popularidade real.
      salesCount: productSalesCount.get(product.id) ?? 0,
    };
  }));
}

async function getProductRecordBySlug(slug: string, includeUnlisted: boolean) {
  const db = await getDb();
  if (!db) return undefined;
  const normalizedSlug = slug.trim().toLowerCase();
  
  // Se o slug for numérico, procurar por ID diretamente
  if (/^\d+$/.test(normalizedSlug)) {
    const idNum = Number(normalizedSlug);
    const productById = await db.select().from(products).where(eq(products.id, idNum)).limit(1);
    if (productById[0]) {
      const p = productById[0];
      if ((p.status === "active" || p.status === "soldout") && p.visibility !== "hidden" && (includeUnlisted || p.visibility === "visible")) {
        const variations = await db.select().from(productVariations).where(eq(productVariations.productId, p.id));
        return { ...p, variations };
      }
    }
  }

  // Tentar busca exata por slug
  let product = await db.select().from(products).where(eq(products.slug, normalizedSlug)).limit(1);
  
  // Se não encontrar, tentar procurar por ID no final ou slugify do nome
  if (!product[0]) {
    const allProducts = await db.select().from(products);
    const matched = allProducts.find(p => {
      const pSlug = (p.slug ?? "").toLowerCase();
      const pNameSlug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return pSlug === normalizedSlug || pNameSlug === normalizedSlug || String(p.id) === normalizedSlug;
    });
    if (matched) {
      product = [matched];
    }
  }

  if (!product[0] || (product[0].status !== "active" && product[0].status !== "soldout") || product[0].visibility === "hidden" || (!includeUnlisted && product[0].visibility !== "visible")) return undefined;
  const variations = await db.select().from(productVariations).where(eq(productVariations.productId, product[0].id));
  return { ...product[0], variations };
}

export async function getPublicProductBySlug(slug: string) {
  return getProductRecordBySlug(slug, true);
}

export async function getProductWithVariations(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const product = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!product[0]) return undefined;
  const variations = await db.select().from(productVariations).where(eq(productVariations.productId, id));
  return { ...product[0], variations };
}

export async function getPublicProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const product = await db.select().from(products).where(and(
    eq(products.id, id),
    or(eq(products.status, "active"), eq(products.status, "soldout")),
    or(eq(products.visibility, "visible"), eq(products.visibility, "unlisted")),
  )).limit(1);
  if (!product[0]) return undefined;
  const variations = await db.select().from(productVariations).where(eq(productVariations.productId, id));
  return { ...product[0], variations };
}

export async function getNewsletterSubscriber(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, normalizedEmail)).limit(1);
  return existing[0];
}

export async function subscribeToNewsletter(name: string, email: string) {
  const db = await getDb();
  if (!db) return { email, name, couponCode: "ERAS10" };
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, normalizedEmail)).limit(1);
  if (existing[0]) return existing[0];
  const couponCode = `ERAS10-${nanoid(5).toUpperCase()}`;
  await db.insert(coupons).values({ code: couponCode, discountPercent: "10.00", usageLimit: 1, active: 1 });
  await db.insert(newsletterSubscribers).values({ name: name.trim(), email: normalizedEmail, couponCode });
  const created = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, normalizedEmail)).limit(1);
  return created[0] ?? { email: normalizedEmail, name: name.trim(), couponCode };
}

export async function listNewsletterSubscribers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.createdAt));
}

export async function logResendEmail(data: { recipient: string; subject: string; templateType: string; status: string; providerResponse?: string }) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(resendEmailLogs).values({
      recipient: data.recipient,
      subject: data.subject,
      templateType: data.templateType,
      status: data.status,
      providerResponse: data.providerResponse ?? null,
    });
  } catch (error) {
    console.warn("[Resend Log] Failed to save email log:", error);
  }
}

export async function listResendEmailLogs(options?: { search?: string; status?: string; templateType?: string; sort?: "newest" | "oldest" }) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  if (options?.status && options.status !== "all") {
    conditions.push(eq(resendEmailLogs.status, options.status));
  }
  if (options?.templateType && options.templateType !== "all") {
    conditions.push(eq(resendEmailLogs.templateType, options.templateType));
  }
  if (options?.search && options.search.trim() !== "") {
    const term = `%${options.search.trim().toLowerCase()}%`;
    conditions.push(or(
      like(resendEmailLogs.recipient, term),
      like(resendEmailLogs.subject, term),
      like(resendEmailLogs.providerResponse, term)
    ));
  }

  const query = db.select().from(resendEmailLogs);
  if (conditions.length > 0) {
    // @ts-ignore
    query.where(and(...conditions));
  }

  const sortOrder = options?.sort === "oldest" ? asc(resendEmailLogs.createdAt) : desc(resendEmailLogs.createdAt);
  // @ts-ignore
  return query.orderBy(sortOrder).limit(100);
}

export async function validateCoupon(code: string, subtotal: number, customerEmail?: string) {
  const db = await getDb();
  const normalizedCode = code.trim().toUpperCase();
  if (!db) return normalizedCode === "ERAS10" ? { valid: true, discount: subtotal * 0.1, code: "ERAS10" } : { valid: false, discount: 0, code };
  const result = await db.select().from(coupons).where(eq(coupons.code, normalizedCode)).limit(1);
  const coupon = result[0];
  if (!coupon && normalizedCode === "ERAS10") return { valid: true, discount: subtotal * 0.1, code: "ERAS10" };
  if (!coupon || !coupon.active || (coupon.usageLimit !== null && coupon.timesUsed >= coupon.usageLimit)) return { valid: false, discount: 0, code };
  if (coupon.validUntil && coupon.validUntil.getTime() < Date.now()) return { valid: false, discount: 0, code };
  if (coupon.minPurchase && subtotal < Number(coupon.minPurchase)) return { valid: false, discount: 0, code };

  if (coupon.isFirstPurchaseOnly === 1 && customerEmail) {
    const priorOrders = await db.select({ id: orders.id }).from(orders).where(eq(orders.customerEmail, customerEmail.trim().toLowerCase())).limit(1);
    if (priorOrders.length > 0) {
      return { valid: false, discount: 0, code: coupon.code, message: "Este cupom é válido apenas para a primeira compra." };
    }
  }

  let discount = 0;
  let freeShipping = false;

  if (coupon.promoType === "free_shipping") {
    freeShipping = true;
    discount = 0;
  } else if (coupon.promoType === "fixed") {
    const rules = coupon.promoRules as { fixedAmount?: number } | null;
    discount = Number(rules?.fixedAmount ?? coupon.discountPercent ?? 0);
  } else {
    discount = coupon.discountPercent ? subtotal * Number(coupon.discountPercent) / 100 : 0;
  }

  return { valid: true, discount, freeShipping, code: coupon.code };
}

export async function getAdminSummary() {
  const db = await getDb();
  if (!db) return { revenue: 0, orderCount: 0, customerCount: 0, newsletterCount: 0 };
  const [orderStats, customerStats, newsletterStats] = await Promise.all([
    db.select({ count: sql<number>`count(*)`, revenue: sql<number>`coalesce(sum(${orders.total}), 0)` }).from(orders),
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(newsletterSubscribers),
  ]);
  return {
    revenue: Number(orderStats[0]?.revenue ?? 0),
    orderCount: Number(orderStats[0]?.count ?? 0),
    customerCount: Number(customerStats[0]?.count ?? 0),
    newsletterCount: Number(newsletterStats[0]?.count ?? 0),
  };
}

export async function getAdminProducts() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(products).orderBy(desc(products.id));
  return Promise.all(rows.map(async (product) => {
    const [variations, categoryRelations] = await Promise.all([
      db
      .select({ id: productVariations.id, size: productVariations.size, stock: productVariations.stock })
      .from(productVariations)
      .where(eq(productVariations.productId, product.id))
      .orderBy(asc(productVariations.size)),
      db
        .select({ categoryId: productCategories.categoryId })
        .from(productCategories)
        .where(eq(productCategories.productId, product.id)),
    ]);
    return {
      ...product,
      categoryIds: categoryRelations.map((relation) => relation.categoryId),
      variations,
      totalStock: variations.reduce((total, variation) => total + Number(variation.stock ?? 0), 0),
    };
  }));
}

export async function duplicateProductData(productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const [source] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  if (!source) throw new Error("Produto não encontrado para duplicação.");
  const sourceVariations = await db
    .select({ size: productVariations.size, stock: productVariations.stock })
    .from(productVariations)
    .where(eq(productVariations.productId, productId))
    .orderBy(asc(productVariations.size));
  const sourceCategoryRelations = await db
    .select({ categoryId: productCategories.categoryId })
    .from(productCategories)
    .where(eq(productCategories.productId, productId));
  const sourceSku = source.sku?.trim();
  const suffix = Date.now().toString(36).slice(-6).toUpperCase();
  return saveProductData({
    name: `${source.name} (cópia)`,
    collection: source.collection,
    category: source.category,
    subcategory: source.subcategory,
    slug: source.slug ? `${source.slug}-copia-${suffix.toLowerCase()}` : null,
    visibility: "hidden",
    categoryIds: sourceCategoryRelations.map((relation) => relation.categoryId),
    sku: sourceSku ? `${sourceSku}-COPY-${suffix}` : null,
    price: Number(source.price),
    pixPrice: Number(source.pixPrice),
    promotionalPrice: source.promotionalPrice !== null && source.promotionalPrice !== undefined ? Number(source.promotionalPrice) : null,
    description: source.description ?? "",
    images: Array.isArray(source.images) ? source.images : [],
    status: source.status === "active" ? "Publicado" : source.status === "soldout" ? "Esgotado" : "Rascunho",
    variations: sourceVariations.map((variation) => ({ size: variation.size, stock: Number(variation.stock ?? 0) })),
  });
}

export async function deleteProductData(productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const [source] = await db.select({ id: products.id }).from(products).where(eq(products.id, productId)).limit(1);
  if (!source) throw new Error("Produto não encontrado.");
  await db.delete(productVariations).where(eq(productVariations.productId, productId));
  await db.delete(productCategories).where(eq(productCategories.productId, productId));
  await db.delete(products).where(eq(products.id, productId));
  return { success: true, id: productId };
}

export async function assignProductsToCategory(productIds: number[], categoryId: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const [category] = await db.select({ id: categories.id }).from(categories).where(eq(categories.id, categoryId)).limit(1);
  if (!category) throw new Error("Categoria não encontrada.");
  const uniqueProductIds = Array.from(new Set(productIds.filter((id) => Number.isInteger(id) && id > 0)));
  for (const productId of uniqueProductIds) {
    const [product] = await db.select({ id: products.id }).from(products).where(eq(products.id, productId)).limit(1);
    if (!product) continue;
    const [existing] = await db.select({ id: productCategories.id }).from(productCategories).where(and(eq(productCategories.productId, productId), eq(productCategories.categoryId, categoryId))).limit(1);
    if (!existing) await db.insert(productCategories).values({ productId, categoryId });
  }
  return { productIds: uniqueProductIds, categoryId };
}

/** Lista categorias no painel e inclui a quantidade de produtos associados pelo nome atual. */
export async function listAdminCategories() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name));
  return Promise.all(rows.map(async (category) => {
    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(or(eq(products.category, category.name), eq(products.subcategory, category.name)));
    return { ...category, productCount: Number(countRow?.count ?? 0) };
  }));
}

/** Lista apenas categorias ativas para a navegação pública e filtros da loja. */
export async function listPublicCategories() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(categories)
    .where(eq(categories.active, 1))
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

/** Resolve slug ou nome para o nome persistido usado hoje na coluna products.category. */
export async function resolveCategoryName(value?: string) {
  const normalized = value?.trim();
  if (!normalized || normalized === "Todos") return undefined;
  const db = await getDb();
  if (!db) return normalized;
  const rows = await db
    .select({ name: categories.name })
    .from(categories)
    .where(or(eq(categories.slug, normalized), eq(categories.name, normalized)))
    .limit(1);
  return rows[0]?.name ?? normalized;
}

/** Cria ou atualiza uma categoria, mantendo slug estável e validável pela URL pública. */
export async function saveCategoryData(data: {
  id?: number;
  name: string;
  description?: string;
  parentId?: number | null;
  coverImageUrl?: string | null;
  active: number;
  sortOrder: number;
}) {
  const name = normalizeCategoryName(data.name);
  const slug = slugifyCategory(name);
  const normalized = {
    ...data,
    name,
    slug,
    description: data.description?.trim() || null,
    parentId: data.parentId ?? null,
    coverImageUrl: data.coverImageUrl?.trim() || null,
  };
  const db = await getDb();
  if (!db) return { id: data.id ?? Math.floor(Math.random() * 1000 + 10), ...normalized, productCount: 0 };

  if (data.id) {
    const previousRows = await db.select({ name: categories.name, parentId: categories.parentId }).from(categories).where(eq(categories.id, data.id)).limit(1);
    await db.update(categories).set(normalized).where(eq(categories.id, data.id));
    const previousName = previousRows[0]?.name;
    if (previousName && previousName !== name) {
      if (previousRows[0]?.parentId) {
        await db.update(products).set({ subcategory: name }).where(eq(products.subcategory, previousName));
      } else {
        await db.update(products).set({ category: name }).where(eq(products.category, previousName));
      }
    }
  } else {
    await db.insert(categories).values(normalized);
  }
  const rows = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  const saved = rows[0];
  if (!saved) throw new Error("Categoria não encontrada após o salvamento.");
  const [countRow] = await db.select({ count: sql<number>`count(*)` }).from(products).where(or(eq(products.category, saved.name), eq(products.subcategory, saved.name)));
  return { ...saved, productCount: Number(countRow?.count ?? 0) };
}

/** Arquiva uma categoria sem apagar o histórico nem quebrar produtos existentes. */
export async function archiveCategory(id: number) {
  const db = await getDb();
  if (!db) return { success: true };
  await db.update(categories).set({ active: 0 }).where(eq(categories.id, id));
  return { success: true };
}

export const DEFAULT_COMMERCIAL_CONFIG = {
  pixDiscountPercent: 5,
  freeShippingThreshold: 350,
  maxInstallments: 12,
  interestFreeInstallments: 3,
  installmentInterestRate: 2.99,
};

export type CommercialConfig = typeof DEFAULT_COMMERCIAL_CONFIG;

export async function getCommercialConfig(): Promise<CommercialConfig> {
  const db = await getDb();
  if (!db) return DEFAULT_COMMERCIAL_CONFIG;
  const rows = await db.select().from(siteAppearance).where(eq(siteAppearance.sectionKey, "commercial_config")).limit(1);
  const saved = (rows[0]?.content as Partial<CommercialConfig> | undefined) ?? {};
  return {
    pixDiscountPercent: Number(saved.pixDiscountPercent ?? DEFAULT_COMMERCIAL_CONFIG.pixDiscountPercent),
    freeShippingThreshold: Number(saved.freeShippingThreshold ?? DEFAULT_COMMERCIAL_CONFIG.freeShippingThreshold),
    maxInstallments: Math.min(24, Math.max(1, Number(saved.maxInstallments ?? DEFAULT_COMMERCIAL_CONFIG.maxInstallments))),
    interestFreeInstallments: Math.min(24, Math.max(1, Number(saved.interestFreeInstallments ?? DEFAULT_COMMERCIAL_CONFIG.interestFreeInstallments))),
    installmentInterestRate: Math.min(20, Math.max(0, Number(saved.installmentInterestRate ?? DEFAULT_COMMERCIAL_CONFIG.installmentInterestRate))),
  };
}

// Funções de Gerenciamento de Notificações (Estilo Nuvemshop)
export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) return;
  await db.insert(notifications).values(data);
}

export async function listNotifications(userId?: number, role?: string) {
  const db = await getDb();
  if (!db) return [];
  if (role === "admin") {
    // Admin vê notificações para admin ou all
    return db.select().from(notifications).where(or(eq(notifications.targetRole, "admin"), eq(notifications.targetRole, "all"))).orderBy(desc(notifications.createdAt)).limit(50);
  } else if (userId) {
    // Cliente vê notificações destinadas a ele ou all/customer
    return db.select().from(notifications).where(or(eq(notifications.userId, userId), eq(notifications.targetRole, "customer"), eq(notifications.targetRole, "all"))).orderBy(desc(notifications.createdAt)).limit(50);
  }
  return [];
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: 1 }).where(eq(notifications.id, id));
}

export async function markAllNotificationsAsRead(userId?: number, role?: string) {
  const db = await getDb();
  if (!db) return;
  if (role === "admin") {
    await db.update(notifications).set({ isRead: 1 }).where(or(eq(notifications.targetRole, "admin"), eq(notifications.targetRole, "all")));
  } else if (userId) {
    await db.update(notifications).set({ isRead: 1 }).where(or(eq(notifications.userId, userId), eq(notifications.targetRole, "customer"), eq(notifications.targetRole, "all")));
  }
}

export async function createNotificationDeduped(data: InsertNotification & { orderId?: number; type?: string }) {
  const db = await getDb();
  if (!db) return;
  // Evitar duplicar notificação idêntica para o mesmo pedido e tipo
  if (data.orderId && data.type) {
    const existing = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.orderId, data.orderId), eq(notifications.type, data.type)))
      .limit(1);
    if (existing.length > 0) {
      return;
    }
  }
  await db.insert(notifications).values(data);
}

export async function saveCommercialConfig(config: Partial<CommercialConfig>) {
  const normalized: CommercialConfig = {
    pixDiscountPercent: Math.min(100, Math.max(0, Number(config.pixDiscountPercent))),
    freeShippingThreshold: Math.max(0, Number(config.freeShippingThreshold)),
    maxInstallments: Math.min(24, Math.max(1, Math.round(Number(config.maxInstallments)))),
    interestFreeInstallments: Math.min(24, Math.max(1, Math.round(Number(config.interestFreeInstallments ?? 3)))),
    installmentInterestRate: Math.min(20, Math.max(0, Number(config.installmentInterestRate))),
  };
  const db = await getDb();
  if (!db) return normalized;
  const existing = await db.select().from(siteAppearance).where(eq(siteAppearance.sectionKey, "commercial_config")).limit(1);
  if (existing[0]) {
    await db.update(siteAppearance).set({ content: normalized as any }).where(eq(siteAppearance.sectionKey, "commercial_config"));
  } else {
    await db.insert(siteAppearance).values({ sectionKey: "commercial_config", content: normalized as any });
  }
  return normalized;
}

export type HomeBannerTargetType = "custom" | "catalog" | "category" | "collection";

export type HomeProductSection = {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  productIds: number[];
};

export type HomeContent = {
  banners: Array<{ id: string; eyebrow: string; title: string; subtitle: string; imageUrl: string; href: string; cta: string; targetType?: HomeBannerTargetType; targetValue?: string }>;
  highlights: Array<{ id: string; productId: number; label: string }>;
  productSections?: HomeProductSection[];
  sectionTitles?: { highlights?: string; shop?: string; community?: string };
  vipBanner: { eyebrow: string; title: string; subtitle: string; imageUrl: string; href: string; cta: string; targetType?: HomeBannerTargetType; targetValue?: string };
};

export const defaultHomeContent: HomeContent = {
  banners: [
    {
      id: "drafts",
      eyebrow: "NOVA ERA · 2026",
      title: "DRAFTS JÁ DISPONÍVEL",
      subtitle: "Uma nova coleção em movimento.",
      imageUrl: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=2000&q=90",
      href: "#shop",
      cta: "EXPLORAR AGORA",
    },
    {
      id: "paradox",
      eyebrow: "PARADOX COLLECTION",
      title: "REVIVER. REINVENTAR.",
      subtitle: "Peças para atravessar o tempo presente.",
      imageUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=2000&q=90",
      href: "#shop",
      cta: "VER COLEÇÃO",
    },
  ],
  highlights: [
    { id: "highlight-1", productId: 1, label: "PEÇA-CHAVE" },
    { id: "highlight-2", productId: 2, label: "MAIS VISTO" },
    { id: "highlight-3", productId: 5, label: "ARQUIVO" },
  ],
  productSections: [],
  sectionTitles: {
    highlights: "Destaques",
    shop: "Produtos da Era",
    community: "Visto fora do estúdio.",
  },
  vipBanner: {
    eyebrow: "ACESSO ANTECIPADO",
    title: "ENTRE PARA O GRUPO VIP",
    subtitle: "Lançamentos, bastidores e as próximas eras primeiro.",
    imageUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=90",
    href: "https://chat.whatsapp.com/I9UWZ9A6MmCLVm92mF86MK?mode=gi_t",
    cta: "ENTRAR NO WHATSAPP",
  },
};

export async function getHomeContent(): Promise<HomeContent> {
  const db = await getDb();
  if (!db) return defaultHomeContent;
  const rows = await db.select().from(siteAppearance).where(eq(siteAppearance.sectionKey, "home_content")).limit(1);
  return (rows[0]?.content as HomeContent) || defaultHomeContent;
}

export async function saveHomeContent(content: HomeContent) {
  const db = await getDb();
  if (!db) return content;
  const existing = await db.select().from(siteAppearance).where(eq(siteAppearance.sectionKey, "home_content")).limit(1);
  if (existing[0]) {
    await db.update(siteAppearance).set({ content: content as any }).where(eq(siteAppearance.sectionKey, "home_content"));
  } else {
    await db.insert(siteAppearance).values({ sectionKey: "home_content", content: content as any });
  }
  return content;
}

export async function saveProductData(data: {
  id?: number;
  name: string;
  collection: string;
  category: string;
  price: number;
  pixPrice: number;
  promotionalPrice?: number | null;
  description: string;
  images: string[];
  status: string;
  visibility?: "visible" | "unlisted" | "hidden";
  slug?: string | null;
  categoryIds?: number[];
  sku?: string | null;
  subcategory?: string | null;
  variations?: Array<{ size: string; stock: number }>;
}) {
  const normalizedVariations = normalizeInventoryVariations(data.variations ?? []);
  const normalizedSlug = slugifyCategory(data.slug?.trim() || data.name);
  const visibility = data.visibility ?? "visible";
  const categoryIds = Array.from(new Set((data.categoryIds ?? []).filter((id) => Number.isInteger(id) && id > 0)));
  const db = await getDb();
  if (!db) {
    return {
      id: data.id || Math.floor(Math.random() * 1000 + 10),
      ...data,
      slug: normalizedSlug,
      visibility,
      categoryIds,
      variations: normalizedVariations,
      totalStock: sumInventoryStock(normalizedVariations),
    };
  }

  const existingSlug = await db.select({ id: products.id }).from(products).where(eq(products.slug, normalizedSlug)).limit(1);
  if (existingSlug[0] && existingSlug[0].id !== data.id) {
    throw new Error("Este link já está a ser utilizado por outro produto.");
  }

  const statusDb = data.status === "Publicado" ? "active" : data.status === "Esgotado" ? "soldout" : "hidden";
  let productId = data.id;

  if (data.id) {
    await db.update(products).set({
      name: data.name,
      collection: data.collection,
      category: data.category,
      subcategory: data.subcategory?.trim() || null,
      slug: normalizedSlug,
      visibility,
      sku: data.sku?.trim() || null,
      price: String(data.price),
      pixPrice: String(data.pixPrice),
      promotionalPrice: data.promotionalPrice !== undefined && data.promotionalPrice !== null && !Number.isNaN(data.promotionalPrice) ? String(data.promotionalPrice) : null,
      description: data.description,
      images: data.images as any,
      status: statusDb as any,
    }).where(eq(products.id, data.id));
  } else {
    const [inserted] = await db.insert(products).values({
      name: data.name,
      collection: data.collection,
      category: data.category,
      subcategory: data.subcategory?.trim() || null,
      slug: normalizedSlug,
      visibility,
      sku: data.sku?.trim() || null,
      price: String(data.price),
      pixPrice: String(data.pixPrice),
      promotionalPrice: data.promotionalPrice !== undefined && data.promotionalPrice !== null && !Number.isNaN(data.promotionalPrice) ? String(data.promotionalPrice) : null,
      description: data.description,
      images: data.images as any,
      status: statusDb as any,
    });
    productId = Number((inserted as any).insertId || 0);
  }

  if (!productId) throw new Error("Não foi possível identificar o produto salvo.");
  if (data.categoryIds !== undefined) {
    await db.delete(productCategories).where(eq(productCategories.productId, productId));
    if (categoryIds.length > 0) {
      await db.insert(productCategories).values(categoryIds.map((categoryId) => ({ productId, categoryId })));
    }
  }
  if (data.variations !== undefined) {
    await db.delete(productVariations).where(eq(productVariations.productId, productId));
    if (normalizedVariations.length > 0) {
      await db.insert(productVariations).values(normalizedVariations.map((variation) => ({
        productId,
        size: variation.size,
        color: "",
        stock: variation.stock,
      })));
    }
  }

  return {
    id: productId,
    ...data,
    slug: normalizedSlug,
    visibility,
    categoryIds,
    variations: normalizedVariations,
    totalStock: normalizedVariations.reduce((total, variation) => total + variation.stock, 0),
  };
}

export async function updateInventoryStock(data: { productId: number; variations: Array<{ size: string; stock: number }> }) {
  const db = await getDb();
  const normalizedVariations = normalizeInventoryVariations(data.variations);
  if (!db) {
    return { productId: data.productId, variations: normalizedVariations, totalStock: sumInventoryStock(normalizedVariations) };
  }
  const existing = await db.select({ id: products.id }).from(products).where(eq(products.id, data.productId)).limit(1);
  if (!existing[0]) throw new Error("Produto não encontrado.");
  await db.delete(productVariations).where(eq(productVariations.productId, data.productId));
  if (normalizedVariations.length > 0) {
    await db.insert(productVariations).values(normalizedVariations.map((variation) => ({
      productId: data.productId,
      size: variation.size,
      color: "",
      stock: variation.stock,
    })));
  }
  return { productId: data.productId, variations: normalizedVariations, totalStock: sumInventoryStock(normalizedVariations) };
}

export async function listClients() {
  const db = await getDb();
  if (!db) return [];
  const registeredUsers = await db.select().from(users).orderBy(desc(users.lastSignedIn));
  const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));

  // Mapear utilizadores registados por e-mail (lowercase)
  const clientMap = new Map<string, { id: number | string; name: string; email: string; role: string; createdAt: number; source: string }>();

  for (const u of registeredUsers) {
    const emailKey = (u.email || "").toLowerCase().trim();
    if (!emailKey) continue;
    clientMap.set(emailKey, {
      id: u.id,
      name: u.name || "Cliente",
      email: u.email || "",
      role: u.role || "user",
      createdAt: u.createdAt ? new Date(u.createdAt).getTime() : Date.now(),
      source: "user"
    });
  }

  // Adicionar compradores que fizeram pedidos (mesmo convidados sem conta dedicada)
  for (const o of allOrders) {
    const emailKey = (o.customerEmail || "").toLowerCase().trim();
    if (!emailKey) continue;
    if (!clientMap.has(emailKey)) {
      clientMap.set(emailKey, {
        id: `order-buyer-${o.id}`,
        name: o.customerName || "Comprador",
        email: o.customerEmail || "",
        role: "customer",
        createdAt: o.createdAt ? new Date(o.createdAt).getTime() : Date.now(),
        source: "order"
      });
    }
  }

  return Array.from(clientMap.values()).sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
}

export async function listMarketingCollections() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({ collection: products.collection })
    .from(products)
    .groupBy(products.collection)
    .orderBy(asc(products.collection));
  return rows.map((row) => row.collection).filter(Boolean);
}

export async function listCollectionMarketingRecipients(collection: string) {
  const db = await getDb();
  if (!db) return [];

  const collectionProducts = await db
    .select({ id: products.id, collection: products.collection })
    .from(products);
  const orderRows = await db
    .select({ customerEmail: orders.customerEmail, customerName: orders.customerName, items: orders.items })
    .from(orders);
  return collectCollectionRecipients(collection, collectionProducts, orderRows);
}

export async function listOrders(options: { includeArchived?: boolean } = {}) {
  const db = await getDb();
  if (!db) return [];
  const rows = options.includeArchived
    ? await db.select().from(orders).orderBy(desc(orders.id))
    : await db.select().from(orders).where(isNull(orders.archivedAt)).orderBy(desc(orders.id));
  return rows.map(normalizeOrderForClient);
}

export async function listAbandonedCarts() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(abandonedCarts).orderBy(desc(abandonedCarts.createdAt));
  return rows.map((cart) => ({
    ...cart,
    total: Number(cart.total),
    recovered: Boolean(cart.recovered),
    items: Array.isArray(cart.items) ? cart.items as Array<Record<string, unknown>> : [],
  }));
}

export async function createManualOrder(data: typeof orders.$inferInsert) {
  return createOrder({
    ...data,
    notes: ["Pedido criado manualmente pelo painel administrativo.", data.notes].filter(Boolean).join(" "),
  });
}

export async function getOrderById(orderId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return rows[0];
}

export async function getOrderByNumber(orderNumber: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber.trim())).limit(1);
  return rows[0];
}

export async function updateOrderPixPayment(data: {
  orderNumber: string;
  paymentId: string;
  pixExpiresAt: Date;
  pixQrCode?: string | null;
  pixQrCodeBase64?: string | null;
  pixTicketUrl?: string | null;
  pixGeneration: number;
}) {
  const db = await getDb();
  if (!db) return undefined;
  const current = await getOrderByNumber(data.orderNumber);
  if (!current) return undefined;

  await db.update(orders).set({
    paymentId: data.paymentId,
    pixExpiresAt: data.pixExpiresAt,
    pixQrCode: data.pixQrCode ?? null,
    pixQrCodeBase64: data.pixQrCodeBase64 ?? null,
    pixTicketUrl: data.pixTicketUrl ?? null,
    pixGeneration: data.pixGeneration,
    paymentStatus: "pending",
    status: "Aguardando pagamento",
    paymentFailureReason: null,
  }).where(eq(orders.orderNumber, data.orderNumber));

  const updated = await db.select().from(orders).where(eq(orders.orderNumber, data.orderNumber)).limit(1);
  return updated[0] ? normalizeOrderForClient(updated[0]) : undefined;
}

export async function generateNextOrderNumber(): Promise<string> {
  const db = await getDb();
  const year = new Date().getFullYear();
  const prefix = `ER-${year}-`;
  if (!db) {
    return `${prefix}001`;
  }
  const allRows = await db.select({ orderNumber: orders.orderNumber }).from(orders);
  let maxSeq = 0;
  for (const row of allRows) {
    const numStr = String(row.orderNumber || "");
    if (numStr.startsWith(prefix)) {
      const suffix = numStr.slice(prefix.length);
      const seq = parseInt(suffix, 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  }
  const nextSeq = maxSeq + 1;
  return `${prefix}${String(nextSeq).padStart(3, "0")}`;
}

export async function createOrder(data: typeof orders.$inferInsert) {
  const db = await getDb();
  if (!db) return undefined;
  
  const orderNumber = data.orderNumber && /^ER-\d{4}-\d{2,}$/.test(data.orderNumber)
    ? data.orderNumber
    : await generateNextOrderNumber();
  const orderWithSequence = { ...data, orderNumber };

  // Validação server-side de estoque e baixa transacional das variações
  const rawItems = Array.isArray(orderWithSequence.items) ? (orderWithSequence.items as Array<any>) : [];
  for (const item of rawItems) {
    const productId = Number(item.productId);
    const size = String(item.size || "").trim();
    const qty = Number(item.quantity || 1);
    if (!productId || !size || qty <= 0) continue;

    const [prod] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    if (prod) {
      if (prod.status !== "active" || prod.visibility === "hidden") {
        throw new Error(`O produto "${item.name || productId}" não está disponível para compra.`);
      }

      const [variation] = await db
        .select()
        .from(productVariations)
        .where(and(eq(productVariations.productId, productId), eq(productVariations.size, size)))
        .limit(1);

      if (variation) {
        if (variation.stock < qty) {
          throw new Error(`Estoque insuficiente para o produto "${prod.name}" no tamanho ${size}. Disponível: ${variation.stock}, solicitado: ${qty}.`);
        }
        const newStock = variation.stock - qty;
        await db
          .update(productVariations)
          .set({ stock: newStock })
          .where(eq(productVariations.id, variation.id));
      }
    }
  }

  await db.insert(orders).values(orderWithSequence);
  const created = await db.select().from(orders).where(eq(orders.orderNumber, orderWithSequence.orderNumber)).limit(1);
  return created[0] ? normalizeOrderForClient(created[0]) : undefined;
}

function normalizeOrderForClient(order: typeof orders.$inferSelect) {
  const rawItems = Array.isArray(order.items) ? order.items as Array<Record<string, unknown>> : [];
  return {
    ...order,
    address: order.shippingAddress,
    paymentMethod: order.paymentMethod,
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    discount: Number(order.discount),
    total: Number(order.total),
    paymentStatus: order.paymentStatus,
    paymentId: order.paymentId,
    pixExpiresAt: order.pixExpiresAt ? new Date(order.pixExpiresAt).toISOString() : null,
    pixGeneration: order.pixGeneration ?? 0,
    pixData: order.paymentMethod === "pix" && order.pixQrCode ? {
      qr_code: order.pixQrCode,
      qr_code_base64: order.pixQrCodeBase64 || undefined,
      ticket_url: order.pixTicketUrl || undefined,
    } : null,
    fulfillmentStatus: order.fulfillmentStatus || (order.archivedAt ? "archived" : "pending_packaging"),
    archived: Boolean(order.archivedAt),
    shippingService: order.shippingMethod || "Correios / Logística",
    items: rawItems.map((item) => ({
      id: Number(item.id ?? item.productId ?? 0),
      name: String(item.name ?? "Produto Eras Label"),
      size: String(item.size ?? "Único"),
      quantity: Number(item.quantity ?? 1),
      price: Number(item.price ?? 0),
      image: String(item.image ?? ""),
    })),
  };
}

export async function listOrdersByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  return rows.map(normalizeOrderForClient);
}

export function mapMercadoPagoOrderStatus(paymentStatus: string) {
  const normalizedStatus = String(paymentStatus).toLowerCase();
  const isConfirmed = normalizedStatus === "approved" || normalizedStatus === "authorized";
  const nextStatus = isConfirmed ? "Processando" : normalizedStatus === "in_process" ? "Em análise" : normalizedStatus === "cancelled" || normalizedStatus === "rejected" ? "Pagamento recusado" : "Aguardando pagamento";
  return { normalizedStatus, nextStatus, isConfirmed };
}

export async function updateOrderPaymentStatus(orderNumber: string, paymentStatus: string, paymentFailureReason?: string | null, paymentId?: string | number | null) {
  const db = await getDb();
  if (!db) return undefined;
  const current = await getOrderByNumber(orderNumber);
  if (!current) return undefined;

  // Um pedido pode ter uma nova cobrança Pix depois que a anterior expirar.
  // Notificações atrasadas da cobrança antiga não podem aprovar a cobrança nova.
  const incomingPaymentId = String(paymentId ?? "").trim();
  const activePaymentId = String(current.paymentId ?? "").trim();
  if (incomingPaymentId && activePaymentId && incomingPaymentId !== activePaymentId) {
    return current;
  }

  const { normalizedStatus, nextStatus, isConfirmed } = mapMercadoPagoOrderStatus(paymentStatus);
  const clearFailureReason = isConfirmed;
  await db.update(orders).set({
    paymentStatus: normalizedStatus,
    status: nextStatus,
    ...(incomingPaymentId && !activePaymentId ? { paymentId: incomingPaymentId } : {}),
    ...(clearFailureReason ? { paymentFailureReason: null } : paymentFailureReason !== undefined ? { paymentFailureReason } : {}),
  }).where(eq(orders.orderNumber, orderNumber));
  const updated = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  return updated[0];
}

export async function updateOrderTracking(orderId: number, trackingCode: string, carrier?: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(orders).set({ trackingCode, carrier: carrier?.trim() || "Correios / Logística", fulfillmentStatus: "shipped", status: "Enviado" }).where(eq(orders.id, orderId));
}

export type FulfillmentStatus = "pending_packaging" | "packed" | "shipped" | "archived";

const FULFILLMENT_ORDER: FulfillmentStatus[] = ["pending_packaging", "packed", "shipped", "archived"];

export function getNextFulfillmentStatus(status: FulfillmentStatus): FulfillmentStatus | null {
  const index = FULFILLMENT_ORDER.indexOf(status);
  return index >= 0 && index < FULFILLMENT_ORDER.length - 1 ? FULFILLMENT_ORDER[index + 1] : null;
}

export function getFulfillmentTransitionError(currentStatus: FulfillmentStatus, nextStatus: FulfillmentStatus, paymentStatus?: string | null) {
  if (currentStatus === "archived" && nextStatus !== "archived") {
    return "Um pedido arquivado não pode voltar ao fluxo operacional.";
  }

  // Marcar como enviado é uma decisão operacional explícita do administrador.
  // Não deve depender de etiqueta, cotação, pagamento ou da etapa visual anterior.
  if (nextStatus === "shipped") return null;

  const paymentConfirmed = ["approved", "authorized"].includes(String(paymentStatus ?? "").toLowerCase());
  if (["packed", "archived"].includes(nextStatus) && !paymentConfirmed) {
    return "Só é possível preparar ou arquivar pedidos com pagamento aprovado.";
  }

  if (nextStatus !== "pending_packaging" && nextStatus !== currentStatus) {
    const expectedNext = getNextFulfillmentStatus(currentStatus);
    if (expectedNext !== nextStatus) return "O pedido deve seguir a sequência: embalar, enviar e arquivar.";
  }

  return null;
}

export async function updateOrderFulfillmentStatus(orderId: number, nextStatus: FulfillmentStatus) {
  const db = await getDb();
  if (!db) return undefined;
  const current = await getOrderById(orderId);
  if (!current) return undefined;

  const currentStatus = (current.fulfillmentStatus || (current.archivedAt ? "archived" : "pending_packaging")) as FulfillmentStatus;
  const transitionError = getFulfillmentTransitionError(currentStatus, nextStatus, current.paymentStatus);
  if (transitionError) throw new Error(transitionError);

  const statusLabel = nextStatus === "packed" ? "Embalado" : nextStatus === "shipped" ? "Enviado" : nextStatus === "archived" ? "Arquivado" : "Processando";
  await db.update(orders).set({
    fulfillmentStatus: nextStatus,
    status: statusLabel,
    archivedAt: nextStatus === "archived" ? new Date() : null,
  }).where(eq(orders.id, orderId));
  const updated = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return updated[0] ? normalizeOrderForClient(updated[0]) : undefined;
}

export type AnalyticsRange = {
  cutoff: number;
  rangeEnd: number;
  effectivePeriodDays: number;
  hasCustomRange: boolean;
};

export function resolveAnalyticsRange(
  periodDays = 7,
  range?: { startAt?: number; endAt?: number },
  now = Date.now(),
): AnalyticsRange {
  const safeNow = Number.isFinite(now) ? now : Date.now();
  const requestedDays = Number.isFinite(periodDays) ? Math.max(1, Math.floor(periodDays)) : 7;
  const hasCustomRange = Number.isFinite(range?.startAt) && Number.isFinite(range?.endAt) && (range?.endAt as number) > (range?.startAt as number);
  const rangeEnd = hasCustomRange ? Math.min(range?.endAt as number, safeNow) : safeNow;
  const cutoff = hasCustomRange ? (range?.startAt as number) : safeNow - requestedDays * 24 * 60 * 60 * 1000;
  const effectivePeriodDays = hasCustomRange
    ? Math.max(1, Math.ceil(Math.max(1, rangeEnd - cutoff) / (24 * 60 * 60 * 1000)))
    : requestedDays;
  return { cutoff, rangeEnd, effectivePeriodDays, hasCustomRange };
}

export async function recordAnalyticsEvent(data: { visitorId: string; path: string; eventType?: string }) {
  const db = await getDb();
  if (!db) return { success: false };
  await db.insert(analyticsEvents).values({
    visitorId: data.visitorId.trim().slice(0, 120),
    path: data.path.trim().slice(0, 255) || "/",
    eventType: data.eventType?.trim().slice(0, 40) || "page_view",
  });
  return { success: true };
}

export async function updateOrderLabelData(orderId: number, data: { shippingOrderId?: string; labelPdfUrl?: string }) {
  const db = await getDb();
  if (!db) return;
  await db.update(orders).set(data).where(eq(orders.id, orderId));
}

export function aggregateVariationStock(variations: Array<{ productId: number | null | undefined; stock: number | null | undefined }>) {
  const stockByProduct = new Map<number, number>();
  for (const variation of variations) {
    const productId = Number(variation.productId);
    if (!productId) continue;
    stockByProduct.set(productId, (stockByProduct.get(productId) || 0) + Math.max(0, Number(variation.stock) || 0));
  }
  return stockByProduct;
}

export async function getAdminAnalytics(periodDays: number = 7, range?: { startAt?: number; endAt?: number }) {
  const db = await getDb();
  const { cutoff, rangeEnd, effectivePeriodDays, hasCustomRange } = resolveAnalyticsRange(periodDays, range);
  const emptyAnalytics = {
    period: { startAt: cutoff, endAt: rangeEnd, days: effectivePeriodDays, custom: hasCustomRange, generatedAt: Date.now() },
    summary: { visits: 0, pageViews: 0, sales: 0, revenue: 0, grossRevenue: 0, discounts: 0, averageTicket: 0, conversionRate: 0 },
    comparison: { visits: null, sales: null, revenue: null, averageTicket: null, conversionRate: null },
    visitorBehavior: { totalVisits: 0, pageViews: 0, homeViews: 0, categoryViews: 0, collectionViews: 0, productViews: 0, cartViews: 0, checkoutViews: 0 },
    funnel: { visits: 0, productViews: 0, cartViews: 0, checkoutViews: 0, paidOrders: 0 },
    salesTrend: [],
    topProducts: [],
    couponStats: { totalCoupons: 0, activeCoupons: 0, totalUses: 0, discountedOrders: 0, discountAmount: 0, topCoupons: [] },
  };
  if (!db) return emptyAnalytics;

  const dayMs = 24 * 60 * 60 * 1000;
  const getTime = (value: unknown) => value ? new Date(value as any).getTime() : 0;
  const isPaidOrder = (order: any) => ["approved", "authorized"].includes(String(order.paymentStatus ?? "").trim().toLowerCase());
  const isCancelledOrder = (order: any) => ["cancelled", "canceled", "estornado", "refunded"].includes(String(order.status ?? "").trim().toLowerCase());
  const isCountableSale = (order: any) => isPaidOrder(order) && !isCancelledOrder(order);
  const changePercent = (current: number, previous: number) => previous === 0 ? (current === 0 ? 0 : null) : Number((((current - previous) / previous) * 100).toFixed(2));
  const sum = (items: any[], key: string) => items.reduce((total, item) => total + Number(item[key] || 0), 0);
  const uniqueVisitorCount = (events: any[]) => new Set(events.map((event) => String(event.visitorId || "").trim()).filter(Boolean)).size;
  const previousCutoff = cutoff - effectivePeriodDays * dayMs;
  const queryStart = new Date(previousCutoff);
  const queryEnd = new Date(rangeEnd);

  // O painel usa somente os eventos que participam do período atual ou da comparação.
  // Evitamos carregar o histórico integral de eventos/pedidos a cada abertura da tela,
  // sem estimar ou fabricar métricas: tudo continua vindo das linhas reais do banco.
  const [periodOrders, periodVisitEvents, allProducts, allCoupons, allVariations] = await Promise.all([
    db.select().from(orders).where(and(gte(orders.createdAt, queryStart), lte(orders.createdAt, queryEnd))),
    db.select().from(analyticsEvents).where(and(gte(analyticsEvents.createdAt, queryStart), lte(analyticsEvents.createdAt, queryEnd))),
    db.select().from(products),
    db.select().from(coupons),
    db.select({ productId: productVariations.productId, stock: productVariations.stock }).from(productVariations),
  ]);
  const stockByProduct = aggregateVariationStock(allVariations);
  const filteredOrders = periodOrders.filter((order: any) => {
    const createdAt = getTime(order.createdAt);
    return createdAt >= cutoff && createdAt <= rangeEnd;
  });
  const salesOrders = filteredOrders.filter(isCountableSale);
  const filteredVisits = periodVisitEvents.filter((event: any) => {
    const createdAt = getTime(event.createdAt);
    return event.eventType === "page_view" && createdAt >= cutoff && createdAt <= rangeEnd;
  });
  const previousOrders = periodOrders.filter((order: any) => {
    const createdAt = getTime(order.createdAt);
    return createdAt >= previousCutoff && createdAt < cutoff && isCountableSale(order);
  });
  const previousVisits = periodVisitEvents.filter((event: any) => {
    const createdAt = getTime(event.createdAt);
    return event.eventType === "page_view" && createdAt >= previousCutoff && createdAt < cutoff;
  });

  const pageViews = filteredVisits.length;
  const visits = uniqueVisitorCount(filteredVisits);
  const totalRevenue = sum(salesOrders, "total");
  const totalDiscounts = sum(salesOrders, "discount");
  const totalSales = salesOrders.length;
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
  const conversionRate = visits > 0 ? Number(((totalSales / visits) * 100).toFixed(2)) : 0;
  const previousRevenue = sum(previousOrders, "total");
  const previousSales = previousOrders.length;
  const previousVisitsCount = uniqueVisitorCount(previousVisits);
  const previousAverageTicket = previousSales > 0 ? previousRevenue / previousSales : 0;
  const previousConversionRate = previousVisitsCount > 0 ? Number(((previousSales / previousVisitsCount) * 100).toFixed(2)) : 0;
  const pathCount = (matcher: (path: string) => boolean) => filteredVisits.filter((event: any) => matcher(String(event.path || ""))).length;
  const categoryViews = pathCount((path) => path.startsWith("/category") || path.startsWith("/categoria"));
  const collectionViews = pathCount((path) => path.startsWith("/collection") || path.startsWith("/colecao"));
  const productViews = pathCount((path) => path.startsWith("/produto") || path.startsWith("/product"));
  const cartViews = pathCount((path) => path === "/cart" || path === "/sacola" || path.startsWith("/cart/"));
  const checkoutViews = pathCount((path) => path === "/checkout" || path.startsWith("/checkout/"));

  const stepCount = effectivePeriodDays <= 2 ? effectivePeriodDays : effectivePeriodDays <= 7 ? 7 : effectivePeriodDays <= 30 ? 6 : 8;
  const bucketDuration = Math.max(1, (rangeEnd - cutoff) / stepCount);
  const previousBucketDuration = Math.max(1, (cutoff - previousCutoff) / stepCount);
  const formatLabel = (timestamp: number, index: number) => {
    if (effectivePeriodDays <= 2) return new Date(timestamp).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    if (effectivePeriodDays <= 7) return index === stepCount - 1 ? "Hoje" : new Date(timestamp).toLocaleDateString("pt-BR", { weekday: "short" });
    if (effectivePeriodDays <= 30) return `Semana ${index + 1}`;
    return `Período ${index + 1}`;
  };
  const salesTrend = Array.from({ length: stepCount }).map((_, index) => {
    const bucketStart = cutoff + bucketDuration * index;
    const bucketEnd = index === stepCount - 1 ? rangeEnd + 1 : cutoff + bucketDuration * (index + 1);
    const previousBucketStart = previousCutoff + previousBucketDuration * index;
    const previousBucketEnd = index === stepCount - 1 ? cutoff : previousCutoff + previousBucketDuration * (index + 1);
    const currentOrders = salesOrders.filter((order: any) => getTime(order.createdAt) >= bucketStart && getTime(order.createdAt) < bucketEnd);
    const currentVisits = filteredVisits.filter((event: any) => getTime(event.createdAt) >= bucketStart && getTime(event.createdAt) < bucketEnd);
    const priorOrders = previousOrders.filter((order: any) => getTime(order.createdAt) >= previousBucketStart && getTime(order.createdAt) < previousBucketEnd);
    return {
      label: formatLabel(bucketStart, index),
      orders: currentOrders.length,
      revenue: Number(sum(currentOrders, "total").toFixed(2)),
      prevRevenue: Number(sum(priorOrders, "total").toFixed(2)),
      visits: uniqueVisitorCount(currentVisits),
      pageViews: currentVisits.length,
    };
  });

  const productSalesMap = new Map<number, { unitsSold: number; revenue: number }>();
  for (const order of salesOrders) {
    try {
      const items = typeof order.items === "string" ? JSON.parse(order.items) : (order.items || []);
      for (const item of items) {
        const productId = Number(item.productId || item.id || 0);
        const quantity = Math.max(1, Number(item.quantity || 1));
        if (!productId) continue;
        const unitPrice = Number(item.price ?? item.unitPrice ?? 0);
        const current = productSalesMap.get(productId) || { unitsSold: 0, revenue: 0 };
        current.unitsSold += quantity;
        current.revenue += Number(item.total ?? item.lineTotal ?? (unitPrice * quantity));
        productSalesMap.set(productId, current);
      }
    } catch {
      // Itens legados inválidos não podem inventar métricas; são ignorados.
    }
  }
  const topProducts = allProducts.map((product: any) => {
    const metrics = productSalesMap.get(product.id) || { unitsSold: 0, revenue: 0 };
    return {
      id: product.id,
      name: product.name,
      category: product.category || "Geral",
      price: Number(product.price || 0),
      stock: stockByProduct.get(Number(product.id)) ?? 0,
      velocity: Number((metrics.unitsSold / Math.max(1, effectivePeriodDays)).toFixed(2)),
      unitsSold: metrics.unitsSold,
      revenue: Number(metrics.revenue.toFixed(2)),
    };
  }).filter((product) => product.unitsSold > 0).sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 8);

  const discountedOrders = salesOrders.filter((order: any) => Number(order.discount || 0) > 0).length;
  const topCoupons = allCoupons.filter((coupon: any) => Number(coupon.timesUsed || 0) > 0).map((coupon: any) => ({
    code: coupon.code,
    uses: Number(coupon.timesUsed || 0),
    discountPercent: Number(coupon.discountPercent || 0),
    active: Number(coupon.active || 0) === 1,
  })).sort((a, b) => b.uses - a.uses).slice(0, 5);

  return {
    period: { startAt: cutoff, endAt: rangeEnd, days: effectivePeriodDays, custom: hasCustomRange, generatedAt: Date.now() },
    summary: {
      visits,
      pageViews,
      sales: totalSales,
      revenue: Number(totalRevenue.toFixed(2)),
      grossRevenue: Number((totalRevenue + totalDiscounts).toFixed(2)),
      discounts: Number(totalDiscounts.toFixed(2)),
      averageTicket: Number(averageTicket.toFixed(2)),
      conversionRate,
    },
    comparison: {
      visits: changePercent(visits, previousVisitsCount),
      sales: changePercent(totalSales, previousSales),
      revenue: changePercent(totalRevenue, previousRevenue),
      averageTicket: changePercent(averageTicket, previousAverageTicket),
      conversionRate: changePercent(conversionRate, previousConversionRate),
    },
    visitorBehavior: {
      totalVisits: visits,
      pageViews,
      homeViews: pathCount((path) => path === "/"),
      categoryViews,
      collectionViews,
      productViews,
      cartViews,
      checkoutViews,
    },
    funnel: { visits, productViews, cartViews, checkoutViews, paidOrders: totalSales },
    salesTrend,
    topProducts,
    couponStats: {
      totalCoupons: allCoupons.length,
      activeCoupons: allCoupons.filter((coupon: any) => Number(coupon.active || 0) === 1).length,
      totalUses: allCoupons.reduce((total: number, coupon: any) => total + Number(coupon.timesUsed || 0), 0),
      discountedOrders,
      discountAmount: Number(totalDiscounts.toFixed(2)),
      topCoupons,
    },
  };
}

export async function logInventoryAudit(data: { productId: number; productName: string; size: string; previousStock: number; newStock: number; adminEmail: string; adminName?: string }) {
  const db = await getDb();
  if (!db) return;
  await db.insert(inventoryAuditLogs).values({
    productId: data.productId,
    productName: data.productName,
    size: data.size,
    previousStock: data.previousStock,
    newStock: data.newStock,
    adminEmail: data.adminEmail,
    adminName: data.adminName || "Administrador",
  });
}

export async function getCategoryRevenueMetrics() {
  const db = await getDb();
  if (!db) return [];

  const [allOrders, allProducts] = await Promise.all([
    db.select().from(orders),
    db.select().from(products),
  ]);
  const productCategories = new Map<number, string>();
  for (const product of allProducts) {
    productCategories.set(product.id, product.category || "Geral");
  }

  const categoryMap: Record<string, { revenue: number; count: number }> = {};
  for (const order of allOrders as any[]) {
    const paymentStatus = String(order.paymentStatus ?? "").trim().toLowerCase();
    const orderStatus = String(order.status ?? "").trim().toLowerCase();
    if (!["approved", "authorized"].includes(paymentStatus)) continue;
    if (["cancelled", "canceled", "estornado", "refunded"].includes(orderStatus)) continue;
    let items: Array<Record<string, unknown>> = [];
    try {
      const parsed = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
      if (Array.isArray(parsed)) items = parsed;
    } catch {
      continue;
    }
    for (const item of items) {
      const productId = Number(item.productId || item.id || 0);
      const category = productCategories.get(productId) || String(item.category || "Geral");
      const quantity = Math.max(1, Number(item.quantity || 1));
      const unitPrice = Number(item.price ?? item.unitPrice ?? 0);
      const revenue = Number(item.total ?? item.lineTotal ?? (unitPrice * quantity));
      categoryMap[category] ??= { revenue: 0, count: 0 };
      categoryMap[category].count += quantity;
      categoryMap[category].revenue += Number.isFinite(revenue) ? revenue : 0;
    }
  }

  return Object.entries(categoryMap)
    .map(([category, data]) => ({ category, revenue: Number(data.revenue.toFixed(2)), count: data.count }))
    .sort((a, b) => b.revenue - a.revenue);
}

export async function getLowStockAlerts() {
  const db = await getDb();
  if (!db) return [];
  const [allProducts, allVariations] = await Promise.all([
    db.select().from(products),
    db.select({ productId: productVariations.productId, stock: productVariations.stock }).from(productVariations),
  ]);
  const stockByProduct = aggregateVariationStock(allVariations);
  return allProducts.map((product: any) => ({
    id: product.id,
    name: product.name,
    stock: stockByProduct.get(Number(product.id)) ?? 0,
    sku: product.sku || "",
    category: product.category || "Geral",
  })).filter((product) => product.stock < 5);
}

export async function listInventoryAuditLogs(filters?: {
  adminFilter?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "createdAt" | "productName" | "size" | "newStock" | "adminName";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  
  const rows = await db.select().from(inventoryAuditLogs);

  const filtered = rows.filter((log: any) => {
    if (filters?.adminFilter && filters.adminFilter !== "all") {
      const matchEmail = log.adminEmail?.toLowerCase().includes(filters.adminFilter.toLowerCase());
      const matchName = log.adminName?.toLowerCase().includes(filters.adminFilter.toLowerCase());
      if (!matchEmail && !matchName) return false;
    }
    if (filters?.startDate) {
      const logTime = new Date(log.createdAt).getTime();
      const startTime = new Date(filters.startDate).getTime();
      if (!isNaN(startTime) && logTime < startTime) return false;
    }
    if (filters?.endDate) {
      const logTime = new Date(log.createdAt).getTime();
      const endTime = new Date(filters.endDate).getTime() + 24 * 60 * 60 * 1000 - 1;
      if (!isNaN(endTime) && logTime > endTime) return false;
    }
    return true;
  });

  const sortBy = filters?.sortBy || "createdAt";
  const sortOrder = filters?.sortOrder || "desc";

  filtered.sort((a: any, b: any) => {
    let valA = a[sortBy];
    let valB = b[sortBy];
    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const page = filters?.page || 1;
  const pageSize = filters?.pageSize || 10;
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return { items, total, page, pageSize };
}

export async function listAdminUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(adminUsers);
}

export async function getAdminUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
  return rows[0] || null;
}

export async function createAdminUser(data: { email: string; name: string; passwordHash: string; roleTitle: string; permissions: string; isActive?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(adminUsers).values({
    email: data.email.toLowerCase().trim(),
    name: data.name,
    passwordHash: data.passwordHash,
    roleTitle: data.roleTitle || "Assistente",
    permissions: data.permissions || "products,inventory,categories,stats,emails,settings",
    isActive: data.isActive ?? 1,
  });
  return { id: result.insertId };
}

export async function updateAdminUser(id: number, data: { name?: string; roleTitle?: string; permissions?: string; isActive?: number; passwordHash?: string; avatarUrl?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: any = { updatedAt: new Date() };
  if (data.name !== undefined) updateData.name = data.name;
  if (data.roleTitle !== undefined) updateData.roleTitle = data.roleTitle;
  if (data.permissions !== undefined) updateData.permissions = data.permissions;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.passwordHash !== undefined) updateData.passwordHash = data.passwordHash;
  if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;

  await db.update(adminUsers).set(updateData).where(eq(adminUsers.id, id));
}

export async function deleteAdminUser(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(adminUsers).where(eq(adminUsers.id, id));
}

export async function getOrderItems(orderId: number) {
  const order = await getOrderById(orderId);
  if (!order || !Array.isArray(order.items)) return [];
  return (order.items as Array<Record<string, unknown>>).map((item) => ({
    productName: String(item.productName ?? item.name ?? "Peça Eras Label"),
    quantity: Number(item.quantity ?? 1),
    unitPrice: Number(item.unitPrice ?? item.price ?? 0),
    size: String(item.size ?? "Único"),
  }));
}



function safeStorefrontString(value: unknown, fallback: string, maxLength: number) {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim();
  return normalized ? normalized.slice(0, maxLength) : fallback;
}

function safeHexColor(value: unknown, fallback: string) {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

function normalizeAnnouncementMessages(value: { messages?: unknown; text?: unknown; href?: unknown }): StorefrontAnnouncementMessage[] {
  const rawMessages = Array.isArray(value.messages) ? value.messages : [{ text: value.text, href: value.href }];
  const messages = rawMessages.map((item, index) => {
    const candidate = (item && typeof item === "object" ? item : {}) as { id?: unknown; text?: unknown; href?: unknown };
    const text = typeof candidate.text === "string" ? candidate.text.trim().slice(0, 180) : "";
    if (!text) return null;
    return {
      id: safeStorefrontString(candidate.id, `announcement-${index + 1}`, 80),
      text,
      href: typeof candidate.href === "string" ? candidate.href.trim().slice(0, 500) : "",
    };
  }).filter((message): message is StorefrontAnnouncementMessage => Boolean(message));
  return messages.length > 0 ? messages : DEFAULT_STOREFRONT_CONFIG.announcement.messages;
}

function normalizeStorefrontConfig(value: unknown): StorefrontConfig {
  const saved = (value && typeof value === "object" ? value : {}) as Partial<StorefrontConfig>;
  const announcement = (saved.announcement ?? {}) as Partial<StorefrontConfig["announcement"]> & { text?: unknown; href?: unknown };
  const maintenance = (saved.maintenance ?? {}) as Partial<StorefrontConfig["maintenance"]>;
  const accessPasswordHash = typeof (saved as Record<string, unknown>).accessPasswordHash === "string" ? (saved as Record<string, unknown>).accessPasswordHash as string : "";
  const drop = (saved.drop ?? {}) as Partial<StorefrontConfig["drop"]>;
  const targetAt = typeof drop.targetAt === "string" && !Number.isNaN(Date.parse(drop.targetAt)) ? drop.targetAt : null;

  return {
    announcement: {
      enabled: announcement.enabled !== false,
      messages: normalizeAnnouncementMessages(announcement),
      backgroundColor: safeHexColor(announcement.backgroundColor, DEFAULT_STOREFRONT_CONFIG.announcement.backgroundColor),
      textColor: safeHexColor(announcement.textColor, DEFAULT_STOREFRONT_CONFIG.announcement.textColor),
      rotationSpeedSeconds: typeof announcement.rotationSpeedSeconds === "number" && announcement.rotationSpeedSeconds >= 2 && announcement.rotationSpeedSeconds <= 15 ? announcement.rotationSpeedSeconds : DEFAULT_STOREFRONT_CONFIG.announcement.rotationSpeedSeconds,
      showArrows: announcement.showArrows !== false,
    },
    maintenance: {
      enabled: maintenance.enabled === true,
      title: safeStorefrontString(maintenance.title, DEFAULT_STOREFRONT_CONFIG.maintenance.title, 100),
      message: safeStorefrontString(maintenance.message, DEFAULT_STOREFRONT_CONFIG.maintenance.message, 500),
      accessLabel: safeStorefrontString(maintenance.accessLabel, DEFAULT_STOREFRONT_CONFIG.maintenance.accessLabel, 100),
      passwordConfigured: Boolean(accessPasswordHash),
    },
    drop: {
      enabled: drop.enabled === true && Boolean(targetAt),
      title: safeStorefrontString(drop.title, DEFAULT_STOREFRONT_CONFIG.drop.title, 100),
      targetAt,
    },
  };
}

export async function getStorefrontConfig(): Promise<StorefrontConfig> {
  const db = await getDb();
  if (!db) return DEFAULT_STOREFRONT_CONFIG;
  const rows = await db.select().from(siteAppearance).where(eq(siteAppearance.sectionKey, "storefront_config")).limit(1);
  return normalizeStorefrontConfig(rows[0]?.content);
}

export async function saveStorefrontConfig(config: StorefrontConfig, accessPasswordHash?: string | null): Promise<StorefrontConfig> {
  const normalized = normalizeStorefrontConfig(config);
  const db = await getDb();
  if (!db) return normalizeStorefrontConfig({ ...normalized, ...(accessPasswordHash ? { accessPasswordHash } : {}) });
  const existing = await db.select().from(siteAppearance).where(eq(siteAppearance.sectionKey, "storefront_config")).limit(1);
  const existingContent = (existing[0]?.content && typeof existing[0].content === "object" ? existing[0].content : {}) as Record<string, unknown>;
  const currentHash = typeof existingContent.accessPasswordHash === "string" ? existingContent.accessPasswordHash : "";
  const nextHash = accessPasswordHash === undefined ? currentHash : accessPasswordHash || "";
  const persisted = { ...normalized, ...(nextHash ? { accessPasswordHash: nextHash } : {}) };
  if (existing[0]) {
    await db.update(siteAppearance).set({ content: persisted as any }).where(eq(siteAppearance.sectionKey, "storefront_config"));
  } else {
    await db.insert(siteAppearance).values({ sectionKey: "storefront_config", content: persisted as any });
  }
  return normalizeStorefrontConfig(persisted);
}

export async function getStorefrontAccessPasswordHash(): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select({ content: siteAppearance.content }).from(siteAppearance).where(eq(siteAppearance.sectionKey, "storefront_config")).limit(1);
  const content = (rows[0]?.content && typeof rows[0].content === "object" ? rows[0].content : {}) as Record<string, unknown>;
  return typeof content.accessPasswordHash === "string" && content.accessPasswordHash ? content.accessPasswordHash : null;
}


/**
 * Funções auxiliares para Gestão de Conteúdo (CMS) e Menus Dinâmicos
 * Permitem ler e salvar páginas institucionais e itens de menu customizados no banco de dados.
 */

export async function getCmsPage(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(cmsPages).where(eq(cmsPages.slug, slug)).limit(1);
  return rows[0] || null;
}

export async function saveCmsPage(slug: string, data: { title: string; subtitle?: string; content: string; bannerUrl?: string }) {
  const db = await getDb();
  if (!db) return null;
  const existing = await db.select().from(cmsPages).where(eq(cmsPages.slug, slug)).limit(1);
  if (existing[0]) {
    await db.update(cmsPages).set({
      title: data.title,
      subtitle: data.subtitle ?? null,
      content: data.content,
      bannerUrl: data.bannerUrl ?? null,
      updatedAt: new Date(),
    }).where(eq(cmsPages.slug, slug));
  } else {
    await db.insert(cmsPages).values({
      slug,
      title: data.title,
      subtitle: data.subtitle ?? null,
      content: data.content,
      bannerUrl: data.bannerUrl ?? null,
    });
  }
  return getCmsPage(slug);
}

export async function listCustomMenus(location?: string) {
  const db = await getDb();
  if (!db) return [];
  if (location) {
    return db.select().from(customMenus).where(eq(customMenus.location, location)).orderBy(customMenus.sortOrder);
  }
  return db.select().from(customMenus).orderBy(customMenus.sortOrder);
}

export async function saveCustomMenu(data: { id?: number; location: string; label: string; url: string; sortOrder?: number; isVisible?: number }) {
  const db = await getDb();
  if (!db) return null;
  if (data.id) {
    await db.update(customMenus).set({
      location: data.location,
      label: data.label,
      url: data.url,
      sortOrder: data.sortOrder ?? 0,
      isVisible: data.isVisible ?? 1,
    }).where(eq(customMenus.id, data.id));
    return data.id;
  } else {
    const res = await db.insert(customMenus).values({
      location: data.location,
      label: data.label,
      url: data.url,
      sortOrder: data.sortOrder ?? 0,
      isVisible: data.isVisible ?? 1,
    });
    return Number(res[0].insertId);
  }
}

export async function deleteCustomMenu(id: number) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(customMenus).where(eq(customMenus.id, id));
  return true;
}

export async function listAdminCollections() {
  const db = await getDb();
  if (!db) {
    return [
      { id: 1, name: "Paradox Collection", slug: "paradox", year: "2026", description: "A colisão entre memórias analógicas e o futuro digital.", editorialText: "Travessia, Dissociação, Ressonador, Vórtex e Time Break. A era em curso: estar em dois tempos ao mesmo tempo.", imageUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=2000&q=90", ctaLabel: "COMPRAR A ERA", ctaUrl: "/collection/paradox", sortOrder: 1, active: 1, createdAt: new Date() },
      { id: 2, name: "Lost Between Eras", slug: "lost-between-eras", year: "2025", description: "Inspirada nos anos 90 e na estética underground de transição de milénio.", editorialText: "Ruínas urbanas, fitas cassete e silhuetas que desafiam a gravidade.", imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=2000&q=90", ctaLabel: "VER COLEÇÃO", ctaUrl: "/collection/lost-between-eras", sortOrder: 2, active: 1, createdAt: new Date() },
      { id: 3, name: "Raízes — Recife & La Ursa", slug: "raizes", year: "2024", description: "Uma homenagem vibrante à cultura pernambucana.", editorialText: "Raízes fincadas no mangue beat e no frevo de rua.", imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=2000&q=90", ctaLabel: "EXPLORAR ERA", ctaUrl: "/collection/raizes", sortOrder: 3, active: 1, createdAt: new Date() },
    ];
  }
  const rows = await db.select().from(collections).orderBy(asc(collections.sortOrder), desc(collections.id));
  if (rows.length === 0) {
    // Seed inicial padrão
    const defaults = [
      { name: "Paradox Collection", slug: "paradox", year: "2026", description: "A colisão entre memórias analógicas e o futuro digital.", editorialText: "Travessia, Dissociação, Ressonador, Vórtex e Time Break. A era em curso: estar em dois tempos ao mesmo tempo.", imageUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=2000&q=90", ctaLabel: "COMPRAR A ERA", ctaUrl: "/collection/paradox", sortOrder: 1, active: 1 },
      { name: "Lost Between Eras", slug: "lost-between-eras", year: "2025", description: "Inspirada nos anos 90 e na estética underground de transição de milénio.", editorialText: "Ruínas urbanas, fitas cassete e silhuetas que desafiam a gravidade.", imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=2000&q=90", ctaLabel: "VER COLEÇÃO", ctaUrl: "/collection/lost-between-eras", sortOrder: 2, active: 1 },
      { name: "Raízes — Recife & La Ursa", slug: "raizes", year: "2024", description: "Uma homenagem vibrante à cultura pernambucana.", editorialText: "Raízes fincadas no mangue beat e no frevo de rua.", imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=2000&q=90", ctaLabel: "EXPLORAR ERA", ctaUrl: "/collection/raizes", sortOrder: 3, active: 1 },
    ];
    for (const def of defaults) {
      await db.insert(collections).values(def).onDuplicateKeyUpdate({ set: { name: def.name } });
    }
    return db.select().from(collections).orderBy(asc(collections.sortOrder), desc(collections.id));
  }
  return rows;
}

export async function saveCollectionData(data: {
  id?: number;
  name: string;
  slug?: string;
  year: string;
  description?: string;
  editorialText?: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  sortOrder?: number;
  active?: number;
}) {
  const db = await getDb();
  const slug = data.slug?.trim() ? slugifyCategory(data.slug) : slugifyCategory(data.name);
  const values = {
    name: data.name,
    slug,
    year: data.year || "2026",
    description: data.description || "",
    editorialText: data.editorialText || "",
    imageUrl: data.imageUrl || "",
    ctaLabel: data.ctaLabel || "VER COLEÇÃO",
    ctaUrl: data.ctaUrl || `/collection/${slug}`,
    sortOrder: Number(data.sortOrder || 0),
    active: data.active !== undefined ? Number(data.active) : 1,
  };

  if (!db) return { id: data.id || 1, ...values };

  if (data.id) {
    await db.update(collections).set(values).where(eq(collections.id, data.id));
    const [updated] = await db.select().from(collections).where(eq(collections.id, data.id)).limit(1);
    return updated;
  } else {
    const [inserted] = await db.insert(collections).values(values);
    const insertId = Number((inserted as any).insertId || 0);
    const [created] = await db.select().from(collections).where(eq(collections.id, insertId)).limit(1);
    return created;
  }
}

export async function archiveCollection(id: number) {
  const db = await getDb();
  if (!db) return { success: true };
  await db.update(collections).set({ active: 0 }).where(eq(collections.id, id));
  return { success: true };
}


export async function listAdminCoupons() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(coupons).orderBy(desc(coupons.createdAt));
}

export async function saveCouponData(data: {
  id?: number;
  code: string;
  discountType?: string;
  discountPercent?: number;
  fixedAmount?: number;
  usageLimit?: number | null;
  minPurchase?: number;
  validUntil?: string | null;
  active?: number;
  isFirstPurchaseOnly?: number;
}) {
  const db = await getDb();
  const code = data.code.trim().toUpperCase();
  if (!code) throw new Error("Código do cupom é obrigatório.");
  
  const discountType = data.discountType || "percent";
  let promoType = "standard";
  let percentVal = Number(data.discountPercent ?? 10);
  
  if (discountType === "free_shipping") {
    promoType = "free_shipping";
    percentVal = 0;
  } else if (discountType === "fixed") {
    promoType = "fixed";
  }

  const values: InsertCoupon = {
    code,
    discountPercent: percentVal.toFixed(2),
    usageLimit: data.usageLimit ?? null,
    minPurchase: (data.minPurchase ?? 0).toFixed(2),
    validUntil: data.validUntil ? new Date(data.validUntil) : null,
    active: data.active ?? 1,
    promoType,
    promoRules: discountType === "fixed" ? { fixedAmount: data.fixedAmount || 0 } : null,
    isFirstPurchaseOnly: data.isFirstPurchaseOnly ?? 0,
  };
  if (!db) return { ...values, id: data.id ?? 0, timesUsed: 0, createdAt: new Date() };
  if (data.id) {
    await db.update(coupons).set(values).where(eq(coupons.id, data.id));
    const updated = await db.select().from(coupons).where(eq(coupons.id, data.id)).limit(1);
    return updated[0];
  }
  await db.insert(coupons).values(values);
  const created = await db.select().from(coupons).where(eq(coupons.code, code)).limit(1);
  return created[0];
}

export async function toggleCouponActive(id: number, active: number) {
  const db = await getDb();
  if (!db) return { success: true };
  await db.update(coupons).set({ active }).where(eq(coupons.id, id));
  return { success: true };
}

export async function deleteCouponData(id: number) {
  const db = await getDb();
  if (!db) return { success: true };
  await db.delete(coupons).where(eq(coupons.id, id));
  return { success: true };
}

// ==================== SHIPMENTS & LOGISTICS (ENVIOS) = ===
export async function listShipments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(shipments).orderBy(desc(shipments.createdAt)).limit(100);
}

export async function createShipment(data: { type: string; recipientName: string; recipientAddress: string; carrier?: string; trackingCode?: string; shippingCost?: number; estimatedDays?: number; notes?: string }) {
  const db = await getDb();
  const shipmentNumber = `#SHP-${Math.floor(100000 + Math.random() * 900000)}`;
  const values = {
    shipmentNumber,
    type: data.type || "Avulso",
    recipientName: data.recipientName,
    recipientAddress: data.recipientAddress,
    carrier: data.carrier || "Jadlog Econômico",
    trackingCode: data.trackingCode || `NEB-${Math.floor(10000000 + Math.random() * 90000000)}`,
    shippingCost: String(data.shippingCost ?? 18.50),
    estimatedDays: Number(data.estimatedDays ?? 5),
    status: "Por enviar",
    notes: data.notes || null,
  };
  if (!db) return { id: 1, ...values };
  const res = await db.insert(shipments).values(values);
  return { id: Number(res[0].insertId), ...values };
}

export async function updateShipmentStatus(id: number, status: string, trackingCode?: string) {
  const db = await getDb();
  if (!db) return { success: true };
  const updateData: any = { status };
  if (trackingCode) updateData.trackingCode = trackingCode;
  await db.update(shipments).set(updateData).where(eq(shipments.id, id));
  return { success: true };
}

export async function getExtraShippingDays(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const rows = await db.select().from(siteAppearance).where(eq(siteAppearance.sectionKey, "shipping_extra_days")).limit(1);
  const val = rows[0]?.content as { extraDays?: number } | undefined;
  return Number(val?.extraDays ?? 0);
}

export async function saveExtraShippingDays(extraDays: number) {
  const normalized = Math.max(0, Math.min(60, Number(extraDays || 0)));
  const db = await getDb();
  if (!db) return normalized;
  const existing = await db.select().from(siteAppearance).where(eq(siteAppearance.sectionKey, "shipping_extra_days")).limit(1);
  if (existing[0]) {
    await db.update(siteAppearance).set({ content: { extraDays: normalized } as any }).where(eq(siteAppearance.sectionKey, "shipping_extra_days"));
  } else {
    await db.insert(siteAppearance).values({ sectionKey: "shipping_extra_days", content: { extraDays: normalized } as any });
  }
  return normalized;
}

export async function restoreCollection(id: number) {
  const db = await getDb();
  if (!db) return { success: true };
  await db.update(collections).set({ active: 1 }).where(eq(collections.id, id));
  return { success: true };
}



// ==================== PROMOTIONS (PROMOÇÕES) ====================
export async function listPromotions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(promotions).orderBy(desc(promotions.createdAt)).limit(100);
}

export async function createPromotion(data: {
  id?: number;
  name: string;
  discountType?: string;
  scopeType?: string;
  scopeIds?: string | null;
  allowPromotionalPrice?: number;
  combinableWithPrice?: number;
  combinableWithShipping?: number;
  combinableWithCart?: number;
  combinableWithApps?: number;
  dateLimitType?: string;
  startDate?: string | null;
  endDate?: string | null;
  customBadgeEnabled?: number;
  customBadgeText?: string | null;
  status?: string;
}) {
  const db = await getDb();
  const values = {
    name: data.name,
    discountType: data.discountType || "buy_x_get_y",
    scopeType: data.scopeType || "store",
    scopeIds: data.scopeIds || null,
    allowPromotionalPrice: data.allowPromotionalPrice ? 1 : 0,
    combinableWithPrice: data.combinableWithPrice ? 1 : 0,
    combinableWithShipping: data.combinableWithShipping ? 1 : 0,
    combinableWithCart: data.combinableWithCart ? 1 : 0,
    combinableWithApps: data.combinableWithApps ? 1 : 0,
    dateLimitType: data.dateLimitType || "unlimited",
    startDate: data.startDate ? new Date(data.startDate) : null,
    endDate: data.endDate ? new Date(data.endDate) : null,
    customBadgeEnabled: data.customBadgeEnabled ? 1 : 0,
    customBadgeText: data.customBadgeText || null,
    status: data.status || "active",
  };
  if (!db) return { id: data.id || 1, ...values };
  if (data.id) {
    await db.update(promotions).set(values as any).where(eq(promotions.id, data.id));
    return { id: data.id, ...values };
  }
  const res = await db.insert(promotions).values(values as any);
  return { id: Number(res[0].insertId), ...values };
}

export async function togglePromotionStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) return { success: true };
  await db.update(promotions).set({ status }).where(eq(promotions.id, id));
  return { success: true };
}

export async function deletePromotion(id: number) {
  const db = await getDb();
  if (!db) return { success: true };
  await db.delete(promotions).where(eq(promotions.id, id));
  return { success: true };
}
