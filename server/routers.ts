import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import * as catalog from "./catalog";

const toolUpdateInput = z.object({
  isPopular: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  searchKeywords: z.array(z.string().trim().min(1).max(80)).max(30).nullable().optional(),
  relatedToolIds: z.array(z.number().int().positive()).max(20).nullable().optional(),
  status: z.enum(["active", "inactive", "draft"]).optional(),
});

const categoryInput = z.object({
  parentId: z.number().int().positive().nullable().optional(),
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/, "영문 소문자·숫자·하이픈만 사용할 수 있습니다.").max(120),
  description: z.string().trim().max(500).nullable().optional(),
  icon: z.string().trim().max(80).nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  seoTitle: z.string().trim().max(180).nullable().optional(),
  seoDescription: z.string().trim().max(320).nullable().optional(),
});

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  catalog: router({
    snapshot: publicProcedure.query(() => catalog.getPublicCatalog()),
    adminSnapshot: adminProcedure.query(() => catalog.getAdminCatalog()),
    createCategory: adminProcedure.input(categoryInput).mutation(({ input }) => catalog.createCategory({
      parentId: input.parentId ?? null,
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      icon: input.icon ?? null,
      sortOrder: input.sortOrder ?? 0,
      status: input.status ?? "active",
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
    })),
    updateCategory: adminProcedure.input(z.object({ id: z.number().int().positive(), values: categoryInput.partial() })).mutation(({ input }) => catalog.updateCategory(input.id, input.values)),
    deleteCategory: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => catalog.deleteCategory(input.id)),
    reorderCategory: adminProcedure.input(z.object({ id: z.number().int().positive(), direction: z.enum(["up", "down"]) })).mutation(({ input }) => catalog.reorderCategory(input.id, input.direction)),
    updateTool: adminProcedure.input(z.object({ id: z.number().int().positive(), values: toolUpdateInput })).mutation(({ input }) => catalog.updateTool(input.id, input.values)),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
