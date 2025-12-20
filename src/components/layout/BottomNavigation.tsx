import { NavLink, useLocation } from "react-router-dom";
import { User, Users, MessageCircle, UserCircle } from "lucide-react";

const navItems = [
  { to: "/discover", icon: User, label: "Entdecken" },
  { to: "/contacts", icon: Users, label: "Kontakte" },
  { to: "/chats", icon: MessageCircle, label: "Chats" },
  { to: "/profile", icon: UserCircle, label: "Profil" },
];

export function BottomNavigation() {
  const location = useLocation();

  const isActive = (to: string) => {
    if (to === "/profile") {
      // Only active for exact /profile (own profile)
      return location.pathname === "/profile";
    }
    // For other tabs: active if path starts with the tab route
    return location.pathname.startsWith(to);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={() =>
              `flex flex-col items-center justify-center gap-1 px-4 py-2 transition-all duration-500 ease-out ${
                isActive(to) 
                  ? "text-primary border-t-2 border-primary -mt-0.5" 
                  : "text-foreground/60 hover:text-foreground"
              }`
            }
          >
            <Icon className="w-5 h-5" strokeWidth={1.5} />
            <span className="font-display text-[10px] tracking-[0.15em] uppercase">
              {label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
