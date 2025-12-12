import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { authSchema, type AuthFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import lomariaLogo from "@/assets/lomaria-logo.png";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, loading, signIn, signUp } = useAuth();
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

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate("/onboarding");
    }
  }, [user, loading, navigate]);

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
          // If email confirmation is disabled, user is logged in immediately
          // The onAuthStateChange will pick up the session and redirect
          toast({
            title: "Registrierung erfolgreich",
            description: "Willkommen bei Lomaria!",
          });
          navigate("/onboarding");
        }
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
        <div className="h-0.5 w-32 bg-muted overflow-hidden rounded-full">
          <div className="h-full bg-primary animate-loader" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 animate-page-enter">
      {/* Logo */}
      <div className="mb-12">
        <img 
          src={lomariaLogo} 
          alt="Lomaria" 
          className="h-12 w-auto"
        />
      </div>

      {/* Title */}
      <h1 className="font-display text-2xl font-bold uppercase tracking-[0.2em] text-primary mb-2">
        {isLogin ? "ANMELDEN" : "REGISTRIEREN"}
      </h1>
      <p className="text-muted-foreground text-sm mb-10 text-center">
        Exklusives Netzwerk für WU-Studierende
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm space-y-6">
        <div className="space-y-1">
          <Input
            type="email"
            placeholder="E-Mail"
            className="input-elegant"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-destructive text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Input
            type="password"
            placeholder="Passwort"
            className="input-elegant"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-destructive text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="pt-4 flex justify-center">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="btn-premium"
          >
            {isSubmitting ? "..." : isLogin ? "Anmelden" : "Registrieren"}
          </Button>
        </div>
      </form>

      {/* Toggle */}
      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={toggleMode}
          className="text-muted-foreground text-sm hover:text-foreground transition-colors duration-150"
        >
          {isLogin ? (
            <>Noch kein Konto? <span className="text-primary">Registrieren</span></>
          ) : (
            <>Bereits registriert? <span className="text-primary">Anmelden</span></>
          )}
        </button>
      </div>

      {/* Testing notice */}
      <p className="mt-8 text-muted-foreground/50 text-xs text-center">
        Testmodus: @gmail.com erlaubt
      </p>
    </div>
  );
}
