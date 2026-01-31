import { LayoutShell } from "@/components/layout-shell";
import { useSavedLists, useCreateSavedList, useDeleteSavedList } from "@/hooks/use-trips";
import { Loader2, Plus, Trash2, Heart as BookHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const listSchema = z.object({
  name: z.string().min(1, "Name is required"),
  itemsText: z.string().min(1, "Add some items"),
});

export default function SavedListsPage() {
  const { data: lists, isLoading } = useSavedLists();
  const { mutate: deleteList } = useDeleteSavedList();
  const { mutate: createList, isPending } = useCreateSavedList();
  const [open, setOpen] = useState(false);

  const form = useForm<{ name: string; itemsText: string }>({
    resolver: zodResolver(listSchema),
  });

  const onSubmit = (data: { name: string; itemsText: string }) => {
    const items = data.itemsText.split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(name => ({ name, quantity: 1 }));

    createList({ name: data.name, items }, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      }
    });
  };

  if (isLoading) {
    return (
      <LayoutShell>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell>
      <div className="space-y-8 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Saved Templates</h1>
            <p className="text-muted-foreground mt-1">Reuse your favorite packing lists for future trips.</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Packing Template</DialogTitle>
                <DialogDescription>Create a master list you can import into any trip.</DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input id="name" placeholder="e.g. Ski Trip Essentials" {...form.register("name")} />
                  {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="items">Items (one per line)</Label>
                  <textarea 
                    className="w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    id="items" 
                    placeholder="Socks&#10;Toothbrush&#10;Passport" 
                    {...form.register("itemsText")} 
                  />
                  {form.formState.errors.itemsText && <p className="text-xs text-destructive">{form.formState.errors.itemsText.message}</p>}
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Template"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {!lists?.length ? (
           <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-2xl border-border bg-card/50">
             <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
               <BookHeart className="w-8 h-8 text-accent" />
             </div>
             <h3 className="text-xl font-semibold mb-2">No saved templates</h3>
             <p className="text-muted-foreground max-w-sm">
               Create templates for commonly packed items like "Beach Essentials" or "Toiletries" to save time.
             </p>
           </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {lists.map(list => (
              <Card key={list.id} className="group hover:shadow-lg transition-all relative">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="font-display">{list.name}</CardTitle>
                      <CardDescription>{list.items.length} items</CardDescription>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteList(list.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {list.items.slice(0, 5).map(item => (
                      <span key={item.id} className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-xs text-secondary-foreground">
                        {item.name}
                      </span>
                    ))}
                    {list.items.length > 5 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground">
                        +{list.items.length - 5} more
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </LayoutShell>
  );
}
