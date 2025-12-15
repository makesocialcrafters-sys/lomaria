import { MainLayout } from "@/components/layout/MainLayout";
import lomariaLogo from "@/assets/lomaria-logo.png";

export default function Chats() {
  return (
    <MainLayout>
      <div className="px-6 py-8 animate-page-enter">
        <div className="max-w-md mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={lomariaLogo} alt="Lomaria" className="h-10 w-auto opacity-60" />
          </div>

          {/* Title */}
          <h1 className="font-display text-lg font-bold uppercase tracking-[0.2em] text-primary text-center mb-8">
            CHATS
          </h1>

          {/* Placeholder */}
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Deine Unterhaltungen erscheinen hier.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
