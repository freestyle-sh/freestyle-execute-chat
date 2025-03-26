import type { InferSelectModel } from "drizzle-orm";
import type { Message as SdkMessage } from "ai";
import {
  boolean,
  index,
  integer,
  json,
  pgTable,
  primaryKey,
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
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.id, {
    onDelete: "cascade",
  }),
  name: varchar("name", { length: 256 }),
  createdAt: timestamp("created_at").notNull(),
});

export type Chat = InferSelectModel<typeof chatsTable>;

export const messagesTable = pgTable(
  "Messages",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    chatId: uuid("chat_id").references(() => chatsTable.id, {
      onDelete: "cascade",
    }),
    content: text("content").notNull(),
    parts: json("parts").notNull(),
    role: varchar("role", { length: 16 }).notNull(),
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => [
    // speed up lookups by chatId
    index().on(table.chatId),
  ],
);

export type Message = InferSelectModel<typeof messagesTable> & SdkMessage;

export const userFormResponsesTable = pgTable("UserFormResponse", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chatsTable.id, {
      onDelete: "cascade",
    }),
  toolCallId: varchar("toolCallId", { length: 128 }).notNull(),
  formTitle: varchar("formTitle", { length: 256 }),
  state: varchar("state", { length: 32 }).notNull(), // "idle", "submitted", "cancelled"
  formData: json("formData"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type UserFormResponse = Omit<
  InferSelectModel<typeof userFormResponsesTable>,
  "formData"
> & {
  formData: Record<string, unknown> | null;
};

export const freestyleModulesTable = pgTable("FreestyleModules", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: varchar("name", { length: 256 }).notNull(),
  example: text("example").notNull(),
  svg: text("svg").notNull(),
  lightModeColor: varchar("lightModeColor", { length: 16 }).notNull(),
  darkModeColor: varchar("darkModeColor", { length: 16 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  nodeModules: json("node_modules").notNull(),
  priority: integer("priority").notNull().default(0),
  setupInstructions: text("setup_instructions"),
  documentation: text("documentation"),
  _specialBehavior: json("_special_behavior"),
});

export type FreestyleModule = InferSelectModel<typeof freestyleModulesTable>;

export const freestyleModulesEnvironmentVariableRequirementsTable = pgTable(
  "FreestyleModulesEnvironmentVariableRequirements",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    moduleId: uuid("moduleId")
      .notNull()
      .references(() => freestyleModulesTable.id, {
        onDelete: "cascade",
      }),
    name: varchar("name", { length: 256 }).notNull(),
    description: text("description"),
    example: text("example"),
    required: boolean("required").default(true).notNull(),
    public: boolean("public").default(false).notNull(),
  },
  (table) => [
    // speed up lookups by moduleId
    index().on(table.moduleId),
    index().on(table.id),
  ],
);

export const freestyleModulesConfigurationsTable = pgTable(
  "FreestyleModulesConfigurations",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => usersTable.id, {
        onDelete: "cascade",
      }),
    environmentVariableId: uuid("environmentVariableId")
      .notNull()
      .references(
        () => freestyleModulesEnvironmentVariableRequirementsTable.id,
        {
          onDelete: "cascade",
        },
      ),
    value: text("value").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.environmentVariableId] }),
    index().on(table.userId),
  ],
);

export const chatModulesEnabledTable = pgTable(
  "ChatModulesEnabled",
  {
    chatId: uuid("chatId")
      .notNull()
      .references(() => chatsTable.id, {
        onDelete: "cascade",
      }),
    moduleId: uuid("moduleId")
      .notNull()
      .references(() => freestyleModulesTable.id, {
        onDelete: "cascade",
      }),
    enabled: boolean("enabled").notNull().default(true),
  },
  (table) => [
    primaryKey({ columns: [table.chatId, table.moduleId] }),
    index().on(table.chatId),
  ],
);
