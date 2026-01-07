import { useNavigate, Link } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Visually hidden h1 for screen readers */}
      <h1 className="sr-only">Lomaria – Exklusive Networking-Plattform für WU-Studierende</h1>
      
      {/* Main Headline - "Lomaria" (visible as h2) */}
      <h2 className="font-display text-4xl md:text-5xl text-primary tracking-[0.12em] mb-6 animate-cinematic-stagger-1">
        Lomaria
      </h2>
      
      {/* Gold Divider - Subtle, cinematic */}
      <div 
        className="w-16 h-px bg-primary/40 mb-6 animate-cinematic-stagger-2" 
        role="presentation" 
        aria-hidden="true" 
      />
      
      {/* Subline - Editorial tone */}
      <p className="font-display text-base md:text-lg text-foreground/60 tracking-[0.08em] mb-3 animate-cinematic-stagger-3">
        An exclusive network for WU students.
      </p>
      
      {/* Secondary line - Caption-like, very subtle */}
      <p className="font-display text-xs text-foreground/35 tracking-[0.15em] uppercase mb-16 animate-cinematic-stagger-4">
        Connect · Collaborate · Learn
      </p>
      
      {/* CTA Button - Thin gold outline, no fill */}
      <button
        onClick={() => navigate("/auth")}
        className="px-12 py-4 min-h-[48px] border border-primary/50 text-primary font-display text-sm tracking-[0.1em]
                   hover:border-primary/80 transition-all duration-700 ease-out bg-transparent
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
                   animate-cinematic-stagger-5"
      >
        Join with WU Email
      </button>
      
      {/* Legal Links - with proper touch targets */}
      <footer className="absolute bottom-12 flex gap-1 animate-cinematic-stagger-5">
        <Link 
          to="/legal?section=impressum" 
          className="px-3 py-2 min-h-[44px] flex items-center font-display text-xs text-foreground/30 tracking-[0.05em] hover:text-primary/60 transition-colors duration-500"
        >
          Impressum
        </Link>
        <Link 
          to="/legal?section=agb" 
          className="px-3 py-2 min-h-[44px] flex items-center font-display text-xs text-foreground/30 tracking-[0.05em] hover:text-primary/60 transition-colors duration-500"
        >
          AGB
        </Link>
        <Link 
          to="/legal?section=datenschutz" 
          className="px-3 py-2 min-h-[44px] flex items-center font-display text-xs text-foreground/30 tracking-[0.05em] hover:text-primary/60 transition-colors duration-500"
        >
          Datenschutz
        </Link>
      </footer>

      {/* Footnote - Positioned at bottom, very discreet */}
      <p className="absolute bottom-6 font-display text-[10px] text-foreground/25 tracking-[0.08em] animate-cinematic-stagger-5">
        Access restricted to verified WU Wien students.
      </p>
      
    </main>
  );
};

export default Index;