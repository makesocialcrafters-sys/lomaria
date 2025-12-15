import { NavLink } from "react-router-dom";
import { User, Users, MessageCircle, UserCircle } from "lucide-react";

const navItems = [
  { to: "/discover", icon: User, label: "Entdecken" },
  { to: "/contacts", icon: Users, label: "Kontakte" },
  { to: "/chats", icon: MessageCircle, label: "Chats" },
  { to: "/profile", icon: UserCircle, label: "Profil" },
];

export function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors duration-150 ${
                isActive ? "text-primary" : "text-foreground"
              }`
            }
          >
            <Icon className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-[10px] font-medium tracking-wide uppercase">
              {label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
