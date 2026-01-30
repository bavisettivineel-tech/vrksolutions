import { Home, Grid3X3, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Grid3X3, label: "Categories", path: "/categories" },
    { icon: User, label: "Account", path: "/account" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-card border-t border-border shadow-elevated">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors duration-200 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div
                className={`p-2 rounded-xl transition-all duration-200 ${
                  isActive ? "bg-vrk-100" : ""
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
