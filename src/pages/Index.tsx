import { useNavigate } from "react-router-dom";
import lomariaLogo from "@/assets/lomaria-logo.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 overflow-hidden">
      
      {/* Logo - Top area, small, slow cinematic fade */}
      <img 
        src={lomariaLogo}
        alt="Lomaria"
        className="h-8 md:h-10 mb-20 opacity-0"
        style={{ animation: "cinematic-fade 1.8s ease-out 0.3s forwards" }}
      />
      
      {/* Main Headline - "Lomaria" */}
      <h1 
        className="font-display text-4xl md:text-5xl text-primary tracking-[0.12em] mb-6 opacity-0"
        style={{ animation: "cinematic-slide 1.2s ease-out 0.8s forwards" }}
      >
        Lomaria
      </h1>
      
      {/* Gold Divider - Subtle, cinematic */}
      <div 
        className="w-16 h-px bg-primary/40 mb-6 opacity-0"
        style={{ animation: "cinematic-fade 1s ease-out 1.1s forwards" }}
      />
      
      {/* Subline - Editorial tone */}
      <p 
        className="font-display text-base md:text-lg text-foreground/60 tracking-[0.08em] mb-3 opacity-0"
        style={{ animation: "cinematic-fade 1s ease-out 1.3s forwards" }}
      >
        An exclusive network for WU students.
      </p>
      
      {/* Secondary line - Caption-like, very subtle */}
      <p 
        className="font-display text-xs text-foreground/35 tracking-[0.15em] uppercase mb-16 opacity-0"
        style={{ animation: "cinematic-fade 1s ease-out 1.6s forwards" }}
      >
        Connect · Collaborate · Learn
      </p>
      
      {/* CTA Button - Thin gold outline, no fill */}
      <button
        onClick={() => navigate("/auth")}
        className="px-12 py-4 border border-primary/50 text-primary font-display text-sm tracking-[0.1em]
                   hover:border-primary/80 transition-all duration-700 ease-out opacity-0 bg-transparent"
        style={{ animation: "cinematic-fade 0.8s ease-out 2s forwards" }}
      >
        Join with WU Email
      </button>
      
      {/* Footnote - Positioned at bottom, very discreet */}
      <p 
        className="absolute bottom-8 font-display text-[10px] text-foreground/25 tracking-[0.08em] opacity-0"
        style={{ animation: "cinematic-fade 0.8s ease-out 2.4s forwards" }}
      >
        Access restricted to verified WU Wien students.
      </p>
      
    </div>
  );
};

export default Index;
