import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Setup Replit Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // Trips
  app.get(api.trips.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const trips = await storage.getTrips(userId);
    res.json(trips);
  });

  app.get(api.trips.get.path, isAuthenticated, async (req, res) => {
    const trip = await storage.getTrip(Number(req.params.id));
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    res.json(trip);
  });

  app.post(api.trips.create.path, isAuthenticated, async (req, res) => {
    try {
      // Use z.coerce to handle date strings from forms
      const bodySchema = api.trips.create.input.extend({
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
      });
      const input = bodySchema.parse(req.body);
      // Ensure organizerId is the current user
      const userId = (req.user as any).claims.sub;
      const trip = await storage.createTrip({ ...input, organizerId: userId });
      res.status(201).json(trip);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.trips.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteTrip(Number(req.params.id));
    res.status(204).send();
  });

  // Groups
  app.post(api.groups.create.path, isAuthenticated, async (req, res) => {
    const input = api.groups.create.input.parse(req.body);
    const tripId = Number(req.params.tripId);
    const group = await storage.createGroup({ ...input, tripId });
    res.status(201).json(group);
  });

  app.delete(api.groups.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteGroup(Number(req.params.id));
    res.status(204).send();
  });

  // Members
  app.post(api.members.create.path, isAuthenticated, async (req, res) => {
    const input = api.members.create.input.parse(req.body);
    const groupId = Number(req.params.groupId);
    const member = await storage.createGroupMember({ ...input, groupId });
    res.status(201).json(member);
  });

  app.delete(api.members.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteGroupMember(Number(req.params.id));
    res.status(204).send();
  });

  // Items
  app.post(api.items.create.path, isAuthenticated, async (req, res) => {
    const input = api.items.create.input.parse(req.body);
    const tripId = Number(req.params.tripId);
    const item = await storage.createItem({ ...input, tripId });
    res.status(201).json(item);
  });

  app.patch(api.items.update.path, isAuthenticated, async (req, res) => {
    const updates = api.items.update.input.parse(req.body);
    const item = await storage.updateItem(Number(req.params.id), updates);
    res.json(item);
  });

  app.delete(api.items.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteItem(Number(req.params.id));
    res.status(204).send();
  });

  app.post(api.items.bulkCreate.path, isAuthenticated, async (req, res) => {
    const { items: itemsData } = api.items.bulkCreate.input.parse(req.body);
    const tripId = Number(req.params.tripId);
    const itemsWithTrip = itemsData.map(i => ({ ...i, tripId }));
    const createdItems = await storage.createItems(itemsWithTrip);
    res.status(201).json(createdItems);
  });

  // Saved Lists
  app.get(api.savedLists.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const lists = await storage.getSavedLists(userId);
    res.json(lists);
  });

  app.post(api.savedLists.create.path, isAuthenticated, async (req, res) => {
    const { name, items: listItems } = api.savedLists.create.input.parse(req.body);
    const userId = (req.user as any).claims.sub;
    const list = await storage.createSavedList(
      { name, userId },
      listItems.map(i => ({ name: i.name, quantity: i.quantity, savedListId: 0 })) // ID will be set in storage
    );
    res.status(201).json(list);
  });

  app.delete(api.savedLists.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteSavedList(Number(req.params.id));
    res.status(204).send();
  });

  return httpServer;
}
