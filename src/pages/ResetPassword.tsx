import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { passwordSchema } from "@/lib/validations";

const resetSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwörter stimmen nicht überein",
  path: ["confirmPassword"],
});

type ResetFormData = z.infer<typeof resetSchema>;

export default function ResetPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session, loading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormData) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        toast({ 
          title: "Fehler beim Zurücksetzen", 
          description: error.message,
          variant: "destructive" 
        });
      } else {
        toast({ title: "Passwort erfolgreich geändert!" });
        navigate("/auth");
      }
    } catch (err) {
      toast({ title: "Ein Fehler ist aufgetreten", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
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

  if (!session) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center px-6 overflow-hidden">
        <h1 className="font-display text-2xl md:text-3xl text-primary tracking-[0.12em] mb-4 animate-cinematic-stagger-1">
          Link ungültig
        </h1>
        
        <div 
          className="w-12 h-px bg-primary/40 mb-4 animate-cinematic-stagger-2"
          role="presentation"
          aria-hidden="true"
        />
        
        <p className="font-display text-sm text-foreground/50 tracking-[0.08em] mb-12 text-center animate-cinematic-stagger-3">
          Der Link ist abgelaufen oder ungültig.<br />
          Bitte fordere einen neuen Link an.
        </p>
        
        <button 
          onClick={() => navigate("/auth")}
          className="px-12 py-4 min-h-[48px] border border-primary/50 text-primary font-display text-sm tracking-[0.1em]
                     hover:border-primary/80 transition-all duration-700 ease-out bg-transparent
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
                     animate-cinematic-stagger-4"
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
        Neues Passwort
      </h1>
      
      {/* Gold Divider */}
      <div 
        className="w-12 h-px bg-primary/40 mb-4 animate-cinematic-stagger-2"
        role="presentation"
        aria-hidden="true"
      />
      
      {/* Subline */}
      <p className="font-display text-sm text-foreground/50 tracking-[0.08em] mb-12 text-center animate-cinematic-stagger-3">
        Gib dein neues Passwort ein
      </p>

      {/* Form */}
      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="w-full max-w-sm space-y-6 animate-cinematic-stagger-4"
      >
        <div className="space-y-1 relative">
          <label htmlFor="new-password" className="sr-only">Neues Passwort</label>
          <Input
            id="new-password"
            type={showPassword ? "text" : "password"}
            placeholder="Neues Passwort"
            autoComplete="new-password"
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
          <p className="text-foreground/30 text-xs mt-2 font-display">
            Min. 8 Zeichen, 1 Zahl, 1 Sonderzeichen
          </p>
        </div>

        <div className="space-y-1 relative">
          <label htmlFor="confirm-password" className="sr-only">Passwort bestätigen</label>
          <Input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Passwort bestätigen"
            autoComplete="new-password"
            className="h-12 bg-transparent border-0 border-b border-primary/30 rounded-none text-foreground placeholder:text-foreground/30 focus:border-primary/60 focus-visible:ring-0 font-display tracking-wide transition-colors duration-500 pr-10"
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            aria-label={showConfirmPassword ? "Passwort verbergen" : "Passwort anzeigen"}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-foreground/30 hover:text-foreground/60 transition-colors duration-300"
          >
            {showConfirmPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
          {errors.confirmPassword && (
            <p className="text-destructive text-xs mt-1 font-display" role="alert">{errors.confirmPassword.message}</p>
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
            {isSubmitting ? "..." : "Passwort ändern"}
          </button>
        </div>
      </form>
    </main>
  );
}