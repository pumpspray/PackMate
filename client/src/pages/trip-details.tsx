import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { QRCode } from "react-qrcode-logo";
import { useTrip, useCreateGroup, useDeleteGroup, useCreateMember, useDeleteMember, useCreateItem, useUpdateItem, useDeleteItem, useSavedLists, useBulkCreateItems } from "@/hooks/use-trips";
import { LayoutShell } from "@/components/layout-shell";
import { Loader2, Plus, Share2, Trash2, User, Users, CheckCircle2, Circle, MoreVertical, Copy, Import, ChevronDown, ChevronRight, Heart as BookHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function TripDetailsPage() {
  const [match, params] = useRoute("/trip/:id");
  const tripId = parseInt(params!.id);
  const { data: trip, isLoading } = useTrip(tripId);
  const { toast } = useToast();
  
  if (isLoading) {
    return (
      <LayoutShell>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </LayoutShell>
    );
  }

  if (!trip) return <LayoutShell>Trip not found</LayoutShell>;

  const shareUrl = window.location.href;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "Copied!", description: "Link copied to clipboard" });
  };

  return (
    <LayoutShell>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">{trip.name}</h1>
              <Badge variant="secondary" className="font-normal text-muted-foreground">
                {trip.items.length} items
              </Badge>
            </div>
            {trip.description && <p className="text-muted-foreground mt-2 max-w-2xl">{trip.description}</p>}
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Share2 className="w-4 h-4" />
                Share Trip
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share with Friends</DialogTitle>
                <DialogDescription>Invite others to join and manage their packing lists.</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center py-6 gap-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border">
                  <QRCode value={shareUrl} size={200} logoWidth={40} />
                </div>
                <div className="flex gap-2 w-full">
                  <Input value={shareUrl} readOnly className="bg-muted font-mono text-xs" />
                  <Button size="icon" onClick={copyLink}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="packing" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="packing" className="px-8">Packing List</TabsTrigger>
            <TabsTrigger value="groups" className="px-8">Groups & Members</TabsTrigger>
          </TabsList>

          <TabsContent value="packing" className="space-y-6">
            <PackingListTab trip={trip} />
          </TabsContent>

          <TabsContent value="groups" className="space-y-6">
            <GroupsTab trip={trip} />
          </TabsContent>
        </Tabs>
      </div>
    </LayoutShell>
  );
}

// === GROUPS TAB ===

