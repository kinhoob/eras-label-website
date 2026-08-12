import { and, desc, eq, sql } from "drizzle-orm";
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
} from "../drizzle/schema";
import { ENV } from "./_core/env";

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
  const rows = category && category !== "Todos"
    ? await db.select().from(products).where(and(eq(products.status, "active"), eq(products.category, category)))
    : await db.select().from(products).where(eq(products.status, "active"));
  return rows;
}

export async function getProductWithVariations(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const product = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!product[0]) return undefined;
  const variations = await db.select().from(productVariations).where(eq(productVariations.productId, id));
  return { ...product[0], variations };
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

export async function validateCoupon(code: string, subtotal: number) {
  const db = await getDb();
  if (!db) return code.trim().toUpperCase() === "ERAS10" ? { valid: true, discount: subtotal * 0.1, code: "ERAS10" } : { valid: false, discount: 0, code };
  const result = await db.select().from(coupons).where(eq(coupons.code, code.trim().toUpperCase())).limit(1);
  const coupon = result[0];
  if (!coupon && code.trim().toUpperCase() === "ERAS10") return { valid: true, discount: subtotal * 0.1, code: "ERAS10" };
  if (!coupon || !coupon.active || (coupon.usageLimit !== null && coupon.timesUsed >= coupon.usageLimit)) return { valid: false, discount: 0, code };
  if (coupon.validUntil && coupon.validUntil.getTime() < Date.now()) return { valid: false, discount: 0, code };
  if (coupon.minPurchase && subtotal < Number(coupon.minPurchase)) return { valid: false, discount: 0, code };
  const discount = coupon.discountPercent ? subtotal * Number(coupon.discountPercent) / 100 : Number(coupon.discountAmount ?? 0);
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
