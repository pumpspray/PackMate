import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Types derived from schema via api
type TripInput = z.infer<typeof api.trips.create.input>;
type GroupInput = z.infer<typeof api.groups.create.input>;
type MemberInput = z.infer<typeof api.members.create.input>;
type ItemInput = z.infer<typeof api.items.create.input>;
type ItemBulkInput = z.infer<typeof api.items.bulkCreate.input>;
type SavedListInput = z.infer<typeof api.savedLists.create.input>;

export function useTrips() {
  return useQuery({
    queryKey: [api.trips.list.path],
    queryFn: async () => {
      const res = await fetch(api.trips.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch trips");
      return api.trips.list.responses[200].parse(await res.json());
    },
  });
}

export function useTrip(id: number) {
  return useQuery({
    queryKey: [api.trips.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.trips.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch trip details");
      return api.trips.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: TripInput) => {
      const res = await fetch(api.trips.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create trip");
      return api.trips.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.trips.list.path] });
      toast({ title: "Success", description: "Trip created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.trips.delete.path, { id });
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete trip");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.trips.list.path] });
      toast({ title: "Deleted", description: "Trip removed" });
    },
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ tripId, data }: { tripId: number; data: GroupInput }) => {
      const url = buildUrl(api.groups.create.path, { tripId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create group");
      return api.groups.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, { tripId }) => {
      queryClient.invalidateQueries({ queryKey: [api.trips.get.path, tripId] });
      toast({ title: "Group added" });
    },
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, tripId }: { id: number; tripId: number }) => {
      const url = buildUrl(api.groups.delete.path, { id });
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete group");
    },
    onSuccess: (_, { tripId }) => {
      queryClient.invalidateQueries({ queryKey: [api.trips.get.path, tripId] });
      toast({ title: "Group removed" });
    },
  });
}

export function useCreateMember() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ groupId, tripId, data }: { groupId: number; tripId: number; data: MemberInput }) => {
      const url = buildUrl(api.members.create.path, { groupId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add member");
      return api.members.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, { tripId }) => {
      queryClient.invalidateQueries({ queryKey: [api.trips.get.path, tripId] });
      toast({ title: "Member added" });
    },
  });
}

export function useDeleteMember() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, tripId }: { id: number; tripId: number }) => {
      const url = buildUrl(api.members.delete.path, { id });
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to remove member");
    },
    onSuccess: (_, { tripId }) => {
      queryClient.invalidateQueries({ queryKey: [api.trips.get.path, tripId] });
      toast({ title: "Member removed" });
    },
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ tripId, data }: { tripId: number; data: ItemInput }) => {
      const url = buildUrl(api.items.create.path, { tripId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add item");
      return api.items.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, { tripId }) => {
      queryClient.invalidateQueries({ queryKey: [api.trips.get.path, tripId] });
      toast({ title: "Item added" });
    },
  });
}

export function useBulkCreateItems() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ tripId, data }: { tripId: number; data: ItemBulkInput }) => {
      const url = buildUrl(api.items.bulkCreate.path, { tripId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add items");
      return api.items.bulkCreate.responses[201].parse(await res.json());
    },
    onSuccess: (_, { tripId }) => {
      queryClient.invalidateQueries({ queryKey: [api.trips.get.path, tripId] });
      toast({ title: "Items imported successfully" });
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, tripId, updates }: { id: number; tripId: number; updates: Partial<ItemInput> }) => {
      const url = buildUrl(api.items.update.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update item");
      return api.items.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, { tripId }) => {
      // Optimistic updates are handled by query cache, but we invalidate to be safe
      // Note: For checkbox toggling, we might want to do optimistic updates in the UI for speed
      queryClient.invalidateQueries({ queryKey: [api.trips.get.path, tripId] });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, tripId }: { id: number; tripId: number }) => {
      const url = buildUrl(api.items.delete.path, { id });
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete item");
    },
    onSuccess: (_, { tripId }) => {
      queryClient.invalidateQueries({ queryKey: [api.trips.get.path, tripId] });
      toast({ title: "Item removed" });
    },
  });
}

export function useSavedLists() {
  return useQuery({
    queryKey: [api.savedLists.list.path],
    queryFn: async () => {
      const res = await fetch(api.savedLists.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch saved lists");
      return api.savedLists.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateSavedList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: SavedListInput) => {
      const res = await fetch(api.savedLists.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to save list");
      return api.savedLists.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.savedLists.list.path] });
      toast({ title: "List saved", description: "You can reuse this list later." });
    },
  });
}

export function useDeleteSavedList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.savedLists.delete.path, { id });
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete list");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.savedLists.list.path] });
      toast({ title: "List deleted" });
    },
  });
}
