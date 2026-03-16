import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { 
  integer, 
  pgTable, 
  text, 
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  plaidId: text("plaid_id"),
  name: text("name").notNull(),
  userId: text("user_id").notNull(),
});

export const accountsRelations = relations(accounts, ({ many }) => ({
  transactions: many(transactions),
}));

export const insertAccountSchema = createInsertSchema(accounts);

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  plaidId: text("plaid_id"),
  name: text("name").notNull(),
  userId: text("user_id").notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  transactions: many(transactions),
}));

export const insertCategorySchema = createInsertSchema(categories);

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  amount: integer("amount").notNull(),
  payee: text("payee").notNull(),
  notes: text("notes"),
  date: timestamp("date", { mode: "date" }).notNull(),
  accountId: text("account_id").references(() => accounts.id, {
    onDelete: "cascade",
  }).notNull(),
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  // ── Cashback tracking ──────────────────────────────
  creditCard: text("credit_card"),       // e.g. 'flipkart_axis' | 'sbi_cashback' | 'phonepe_sbi_black'
  spendCategory: text("spend_category"), // cashback spend category key
  cashbackEarned: integer("cashback_earned"), // in miliunits (same as amount)
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
  categories: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
}));

export const insertTransactionSchema = createInsertSchema(transactions, {
  date: z.coerce.date(),
  creditCard: z.string().nullable().optional(),
  spendCategory: z.string().nullable().optional(),
  cashbackEarned: z.number().int().nullable().optional(),
});

export const connectedBanks = pgTable("connected_banks", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  accessToken: text("access_token").notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  subscriptionId: text("subscription_id").notNull().unique(),
  status: text("status").notNull(),
});
