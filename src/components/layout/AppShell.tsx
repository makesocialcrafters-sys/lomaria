import { Outlet } from "react-router-dom";
import { BottomNavigation } from "./BottomNavigation";
import { useUpdateLastActive } from "@/hooks/useUpdateLastActive";

export function AppShell() {
  useUpdateLastActive();

  return (
    <div className="min-h-screen bg-background pb-20">
      <main id="main-content" className="animate-cinematic-enter">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
}