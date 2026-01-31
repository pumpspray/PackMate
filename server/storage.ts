import { db } from "./db";
import {
  trips, groups, groupMembers, items, savedLists, savedListItems,
  type InsertTrip, type InsertGroup, type InsertGroupMember, type InsertItem, type InsertSavedList, type InsertSavedListItem
} from "@shared/schema";
import { eq, inArray } from "drizzle-orm";
import { authStorage } from "./replit_integrations/auth/storage";

export interface IStorage {
  // Trips
  getTrips(userId: string): Promise<any[]>;
  getTrip(id: number): Promise<any | undefined>;
  createTrip(trip: InsertTrip): Promise<any>;
  deleteTrip(id: number): Promise<void>;

  // Groups
  createGroup(group: InsertGroup): Promise<any>;
  deleteGroup(id: number): Promise<void>;

  // Members
  createGroupMember(member: InsertGroupMember): Promise<any>;
  deleteGroupMember(id: number): Promise<void>;

  // Items
  createItem(item: InsertItem): Promise<any>;
  updateItem(id: number, updates: Partial<InsertItem>): Promise<any>;
  deleteItem(id: number): Promise<void>;
  createItems(items: InsertItem[]): Promise<any[]>;

  // Saved Lists
  getSavedLists(userId: string): Promise<any[]>;
  createSavedList(list: InsertSavedList, items: InsertSavedListItem[]): Promise<any>;
  deleteSavedList(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Trips
  async getTrips(userId: string): Promise<any[]> {
    return await db.select().from(trips).where(eq(trips.organizerId, userId));
  }

  async getTrip(id: number): Promise<any | undefined> {
    const trip = await db.query.trips.findFirst({
      where: eq(trips.id, id),
      with: {
        groups: {
          with: {
            members: true
          }
        },
        items: {
            with: {
                assignedTo: true
            }
        }
      }
    });
    return trip;
  }

  async createTrip(trip: InsertTrip): Promise<any> {
    const [newTrip] = await db.insert(trips).values(trip).returning();
    return newTrip;
  }

  async deleteTrip(id: number): Promise<void> {
    await db.delete(trips).where(eq(trips.id, id));
  }

  // Groups
  async createGroup(group: InsertGroup): Promise<any> {
    const [newGroup] = await db.insert(groups).values(group).returning();
    return newGroup;
  }

  async deleteGroup(id: number): Promise<void> {
    await db.delete(groups).where(eq(groups.id, id));
  }

  // Members
  async createGroupMember(member: InsertGroupMember): Promise<any> {
    const [newMember] = await db.insert(groupMembers).values(member).returning();
    return newMember;
  }

  async deleteGroupMember(id: number): Promise<void> {
    await db.delete(groupMembers).where(eq(groupMembers.id, id));
  }

  // Items
  async createItem(item: InsertItem): Promise<any> {
    const [newItem] = await db.insert(items).values(item).returning();
    return newItem;
  }

  async updateItem(id: number, updates: Partial<InsertItem>): Promise<any> {
    const [updatedItem] = await db.update(items).set(updates).where(eq(items.id, id)).returning();
    return updatedItem;
  }

  async deleteItem(id: number): Promise<void> {
    await db.delete(items).where(eq(items.id, id));
  }

  async createItems(itemsData: InsertItem[]): Promise<any[]> {
    return await db.insert(items).values(itemsData).returning();
  }

  // Saved Lists
  async getSavedLists(userId: string): Promise<any[]> {
    return await db.query.savedLists.findMany({
      where: eq(savedLists.userId, userId),
      with: {
        items: true
      }
    });
  }

  async createSavedList(list: InsertSavedList, listItems: InsertSavedListItem[]): Promise<any> {
    return await db.transaction(async (tx) => {
      const [newList] = await tx.insert(savedLists).values(list).returning();
      if (listItems.length > 0) {
        await tx.insert(savedListItems).values(
          listItems.map(item => ({ ...item, savedListId: newList.id }))
        );
      }
      return newList;
    });
  }

  async deleteSavedList(id: number): Promise<void> {
    await db.delete(savedLists).where(eq(savedLists.id, id));
  }
}

export const storage = new DatabaseStorage();
// Re-export authStorage for usage in auth routes
export { authStorage } from "./replit_integrations/auth/storage";
