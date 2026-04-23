import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.1.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Lomaria Brand Colors
const BRAND_COLORS = {
  background: "#0c0c0c",
  cardBg: "#1a1a1a",
  gold: "#D4AF37",
  goldLight: "#E8C547",
  text: "#ffffff",
  textMuted: "#a0a0a0",
  border: "#2a2a2a",
};

const APP_URL = "https://lomaria.at";

const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lomaria</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND_COLORS.background}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 520px; width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: ${BRAND_COLORS.gold}; letter-spacing: 2px;">LOMARIA</h1>
            </td>
          </tr>
          <tr>
            <td style="background-color: ${BRAND_COLORS.cardBg}; border-radius: 16px; padding: 40px; border: 1px solid ${BRAND_COLORS.border};">
              ${content}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 32px;">
              <p style="margin: 0; font-size: 12px; color: ${BRAND_COLORS.textMuted};">
                © ${new Date().getFullYear()} Lomaria. Alle Rechte vorbehalten.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

function buildEmail(variant: "24h" | "3d") {
  const isThreeDay = variant === "3d";
  const headline = isThreeDay
    ? "Letzte Erinnerung — vervollständige dein Profil"
    : "Dein Lomaria-Profil wartet auf dich";
  const intro = isThreeDay
    ? "Du hast dich vor ein paar Tagen bei Lomaria registriert, aber dein Profil ist noch nicht vollständig. Ohne abgeschlossenes Onboarding bist du für andere unsichtbar — das wäre schade!"
    : "Du hast dich gestern bei Lomaria registriert, aber dein Profil ist noch nicht vollständig. Erst nach dem kurzen Onboarding kannst du andere Studierende entdecken und selbst gefunden werden.";

  return {
    subject: "Dein Lomaria-Profil wartet auf dich 👋",
    html: emailWrapper(`
      <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 600; color: ${BRAND_COLORS.text};">
        ${headline}
      </h2>
      <p style="margin: 0 0 24px 0; font-size: 15px; color: ${BRAND_COLORS.text}; line-height: 1.6;">
        ${intro}
      </p>
      <div style="background-color: ${BRAND_COLORS.background}; border-radius: 12px; padding: 20px; margin-bottom: 28px; border-left: 3px solid ${BRAND_COLORS.gold};">
        <p style="margin: 0; font-size: 14px; color: ${BRAND_COLORS.textMuted}; line-height: 1.6;">
          Es dauert nur <strong style="color: ${BRAND_COLORS.gold};">2 Minuten</strong>: Vorname, Studium, deine Ziele und Interessen — fertig.
        </p>
      </div>
      <div style="text-align: center;">
        <a href="${APP_URL}/onboarding" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_COLORS.gold}, ${BRAND_COLORS.goldLight}); color: ${BRAND_COLORS.background}; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
          Profil vervollständigen
        </a>
      </div>
      <p style="margin: 28px 0 0 0; font-size: 12px; color: ${BRAND_COLORS.textMuted}; text-align: center; line-height: 1.5;">
        Falls du Lomaria nicht mehr nutzen möchtest, kannst du diese E-Mail einfach ignorieren.
      </p>
    `),
  };
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200 });
  }

  // Validate Authorization header against SERVICE ROLE KEY (cron-only endpoint)
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || authHeader !== `Bearer ${serviceRoleKey}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, serviceRoleKey);

  const now = Date.now();
  const HOUR = 60 * 60 * 1000;

  // Window: created_at between (now - 25h) and (now - 24h) → 24h reminder
  // Window: created_at between (now - 73h) and (now - 72h) → 3d reminder
  const window24Start = new Date(now - 25 * HOUR).toISOString();
  const window24End = new Date(now - 24 * HOUR).toISOString();
  const window3dStart = new Date(now - 73 * HOUR).toISOString();
  const window3dEnd = new Date(now - 72 * HOUR).toISOString();

  type Candidate = {
    id: string;
    email: string;
    auth_user_id: string;
    first_name: string | null;
    created_at: string | null;
    reminder_24h_sent_at: string | null;
    reminder_3d_sent_at: string | null;
  };

  const result = { sent_24h: 0, sent_3d: 0, errors: [] as string[] };

  try {
    // 24h candidates
    const { data: cands24h, error: err24 } = await supabase
      .from("users")
      .select("id, email, auth_user_id, first_name, created_at, reminder_24h_sent_at, reminder_3d_sent_at")
      .gte("created_at", window24Start)
      .lte("created_at", window24End)
      .is("reminder_24h_sent_at", null)
      .or("first_name.is.null,first_name.eq.")
      .eq("email_notifications_enabled", true)
      .returns<Candidate[]>();

    if (err24) throw err24;

    for (const u of cands24h ?? []) {
      try {
        const { subject, html } = buildEmail("24h");
        await resend.emails.send({
          from: "Lomaria <hi@hi.lomaria.at>",
          to: [u.email],
          subject,
          html,
        });
        await supabase
          .from("users")
          .update({ reminder_24h_sent_at: new Date().toISOString() })
          .eq("id", u.id);
        result.sent_24h++;
      } catch (e) {
        result.errors.push(`24h ${u.email}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    // 3d candidates
    const { data: cands3d, error: err3 } = await supabase
      .from("users")
      .select("id, email, auth_user_id, first_name, created_at, reminder_24h_sent_at, reminder_3d_sent_at")
      .gte("created_at", window3dStart)
      .lte("created_at", window3dEnd)
      .is("reminder_3d_sent_at", null)
      .or("first_name.is.null,first_name.eq.")
      .eq("email_notifications_enabled", true)
      .returns<Candidate[]>();

    if (err3) throw err3;

    for (const u of cands3d ?? []) {
      try {
        const { subject, html } = buildEmail("3d");
        await resend.emails.send({
          from: "Lomaria <hi@hi.lomaria.at>",
          to: [u.email],
          subject,
          html,
        });
        await supabase
          .from("users")
          .update({ reminder_3d_sent_at: new Date().toISOString() })
          .eq("id", u.id);
        result.sent_3d++;
      } catch (e) {
        result.errors.push(`3d ${u.email}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    console.log("Onboarding reminders run:", JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("send-onboarding-reminders error:", msg);
    return new Response(JSON.stringify({ error: msg, partial: result }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
