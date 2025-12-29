import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import lomariaLogo from "@/assets/lomaria-logo.png";
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
  const [isValidSession, setIsValidSession] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  useEffect(() => {
    // Check if user has a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsValidSession(true);
      }
      setLoading(false);
    };
    checkSession();
  }, []);

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
        <div className="h-0.5 w-32 bg-muted overflow-hidden rounded-full">
          <div className="h-full bg-primary animate-loader" />
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 animate-page-enter">
        <div className="mb-12">
          <img src={lomariaLogo} alt="Lomaria" className="h-12 w-auto" />
        </div>
        <h1 className="font-display text-xl font-bold uppercase tracking-[0.2em] text-primary mb-4">
          LINK UNGÜLTIG
        </h1>
        <p className="text-muted-foreground text-sm text-center mb-8">
          Der Link ist abgelaufen oder ungültig.<br />
          Bitte fordere einen neuen Link an.
        </p>
        <Button onClick={() => navigate("/auth")} className="btn-premium">
          Zurück zur Anmeldung
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 animate-page-enter">
      <div className="mb-12">
        <img src={lomariaLogo} alt="Lomaria" className="h-12 w-auto" />
      </div>

      <h1 className="font-display text-2xl font-bold uppercase tracking-[0.2em] text-primary mb-2">
        NEUES PASSWORT
      </h1>
      <p className="text-muted-foreground text-sm mb-10 text-center">
        Gib dein neues Passwort ein
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm space-y-6">
        <div className="space-y-1 relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Neues Passwort"
            className="input-elegant pr-10"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          {errors.password && (
            <p className="text-destructive text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1 relative">
          <Input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Passwort bestätigen"
            className="input-elegant pr-10"
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          {errors.confirmPassword && (
            <p className="text-destructive text-xs mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="pt-4 flex justify-center">
          <Button type="submit" disabled={isSubmitting} className="btn-premium">
            {isSubmitting ? "..." : "Passwort ändern"}
          </Button>
        </div>
      </form>
    </div>
  );
}
