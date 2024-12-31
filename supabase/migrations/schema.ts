import { pgTable, unique, pgPolicy, uuid, text, integer, timestamp, foreignKey, jsonb, index, check, vector } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	pgPolicy("Users can manage their own data", { as: "restrictive", for: "all", to: ["public"], using: sql`auth.uid() = id`, withCheck: sql`auth.uid() = id` }),
]);

export const messages = pgTable("messages", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	sessionId: uuid("session_id").notNull(),
	content: text().notNull(),
	role: text().notNull(),
	timestamp: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
	metadata: jsonb().default({}),
	embedding: vector({ dimensions: 1024 }),
}, (table) => [
	index("messages_embedding_idx").using("ivfflat", table.embedding.asc().nullsLast().op("vector_cosine_ops")).where(sql`(embedding IS NOT NULL)`),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "messages_user_id_fkey"
	}),
	pgPolicy("Users can manage their own messages", { as: "restrictive", for: "all", to: ["public"], using: sql`auth.uid() = user_id`, withCheck: sql`auth.uid() = user_id` }),
	check("messages_role_check", sql`role = ANY (ARRAY['user'::text, 'assistant'::text])`),
]);

export const activeResources = pgTable("active_resources", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(), // Keep as uuid for now, we'll change it in a separate migration
	configId: text("config_id").notNull(),
	configVersion: integer("config_version").notNull(),
	promptId: text("prompt_id").notNull(),
	promptVersion: integer("prompt_version").notNull(),
	voiceId: text("voice_id"),
	voiceVersion: integer("voice_version"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("active_resources_user_id_key").on(table.userId),
	pgPolicy("Users can read their own active resources", { as: "restrictive", for: "select", to: ["public"], using: sql`auth.uid()::uuid = user_id` }),
	pgPolicy("Users can insert their own active resources", { as: "restrictive", for: "insert", to: ["public"], withCheck: sql`auth.uid()::uuid = user_id` }),
	pgPolicy("Users can update their own active resources", { as: "restrictive", for: "update", to: ["public"], using: sql`auth.uid()::uuid = user_id`, withCheck: sql`auth.uid()::uuid = user_id` }),
	pgPolicy("Users can delete their own active resources", { as: "restrictive", for: "delete", to: ["public"], using: sql`auth.uid()::uuid = user_id` }),
]);

export const activeTools = pgTable("active_tools", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	activeResourceId: uuid("active_resource_id").notNull(),
	toolId: text("tool_id").notNull(),
	toolVersion: integer("tool_version").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.activeResourceId],
		foreignColumns: [activeResources.id],
		name: "active_tools_active_resource_id_fkey"
	}).onDelete("cascade"),
	pgPolicy("Users can read their active tools", { as: "restrictive", for: "select", to: ["public"], using: sql`EXISTS (
		SELECT 1 FROM active_resources
		WHERE active_resources.id = active_tools.active_resource_id
		AND active_resources.user_id = auth.uid()::uuid
	)` }),
	pgPolicy("Users can manage their active tools", { as: "restrictive", for: "all", to: ["public"], using: sql`EXISTS (
		SELECT 1 FROM active_resources
		WHERE active_resources.id = active_tools.active_resource_id
		AND active_resources.user_id = auth.uid()::uuid
	)`, withCheck: sql`EXISTS (
		SELECT 1 FROM active_resources
		WHERE active_resources.id = active_tools.active_resource_id
		AND active_resources.user_id = auth.uid()::uuid
	)` }),
]);

export const resourceCache = pgTable("resource_cache", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	resourceType: text("resource_type").notNull(),
	resourceId: text("resource_id").notNull(),
	version: integer().notNull(),
	data: jsonb().notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "resource_cache_user_id_fkey"
	}),
	pgPolicy("Users can read their own cache", { as: "restrictive", for: "select", to: ["public"], using: sql`auth.uid() = user_id` }),
	pgPolicy("Users can manage their own cache", { as: "restrictive", for: "all", to: ["public"], using: sql`auth.uid() = user_id`, withCheck: sql`auth.uid() = user_id` }),
]);
