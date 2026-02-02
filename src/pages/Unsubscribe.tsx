import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type UnsubscribeState = "loading" | "success" | "error" | "no-email";

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<UnsubscribeState>("loading");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!email) {
      setState("no-email");
      return;
    }

    const unsubscribe = async () => {
      try {
        const response = await fetch(
          `https://otzcvsbmswxcxpnqafpc.supabase.co/functions/v1/unsubscribe-email?email=${encodeURIComponent(email)}`,
          { method: "GET" }
        );

        if (!response.ok) {
          throw new Error("Unsubscribe failed");
        }

        const data = await response.json();
        if (data.success) {
          setState("success");
        } else {
          setState("error");
        }
      } catch (error) {
        console.error("Error unsubscribing:", error);
        setState("error");
      }
    };

    unsubscribe();
  }, [email]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <h1 className="font-display text-2xl font-bold tracking-[0.2em] text-primary mb-12">
          LOMARIA
        </h1>

        {/* Loading State */}
        {state === "loading" && (
          <div className="space-y-6">
            <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
            <p className="text-muted-foreground">Wird verarbeitet...</p>
          </div>
        )}

        {/* Success State */}
        {state === "success" && (
          <div className="space-y-6 animate-cinematic-enter">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-3">
              <h2 className="heading-page">Abgemeldet</h2>
              <p className="text-muted-foreground leading-relaxed">
                Du erhältst keine E-Mails mehr von Lomaria.
              </p>
            </div>
            <div className="pt-6 space-y-3">
              <p className="text-sm text-muted-foreground">
                Du kannst E-Mail-Benachrichtigungen jederzeit in deinen Einstellungen wieder aktivieren.
              </p>
              <Button asChild variant="outline" className="w-full max-w-xs">
                <Link to="/auth">Zur App</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Error State */}
        {state === "error" && (
          <div className="space-y-6 animate-cinematic-enter">
            <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <div className="space-y-3">
              <h2 className="heading-page">Fehler</h2>
              <p className="text-muted-foreground leading-relaxed">
                Die Abmeldung konnte nicht verarbeitet werden. Bitte versuche es später erneut.
              </p>
            </div>
            <div className="pt-6">
              <Button asChild variant="outline" className="w-full max-w-xs">
                <Link to="/">Zur Startseite</Link>
              </Button>
            </div>
          </div>
        )}

        {/* No Email State */}
        {state === "no-email" && (
          <div className="space-y-6 animate-cinematic-enter">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
              <Mail className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              <h2 className="heading-page">Ungültiger Link</h2>
              <p className="text-muted-foreground leading-relaxed">
                Der Abmelde-Link ist ungültig. Bitte verwende den Link aus der E-Mail.
              </p>
            </div>
            <div className="pt-6">
              <Button asChild variant="outline" className="w-full max-w-xs">
                <Link to="/">Zur Startseite</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
