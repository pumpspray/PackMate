import { pgTable, text, serial, integer, boolean, timestamp, date, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
export * from "./models/auth";
import { users } from "./models/auth";

// === TABLE DEFINITIONS ===

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  organizerId: text("organizer_id").notNull(), // References users.id (which is varchar)
  createdAt: timestamp("created_at").defaultNow(),
});

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  tripId: integer("trip_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull(),
  name: text("name").notNull(), // Display name (e.g., "Dad", "Sarah")
  userId: text("user_id"), // Optional: link to actual user account
  email: text("email"), // Optional: for invitations
});

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  isPacked: boolean("is_packed").default(false).notNull(),
  groupId: integer("group_id"), // Can be assigned to whole group or specific member
  assignedToMemberId: integer("assigned_to_member_id"), // Specific member in a group
  tripId: integer("trip_id").notNull(),
});

// Saved lists / Templates
export const savedLists = pgTable("saved_lists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const savedListItems = pgTable("saved_list_items", {
  id: serial("id").primaryKey(),
  savedListId: integer("saved_list_id").notNull(),
  name: text("name").notNull(),
  quantity: integer("quantity").default(1).notNull(),
});

// === RELATIONS ===

export const tripsRelations = relations(trips, ({ one, many }) => ({
  organizer: one(users, {
    fields: [trips.organizerId],
    references: [users.id],
  }),
  groups: many(groups),
  items: many(items),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  trip: one(trips, {
    fields: [groups.tripId],
    references: [trips.id],
  }),
  members: many(groupMembers),
  items: many(items), // Items assigned to the group generally
}));

export const groupMembersRelations = relations(groupMembers, ({ one, many }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  assignedItems: many(items), // Items assigned specifically to this member
}));

export const itemsRelations = relations(items, ({ one }) => ({
  trip: one(trips, {
    fields: [items.tripId],
    references: [trips.id],
  }),
  group: one(groups, {
    fields: [items.groupId],
    references: [groups.id],
  }),
  assignedTo: one(groupMembers, {
    fields: [items.assignedToMemberId],
    references: [groupMembers.id],
  }),
}));

export const savedListsRelations = relations(savedLists, ({ one, many }) => ({
  owner: one(users, {
    fields: [savedLists.userId],
    references: [users.id],
  }),
  items: many(savedListItems),
}));

export const savedListItemsRelations = relations(savedListItems, ({ one }) => ({
  savedList: one(savedLists, {
    fields: [savedListItems.savedListId],
    references: [savedLists.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertTripSchema = createInsertSchema(trips).omit({ id: true, createdAt: true });
export const insertGroupSchema = createInsertSchema(groups).omit({ id: true, createdAt: true });
export const insertGroupMemberSchema = createInsertSchema(groupMembers).omit({ id: true });
export const insertItemSchema = createInsertSchema(items).omit({ id: true });
export const insertSavedListSchema = createInsertSchema(savedLists).omit({ id: true, createdAt: true });
export const insertSavedListItemSchema = createInsertSchema(savedListItems).omit({ id: true });

// === TYPES ===

export type Trip = typeof trips.$inferSelect;
export type InsertTrip = z.infer<typeof insertTripSchema>;

export type Group = typeof groups.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;

export type GroupMember = typeof groupMembers.$inferSelect;
export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;

export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;

export type SavedList = typeof savedLists.$inferSelect;
export type InsertSavedList = z.infer<typeof insertSavedListSchema>;

export type SavedListItem = typeof savedListItems.$inferSelect;
export type InsertSavedListItem = z.infer<typeof insertSavedListItemSchema>;
