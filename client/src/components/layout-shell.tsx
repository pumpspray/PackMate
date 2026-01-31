import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Map, Heart as BookHeart, User as UserIcon, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "My Trips", href: "/", icon: Map },
    { label: "Saved Lists", href: "/saved-lists", icon: BookHeart },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              P
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground">PackMate</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                  location === item.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
            
            <div className="w-px h-6 bg-border mx-2" />
            
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium hidden lg:inline-block">
                Hi, {user?.firstName || 'Traveler'}
              </span>
              <Avatar className="w-8 h-8 border border-border">
                {user?.profileImageUrl && <AvatarImage src={user.profileImageUrl} />}
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {user?.firstName?.[0] || <UserIcon className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => logout()}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </nav>

          {/* Mobile Nav */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-6 mt-6">
                  <div className="flex items-center gap-3 pb-6 border-b">
                    <Avatar className="w-10 h-10 border border-border">
                      {user?.profileImageUrl && <AvatarImage src={user.profileImageUrl} />}
                      <AvatarFallback>
                        {user?.firstName?.[0] || <UserIcon className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  
                  <nav className="flex flex-col gap-2">
                    {navItems.map((item) => (
                      <Link 
                        key={item.href} 
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          location === item.href 
                            ? "bg-primary/10 text-primary" 
                            : "hover:bg-muted text-foreground"
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                      </Link>
                    ))}
                  </nav>

                  <Button 
                    variant="outline" 
                    className="mt-auto justify-start gap-3 border-destructive/20 text-destructive hover:text-destructive hover:bg-destructive/5"
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
