import { boolean, index, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const categoryStatus = mysqlEnum("categoryStatus", ["active", "inactive"]);
export const toolStatus = mysqlEnum("toolStatus", ["active", "inactive", "draft"]);
export const toolKind = mysqlEnum("toolKind", ["calculator", "converter", "unit"]);

/** Hierarchical taxonomy: root group → subcategory → independently managed tool. */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  parentId: int("parentId"),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 80 }),
  sortOrder: int("sortOrder").notNull().default(0),
  status: categoryStatus.notNull().default("active"),
  seoTitle: varchar("seoTitle", { length: 180 }),
  seoDescription: varchar("seoDescription", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("categories_parent_sort_idx").on(table.parentId, table.sortOrder)]);

/** Tool metadata is separate from its safe client-side implementation registry. */
export const tools = mysqlTable("tools", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description").notNull(),
  kind: toolKind.notNull(),
  inputs: json("inputs"),
  formula: text("formula"),
  faq: json("faq"),
  relatedToolIds: json("relatedToolIds"),
  seoTitle: varchar("seoTitle", { length: 180 }),
  seoDescription: varchar("seoDescription", { length: 320 }),
  status: toolStatus.notNull().default("draft"),
  sortOrder: int("sortOrder").notNull().default(0),
  logicKey: varchar("logicKey", { length: 100 }),
  isPopular: boolean("isPopular").notNull().default(false),
  searchKeywords: json("searchKeywords"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("tools_category_sort_idx").on(table.categoryId, table.sortOrder)]);

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;
export type Tool = typeof tools.$inferSelect;
export type InsertTool = typeof tools.$inferInsert;
