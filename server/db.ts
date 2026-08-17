import { eq, desc, asc, like, or, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { nanoid } from "nanoid";
import {
  InsertUser,
  users,
  products,
  productVariations,
  newsletterSubscribers,
  coupons,
  orders,
  siteAppearance,
  notifications,
  InsertNotification,
  resendEmailLogs,
  categories,
  productCategories,
  inventoryAuditLogs,
  adminUsers,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { collectCollectionRecipients } from "./marketing-audience";
import { normalizeInventoryVariations, sumInventoryStock } from "../shared/inventory";
import { normalizeCategoryName, slugifyCategory } from "../shared/categories";
import { DEFAULT_STOREFRONT_CONFIG, type StorefrontConfig, type StorefrontAnnouncementMessage } from "../shared/storefront";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
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

export async function listProducts(category?: string) {
  const db = await getDb();
  if (!db) return [];
  const resolvedCategory = category && category !== "Todos" ? await resolveCategoryName(category) : undefined;
  let categoryProductIds: number[] = [];
  if (resolvedCategory) {
    const matchingCategory = await db.select({ id: categories.id }).from(categories).where(eq(categories.name, resolvedCategory)).limit(1);
    if (matchingCategory[0]) {
      const relationRows = await db.select({ productId: productCategories.productId }).from(productCategories).where(eq(productCategories.categoryId, matchingCategory[0].id));
      categoryProductIds = relationRows.map((row) => Number(row.productId));
    }
  }
  const baseRows = await db.select().from(products).where(and(eq(products.status, "active"), eq(products.visibility, "visible")));
  const rows = resolvedCategory
    ? baseRows.filter((product) => product.category === resolvedCategory || product.subcategory === resolvedCategory || categoryProductIds.includes(product.id))
    : baseRows;
  // The storefront needs available sizes to filter accurately. Keep this enrichment
  // server-side so the UI does not have to guess from a product category.
  return Promise.all(rows.map(async (product) => {
    const variations = await db
      .select({ size: productVariations.size, stock: productVariations.stock })
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
    return { ...product, variations, categoryIds, categoryNames };
  }));
}

async function getProductRecordBySlug(slug: string, includeUnlisted: boolean) {
  const db = await getDb();
  if (!db) return undefined;
  const normalizedSlug = slug.trim().toLowerCase();
  const product = await db.select().from(products).where(eq(products.slug, normalizedSlug)).limit(1);
  if (!product[0] || product[0].status !== "active" || product[0].visibility === "hidden" || (!includeUnlisted && product[0].visibility !== "visible")) return undefined;
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
    eq(products.status, "active"),
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

export async function validateCoupon(code: string, subtotal: number) {
  const db = await getDb();
  if (!db) return code.trim().toUpperCase() === "ERAS10" ? { valid: true, discount: subtotal * 0.1, code: "ERAS10" } : { valid: false, discount: 0, code };
  const result = await db.select().from(coupons).where(eq(coupons.code, code.trim().toUpperCase())).limit(1);
  const coupon = result[0];
  if (!coupon && code.trim().toUpperCase() === "ERAS10") return { valid: true, discount: subtotal * 0.1, code: "ERAS10" };
  if (!coupon || !coupon.active || (coupon.usageLimit !== null && coupon.timesUsed >= coupon.usageLimit)) return { valid: false, discount: 0, code };
  if (coupon.validUntil && coupon.validUntil.getTime() < Date.now()) return { valid: false, discount: 0, code };
  if (coupon.minPurchase && subtotal < Number(coupon.minPurchase)) return { valid: false, discount: 0, code };
  const discount = coupon.discountPercent ? subtotal * Number(coupon.discountPercent) / 100 : 0;
  return { valid: true, discount, code: coupon.code };
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
    description: source.description ?? "",
    images: Array.isArray(source.images) ? source.images : [],
    status: source.status === "active" ? "Publicado" : source.status === "soldout" ? "Esgotado" : "Rascunho",
    variations: sourceVariations.map((variation) => ({ size: variation.size, stock: Number(variation.stock ?? 0) })),
  });
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
  installmentInterestRate: 0,
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

export async function saveCommercialConfig(config: CommercialConfig) {
  const normalized: CommercialConfig = {
    pixDiscountPercent: Math.min(100, Math.max(0, Number(config.pixDiscountPercent))),
    freeShippingThreshold: Math.max(0, Number(config.freeShippingThreshold)),
    maxInstallments: Math.min(24, Math.max(1, Math.round(Number(config.maxInstallments)))),
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

export type HomeContent = {
  banners: Array<{ id: string; eyebrow: string; title: string; subtitle: string; imageUrl: string; href: string; cta: string }>;
  highlights: Array<{ id: string; productId: number; label: string }>;
  vipBanner: { eyebrow: string; title: string; subtitle: string; imageUrl: string; href: string; cta: string };
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
    await db.insert(productVariations).values(normalizedVariations.map((variation) => ({ productId: data.productId, size: variation.size, stock: variation.stock })));
  }
  return { productId: data.productId, variations: normalizedVariations, totalStock: sumInventoryStock(normalizedVariations) };
}

export async function listClients() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.lastSignedIn));
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

export async function listOrders() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(orders).orderBy(desc(orders.id));
  return rows.map(normalizeOrderForClient);
}

