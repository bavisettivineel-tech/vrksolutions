import { Home, Grid3X3, User, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import vrkLogo from "@/assets/vrk-logo.png";

interface TopNavigationProps {
  userName?: string;
  onLogout: () => void;
}

const TopNavigation = ({ userName, onLogout }: TopNavigationProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Grid3X3, label: "Categories", path: "/categories" },
    { icon: User, label: "Account", path: "/account" },
  ];

  return (
    <header className="hidden md:block fixed top-0 left-0 right-0 z-40 bg-card border-b border-border shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img src={vrkLogo} alt="VRK Solutions" className="h-10 w-10 object-contain" />
            <div>
              <h1 className="font-display font-bold text-lg text-gradient">VRK Solutions</h1>
              <p className="text-xs text-muted-foreground -mt-0.5">First step for your education</p>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Button
                  key={item.path}
                  variant={isActive ? "secondary" : "ghost"}
                  className={`gap-2 ${isActive ? "bg-vrk-100 text-primary" : ""}`}
                  onClick={() => navigate(item.path)}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* User section */}
          <div className="flex items-center gap-3">
            {userName && (
              <span className="text-sm text-muted-foreground">
                Welcome, <span className="font-medium text-foreground">{userName}</span>
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;
