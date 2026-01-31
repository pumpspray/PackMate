import { LayoutShell } from "@/components/layout-shell";
import { useTrips } from "@/hooks/use-trips";
import { TripCard } from "@/components/trip-card";
import { CreateTripDialog } from "@/components/create-trip-dialog";
import { Loader2, Plane, PackageOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  const { data: trips, isLoading } = useTrips();

  if (isLoading) {
    return (
      <LayoutShell>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </LayoutShell>
    );
  }

  const hasTrips = trips && trips.length > 0;

  return (
    <LayoutShell>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Your Trips</h1>
            <p className="text-muted-foreground mt-1">Manage your upcoming adventures and packing lists.</p>
          </div>
          <CreateTripDialog />
        </div>

        {!hasTrips ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-2xl border-border bg-card/50">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Plane className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No trips planned yet</h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              Ready for your next adventure? Create a trip to start organizing groups and packing lists.
            </p>
            <CreateTripDialog />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <TripCard {...trip} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </LayoutShell>
  );
}
