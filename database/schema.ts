import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

export const counter = sqliteTable("counter", {
  id: integer().primaryKey({ autoIncrement: true }),
  username: text().notNull(),
  platform: text().notNull(),
  count: integer().notNull().default(0),
}, (table) => ({
  usernameplatformUnique: unique().on(table.username, table.platform),
}));
