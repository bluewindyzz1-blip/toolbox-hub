import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const catalogMocks = vi.hoisted(() => ({
  getPublicCatalog: vi.fn(),
  getAdminCatalog: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
  reorderCategory: vi.fn(),
}));

vi.mock("./catalog", () => catalogMocks);

import { appRouter } from "./routers";

function createContext(role: "admin" | "user"): TrpcContext {
  return {
    user: { id: 1, openId: "catalog-test", name: "관리자", email: null, loginMethod: "manus", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("catalog management API", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("allows an admin to create a root category", async () => {
    catalogMocks.createCategory.mockResolvedValue({ id: 90, name: "자동차 계산기", slug: "car", parentId: null });
    const caller = appRouter.createCaller(createContext("admin"));
    const result = await caller.catalog.createCategory({ name: "자동차 계산기", slug: "car", description: "자동차 비용 도구", status: "active" });
    expect(result).toMatchObject({ id: 90, slug: "car" });
    expect(catalogMocks.createCategory).toHaveBeenCalledWith(expect.objectContaining({ parentId: null, name: "자동차 계산기", slug: "car", status: "active" }));
  });

  it("allows an admin to update metadata and status", async () => {
    catalogMocks.updateCategory.mockResolvedValue({ id: 90, name: "자동차 계산기", status: "inactive" });
    const caller = appRouter.createCaller(createContext("admin"));
    await caller.catalog.updateCategory({ id: 90, values: { name: "자동차 계산기", slug: "car", status: "inactive", seoTitle: "자동차 계산기" } });
    expect(catalogMocks.updateCategory).toHaveBeenCalledWith(90, expect.objectContaining({ status: "inactive", seoTitle: "자동차 계산기" }));
  });

  it("allows an admin to delete and reorder a category", async () => {
    const caller = appRouter.createCaller(createContext("admin"));
    await caller.catalog.reorderCategory({ id: 90, direction: "up" });
    await caller.catalog.deleteCategory({ id: 90 });
    expect(catalogMocks.reorderCategory).toHaveBeenCalledWith(90, "up");
    expect(catalogMocks.deleteCategory).toHaveBeenCalledWith(90);
  });

  it("rejects create requests from a non-admin user", async () => {
    const caller = appRouter.createCaller(createContext("user"));
    await expect(caller.catalog.createCategory({ name: "차단", slug: "blocked" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(catalogMocks.createCategory).not.toHaveBeenCalled();
  });
});
