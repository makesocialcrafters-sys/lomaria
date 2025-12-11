import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/ui/page-transition";
import lomariaLogo from "@/assets/lomaria-logo.png";

const Index = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col px-6 pt-8">
        {/* Logo - Top Left */}
        <img 
          src={lomariaLogo}
          alt="Lomaria Logo"
          className="w-28 opacity-0 animate-fade-in"
          style={{ animationDelay: "0s", animationFillMode: "forwards" }}
        />
        
        {/* Main Content - Centered */}
        <div className="flex-1 flex flex-col items-center justify-center text-center w-full max-w-md mx-auto">

          {/* Headline - Film Title Card */}
          <h1 
            className="headline-cinematic text-primary text-3xl mb-2 opacity-0 animate-slide-up"
            style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
          >
            LOMARIA
          </h1>

          {/* Subheadline */}
          <p 
            className="font-display text-sm text-foreground/80 tracking-[0.15em] mb-10 opacity-0 animate-fade-in"
            style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
          >
            EXCLUSIVE WU VIENNA NETWORK
          </p>

          {/* Description */}
          <p 
            className="font-display text-sm text-foreground/70 max-w-[75%] mb-8 leading-relaxed opacity-0 animate-fade-in"
            style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}
          >
            Finde Studierende für Projekte, Networking oder Nachhilfe.
          </p>

          {/* CTA Button */}
          <div 
            className="w-full opacity-0 animate-fade-in"
            style={{ animationDelay: "0.8s", animationFillMode: "forwards" }}
          >
            <Button 
              onClick={handleLogin}
              width="symmetric"
              className="h-[50px] text-base font-display"
            >
              Mit WU-Mail anmelden
            </Button>
          </div>
        </div>

        {/* Footer Microcopy */}
        <p 
          className="absolute bottom-8 font-display text-[11px] text-foreground/40 opacity-0 animate-fade-in"
          style={{ animationDelay: "1s", animationFillMode: "forwards" }}
        >
          Nur für Studierende der WU Wien.
        </p>
      </div>
    </PageTransition>
  );
};

export default Index;
