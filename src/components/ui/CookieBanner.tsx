import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "lomaria_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const choice = localStorage.getItem(STORAGE_KEY);
      if (!choice) setVisible(true);
    } catch {
      /* ignore */
    }
  }, []);

  const handleChoice = (choice: "accepted" | "declined") => {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie-Hinweis"
      className="fixed inset-x-0 bottom-0 z-[100] p-4 sm:p-6 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-2xl rounded-lg border border-primary/30 bg-[#080808]/95 backdrop-blur-md p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <p className="font-display text-sm sm:text-base text-foreground leading-relaxed">
              Wir verwenden Cookies um dein Erlebnis zu verbessern.
            </p>
            <Link
              to="/legal"
              className="font-display text-xs sm:text-sm text-primary hover:text-primary-hover underline underline-offset-4 mt-2 inline-block"
            >
              Mehr erfahren
            </Link>
          </div>
          <div className="flex gap-2 sm:gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleChoice("declined")}
            >
              Ablehnen
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => handleChoice("accepted")}
            >
              Akzeptieren
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