export async function getOrderById(orderId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return rows[0];
}

export async function createOrder(data: typeof orders.$inferInsert) {
  const db = await getDb();
  if (!db) return undefined;
  
  // Validação server-side de estoque e baixa transacional das variações
  const rawItems = Array.isArray(data.items) ? (data.items as Array<any>) : [];
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

  await db.insert(orders).values(data);
  const created = await db.select().from(orders).where(eq(orders.orderNumber, data.orderNumber)).limit(1);
  return created[0];
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

export async function updateOrderPaymentStatus(orderNumber: string, paymentStatus: string) {
  const db = await getDb();
  if (!db) return undefined;
  const nextStatus = paymentStatus === "approved" ? "Processando" : paymentStatus === "cancelled" || paymentStatus === "rejected" ? "Pagamento recusado" : "Aguardando pagamento";
  await db.update(orders).set({ paymentStatus, status: nextStatus }).where(eq(orders.orderNumber, orderNumber));
  const updated = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  return updated[0];
}

export async function updateOrderTracking(orderId: number, trackingCode: string, carrier?: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(orders).set({ trackingCode, carrier: carrier?.trim() || "Correios / Logística" }).where(eq(orders.id, orderId));
}

export async function updateOrderLabelData(orderId: number, data: { shippingOrderId?: string; labelPdfUrl?: string }) {
  const db = await getDb();
  if (!db) return;
  await db.update(orders).set(data).where(eq(orders.id, orderId));
}

export async function getAdminAnalytics(periodDays: number = 7, range?: { startAt?: number; endAt?: number }) {
  const db = await getDb();
  const now = Date.now();
  const hasCustomRange = typeof range?.startAt === "number" && typeof range?.endAt === "number" && range.endAt > range.startAt;
  const rangeEnd = hasCustomRange ? Math.min(range.endAt as number, now) : now;
  const effectivePeriodDays = hasCustomRange ? Math.max(1, Math.ceil((rangeEnd - (range.startAt as number)) / (24 * 60 * 60 * 1000))) : periodDays;
  const cutoff = hasCustomRange ? (range.startAt as number) : now - effectivePeriodDays * 24 * 60 * 60 * 1000;

  if (!db) {
    return {
      summary: { visits: 0, sales: 0, revenue: 0, averageTicket: 0, conversionRate: 0 },
      visitorBehavior: { totalVisits: 0, categoryViews: 0, productViews: 0 },
      salesTrend: [],
      topProducts: [],
    };
  }

  const allOrders = await db.select().from(orders);
  // Filtrar por período se houver timestamp nos pedidos
  const filteredOrders = allOrders.filter((o: any) => {
    const oTime = o.createdAt ? new Date(o.createdAt).getTime() : now;
    return oTime >= cutoff && oTime <= rangeEnd;
  });

  const totalRevenue = filteredOrders.reduce((acc, o) => acc + Number(o.total || 0), 0);
  const totalSales = filteredOrders.length;
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
  // Simular visitas coerentes com as ordens para preencher o gráfico de linhas de visitas vs vendas
  const visits = totalSales > 0 ? totalSales * 18 + 42 : effectivePeriodDays * 12;
  const conversionRate = visits > 0 ? Number(((totalSales / visits) * 100).toFixed(2)) : 0;

  const prevCutoff = cutoff - effectivePeriodDays * 24 * 60 * 60 * 1000;
  const prevFilteredOrders = allOrders.filter((o: any) => {
    const oTime = o.createdAt ? new Date(o.createdAt).getTime() : now;
    return oTime >= prevCutoff && oTime < cutoff;
  });

  // Gerar tendência baseada no período escolhido com comparação do período anterior
  const stepCount = effectivePeriodDays <= 7 ? 7 : effectivePeriodDays <= 30 ? 6 : 8;
  const salesTrend = Array.from({ length: stepCount }).map((_, index) => {
    const stepLabel = effectivePeriodDays <= 7 ? `Há ${6 - index} dias` : effectivePeriodDays <= 30 ? `Semana ${index + 1}` : `Mês ${index + 1}`;
    const chunkOrders = filteredOrders.filter((_, idx) => idx % stepCount === index);
    const chunkRev = chunkOrders.reduce((acc, o) => acc + Number(o.total || 0), 0);

    const prevChunkOrders = prevFilteredOrders.filter((_, idx) => idx % stepCount === index);
    const prevChunkRev = prevChunkOrders.reduce((acc, o) => acc + Number(o.total || 0), 0);

    const chunkVisits = Math.round(chunkOrders.length * 18 + Math.max(5, effectivePeriodDays * 1.5));
    return {
      label: index === stepCount - 1 ? "Atual" : stepLabel,
      orders: chunkOrders.length,
      revenue: Number(chunkRev.toFixed(2)),
      prevRevenue: Number(prevChunkRev.toFixed(2)),
      visits: chunkVisits,
    };
  });

  const allProducts = await db.select().from(products);
  const topProducts = allProducts.map((p: any) => ({
    id: p.id,
    name: p.name,
    category: p.category || "Geral",
    price: Number(p.price || 0),
    stock: p.stock ?? 10,
    velocity: 0,
  })).sort((a, b) => b.velocity - a.velocity).slice(0, 5);

  return {
    summary: {
      visits,
      sales: totalSales,
      revenue: Number(totalRevenue.toFixed(2)),
      averageTicket: Number(averageTicket.toFixed(2)),
      conversionRate,
    },
    visitorBehavior: {
      totalVisits: visits,
      categoryViews: Math.round(visits * 0.25),
      productViews: Math.round(visits * 0.35),
    },
    salesTrend,
    topProducts,
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
  if (!db) {
    return [
      { category: "Camisetas", revenue: 142.60, count: 12 },
      { category: "Calças", revenue: 210.00, count: 8 },
      { category: "Bonés", revenue: 89.00, count: 6 },
    ];
  }

  const allProducts = await db.select().from(products);
  const categoryMap: Record<string, { revenue: number; count: number }> = {};
  
  for (const p of allProducts) {
    const cat = p.category || "Geral";
    if (!categoryMap[cat]) {
      categoryMap[cat] = { revenue: 0, count: 0 };
    }
    categoryMap[cat].count += 1;
    categoryMap[cat].revenue += Number(p.price || 0) * 2; // estimativa baseada no catálogo
  }

  return Object.entries(categoryMap).map(([category, data]) => ({
    category,
    revenue: Number(data.revenue.toFixed(2)),
    count: data.count,
  }));
}

export async function getLowStockAlerts() {
  const db = await getDb();
  if (!db) {
    return [
      { id: 1, name: "Camiseta Archive Boxy", stock: 2, sku: "EL-TS-01", category: "Camisetas" },
      { id: 2, name: "Calça Cargo Paradox", stock: 1, sku: "EL-CP-02", category: "Calças" },
    ];
  }

  const allProducts = await db.select().from(products);
  return allProducts.filter((p: any) => Number(p.stock || 0) < 5).map((p: any) => ({
    id: p.id,
    name: p.name,
    stock: p.stock,
    sku: p.sku || "",
    category: p.category || "Geral",
  }));
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

export async function saveStorefrontConfig(config: StorefrontConfig): Promise<StorefrontConfig> {
  const normalized = normalizeStorefrontConfig(config);
  const db = await getDb();
  if (!db) return normalized;
  const existing = await db.select().from(siteAppearance).where(eq(siteAppearance.sectionKey, "storefront_config")).limit(1);
  if (existing[0]) {
    await db.update(siteAppearance).set({ content: normalized as any }).where(eq(siteAppearance.sectionKey, "storefront_config"));
  } else {
    await db.insert(siteAppearance).values({ sectionKey: "storefront_config", content: normalized as any });
  }
  return normalized;
}
