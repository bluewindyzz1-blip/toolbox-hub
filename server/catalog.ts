import { asc, eq, isNull } from "drizzle-orm";
import { categories, InsertCategory, InsertTool, tools } from "../drizzle/schema";
import { CatalogCategory, CatalogSnapshot, CatalogTool, defaultCatalog, getCategoryPath, getToolPath } from "../shared/catalog";
import { getDb } from "./db";

function normalizeCategory(row: typeof categories.$inferSelect): CatalogCategory {
  return { ...row, description: row.description ?? null, icon: row.icon ?? null, seoTitle: row.seoTitle ?? null, seoDescription: row.seoDescription ?? null };
}

function normalizeTool(row: typeof tools.$inferSelect): CatalogTool {
  return {
    ...row,
    description: row.description,
    inputs: (row.inputs as Record<string, unknown> | null) ?? null,
    faq: (row.faq as CatalogTool["faq"]) ?? null,
    relatedToolIds: (row.relatedToolIds as number[] | null) ?? null,
    formula: row.formula ?? null,
    seoTitle: row.seoTitle ?? null,
    seoDescription: row.seoDescription ?? null,
    logicKey: row.logicKey ?? null,
    isPopular: Boolean(row.isPopular),
    searchKeywords: (row.searchKeywords as string[] | null) ?? null,
  };
}

/**
 * Existing installations may already have a populated catalog.  The seed is therefore
 * additive: it only creates records whose immutable slug does not exist and never
 * overwrites an administrator's metadata or display choices.
 */
async function seedDefaultCatalog() {
  const db = await getDb();
  if (!db) return;

  const currentCategories = await db.select().from(categories);
  const categoryIdBySlug = new Map(currentCategories.map((item) => [item.slug, item.id]));
  const categoryIdBySeedId = new Map<number, number>();
  for (const seeded of defaultCatalog.categories) {
    const found = categoryIdBySlug.get(seeded.slug);
    if (found) {
      categoryIdBySeedId.set(seeded.id, found);
      continue;
    }
    const values: InsertCategory = {
      name: seeded.name,
      slug: seeded.slug,
      description: seeded.description,
      icon: seeded.icon,
      sortOrder: seeded.sortOrder,
      status: seeded.status === "draft" ? "inactive" : seeded.status,
      seoTitle: seeded.seoTitle,
      seoDescription: seeded.seoDescription,
      parentId: seeded.parentId ? categoryIdBySeedId.get(seeded.parentId) ?? null : null,
    };
    await db.insert(categories).values(values);
    const [created] = await db.select().from(categories).where(eq(categories.slug, seeded.slug)).limit(1);
    if (created) {
      categoryIdBySlug.set(seeded.slug, created.id);
      categoryIdBySeedId.set(seeded.id, created.id);
    }
  }

  const currentTools = await db.select({ slug: tools.slug }).from(tools);
  const toolSlugs = new Set(currentTools.map((item) => item.slug));
  for (const seeded of defaultCatalog.tools) {
    if (toolSlugs.has(seeded.slug)) continue;
    const values: InsertTool = {
      categoryId: categoryIdBySeedId.get(seeded.categoryId) ?? 0,
      slug: seeded.slug,
      title: seeded.title,
      description: seeded.description,
      kind: seeded.kind,
      inputs: seeded.inputs,
      formula: seeded.formula,
      faq: seeded.faq,
      relatedToolIds: seeded.relatedToolIds,
      seoTitle: seeded.seoTitle,
      seoDescription: seeded.seoDescription,
      status: seeded.status,
      sortOrder: seeded.sortOrder,
      logicKey: seeded.logicKey,
      isPopular: seeded.isPopular ?? false,
      searchKeywords: seeded.searchKeywords ?? null,
    };
    await db.insert(tools).values(values);
  }

  // Phase 3 keeps the pre-existing retirement calculator but moves it into the
  // new salary subgroup only when it is still in the original seed location.
  const retirementGroupId = categoryIdBySeedId.get(30);
  const salaryRootId = categoryIdBySeedId.get(4);
  if (retirementGroupId && salaryRootId) {
    const [legacyRetirementTool] = await db.select().from(tools).where(eq(tools.slug, "retirement-pay")).limit(1);
    if (legacyRetirementTool?.categoryId === salaryRootId) {
      await db.update(tools).set({ categoryId: retirementGroupId, sortOrder: 0, isPopular: true, relatedToolIds: [103, 130, 127, 129, 131], searchKeywords: ["퇴직", "퇴직금", "평균임금", "퇴직 정산"] }).where(eq(tools.id, legacyRetirementTool.id));
    }
  }
}

