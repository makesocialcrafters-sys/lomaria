import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 overflow-hidden">
      
      {/* Main Headline - "Lomaria" */}
      <h1 className="font-display text-4xl md:text-5xl text-primary tracking-[0.12em] mb-6 animate-cinematic-slide [animation-delay:0.8s] opacity-0 [animation-fill-mode:forwards]">
        Lomaria
      </h1>
      
      {/* Gold Divider - Subtle, cinematic */}
      <div className="w-16 h-px bg-primary/40 mb-6 animate-cinematic-fade [animation-delay:1.1s] opacity-0 [animation-fill-mode:forwards]" />
      
      {/* Subline - Editorial tone */}
      <p className="font-display text-base md:text-lg text-foreground/60 tracking-[0.08em] mb-3 animate-cinematic-fade [animation-delay:1.3s] opacity-0 [animation-fill-mode:forwards]">
        An exclusive network for WU students.
      </p>
      
      {/* Secondary line - Caption-like, very subtle */}
      <p className="font-display text-xs text-foreground/35 tracking-[0.15em] uppercase mb-16 animate-cinematic-fade [animation-delay:1.6s] opacity-0 [animation-fill-mode:forwards]">
        Connect · Collaborate · Learn
      </p>
      
      {/* CTA Button - Thin gold outline, no fill */}
      <button
        onClick={() => navigate("/auth")}
        className="px-12 py-4 border border-primary/50 text-primary font-display text-sm tracking-[0.1em]
                   hover:border-primary/80 transition-all duration-700 ease-out bg-transparent
                   animate-cinematic-fade [animation-delay:2s] opacity-0 [animation-fill-mode:forwards]"
      >
        Join with WU Email
      </button>
      
      {/* Footnote - Positioned at bottom, very discreet */}
      <p className="absolute bottom-8 font-display text-[10px] text-foreground/25 tracking-[0.08em] animate-cinematic-fade [animation-delay:2.4s] opacity-0 [animation-fill-mode:forwards]">
        Access restricted to verified WU Wien students.
      </p>
      
    </div>
  );
};

export default Index;
