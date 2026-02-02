import { NavLink, useLocation } from "react-router-dom";
import { User, Users, MessageCircle, UserCircle, Lock } from "lucide-react";
import { useNotificationCounts } from "@/hooks/useNotificationCounts";
import { toast } from "@/hooks/use-toast";

const navItems = [
  { to: "/discover", icon: User, label: "Entdecken" },
  { to: "/contacts", icon: Users, label: "Kontakte" },
  { to: "/chats", icon: MessageCircle, label: "Chats" },
];

const profileTab = { to: "/profile", icon: UserCircle, label: "Profil" };

export function BottomNavigation() {
  const location = useLocation();
  const { hasNewContacts, hasUnreadMessages } = useNotificationCounts();

  const isActive = (to: string) => {
    if (to === "/profile") {
      return location.pathname === "/profile";
    }
    return location.pathname.startsWith(to);
  };

  const showNotificationDot = (to: string) => {
    if (isActive(to)) return false;
    if (to === "/contacts") return hasNewContacts;
    if (to === "/chats") return hasUnreadMessages;
    return false;
  };

  return (
    <nav 
      aria-label="Hauptnavigation" 
      className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50"
    >
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            aria-current={isActive(to) ? "page" : undefined}
            className={() =>
              `flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[48px] px-2 py-2 transition-all duration-500 ease-out ${
                isActive(to) 
                  ? "text-primary border-t-2 border-primary -mt-0.5" 
                  : "text-foreground/60 hover:text-foreground"
              }`
            }
          >
            <div className="relative">
              <Icon className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
              {showNotificationDot(to) && (
                <span
                  aria-label="Neue Aktivität"
                  className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-primary rounded-full"
                />
              )}
            </div>
            <span className="font-display text-[10px] tracking-[0.15em] uppercase">
              {label}
            </span>
          </NavLink>
        ))}
        
        {/* Opportunity Tab - Coming Soon */}
        <button
          type="button"
          onClick={() => toast({
            title: "Bald verfügbar",
            description: "Opportunity kommt bald! Bleib dran.",
          })}
          className="flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[48px] px-2 py-2 text-foreground/40 transition-all duration-500 ease-out hover:text-foreground/60"
        >
          <Lock className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
          <span className="font-display text-[10px] tracking-[0.15em] uppercase">
            Opportunity
          </span>
        </button>
        
        {/* Profile Tab */}
        <NavLink
          to={profileTab.to}
          aria-current={isActive(profileTab.to) ? "page" : undefined}
          className={() =>
            `flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[48px] px-2 py-2 transition-all duration-500 ease-out ${
              isActive(profileTab.to) 
                ? "text-primary border-t-2 border-primary -mt-0.5" 
                : "text-foreground/60 hover:text-foreground"
            }`
          }
        >
          <profileTab.icon className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
          <span className="font-display text-[10px] tracking-[0.15em] uppercase">
            {profileTab.label}
          </span>
        </NavLink>
      </div>
    </nav>
  );
}