export async function getPublicCatalog(): Promise<CatalogSnapshot> {
  const db = await getDb();
  if (!db) return defaultCatalog;
  await seedDefaultCatalog();
  const [categoryRows, toolRows] = await Promise.all([
    db.select().from(categories).where(eq(categories.status, "active")).orderBy(asc(categories.sortOrder), asc(categories.id)),
    db.select().from(tools).where(eq(tools.status, "active")).orderBy(asc(tools.sortOrder), asc(tools.id)),
  ]);
  return { categories: categoryRows.map(normalizeCategory), tools: toolRows.map(normalizeTool) };
}

export async function getAdminCatalog(): Promise<CatalogSnapshot> {
  const db = await getDb();
  if (!db) return defaultCatalog;
  await seedDefaultCatalog();
  const [categoryRows, toolRows] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.id)),
    db.select().from(tools).orderBy(asc(tools.sortOrder), asc(tools.id)),
  ]);
  return { categories: categoryRows.map(normalizeCategory), tools: toolRows.map(normalizeTool) };
}

export async function createCategory(values: Omit<InsertCategory, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("데이터베이스에 연결할 수 없습니다.");
  await db.insert(categories).values(values);
  const [created] = await db.select().from(categories).where(eq(categories.slug, values.slug)).limit(1);
  return created ? normalizeCategory(created) : null;
}

export async function updateCategory(id: number, values: Partial<Omit<InsertCategory, "id" | "createdAt" | "updatedAt">>) {
  const db = await getDb();
  if (!db) throw new Error("데이터베이스에 연결할 수 없습니다.");
  await db.update(categories).set(values).where(eq(categories.id, id));
  const [updated] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return updated ? normalizeCategory(updated) : null;
}

export async function updateTool(id: number, values: Partial<Pick<InsertTool, "isPopular" | "sortOrder" | "searchKeywords" | "relatedToolIds" | "status">>) {
  const db = await getDb();
  if (!db) throw new Error("데이터베이스에 연결할 수 없습니다.");
  await db.update(tools).set(values).where(eq(tools.id, id));
  const [updated] = await db.select().from(tools).where(eq(tools.id, id)).limit(1);
  return updated ? normalizeTool(updated) : null;
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("데이터베이스에 연결할 수 없습니다.");
  const [child] = await db.select({ id: categories.id }).from(categories).where(eq(categories.parentId, id)).limit(1);
  const [assignedTool] = await db.select({ id: tools.id }).from(tools).where(eq(tools.categoryId, id)).limit(1);
  if (child || assignedTool) throw new Error("하위 카테고리 또는 연결된 도구가 있어 삭제할 수 없습니다.");
  await db.delete(categories).where(eq(categories.id, id));
}

export async function reorderCategory(id: number, direction: "up" | "down") {
  const db = await getDb();
  if (!db) throw new Error("데이터베이스에 연결할 수 없습니다.");
  const [current] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  if (!current) throw new Error("카테고리를 찾을 수 없습니다.");
  const siblings = await db.select().from(categories).where(current.parentId === null ? isNull(categories.parentId) : eq(categories.parentId, current.parentId)).orderBy(asc(categories.sortOrder), asc(categories.id));
  const index = siblings.findIndex((item) => item.id === current.id);
  const target = siblings[direction === "up" ? index - 1 : index + 1];
  if (!target) return;
  await db.update(categories).set({ sortOrder: target.sortOrder }).where(eq(categories.id, current.id));
  await db.update(categories).set({ sortOrder: current.sortOrder }).where(eq(categories.id, target.id));
}

export async function listSitemapPaths() {
  const catalog = await getPublicCatalog();
  const paths = ["/", "/about", "/guide", "/faq", "/privacy", "/terms", "/disclaimer", "/cookie-policy", "/contact", "/document"];
  for (const root of catalog.categories.filter((item) => item.parentId === null)) paths.push(getCategoryPath(root, catalog.categories));
  for (const category of catalog.categories.filter((item) => item.parentId !== null && catalog.categories.some((root) => root.id === item.parentId && root.parentId === null))) paths.push(getCategoryPath(category, catalog.categories));
  for (const tool of catalog.tools) paths.push(getToolPath(tool, catalog.categories));
  return Array.from(new Set(paths));
}
