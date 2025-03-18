import type { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  json,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("User", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  stackId: varchar("stack_id", { length: 64 }).notNull(),
});

export type User = InferSelectModel<typeof usersTable>;

export const chatsTable = pgTable("Chats", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.id),
  name: varchar("name", { length: 256 }),
  createdAt: timestamp("created_at").notNull(),
});

export type Chat = InferSelectModel<typeof chatsTable>;

export const messagesTable = pgTable("Messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  chatId: uuid("chat_id").references(() => chatsTable.id),
  content: text("content").notNull(),
  role: varchar("role", { length: 16 }).notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export type Message = InferSelectModel<typeof messagesTable>;

export const moduleConfig = pgTable("ModuleConfig", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  moduleId: varchar("moduleId", { length: 64 }).notNull(),
  userId: uuid("userId").references(() => usersTable.id),
  enabled: boolean("enabled").default(false).notNull(),
  envVars: json("envVars").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ModuleConfig = Omit<
  InferSelectModel<typeof moduleConfig>,
  "envVars"
> & {
  envVars: Record<string, string>;
};

export const userFormResponse = pgTable("UserFormResponse", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .references(() => chatsTable.id)
    .notNull(),
  toolCallId: varchar("toolCallId", { length: 128 }).notNull(),
  formTitle: varchar("formTitle", { length: 256 }),
  state: varchar("state", { length: 32 }).notNull(), // "idle", "submitted", "cancelled"
  formData: json("formData"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type UserFormResponse = Omit<
  InferSelectModel<typeof userFormResponse>,
  "formData"
> & {
  formData: Record<string, unknown> | null;
};
