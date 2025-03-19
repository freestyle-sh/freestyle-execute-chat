import type { InferSelectModel } from "drizzle-orm";
import type { Message as SdkMessage } from "ai";
import {
  boolean,
  integer,
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
  userId: uuid("user_id").references(() => usersTable.id, {
    onDelete: "cascade",
  }),
  name: varchar("name", { length: 256 }),
  createdAt: timestamp("created_at").notNull(),
});

export type Chat = InferSelectModel<typeof chatsTable>;

export const messagesTable = pgTable("Messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  chatId: uuid("chat_id").references(() => chatsTable.id, {
    onDelete: "cascade",
  }),
  content: text("content").notNull(),
  parts: json("parts").notNull(),
  role: varchar("role", { length: 16 }).notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export type Message = InferSelectModel<typeof messagesTable> & SdkMessage;

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

export const freestyleModulesTable = pgTable("FreestyleModules", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: varchar("name", { length: 256 }).notNull(),
  example: text("example").notNull(),
  svg: text("svg").notNull(),
  color: varchar("color", { length: 16 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  nodeModules: json("node_modules").notNull(),
  priority: integer("priority").notNull().default(0),
  setupInstructions: text("setup_instructions"),
  documentation: text("documentation"),
});

export const freestyleModulesEnvironmentVariableRequirementsTable = pgTable(
  "FreestyleModulesEnvironmentVariableRequirements",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    moduleId: uuid("moduleId").references(() => freestyleModulesTable.id, {
      onDelete: "cascade",
    }),
    name: varchar("name", { length: 256 }).notNull(),
    description: text("description"),
    example: text("example"),
    required: boolean("required").default(true).notNull(),
    public: boolean("public").default(false).notNull(),
  }
);

export type UserFormResponse = Omit<
  InferSelectModel<typeof userFormResponse>,
  "formData"
> & {
  formData: Record<string, unknown> | null;
};
