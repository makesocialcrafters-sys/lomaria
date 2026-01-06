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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-px w-24 bg-primary/30 overflow-hidden">
          <div className="h-full w-full bg-primary/60" style={{ animation: "cinematic-fade 1.5s ease-out infinite" }} />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 overflow-hidden">
        <h1 
          className="font-display text-2xl md:text-3xl text-primary tracking-[0.12em] mb-4 opacity-0"
          style={{ animation: "cinematic-slide 1.2s ease-out 0.3s forwards" }}
        >
          Link ungültig
        </h1>
        
        <div 
          className="w-12 h-px bg-primary/40 mb-4 opacity-0"
          style={{ animation: "cinematic-fade 1s ease-out 0.6s forwards" }}
        />
        
        <p 
          className="font-display text-sm text-foreground/50 tracking-[0.08em] mb-12 text-center opacity-0"
          style={{ animation: "cinematic-fade 1s ease-out 0.8s forwards" }}
        >
          Der Link ist abgelaufen oder ungültig.<br />
          Bitte fordere einen neuen Link an.
        </p>
        
        <button 
          onClick={() => navigate("/auth")}
          className="px-12 py-4 border border-primary/50 text-primary font-display text-sm tracking-[0.1em]
                     hover:border-primary/80 transition-all duration-700 ease-out bg-transparent opacity-0"
          style={{ animation: "cinematic-fade 0.8s ease-out 1s forwards" }}
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
        Neues Passwort
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
        Gib dein neues Passwort ein
      </p>

      {/* Form */}
      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="w-full max-w-sm space-y-6 opacity-0"
        style={{ animation: "cinematic-fade 0.8s ease-out 1s forwards" }}
      >
        <div className="space-y-1 relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Neues Passwort"
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
          <p className="text-foreground/30 text-xs mt-2 font-display">
            Min. 8 Zeichen, 1 Zahl, 1 Sonderzeichen
          </p>
        </div>

        <div className="space-y-1 relative">
          <Input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Passwort bestätigen"
            className="h-12 bg-transparent border-0 border-b border-primary/30 rounded-none text-foreground placeholder:text-foreground/30 focus:border-primary/60 focus-visible:ring-0 font-display tracking-wide transition-colors duration-500 pr-10"
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/60 transition-colors duration-300"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          {errors.confirmPassword && (
            <p className="text-destructive text-xs mt-1 font-display">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="pt-6 flex justify-center">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-12 py-4 border border-primary/50 text-primary font-display text-sm tracking-[0.1em]
                       hover:border-primary/80 transition-all duration-700 ease-out bg-transparent disabled:opacity-50"
          >
            {isSubmitting ? "..." : "Passwort ändern"}
          </button>
        </div>
      </form>
    </div>
  );
}
