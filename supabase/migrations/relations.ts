import { relations } from "drizzle-orm/relations";
import { activeResources, activeTools, users, messages, resourceCache } from "./schema";

export const activeToolsRelations = relations(activeTools, ({one}) => ({
	activeResource: one(activeResources, {
		fields: [activeTools.activeResourceId],
		references: [activeResources.id]
	}),
}));

export const activeResourcesRelations = relations(activeResources, ({one, many}) => ({
	activeTools: many(activeTools),
	user: one(users, {
		fields: [activeResources.userId],
		references: [users.id]
	}),
}));

export const messagesRelations = relations(messages, ({one}) => ({
	user: one(users, {
		fields: [messages.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	messages: many(messages),
	activeResources: many(activeResources),
	resourceCache: many(resourceCache),
}));

export const resourceCacheRelations = relations(resourceCache, ({one}) => ({
	user: one(users, {
		fields: [resourceCache.userId],
		references: [users.id]
	}),
}));