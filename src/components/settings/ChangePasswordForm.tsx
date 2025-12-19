import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { passwordSchema } from "@/lib/validations";

interface ChangePasswordFormProps {
  onCancel: () => void;
}

export function ChangePasswordForm({ onCancel }: ChangePasswordFormProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const passwordResult = passwordSchema.safeParse(newPassword);
    if (!passwordResult.success) {
      newErrors.newPassword = passwordResult.error.errors[0]?.message || "Ungültiges Passwort";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Passwort bestätigen ist erforderlich";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwörter stimmen nicht überein";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Passwort geändert",
        description: "Dein Passwort wurde erfolgreich aktualisiert.",
      });
      setNewPassword("");
      setConfirmPassword("");
      onCancel();
    } catch (error) {
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Passwort konnte nicht geändert werden",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="newPassword">Neues Passwort</Label>
        <Input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={errors.newPassword ? "border-destructive" : ""}
        />
        {errors.newPassword && (
          <p className="text-sm text-destructive">{errors.newPassword}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Neues Passwort wiederholen</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={errors.confirmPassword ? "border-destructive" : ""}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{errors.confirmPassword}</p>
        )}
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Abbrechen
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "Speichern..." : "Passwort ändern"}
        </Button>
      </div>
    </form>
  );
}
