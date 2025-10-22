import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AetherMindLogo } from "@/components/AetherMindLogo";
import { Button } from "./ui/button";
import { Settings, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
interface AetherMindHeaderProps {
  onOpenSettings: () => void;
}
export function AetherMindHeader({ onOpenSettings }: AetherMindHeaderProps) {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    toast.info("You have been logged out.");
    navigate('/auth');
  };
  return (
    <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        <SidebarTrigger aria-label="Open sidebar" />
        <AetherMindLogo />
      </div>
      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <>
            <span className="text-sm text-muted-foreground hidden sm:inline">Welcome, {user?.username}</span>
            <Button variant="ghost" size="icon" onClick={onOpenSettings} aria-label="Open settings">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </>
        ) : (
          <Button variant="ghost" onClick={() => navigate('/auth')} aria-label="Login">
            <LogIn className="mr-2 h-4 w-4" />
            Login
          </Button>
        )}
        <ThemeToggle className="relative top-0 right-0" />
      </div>
    </header>
  );
}