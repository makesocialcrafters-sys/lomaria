import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ImpressumContent,
  AGBContent,
  DatenschutzContent,
  CookiesContent,
} from "@/components/legal/LegalContent";

type LegalSection = "impressum" | "agb" | "datenschutz" | "cookies";

const tabs: { id: LegalSection; label: string }[] = [
  { id: "impressum", label: "Impressum" },
  { id: "agb", label: "AGB" },
  { id: "datenschutz", label: "Datenschutz" },
  { id: "cookies", label: "Cookies" },
];

export default function Legal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const section = (searchParams.get("section") as LegalSection) || "impressum";
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background animate-cinematic-enter">
      <div className="mx-auto max-w-2xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-foreground/50 hover:text-foreground/80 transition-colors duration-500 mb-6"
          >
            <ArrowLeft size={18} />
            <span className="font-display text-sm tracking-wide">Zurück</span>
          </button>
          <h1 className="font-display text-2xl text-primary tracking-[0.12em] mb-3">
            Rechtliches
          </h1>
          <div className="w-16 h-px bg-primary/40" />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ section: tab.id })}
              className={cn(
                "px-4 py-2 font-display text-xs tracking-wide border rounded-full transition-all duration-500",
                section === tab.id
                  ? "border-primary text-primary bg-primary/10"
                  : "border-border/40 text-foreground/60 hover:border-primary/40"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="pr-4">
            {section === "impressum" && <ImpressumContent />}
            {section === "agb" && <AGBContent />}
            {section === "datenschutz" && <DatenschutzContent />}
            {section === "cookies" && <CookiesContent />}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
