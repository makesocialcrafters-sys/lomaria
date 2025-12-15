import { ReactNode, useEffect } from "react";
import { BottomNavigation } from "./BottomNavigation";
import { useUpdateLastActive } from "@/hooks/useUpdateLastActive";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  useUpdateLastActive();

  return (
    <div className="min-h-screen bg-background pb-20">
      {children}
      <BottomNavigation />
    </div>
  );
}
