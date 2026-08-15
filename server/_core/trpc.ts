import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

export const requireModulePermission = (moduleKey: string) => t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    const email = (ctx.user.email || "").toLowerCase().trim();
    const isSuperAdmin = email === (process.env.ADMIN_LOGIN_EMAIL || "theeraslabel@gmail.com").toLowerCase().trim();

    if (!isSuperAdmin) {
      // Consultar banco para verificar permissões do sub-admin
      try {
        const { getAdminUserByEmail } = await import("../db");
        const subAdmin = await getAdminUserByEmail(email);
        if (!subAdmin || subAdmin.isActive !== 1) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Conta administrativa inativa ou sem acesso." });
        }
        const perms = (subAdmin.permissions || "").split(",").map(p => p.trim()).filter(Boolean);
        if (!perms.includes(moduleKey) && !perms.includes("settings")) {
          throw new TRPCError({ code: "FORBIDDEN", message: `Acesso negado ao módulo ${moduleKey}.` });
        }
      } catch (err: any) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "FORBIDDEN", message: "Erro ao validar permissões do administrador." });
      }
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);
