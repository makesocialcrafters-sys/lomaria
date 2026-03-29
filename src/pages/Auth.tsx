import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { authSchema, type AuthFormData } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const emailSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
});

type ForgotPasswordView = "auth" | "forgot";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [view, setView] = useState<ForgotPasswordView>("auth");
  const [showPassword, setShowPassword] = useState(false);
  const { user, loading, authEvent, clearAuthEvent, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const {
    register: registerForgot,
    handleSubmit: handleSubmitForgot,
    formState: { errors: forgotErrors },
  } = useForm<{ email: string }>({
    resolver: zodResolver(emailSchema),
  });

  // Redirect based on auth state
  useEffect(() => {
    if (!loading && user) {
      // If this is a password recovery event, redirect to reset-password
      if (authEvent === "PASSWORD_RECOVERY") {
        clearAuthEvent();
        navigate("/reset-password");
      } else {
        navigate("/discover");
      }
    }
  }, [user, loading, authEvent, navigate, clearAuthEvent]);

  const onSubmit = async (data: AuthFormData) => {
    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await signIn(data.email, data.password);
        if (error) {
          let message = "Anmeldung fehlgeschlagen";
          if (error.message.includes("Invalid login credentials")) {
            message = "Ungültige E-Mail oder Passwort";
          } else if (error.message.includes("Email not confirmed")) {
            message = "Bitte bestätige zuerst deine E-Mail-Adresse";
          }
          toast({ title: message, variant: "destructive" });
        } else {
          toast({ title: "Erfolgreich angemeldet!" });
          navigate("/discover");
        }
      } else {
        const { error } = await signUp(data.email, data.password);
        if (error) {
          let message = "Registrierung fehlgeschlagen";
          if (error.message.includes("already registered")) {
            message = "Diese E-Mail ist bereits registriert";
          }
          toast({ title: message, variant: "destructive" });
        } else {
          toast({
            title: "Bestätigungs-E-Mail gesendet",
            description: "Bitte öffne deine E-Mail und klicke auf den Bestätigungs-Link.",
          });
        }
      }
    } catch (err) {
      toast({ title: "Ein Fehler ist aufgetreten", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onForgotSubmit = async (data: { email: string }) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({ title: "Fehler beim Senden", variant: "destructive" });
      } else {
        toast({
          title: "E-Mail gesendet",
          description: "Falls ein Konto existiert, erhältst du einen Link zum Zurücksetzen.",
        });
        setView("auth");
      }
    } catch (err) {
      toast({ title: "Ein Fehler ist aufgetreten", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    reset();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center" aria-busy="true" aria-label="Laden">
        <div className="h-px w-24 bg-primary/30 overflow-hidden" role="progressbar" aria-label="Lade-Fortschritt">
          <div className="h-full w-full bg-primary/60 animate-fade-in" />
        </div>
      </main>
    );
  }

  // Forgot Password View
  if (view === "forgot") {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Headline */}
        <h1 className="font-display text-2xl md:text-3xl text-primary tracking-[0.12em] mb-4 animate-cinematic-stagger-1">
          Passwort zurücksetzen
        </h1>
        
        {/* Gold Divider */}
        <div 
          className="w-12 h-px bg-primary/40 mb-4 animate-cinematic-stagger-2"
          role="presentation"
          aria-hidden="true"
        />
        
        {/* Subline */}
        <p className="font-display text-sm text-foreground/50 tracking-[0.08em] mb-12 text-center animate-cinematic-stagger-3">
          Gib deine E-Mail ein, um einen Reset-Link zu erhalten
        </p>

        {/* Form */}
        <form 
          onSubmit={handleSubmitForgot(onForgotSubmit)} 
          className="w-full max-w-sm space-y-6 animate-cinematic-stagger-4"
        >
          <div className="space-y-1">
            <label htmlFor="forgot-email" className="sr-only">E-Mail-Adresse</label>
            <Input
              id="forgot-email"
              type="email"
              placeholder="E-Mail"
              autoComplete="email"
              className="h-12 bg-transparent border-0 border-b border-primary/30 rounded-none text-foreground placeholder:text-foreground/30 focus:border-primary/60 focus-visible:ring-0 font-display tracking-wide transition-colors duration-500"
              {...registerForgot("email")}
            />
            {forgotErrors.email && (
              <p className="text-destructive text-xs mt-1 font-display" role="alert">{forgotErrors.email.message}</p>
            )}
          </div>

          <div className="pt-6 flex justify-center">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-12 py-4 min-h-[48px] border border-primary/50 text-primary font-display text-sm tracking-[0.1em]
                         hover:border-primary/80 transition-all duration-700 ease-out bg-transparent disabled:opacity-50
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {isSubmitting ? "..." : "Link senden"}
            </button>
          </div>
        </form>

        {/* Back link */}
        <button
          type="button"
          onClick={() => setView("auth")}
          className="mt-12 px-4 py-2 min-h-[44px] font-display text-xs text-foreground/40 tracking-[0.08em] hover:text-foreground/60 transition-colors duration-500 animate-cinematic-stagger-5"
        >
          Zurück zur Anmeldung
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Headline */}
      <h1 className="font-display text-2xl md:text-3xl text-primary tracking-[0.12em] mb-4 animate-cinematic-stagger-1">
        {isLogin ? "Anmelden" : "Registrieren"}
      </h1>
      
      {/* Gold Divider */}
      <div 
        className="w-12 h-px bg-primary/40 mb-4 animate-cinematic-stagger-2"
        role="presentation"
        aria-hidden="true"
      />
      
      {/* Subline */}
      <p className="font-display text-sm text-foreground/50 tracking-[0.08em] mb-12 text-center animate-cinematic-stagger-3">
        Exklusives Netzwerk für Studierende
      </p>

      {/* Form */}
      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="w-full max-w-sm space-y-6 animate-cinematic-stagger-4"
      >
        <div className="space-y-1">
          <label htmlFor="auth-email" className="sr-only">E-Mail-Adresse</label>
          <Input
            id="auth-email"
            type="email"
            placeholder="E-Mail"
            autoComplete="email"
            className="h-12 bg-transparent border-0 border-b border-primary/30 rounded-none text-foreground placeholder:text-foreground/30 focus:border-primary/60 focus-visible:ring-0 font-display tracking-wide transition-colors duration-500"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-destructive text-xs mt-1 font-display" role="alert">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1 relative">
          <label htmlFor="auth-password" className="sr-only">Passwort</label>
          <Input
            id="auth-password"
            type={showPassword ? "text" : "password"}
            placeholder="Passwort"
            autoComplete={isLogin ? "current-password" : "new-password"}
            className="h-12 bg-transparent border-0 border-b border-primary/30 rounded-none text-foreground placeholder:text-foreground/30 focus:border-primary/60 focus-visible:ring-0 font-display tracking-wide transition-colors duration-500 pr-10"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-foreground/30 hover:text-foreground/60 transition-colors duration-300"
          >
            {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
          {errors.password && (
            <p className="text-destructive text-xs mt-1 font-display" role="alert">{errors.password.message}</p>
          )}
        </div>

        {isLogin && (
          <div className="text-right">
            <button
              type="button"
              onClick={() => setView("forgot")}
              className="px-2 py-2 min-h-[44px] font-display text-xs text-foreground/35 tracking-[0.05em] hover:text-primary/70 transition-colors duration-500"
            >
              Passwort vergessen?
            </button>
          </div>
        )}

        <div className="pt-6 flex justify-center">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-12 py-4 min-h-[48px] border border-primary/50 text-primary font-display text-sm tracking-[0.1em]
                       hover:border-primary/80 transition-all duration-700 ease-out bg-transparent disabled:opacity-50
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {isSubmitting ? "..." : isLogin ? "Anmelden" : "Registrieren"}
          </button>
        </div>
      </form>

      {/* Divider */}
      <div className="w-full max-w-sm flex items-center gap-4 mt-8 animate-cinematic-stagger-5">
        <div className="flex-1 h-px bg-primary/20" />
        <span className="font-display text-xs text-foreground/30 tracking-[0.08em]">oder</span>
        <div className="flex-1 h-px bg-primary/20" />
      </div>

      {/* Google Sign-In */}
      <button
        type="button"
        onClick={async () => {
          const { error } = await signInWithGoogle();
          if (error) {
            toast({ title: "Google-Anmeldung fehlgeschlagen", variant: "destructive" });
          }
        }}
        className="mt-6 w-full max-w-sm flex items-center justify-center gap-3 px-6 py-3 min-h-[48px] border border-primary/30 
                   font-display text-sm text-foreground/70 tracking-[0.06em]
                   hover:border-primary/50 hover:text-foreground/90 transition-all duration-500 bg-transparent
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
                   animate-cinematic-stagger-5"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 0 12c0 1.94.46 3.77 1.28 5.4l3.56-2.77.01-.54z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Mit Google anmelden
      </button>

      {/* Toggle mode link */}
      <button
        type="button"
        onClick={toggleMode}
        className="mt-8 px-4 py-2 min-h-[44px] font-display text-xs text-foreground/40 tracking-[0.08em] hover:text-foreground/60 transition-colors duration-500 animate-cinematic-stagger-5"
      >
        {isLogin ? (
          <>Noch kein Konto? <span className="text-primary/70">Registrieren</span></>
        ) : (
          <>Bereits registriert? <span className="text-primary/70">Anmelden</span></>
        )}
      </button>

      {/* Legal Links */}
      <footer className="absolute bottom-10 flex gap-1 animate-cinematic-stagger-5">
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

      {/* Footnote */}
      <p className="absolute bottom-4 font-display text-[10px] text-foreground/20 tracking-[0.08em] animate-cinematic-stagger-5">
        Verwende deine E-Mail-Adresse
      </p>
    </main>
  );
}