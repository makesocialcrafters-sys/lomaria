import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.1.0";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

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

// Base email template wrapper
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
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: ${BRAND_COLORS.gold}; letter-spacing: 2px;">LOMARIA</h1>
            </td>
          </tr>
          <!-- Content Card -->
          <tr>
            <td style="background-color: ${BRAND_COLORS.cardBg}; border-radius: 16px; padding: 40px; border: 1px solid ${BRAND_COLORS.border};">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px;">
              <p style="margin: 0; font-size: 12px; color: ${BRAND_COLORS.textMuted};">
                © ${new Date().getFullYear()} Lomaria. Alle Rechte vorbehalten.
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: ${BRAND_COLORS.textMuted};">
                Exklusiv für Studierende der Wirtschaftsuniversität Wien
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

// HTML escape to prevent XSS in email templates
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Sanitize all string values in template data
function sanitizeData(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      sanitized[key] = escapeHtml(value.substring(0, 2000));
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// Email templates
const templates = {
  contact_request: (data: { recipientName: string; senderName: string; senderProgram?: string; message: string; appUrl: string }) => ({
    subject: `${data.senderName} möchte sich mit dir vernetzen`,
    html: emailWrapper(`
      <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 600; color: ${BRAND_COLORS.text};">
        Neue Kontaktanfrage
      </h2>
      <p style="margin: 0 0 24px 0; font-size: 16px; color: ${BRAND_COLORS.textMuted}; line-height: 1.6;">
        Hallo ${data.recipientName},
      </p>
      <div style="background-color: ${BRAND_COLORS.background}; border-radius: 12px; padding: 20px; margin-bottom: 24px; border-left: 3px solid ${BRAND_COLORS.gold};">
        <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: ${BRAND_COLORS.gold};">
          ${data.senderName}
        </p>
        ${data.senderProgram ? `<p style="margin: 0 0 12px 0; font-size: 14px; color: ${BRAND_COLORS.textMuted};">${data.senderProgram}</p>` : ''}
        <p style="margin: 0; font-size: 15px; color: ${BRAND_COLORS.text}; font-style: italic; line-height: 1.5;">
          "${data.message}"
        </p>
      </div>
      <a href="${data.appUrl}/contacts" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_COLORS.gold}, ${BRAND_COLORS.goldLight}); color: ${BRAND_COLORS.background}; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
        Anfrage ansehen
      </a>
    `),
  }),

  request_accepted: (data: { recipientName: string; accepterName: string; accepterProgram?: string; chatUrl: string; appUrl: string }) => ({
    subject: `${data.accepterName} hat deine Anfrage angenommen! 🎉`,
    html: emailWrapper(`
      <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 600; color: ${BRAND_COLORS.text};">
        Gute Nachrichten!
      </h2>
      <p style="margin: 0 0 24px 0; font-size: 16px; color: ${BRAND_COLORS.textMuted}; line-height: 1.6;">
        Hallo ${data.recipientName},
      </p>
      <div style="background-color: ${BRAND_COLORS.background}; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
        <div style="width: 64px; height: 64px; background: linear-gradient(135deg, ${BRAND_COLORS.gold}, ${BRAND_COLORS.goldLight}); border-radius: 50%; margin: 0 auto 16px auto; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 28px;">✓</span>
        </div>
        <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: ${BRAND_COLORS.gold};">
          ${data.accepterName}
        </p>
        ${data.accepterProgram ? `<p style="margin: 0; font-size: 14px; color: ${BRAND_COLORS.textMuted};">${data.accepterProgram}</p>` : ''}
      </div>
      <p style="margin: 0 0 24px 0; font-size: 15px; color: ${BRAND_COLORS.text}; line-height: 1.6; text-align: center;">
        hat deine Kontaktanfrage angenommen.<br>Ihr könnt jetzt miteinander chatten!
      </p>
      <div style="text-align: center;">
        <a href="${data.chatUrl}" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_COLORS.gold}, ${BRAND_COLORS.goldLight}); color: ${BRAND_COLORS.background}; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
          Chat öffnen
        </a>
      </div>
    `),
  }),

  new_message: (data: { recipientName: string; senderName: string; messagePreview: string; chatUrl: string; appUrl: string }) => ({
    subject: `Neue Nachricht von ${data.senderName}`,
    html: emailWrapper(`
      <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 600; color: ${BRAND_COLORS.text};">
        Neue Nachricht
      </h2>
      <p style="margin: 0 0 24px 0; font-size: 16px; color: ${BRAND_COLORS.textMuted}; line-height: 1.6;">
        Hallo ${data.recipientName},
      </p>
      <div style="background-color: ${BRAND_COLORS.background}; border-radius: 12px; padding: 20px; margin-bottom: 24px; border-left: 3px solid ${BRAND_COLORS.gold};">
        <p style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: ${BRAND_COLORS.gold};">
          ${data.senderName}
        </p>
        <p style="margin: 0; font-size: 15px; color: ${BRAND_COLORS.text}; line-height: 1.5;">
          "${data.messagePreview}"
        </p>
      </div>
      <a href="${data.chatUrl}" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_COLORS.gold}, ${BRAND_COLORS.goldLight}); color: ${BRAND_COLORS.background}; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
        Antworten
      </a>
    `),
  }),

  account_verified: (data: { userName: string; appUrl: string }) => ({
    subject: "Willkommen bei Lomaria! 🎓",
    html: emailWrapper(`
      <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 600; color: ${BRAND_COLORS.text};">
        Herzlich Willkommen!
      </h2>
      <p style="margin: 0 0 24px 0; font-size: 16px; color: ${BRAND_COLORS.textMuted}; line-height: 1.6;">
        Hallo${data.userName ? ` ${data.userName}` : ''},
      </p>
      <p style="margin: 0 0 24px 0; font-size: 15px; color: ${BRAND_COLORS.text}; line-height: 1.6;">
        Dein Account wurde erfolgreich verifiziert! Du bist jetzt Teil der exklusiven Lomaria-Community für WU-Studierende.
      </p>
      <div style="background-color: ${BRAND_COLORS.background}; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <p style="margin: 0 0 16px 0; font-size: 14px; color: ${BRAND_COLORS.gold}; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
          Deine nächsten Schritte
        </p>
        <ul style="margin: 0; padding: 0 0 0 20px; color: ${BRAND_COLORS.text}; font-size: 14px; line-height: 1.8;">
          <li>Vervollständige dein Profil</li>
          <li>Entdecke andere WU-Studierende</li>
          <li>Vernetze dich mit Kommilitonen</li>
        </ul>
      </div>
      <a href="${data.appUrl}" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_COLORS.gold}, ${BRAND_COLORS.goldLight}); color: ${BRAND_COLORS.background}; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
        Jetzt loslegen
      </a>
    `),
  }),

  onboarding_reminder: (data: { appUrl: string; variant?: string }) => {
    const isThreeDay = data.variant === "3d";
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
          <a href="${data.appUrl}/onboarding" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_COLORS.gold}, ${BRAND_COLORS.goldLight}); color: ${BRAND_COLORS.background}; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
            Profil vervollständigen
          </a>
        </div>
        <p style="margin: 28px 0 0 0; font-size: 12px; color: ${BRAND_COLORS.textMuted}; text-align: center; line-height: 1.5;">
          Falls du Lomaria nicht mehr nutzen möchtest, kannst du diese E-Mail einfach ignorieren.
        </p>
      `),
    };
  },
};

type EmailType = keyof typeof templates;

interface EmailRequest {
  type: EmailType;
  to: string;
  data: Record<string, unknown>;
}

// Rate limiting helper
async function checkRateLimit(userId: string, action: string): Promise<boolean> {
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();

  // Try to get existing record
  const { data: existing } = await supabase
    .from("rate_limits")
    .select("request_count, window_start")
    .eq("user_id", userId)
    .eq("action", action)
    .maybeSingle();

  if (!existing) {
    // First request — insert
    await supabase.from("rate_limits").insert({ user_id: userId, action, request_count: 1 });
    return true;
  }

  if (existing.window_start < oneMinuteAgo) {
    // Window expired — reset
    await supabase
      .from("rate_limits")
      .update({ request_count: 1, window_start: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("action", action);
    return true;
  }

  if (existing.request_count >= 5) {
    return false; // Rate limited
  }

  // Increment
  await supabase
    .from("rate_limits")
    .update({ request_count: existing.request_count + 1 })
    .eq("user_id", userId)
    .eq("action", action);
  return true;
}

const handler = async (req: Request): Promise<Response> => {
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    // Verify JWT authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = claimsData.claims.sub as string;

    // Rate limiting: 5 requests per minute
    const allowed = await checkRateLimit(userId, "send_email");
    if (!allowed) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded" }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { type, to, data }: EmailRequest = await req.json();

    console.log(`Sending ${type} email to ${to}`);

    if (!type || !to || !data) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: type, to, data" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof to !== "string" || to.length > 254 || !emailRegex.test(to)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!(type in templates)) {
      return new Response(
        JSON.stringify({ error: "Unknown email type" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Sanitize user-supplied data before passing to templates
    const sanitizedData = sanitizeData(data);
    const templateFn = templates[type as EmailType];
    const template = templateFn(sanitizedData as never);

    const emailResponse = await resend.emails.send({
      from: "Lomaria <hi@hi.lomaria.at>",
      to: [to],
      subject: template.subject,
      html: template.html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-email function:", errorMessage);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...getCorsHeaders(req) },
      }
    );
  }
};

serve(handler);
