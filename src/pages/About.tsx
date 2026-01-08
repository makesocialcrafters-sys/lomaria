import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <main className="min-h-screen bg-background">
      <Helmet>
        <title>Über Lomaria – Die Vision für die WU Wien</title>
        <meta 
          name="description" 
          content="Warum wir Lomaria gebaut haben: Schluss mit anonymem Campus-Leben. Unsere Mission für mehr Vernetzung, Gründertum und echte Kontakte an der WU." 
        />
      </Helmet>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6">
        <h1 className="font-display text-3xl md:text-4xl text-primary tracking-[0.1em] mb-6 text-center animate-cinematic-stagger-1">
          Der Campus ist voll. Und trotzdem leer.
        </h1>
        
        <div 
          className="w-16 h-px bg-primary/40 mb-6 animate-cinematic-stagger-2" 
          role="presentation" 
          aria-hidden="true" 
        />
        
        <p className="font-display text-base md:text-lg text-foreground/60 tracking-[0.08em] text-center animate-cinematic-stagger-3">
          Warum wir das soziale Betriebssystem für die WU bauen.
        </p>
      </section>

      {/* Section 1: Die Story */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-px bg-primary/40 mx-auto mb-12" role="presentation" aria-hidden="true" />
          
          <p className="font-display text-sm md:text-base text-foreground/50 leading-relaxed">
            Wir kennen das Problem: Du sitzt im LC, umgeben von 20.000 Menschen, und trotzdem ist es schwer, Anschluss zu finden. LinkedIn ist zu steif für ein Feierabendbier. Tinder ist zu random und oft peinlich, wenn man sich am nächsten Tag in der Vorlesung sieht. Wir wollten einen Ort schaffen, der dazwischen liegt.
          </p>
          
          <div className="w-16 h-px bg-primary/40 mx-auto mt-12" role="presentation" aria-hidden="true" />
        </div>
      </section>

      {/* Section 2: Unsere Werte */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-xl md:text-2xl text-primary tracking-[0.1em] text-center mb-8">
            Unsere Werte
          </h2>
          
          <div className="w-16 h-px bg-primary/40 mx-auto mb-16" role="presentation" aria-hidden="true" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Value 1: Exklusivität */}
            <div className="border border-primary/30 p-8 text-center">
              <h3 className="font-display text-sm text-primary tracking-[0.15em] uppercase mb-4">
                Exklusivität
              </h3>
              <p className="font-display text-sm text-foreground/50 leading-relaxed">
                Nur wer eine aktive E-Mail der Wirtschaftsuniversität Wien hat, kommt rein. Wir bleiben unter uns.
              </p>
            </div>
            
            {/* Value 2: Vielseitigkeit */}
            <div className="border border-primary/30 p-8 text-center">
              <h3 className="font-display text-sm text-primary tracking-[0.15em] uppercase mb-4">
                Vielseitigkeit
              </h3>
              <p className="font-display text-sm text-foreground/50 leading-relaxed">
                Das Leben besteht nicht nur aus Karriere. Hier findest du den Co-Founder für dein Startup genauso wie ein Date für den Prater.
              </p>
            </div>
            
            {/* Value 3: Sicherheit */}
            <div className="border border-primary/30 p-8 text-center">
              <h3 className="font-display text-sm text-primary tracking-[0.15em] uppercase mb-4">
                Sicherheit
              </h3>
              <p className="font-display text-sm text-foreground/50 leading-relaxed">
                Keine Fakes. Keine Bots. Eine Community, die auf Respekt basiert.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Team & Kontakt */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-xl md:text-2xl text-primary tracking-[0.1em] mb-6">
            Von Studierenden für Studierende.
          </h2>
          
          <div className="w-16 h-px bg-primary/40 mx-auto mb-8" role="presentation" aria-hidden="true" />
          
          <p className="font-display text-sm text-foreground/50 leading-relaxed mb-10">
            Lomaria ist ein unabhängiges Projekt aus Wien. Wir lieben Feedback.
          </p>
          
          <a
            href="mailto:hello@lomaria.at"
            className="inline-block px-12 py-4 min-h-[48px] border border-primary/50 text-primary font-display text-sm tracking-[0.1em]
                       hover:border-primary/80 transition-all duration-700 ease-out bg-transparent
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Schreib uns
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 flex flex-col items-center gap-4">
        <div className="flex gap-1">
          <Link 
            to="/about" 
            className="px-3 py-2 min-h-[44px] flex items-center font-display text-xs text-foreground/30 tracking-[0.05em] hover:text-primary/60 transition-colors duration-500"
          >
            Über uns
          </Link>
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
        </div>
      </footer>
    </main>
  );
};

export default About;
