import { Link } from "wouter";
import { format } from "date-fns";
import { Calendar, Users, ChevronRight, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useDeleteTrip } from "@/hooks/use-trips";

interface TripCardProps {
  id: number;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
}

export function TripCard({ id, name, startDate, endDate, description }: TripCardProps) {
  const { mutate: deleteTrip } = useDeleteTrip();

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 border-border/60">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary/0 group-hover:bg-primary transition-all duration-300" />
      
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <h3 className="font-display font-semibold text-xl leading-none tracking-tight group-hover:text-primary transition-colors">
            {name}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-1">{description}</p>
          )}
        </div>
        
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Trip
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the trip and all associated packing lists.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => deleteTrip(id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
          <div className="flex items-center gap-1.5 bg-secondary/50 px-2.5 py-1 rounded-md">
            <Calendar className="w-4 h-4 text-primary" />
            {startDate ? format(new Date(startDate), "MMM d") : "TBD"} 
            {endDate && ` - ${format(new Date(endDate), "MMM d")}`}
            {startDate && endDate && ` (${format(new Date(endDate), "yyyy")})`}
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Link href={`/trip/${id}`} className="w-full">
          <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
            View Details
            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
