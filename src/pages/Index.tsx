import { Helmet } from "react-helmet-async";
import { useNavigate, Link } from "react-router-dom";
import { Heart, Rocket, BookOpen, ChevronDown } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import PublicHeader from "@/components/layout/PublicHeader";
const Index = () => {
  const navigate = useNavigate();
  const scrollToContent = () => {
    document.getElementById("content")?.scrollIntoView({
      behavior: "smooth"
    });
  };
  return <main className="min-h-screen bg-background">
      <PublicHeader />
      <Helmet>
        <title>Lomaria – Das Netzwerk für Studierende</title>
        <meta name="description" content="Vernetze dich am Campus. Finde Co-Founder, Lerngruppen oder Dates – exklusiv für Studierende." />
        <meta name="keywords" content="Studenten, Networking, Co-Founder finden, Lerngruppe, Studierende, Universität" />
      </Helmet>
      
      {/* Visually hidden h1 for screen readers */}
      <h1 className="sr-only">Lomaria – Networking-Plattform für Studierende</h1>
      
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 relative">
        {/* Main Headline */}
        <h2 className="font-display text-4xl md:text-5xl text-primary tracking-[0.12em] mb-6 animate-cinematic-stagger-1">
          Lomaria
        </h2>
        
        {/* Gold Divider */}
        <div className="w-16 h-px bg-primary/40 mb-6 animate-cinematic-stagger-2" role="presentation" aria-hidden="true" />
        
        {/* Subline */}
        <p className="font-display text-base md:text-lg text-foreground/60 tracking-[0.08em] mb-3 animate-cinematic-stagger-3 text-center">
          Das exklusive Netzwerk für Studierende.
        </p>
        
        {/* Secondary line */}
        <p className="font-display text-xs text-foreground/35 tracking-[0.15em] uppercase mb-16 animate-cinematic-stagger-4">
          Vernetzen · Gründen · Lernen
        </p>
        
        {/* CTA Button */}
        <button onClick={() => navigate("/auth")} className="px-12 py-4 min-h-[48px] border border-primary/50 text-primary font-display text-sm tracking-[0.1em]
                     hover:border-primary/80 transition-all duration-700 ease-out bg-transparent
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
                     animate-cinematic-stagger-5">
          Anmelden
        </button>
        
        {/* Disclaimer */}
        <p className="font-display text-[10px] text-foreground/25 tracking-[0.08em] mt-6 animate-cinematic-stagger-5">
          {"\n"}
        </p>
        
        {/* Scroll Indicator */}
        <button onClick={scrollToContent} className="absolute bottom-8 text-primary/40 hover:text-primary/60 transition-colors duration-500 animate-cinematic-stagger-5" aria-label="Mehr erfahren">
          <ChevronDown className="w-6 h-6 animate-bounce" />
        </button>
      </section>

      {/* Section 1: Die 3 Säulen */}
      <section id="content" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="font-display text-xl md:text-2xl text-primary tracking-[0.1em] text-center mb-8">
            Mehr als nur Networking.
          </h3>
          
          <div className="w-16 h-px bg-primary/40 mx-auto mb-16" role="presentation" aria-hidden="true" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {/* Pillar 1: Campus Dating */}
            <div className="flex flex-col items-center text-center">
              <Heart className="w-8 h-8 text-primary mb-6" />
              <h4 className="font-display text-sm text-primary tracking-[0.15em] uppercase mb-4">
                Campus Dating
              </h4>
              <p className="font-display text-sm text-foreground/50 leading-relaxed">Keine Randoms. Keine Bots. Triff Studierende, die deinen Lifestyle verstehen. Vom Feiermodus bis zum Lern-Date in der Bib.</p>
            </div>
            
            {/* Pillar 2: Co-Founding & Business */}
            <div className="flex flex-col items-center text-center">
              <Rocket className="w-8 h-8 text-primary mb-6" />
              <h4 className="font-display text-sm text-primary tracking-[0.15em] uppercase mb-4">
                Co-Founding & Business
              </h4>
              <p className="font-display text-sm text-foreground/50 leading-relaxed">
                Du suchst einen Co-Founder oder Partner für ein Projekt? Finde Macher aus allen Universitäten.
              </p>
            </div>
            
            {/* Pillar 3: Study & Support */}
            <div className="flex flex-col items-center text-center">
              <BookOpen className="w-8 h-8 text-primary mb-6" />
              <h4 className="font-display text-sm text-primary tracking-[0.15em] uppercase mb-4">
                Study & Support
              </h4>
              <p className="font-display text-sm text-foreground/50 leading-relaxed">
                Finde deine Lerngruppe für die nächste Prüfungswoche. Egal ob STEOP oder Master-Thesis – quer über alle Unis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Vertrauen */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-px bg-primary/40 mx-auto mb-12" role="presentation" aria-hidden="true" />
          
          <h3 className="font-display text-xl md:text-2xl text-primary tracking-[0.1em] mb-6">
            100% Verified. 100% Student.
          </h3>
          
          <p className="font-display text-sm text-foreground/50 leading-relaxed">
            Zugang nur mit verifizierter E-Mail-Adresse. Wir halten die Community sicher, exklusiv und frei von Fakes.
          </p>
          
          <div className="w-16 h-px bg-primary/40 mx-auto mt-12" role="presentation" aria-hidden="true" />
        </div>
      </section>

      {/* Section 3: FAQ */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <h3 className="font-display text-xl md:text-2xl text-primary tracking-[0.1em] text-center mb-8">
            Häufige Fragen
          </h3>
          
          <div className="w-16 h-px bg-primary/40 mx-auto mb-12" role="presentation" aria-hidden="true" />
          
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="what" className="border-b border-primary/20">
              <AccordionTrigger className="font-display text-sm text-foreground/80 tracking-[0.05em] hover:text-primary transition-colors duration-500 py-6">
                Was ist Lomaria genau?
              </AccordionTrigger>
              <AccordionContent className="text-foreground/50 text-sm leading-relaxed">
                Lomaria ist eine Plattform, die Studierende vernetzt – ob für gemeinsame Projekte, Lerngruppen, Co-Founder-Suche oder einfach neue Freundschaften. Nur verifizierte Studierende haben Zugang.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="verification" className="border-b border-primary/20">
              <AccordionTrigger className="font-display text-sm text-foreground/80 tracking-[0.05em] hover:text-primary transition-colors duration-500 py-6">
                Wie funktioniert die Verifizierung?
              </AccordionTrigger>
              <AccordionContent className="text-foreground/50 text-sm leading-relaxed">
                Ganz einfach per E-Mail registrieren und verifizieren. So stellen wir sicher, dass nur echte Studierende auf der Plattform sind.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="unis" className="border-b border-primary/20">
              <AccordionTrigger className="font-display text-sm text-foreground/80 tracking-[0.05em] hover:text-primary transition-colors duration-500 py-6">
                Welche Unis werden unterstützt?
              </AccordionTrigger>
              <AccordionContent className="text-foreground/50 text-sm leading-relaxed">
                Alle Universitäten und Hochschulen sind willkommen – egal ob Uni Wien, TU, WU, BOKU, FHs oder andere Hochschulen im deutschsprachigen Raum.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="difference" className="border-b border-primary/20">
              <AccordionTrigger className="font-display text-sm text-foreground/80 tracking-[0.05em] hover:text-primary transition-colors duration-500 py-6">
                Was unterscheidet Lomaria von LinkedIn oder Instagram?
              </AccordionTrigger>
              <AccordionContent className="text-foreground/50 text-sm leading-relaxed">
                Lomaria ist exklusiv für Studierende und fokussiert sich auf echte Verbindungen statt Follower-Zahlen. Hier geht es darum, die richtigen Leute für dein nächstes Projekt, deine Lerngruppe oder dein Startup zu finden.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="privacy" className="border-b border-primary/20">
              <AccordionTrigger className="font-display text-sm text-foreground/80 tracking-[0.05em] hover:text-primary transition-colors duration-500 py-6">
                Findet man mich auf Google?
              </AccordionTrigger>
              <AccordionContent className="text-foreground/50 text-sm leading-relaxed">
                Nein. Dein Profil ist privat und nur für eingeloggte, verifizierte Studierende sichtbar. Nichts davon erscheint in Suchmaschinen.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="matching" className="border-b border-primary/20">
              <AccordionTrigger className="font-display text-sm text-foreground/80 tracking-[0.05em] hover:text-primary transition-colors duration-500 py-6">
                Wie finde ich die richtigen Leute?
              </AccordionTrigger>
              <AccordionContent className="text-foreground/50 text-sm leading-relaxed">
                Über Filter wie Studienrichtung, Interessen und Absichten (z.B. Lerngruppe, Startup, Nachhilfe). So siehst du nur Profile, die wirklich zu dir passen.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="data" className="border-b border-primary/20">
              <AccordionTrigger className="font-display text-sm text-foreground/80 tracking-[0.05em] hover:text-primary transition-colors duration-500 py-6">
                Was passiert mit meinen Daten?
              </AccordionTrigger>
              <AccordionContent className="text-foreground/50 text-sm leading-relaxed">
                Deine Daten werden ausschließlich für die Plattform verwendet und niemals an Dritte weitergegeben. Du kannst dein Konto jederzeit vollständig löschen.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Section 4: Bottom CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-display text-lg text-foreground/60 tracking-[0.08em] mb-10">
            Bereit für echtes Networking?
          </p>
          
          <button onClick={() => navigate("/auth")} className="px-12 py-4 min-h-[48px] border border-primary/50 text-primary font-display text-sm tracking-[0.1em]
                       hover:border-primary/80 transition-all duration-700 ease-out bg-transparent
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            Anmelden
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 flex flex-col items-center gap-4">
        <div className="flex gap-1">
          <Link to="/legal?section=impressum" className="px-3 py-2 min-h-[44px] flex items-center font-display text-xs text-foreground/30 tracking-[0.05em] hover:text-primary/60 transition-colors duration-500">
            Impressum
          </Link>
          <Link to="/legal?section=agb" className="px-3 py-2 min-h-[44px] flex items-center font-display text-xs text-foreground/30 tracking-[0.05em] hover:text-primary/60 transition-colors duration-500">
            AGB
          </Link>
          <Link to="/legal?section=datenschutz" className="px-3 py-2 min-h-[44px] flex items-center font-display text-xs text-foreground/30 tracking-[0.05em] hover:text-primary/60 transition-colors duration-500">
            Datenschutz
          </Link>
        </div>
      </footer>
    </main>;
};
export default Index;