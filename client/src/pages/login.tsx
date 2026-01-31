import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Compass, CheckCircle2, UserPlus, Share2 } from "lucide-react";

// Unsplash image for utility/travel vibe
// Travel accessories on a table
const HERO_IMAGE = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop";

export default function LoginPage() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel - Branding */}
      <div className="relative hidden lg:flex flex-col p-12 text-white bg-black">
        <div className="absolute inset-0 z-0">
          <img 
            src={HERO_IMAGE} 
            alt="Travel background" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
        </div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-display font-bold">PackMate</span>
        </div>

        <div className="relative z-10 mt-auto max-w-lg space-y-6">
          <h1 className="text-5xl font-display font-bold leading-tight">
            Never forget the essentials again.
          </h1>
          <p className="text-lg text-white/80 font-light">
            Coordinate group trips, manage shared packing lists, and travel with peace of mind.
          </p>
          
          <div className="grid gap-4 pt-8">
            {[
              { icon: CheckCircle2, text: "Interactive Packing Checklists" },
              { icon: UserPlus, text: "Group Management & Assignments" },
              { icon: Share2, text: "Share Lists via QR or Link" }
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-white/90">
                <feature.icon className="w-5 h-5 text-accent" />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login */}
      <div className="flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md border-none shadow-none bg-transparent">
          <CardHeader className="space-y-2 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 lg:hidden">
              <Compass className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground">Sign in to access your trips and lists</p>
          </CardHeader>
          
          <CardContent className="space-y-4 pt-6">
            <Button 
              size="lg" 
              className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20" 
              onClick={handleLogin}
            >
              Log in with Replit
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Secure access
                </span>
              </div>
            </div>
            
            <p className="text-center text-sm text-muted-foreground px-8">
              By clicking continue, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
