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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-px w-24 bg-primary/30 overflow-hidden">
          <div className="h-full w-full bg-primary/60" style={{ animation: "cinematic-fade 1.5s ease-out infinite" }} />
        </div>
      </div>
    );
  }

  // Forgot Password View
  if (view === "forgot") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Headline */}
        <h1 
          className="font-display text-2xl md:text-3xl text-primary tracking-[0.12em] mb-4 opacity-0"
          style={{ animation: "cinematic-slide 1.2s ease-out 0.3s forwards" }}
        >
          Passwort zurücksetzen
        </h1>
        
        {/* Gold Divider */}
        <div 
          className="w-12 h-px bg-primary/40 mb-4 opacity-0"
          style={{ animation: "cinematic-fade 1s ease-out 0.6s forwards" }}
        />
        
        {/* Subline */}
        <p 
          className="font-display text-sm text-foreground/50 tracking-[0.08em] mb-12 text-center opacity-0"
          style={{ animation: "cinematic-fade 1s ease-out 0.8s forwards" }}
        >
          Gib deine E-Mail ein, um einen Reset-Link zu erhalten
        </p>

        {/* Form */}
        <form 
          onSubmit={handleSubmitForgot(onForgotSubmit)} 
          className="w-full max-w-sm space-y-6 opacity-0"
          style={{ animation: "cinematic-fade 0.8s ease-out 1s forwards" }}
        >
          <div className="space-y-1">
            <Input
              type="email"
              placeholder="E-Mail"
              className="h-12 bg-transparent border-0 border-b border-primary/30 rounded-none text-foreground placeholder:text-foreground/30 focus:border-primary/60 focus-visible:ring-0 font-display tracking-wide transition-colors duration-500"
              {...registerForgot("email")}
            />
            {forgotErrors.email && (
              <p className="text-destructive text-xs mt-1 font-display">{forgotErrors.email.message}</p>
            )}
          </div>

          <div className="pt-6 flex justify-center">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-12 py-4 border border-primary/50 text-primary font-display text-sm tracking-[0.1em]
                         hover:border-primary/80 transition-all duration-700 ease-out bg-transparent disabled:opacity-50"
            >
              {isSubmitting ? "..." : "Link senden"}
            </button>
          </div>
        </form>

        {/* Back link */}
        <button
          type="button"
          onClick={() => setView("auth")}
          className="mt-12 font-display text-xs text-foreground/40 tracking-[0.08em] hover:text-foreground/60 transition-colors duration-500 opacity-0"
          style={{ animation: "cinematic-fade 0.8s ease-out 1.3s forwards" }}
        >
          Zurück zur Anmeldung
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Headline */}
      <h1 
        className="font-display text-2xl md:text-3xl text-primary tracking-[0.12em] mb-4 opacity-0"
        style={{ animation: "cinematic-slide 1.2s ease-out 0.3s forwards" }}
      >
        {isLogin ? "Anmelden" : "Registrieren"}
      </h1>
      
      {/* Gold Divider */}
      <div 
        className="w-12 h-px bg-primary/40 mb-4 opacity-0"
        style={{ animation: "cinematic-fade 1s ease-out 0.6s forwards" }}
      />
      
      {/* Subline */}
      <p 
        className="font-display text-sm text-foreground/50 tracking-[0.08em] mb-12 text-center opacity-0"
        style={{ animation: "cinematic-fade 1s ease-out 0.8s forwards" }}
      >
        Exklusives Netzwerk für WU-Studierende
      </p>

      {/* Form */}
      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="w-full max-w-sm space-y-6 opacity-0"
        style={{ animation: "cinematic-fade 0.8s ease-out 1s forwards" }}
      >
        <div className="space-y-1">
          <Input
            type="email"
            placeholder="E-Mail"
            className="h-12 bg-transparent border-0 border-b border-primary/30 rounded-none text-foreground placeholder:text-foreground/30 focus:border-primary/60 focus-visible:ring-0 font-display tracking-wide transition-colors duration-500"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-destructive text-xs mt-1 font-display">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1 relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Passwort"
            className="h-12 bg-transparent border-0 border-b border-primary/30 rounded-none text-foreground placeholder:text-foreground/30 focus:border-primary/60 focus-visible:ring-0 font-display tracking-wide transition-colors duration-500 pr-10"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/60 transition-colors duration-300"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          {errors.password && (
            <p className="text-destructive text-xs mt-1 font-display">{errors.password.message}</p>
          )}
        </div>

        {isLogin && (
          <div className="text-right">
            <button
              type="button"
              onClick={() => setView("forgot")}
              className="font-display text-xs text-foreground/35 tracking-[0.05em] hover:text-primary/70 transition-colors duration-500"
            >
              Passwort vergessen?
            </button>
          </div>
        )}

        <div className="pt-6 flex justify-center">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-12 py-4 border border-primary/50 text-primary font-display text-sm tracking-[0.1em]
                       hover:border-primary/80 transition-all duration-700 ease-out bg-transparent disabled:opacity-50"
          >
            {isSubmitting ? "..." : isLogin ? "Anmelden" : "Registrieren"}
          </button>
        </div>
      </form>

      {/* Toggle mode link */}
      <button
        type="button"
        onClick={toggleMode}
        className="mt-12 font-display text-xs text-foreground/40 tracking-[0.08em] hover:text-foreground/60 transition-colors duration-500 opacity-0"
        style={{ animation: "cinematic-fade 0.8s ease-out 1.3s forwards" }}
      >
        {isLogin ? (
          <>Noch kein Konto? <span className="text-primary/70">Registrieren</span></>
        ) : (
          <>Bereits registriert? <span className="text-primary/70">Anmelden</span></>
        )}
      </button>

      {/* Legal Links */}
      <div 
        className="absolute bottom-14 flex gap-4 font-display text-[10px] text-foreground/30 tracking-[0.05em] opacity-0"
        style={{ animation: "cinematic-fade 0.8s ease-out 1.6s forwards" }}
      >
        <Link to="/legal?section=impressum" className="hover:text-primary/60 transition-colors duration-500">
          Impressum
        </Link>
        <Link to="/legal?section=agb" className="hover:text-primary/60 transition-colors duration-500">
          AGB
        </Link>
        <Link to="/legal?section=datenschutz" className="hover:text-primary/60 transition-colors duration-500">
          Datenschutz
        </Link>
      </div>

      {/* Footnote */}
      <p 
        className="absolute bottom-8 font-display text-[10px] text-foreground/20 tracking-[0.08em] opacity-0"
        style={{ animation: "cinematic-fade 0.8s ease-out 1.8s forwards" }}
      >
        Testmodus: @gmail.com erlaubt
      </p>
    </div>
  );
}
