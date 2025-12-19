import { Outlet } from "react-router-dom";
import { BottomNavigation } from "./BottomNavigation";
import { useUpdateLastActive } from "@/hooks/useUpdateLastActive";

export function AppShell() {
  useUpdateLastActive();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="animate-cinematic-enter">
        <Outlet />
      </div>
      <BottomNavigation />
    </div>
  );
}
