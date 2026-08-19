import { mysqlTable, varchar, text, int, decimal, json, timestamp } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 50 }),
  role: varchar("role", { length: 50 }).default("user").notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  collection: varchar("collectionName", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  subcategory: varchar("subcategory", { length: 100 }),
  /** Slug público editável; nullable para preservar produtos legados antes da migração de conteúdo. */
  slug: varchar("slug", { length: 180 }).unique(),
  /** Estado de publicação: visible, unlisted ou hidden. */
  visibility: varchar("visibility", { length: 20 }).default("visible").notNull(),
  sku: varchar("sku", { length: 100 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  pixPrice: decimal("pixPrice", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  images: json("images").notNull(),
  status: varchar("status", { length: 50 }).default("Publicado").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/** Categorias editáveis pelo admin e consumidas pela navegação pública. */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  description: text("description"),
  parentId: int("parentId"),
  coverImageUrl: text("coverImageUrl"),
  active: int("active").default(1).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export const productVariations = mysqlTable("product_variations", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  size: varchar("size", { length: 20 }).notNull(),
  color: varchar("color", { length: 50 }).default("Preto").notNull(),
  stock: int("stock").default(10).notNull(),
});

export type ProductVariation = typeof productVariations.$inferSelect;
export type InsertProductVariation = typeof productVariations.$inferInsert;

/** Relação N:N para permitir que um produto pertença a várias categorias editáveis. */
export const productCategories = mysqlTable("product_categories", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  categoryId: int("categoryId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProductCategory = typeof productCategories.$inferSelect;
export type InsertProductCategory = typeof productCategories.$inferInsert;

export const newsletterSubscribers = mysqlTable("newsletter_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  couponCode: varchar("couponCode", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;

export const coupons = mysqlTable("coupons", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  discountPercent: decimal("discountPercent", { precision: 5, scale: 2 }).notNull(),
  usageLimit: int("usageLimit").default(100),
  timesUsed: int("timesUsed").default(0).notNull(),
  minPurchase: decimal("minPurchase", { precision: 10, scale: 2 }).default("0.00"),
  validUntil: timestamp("validUntil"),
  active: int("active").default(1).notNull(),
  /** Tipo de promoção: 'standard' (padrão), 'progressive' (desconto progressivo), 'free_shipping' (frete grátis), 'bogo' (leve 2 pague 1) */
  promoType: varchar("promoType", { length: 30 }).default("standard").notNull(),
  /** JSON com regras adicionais (ex: faixas de desconto progressivo, IDs de produtos elegíveis) */
  promoRules: json("promoRules"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = typeof coupons.$inferInsert;

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  userId: int("userId"),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerCpf: varchar("customerCpf", { length: 20 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  shippingAddress: json("shippingAddress").notNull(),
  items: json("items").notNull(),
  shippingMethod: varchar("shippingMethod", { length: 100 }).default("standard").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }).default("pix").notNull(),
  shippingCost: decimal("shippingCost", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0.00").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  paymentStatus: varchar("paymentStatus", { length: 50 }).default("pending").notNull(),
  trackingCode: varchar("trackingCode", { length: 100 }),
  carrier: varchar("carrier", { length: 100 }),
  shippingOrderId: varchar("shippingOrderId", { length: 100 }),
  labelPdfUrl: text("labelPdfUrl"),
  proofUrl: text("proofUrl"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

export const collections = mysqlTable("collections", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  year: varchar("year", { length: 10 }).notNull(),
  description: text("description"),
  editorialText: text("editorialText"),
  imageUrl: text("imageUrl"),
  ctaLabel: varchar("ctaLabel", { length: 100 }),
  ctaUrl: varchar("ctaUrl", { length: 255 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  active: int("active").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Collection = typeof collections.$inferSelect;
export type InsertCollection = typeof collections.$inferInsert;

export const siteAppearance = mysqlTable("site_appearance", {
  id: int("id").autoincrement().primaryKey(),
  sectionKey: varchar("sectionKey", { length: 100 }).notNull().unique(),
  content: json("content").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteAppearance = typeof siteAppearance.$inferSelect;
export type InsertSiteAppearance = typeof siteAppearance.$inferInsert;

export const abandonedCarts = mysqlTable("abandoned_carts", {
  id: int("id").autoincrement().primaryKey(),
  customerEmail: varchar("customerEmail", { length: 320 }),
  customerName: varchar("customerName", { length: 255 }),
  items: json("items").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  recovered: int("recovered").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AbandonedCart = typeof abandonedCarts.$inferSelect;
export type InsertAbandonedCart = typeof abandonedCarts.$inferInsert;

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  targetRole: varchar("targetRole", { length: 50 }).default("all").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).default("new_order").notNull(),
  orderId: varchar("orderId", { length: 100 }),
  isRead: int("isRead").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

export const resendEmailLogs = mysqlTable("resend_email_logs", {
  id: int("id").autoincrement().primaryKey(),
  recipient: varchar("recipient", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  templateType: varchar("templateType", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  providerResponse: text("providerResponse"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ResendEmailLog = typeof resendEmailLogs.$inferSelect;
export type InsertResendEmailLog = typeof resendEmailLogs.$inferInsert;

export const inventoryAuditLogs = mysqlTable("inventory_audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  size: varchar("size", { length: 20 }).notNull(),
  previousStock: int("previousStock").notNull(),
  newStock: int("newStock").notNull(),
  adminEmail: varchar("adminEmail", { length: 320 }).notNull(),
  adminName: varchar("adminName", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InventoryAuditLog = typeof inventoryAuditLogs.$inferSelect;
export type InsertInventoryAuditLog = typeof inventoryAuditLogs.$inferInsert;

export const adminUsers = mysqlTable("admin_users", {
  id: int("id").primaryKey().autoincrement(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  roleTitle: varchar("roleTitle", { length: 100 }).notNull().default("Assistente"),
  permissions: text("permissions").notNull().default("products,inventory,categories,stats,emails,settings"),
  avatarUrl: text("avatarUrl"),
  isActive: int("isActive").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = typeof adminUsers.$inferInsert;


/**
 * Tabela cmsPages: Armazena o conteúdo editorável das páginas institucionais (Manifesto, História, Encontros, etc.)
 * Gerida pelo painel administrativo para dar autonomia total ao lojista.
 */
export const cmsPages = mysqlTable("cms_pages", {
  id: int("id").primaryKey().autoincrement(),
  slug: varchar("slug", { length: 100 }).notNull().unique(), // Ex: manifesto, history, events, about
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: varchar("subtitle", { length: 500 }),
  content: text("content").notNull(), // Texto em Markdown ou HTML formatado
  bannerUrl: text("bannerUrl"), // Imagem de capa opcional
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CmsPage = typeof cmsPages.$inferSelect;
export type InsertCmsPage = typeof cmsPages.$inferInsert;

/**
 * Tabela customMenus: Armazena os itens personalizáveis do menu de navegação superior e rodapé.
 * Permite adicionar, renomear, reordenar ou ocultar links sem alterar código.
 */
export const customMenus = mysqlTable("custom_menus", {
  id: int("id").primaryKey().autoincrement(),
  location: varchar("location", { length: 50 }).notNull().default("header"), // header ou footer
  label: varchar("label", { length: 100 }).notNull(),
  url: varchar("url", { length: 255 }).notNull(),
  sortOrder: int("sortOrder").notNull().default(0),
  isVisible: int("isVisible").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CustomMenu = typeof customMenus.$inferSelect;
export type InsertCustomMenu = typeof customMenus.$inferInsert;

export const shipments = mysqlTable("shipments", {
  id: int("id").autoincrement().primaryKey(),
  shipmentNumber: varchar("shipmentNumber", { length: 50 }).notNull().unique(),
  type: varchar("type", { length: 30 }).default("Avulso").notNull(), // "Avulso", "Reverso", "Loja online"
  recipientName: varchar("recipientName", { length: 255 }).notNull(),
  recipientAddress: text("recipientAddress").notNull(),
  carrier: varchar("carrier", { length: 100 }).default("Jadlog Econômico").notNull(),
  trackingCode: varchar("trackingCode", { length: 100 }),
  shippingCost: decimal("shippingCost", { precision: 10, scale: 2 }).default("0.00").notNull(),
  estimatedDays: int("estimatedDays").default(5).notNull(),
  status: varchar("status", { length: 50 }).default("Por enviar").notNull(), // "Por enviar", "Enviado", "Entregue", "Reverso solicitado"
  labelPdfUrl: text("labelPdfUrl"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Shipment = typeof shipments.$inferSelect;
export type InsertShipment = typeof shipments.$inferInsert;

export const siteMessages = mysqlTable("site_messages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  message: text("message"),
  originTag: varchar("originTag", { length: 50 }).default("contato").notNull(), // "contato" ou "newsletter"
  couponCode: varchar("couponCode", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SiteMessage = typeof siteMessages.$inferSelect;
export type InsertSiteMessage = typeof siteMessages.$inferInsert;


export const promotions = mysqlTable("promotions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  discountType: varchar("discountType", { length: 50 }).notNull().default("buy_x_get_y"), // "buy_x_get_y", "price_discount", "cross_selling", "progressive", "cart_discount"
  scopeType: varchar("scopeType", { length: 50 }).notNull().default("store"), // "store", "categories", "products"
  scopeIds: text("scopeIds"), // JSON or comma-separated IDs
  allowPromotionalPrice: int("allowPromotionalPrice").notNull().default(0),
  combinableWithPrice: int("combinableWithPrice").notNull().default(0),
  combinableWithShipping: int("combinableWithShipping").notNull().default(0),
  combinableWithCart: int("combinableWithCart").notNull().default(0),
  combinableWithApps: int("combinableWithApps").notNull().default(0),
  dateLimitType: varchar("dateLimitType", { length: 20 }).notNull().default("unlimited"), // "unlimited", "period"
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  customBadgeEnabled: int("customBadgeEnabled").notNull().default(0),
  customBadgeText: varchar("customBadgeText", { length: 50 }),
  status: varchar("status", { length: 20 }).notNull().default("active"), // "active", "inactive"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Promotion = typeof promotions.$inferSelect;
export type InsertPromotion = typeof promotions.$inferInsert;