function GroupsTab({ trip }: { trip: any }) {
  const { mutate: createGroup } = useCreateGroup();
  const { mutate: deleteGroup } = useDeleteGroup();
  const { mutate: createMember } = useCreateMember();
  const { mutate: deleteMember } = useDeleteMember();
  const [newGroupName, setNewGroupName] = useState("");
  
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Add Group Card */}
      <Card className="border-dashed bg-muted/30 flex flex-col items-center justify-center p-6 text-center h-full min-h-[200px]">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Users className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Create a Group</h3>
        <p className="text-sm text-muted-foreground mb-4">Add families or groups of friends</p>
        <Popover>
          <PopoverTrigger asChild>
            <Button>Create Group</Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium leading-none">New Group</h4>
              <div className="flex gap-2">
                <Input 
                  placeholder="e.g. The Smiths" 
                  value={newGroupName} 
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
                <Button 
                  size="icon"
                  onClick={() => {
                    if (newGroupName) {
                      createGroup({ tripId: trip.id, data: { name: newGroupName } });
                      setNewGroupName("");
                    }
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </Card>

      {/* Existing Groups */}
      {trip.groups.map((group: any) => (
        <Card key={group.id} className="relative group overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-display">{group.name}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={() => deleteGroup({ id: group.id, tripId: trip.id })}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Group
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {group.members.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No members yet</p>
              )}
              
              {group.members.map((member: any) => (
                <div key={member.id} className="flex items-center justify-between text-sm bg-muted/40 p-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{member.name}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteMember({ id: member.id, tripId: trip.id })}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}

              <AddMemberForm groupId={group.id} tripId={trip.id} createMember={createMember} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AddMemberForm({ groupId, tripId, createMember }: any) {
  const [name, setName] = useState("");
  return (
    <div className="flex gap-2 mt-4 pt-2 border-t">
      <Input 
        placeholder="Add member..." 
        className="h-8 text-sm"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && name) {
            createMember({ groupId, tripId, data: { name } });
            setName("");
          }
        }}
      />
      <Button 
        size="icon" 
        className="h-8 w-8"
        onClick={() => {
          if (name) {
            createMember({ groupId, tripId, data: { name } });
            setName("");
          }
        }}
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}

// === PACKING LIST TAB ===

function PackingListTab({ trip }: { trip: any }) {
  // We need to group items by group -> member
  // First, get all items for the trip
  const allItems = trip.items || [];
  
  // Create a structure: Group -> Member -> Items
  // Plus "Unassigned" items for the whole group
  
  return (
    <div className="space-y-6">
      {trip.groups.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-xl border-2 border-dashed">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Create a group first</h3>
          <p className="text-muted-foreground mb-4">You need to add people to the trip before you can assign items.</p>
        </div>
      ) : (
        trip.groups.map((group: any) => (
          <GroupPackingList key={group.id} group={group} tripId={trip.id} allItems={allItems} />
        ))
      )}
    </div>
  );
}

function GroupPackingList({ group, tripId, allItems }: any) {
  const { data: savedLists } = useSavedLists();
  const { mutate: bulkCreate } = useBulkCreateItems();
  const [importOpen, setImportOpen] = useState(false);

  // Filter items that belong to this group but NO specific member (shared group items)
  const groupSharedItems = allItems.filter((i: any) => i.groupId === group.id && !i.assignedToMemberId);

  const handleImport = (listId: number) => {
    const list = savedLists?.find((l: any) => l.id === listId);
    if (!list) return;

    const newItems = list.items.map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      groupId: group.id,
      tripId: tripId
    }));

    bulkCreate({ tripId, data: { items: newItems } });
    setImportOpen(false);
  };

  return (
    <Card className="overflow-hidden border-t-4 border-t-primary">
      <CardHeader className="bg-muted/20 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-xl">{group.name}</CardTitle>
          <Dialog open={importOpen} onOpenChange={setImportOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-primary hover:bg-primary/10">
                <Import className="w-4 h-4" />
                Import Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Packing List</DialogTitle>
                <DialogDescription>Add items from your saved templates to {group.name}'s shared list.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-2 py-4">
                {savedLists?.map((list: any) => (
                  <Button 
                    key={list.id} 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => handleImport(list.id)}
                  >
                    <BookHeart className="w-4 h-4 mr-2 text-muted-foreground" />
                    {list.name} ({list.items.length} items)
                  </Button>
                ))}
                {(!savedLists || savedLists.length === 0) && (
                  <p className="text-center text-muted-foreground text-sm py-4">No saved templates found.</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-8">
        {/* Shared Group Items */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Users className="w-4 h-4" />
            Shared Group Items
          </h4>
          <ItemList 
            items={groupSharedItems} 
            tripId={tripId} 
            context={{ groupId: group.id }} 
          />
        </div>

        {/* Member Specific Lists */}
        <div className="grid gap-6 md:grid-cols-2">
          {group.members.map((member: any) => {
            const memberItems = allItems.filter((i: any) => i.assignedToMemberId === member.id);
            return (
              <div key={member.id} className="bg-muted/30 rounded-xl p-4 space-y-3 border">
                <h4 className="font-medium flex items-center gap-2 pb-2 border-b border-border/50">
                  <User className="w-4 h-4 text-primary" />
                  {member.name}
                  <Badge variant="outline" className="ml-auto text-xs font-normal">
                    {memberItems.filter((i: any) => i.isPacked).length}/{memberItems.length}
                  </Badge>
                </h4>
                <ItemList 
                  items={memberItems} 
                  tripId={tripId} 
                  context={{ groupId: group.id, assignedToMemberId: member.id }}
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function ItemList({ items, tripId, context }: any) {
  const { mutate: createItem } = useCreateItem();
  const { mutate: updateItem } = useUpdateItem();
  const { mutate: deleteItem } = useDeleteItem();
  const [newItemName, setNewItemName] = useState("");

  const handleAdd = () => {
    if (!newItemName.trim()) return;
    createItem({ 
      tripId, 
      data: { 
        name: newItemName, 
        quantity: 1, 
        isPacked: false,
        ...context 
      } 
    });
    setNewItemName("");
  };

  return (
    <div className="space-y-2">
      {items.map((item: any) => (
        <div 
          key={item.id} 
          className={cn(
            "group flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-background border border-transparent hover:border-border hover:shadow-sm",
            item.isPacked && "opacity-60 bg-muted/20"
          )}
        >
          <button 
            onClick={() => updateItem({ id: item.id, tripId, updates: { isPacked: !item.isPacked } })}
            className={cn(
              "flex-shrink-0 transition-colors",
              item.isPacked ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}
          >
            {item.isPacked ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
          </button>
          
          <span className={cn("flex-1 text-sm font-medium", item.isPacked && "line-through text-muted-foreground")}>
            {item.name}
          </span>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            onClick={() => deleteItem({ id: item.id, tripId })}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      ))}

      <div className="flex gap-2 pt-1">
        <Input 
          placeholder="Add item..." 
          className="h-8 text-sm bg-background"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button size="icon" className="h-8 w-8" onClick={handleAdd}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
