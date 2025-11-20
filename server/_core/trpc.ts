import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import SuperJSON from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: SuperJSON,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  // Check if organization is active
  if (ctx.user?.organizationId) {
    const { getOrganizationById } = await import('../organizations-db');
    const org = await getOrganizationById(ctx.user.organizationId);
    
    if (!org || !org.isActive) {
      throw new TRPCError({ 
        code: "FORBIDDEN", 
        message: "Your organization subscription has been cancelled. Please contact support to reactivate." 
      });
    }
    
    // Update organization's lastUsedAt timestamp in background
    // Fire and forget - don't await to avoid slowing down requests
    const orgId = ctx.user.organizationId;
    import('../organizations-db').then(({ updateOrganizationLastUsed }) => {
      updateOrganizationLastUsed(orgId).catch(err => {
        console.error('[Middleware] Failed to update organization lastUsedAt:', err);
      });
    }).catch(() => {});
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
