import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "https://esm.sh/resend@2.1.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET")?.replace("v1,whsec_", "") || "";

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

// Email templates for auth actions
const authTemplates = {
  signup: (data: { confirmationUrl: string }) => ({
    subject: "Bestätige deine E-Mail-Adresse",
    html: emailWrapper(`
      <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 600; color: ${BRAND_COLORS.text};">
        E-Mail bestätigen
      </h2>
      <p style="margin: 0 0 24px 0; font-size: 16px; color: ${BRAND_COLORS.textMuted}; line-height: 1.6;">
        Willkommen bei Lomaria! Bitte bestätige deine E-Mail-Adresse, um fortzufahren.
      </p>
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${data.confirmationUrl}" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_COLORS.gold}, ${BRAND_COLORS.goldLight}); color: ${BRAND_COLORS.background}; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
          E-Mail bestätigen
        </a>
      </div>
      <p style="margin: 0; font-size: 13px; color: ${BRAND_COLORS.textMuted}; line-height: 1.6;">
        Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br>
        <a href="${data.confirmationUrl}" style="color: ${BRAND_COLORS.gold}; word-break: break-all;">${data.confirmationUrl}</a>
      </p>
    `),
  }),

  recovery: (data: { confirmationUrl: string }) => ({
    subject: "Passwort zurücksetzen",
    html: emailWrapper(`
      <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 600; color: ${BRAND_COLORS.text};">
        Passwort zurücksetzen
      </h2>
      <p style="margin: 0 0 24px 0; font-size: 16px; color: ${BRAND_COLORS.textMuted}; line-height: 1.6;">
        Du hast angefordert, dein Passwort zurückzusetzen. Klicke auf den Button unten, um ein neues Passwort zu wählen.
      </p>
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${data.confirmationUrl}" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_COLORS.gold}, ${BRAND_COLORS.goldLight}); color: ${BRAND_COLORS.background}; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
          Neues Passwort wählen
        </a>
      </div>
      <p style="margin: 0 0 16px 0; font-size: 13px; color: ${BRAND_COLORS.textMuted}; line-height: 1.6;">
        Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br>
        <a href="${data.confirmationUrl}" style="color: ${BRAND_COLORS.gold}; word-break: break-all;">${data.confirmationUrl}</a>
      </p>
      <div style="background-color: ${BRAND_COLORS.background}; border-radius: 8px; padding: 16px; margin-top: 24px;">
        <p style="margin: 0; font-size: 13px; color: ${BRAND_COLORS.textMuted}; line-height: 1.5;">
          ⚠️ Falls du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren. Dein Passwort bleibt unverändert.
        </p>
      </div>
    `),
  }),

  magic_link: (data: { confirmationUrl: string }) => ({
    subject: "Dein Login-Link für Lomaria",
    html: emailWrapper(`
      <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 600; color: ${BRAND_COLORS.text};">
        Magic Link Login
      </h2>
      <p style="margin: 0 0 24px 0; font-size: 16px; color: ${BRAND_COLORS.textMuted}; line-height: 1.6;">
        Klicke auf den Button unten, um dich bei Lomaria anzumelden.
      </p>
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${data.confirmationUrl}" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_COLORS.gold}, ${BRAND_COLORS.goldLight}); color: ${BRAND_COLORS.background}; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
          Bei Lomaria anmelden
        </a>
      </div>
      <p style="margin: 0; font-size: 13px; color: ${BRAND_COLORS.textMuted}; line-height: 1.6;">
        Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br>
        <a href="${data.confirmationUrl}" style="color: ${BRAND_COLORS.gold}; word-break: break-all;">${data.confirmationUrl}</a>
      </p>
    `),
  }),

  email_change: (data: { confirmationUrl: string }) => ({
    subject: "Bestätige deine neue E-Mail-Adresse",
    html: emailWrapper(`
      <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 600; color: ${BRAND_COLORS.text};">
        E-Mail-Adresse ändern
      </h2>
      <p style="margin: 0 0 24px 0; font-size: 16px; color: ${BRAND_COLORS.textMuted}; line-height: 1.6;">
        Du hast angefordert, deine E-Mail-Adresse zu ändern. Bitte bestätige deine neue E-Mail-Adresse.
      </p>
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${data.confirmationUrl}" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_COLORS.gold}, ${BRAND_COLORS.goldLight}); color: ${BRAND_COLORS.background}; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
          E-Mail bestätigen
        </a>
      </div>
      <p style="margin: 0; font-size: 13px; color: ${BRAND_COLORS.textMuted}; line-height: 1.6;">
        Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br>
        <a href="${data.confirmationUrl}" style="color: ${BRAND_COLORS.gold}; word-break: break-all;">${data.confirmationUrl}</a>
      </p>
    `),
  }),
};

type AuthEmailType = keyof typeof authTemplates;

interface AuthEmailPayload {
  user: {
    id: string;
    email: string;
    user_metadata?: {
      first_name?: string;
    };
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: AuthEmailType;
    site_url: string;
  };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);

  // Verify webhook signature
  const wh = new Webhook(hookSecret);
  let data: AuthEmailPayload;

  try {
    data = wh.verify(payload, headers) as AuthEmailPayload;
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return new Response(
      JSON.stringify({ error: { http_code: 401, message: "Unauthorized" } }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { user, email_data } = data;

    console.log(`Auth email hook triggered for ${email_data.email_action_type} to ${user.email}`);

    // Server-side email domain check for signups
    if (email_data.email_action_type === "signup") {
      const allowedDomain = Deno.env.get("ALLOWED_EMAIL_DOMAIN") || "@s.wu.ac.at";
      if (!user.email.endsWith(allowedDomain)) {
        console.log(`Signup rejected: ${user.email} does not match ${allowedDomain}`);
        return new Response(
          JSON.stringify({
            error: {
              http_code: 422,
              message: `Nur E-Mail-Adressen mit ${allowedDomain} sind erlaubt.`,
            },
          }),
          { status: 422, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const emailType = email_data.email_action_type;
    
    if (!(emailType in authTemplates)) {
      console.log(`Unknown email type: ${emailType}, falling back to default Supabase email`);
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Build confirmation URL
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const confirmationUrl = `${supabaseUrl}/auth/v1/verify?token=${email_data.token_hash}&type=${emailType}&redirect_to=${email_data.redirect_to}`;

    const templateFn = authTemplates[emailType as AuthEmailType];
    const template = templateFn({ confirmationUrl });

    const { error } = await resend.emails.send({
      from: "Lomaria <hi@hi.lomaria.at>",
      to: [user.email],
      subject: template.subject,
      html: template.html,
    });

    if (error) {
      console.error("Error sending auth email:", error);
      throw error;
    }

    console.log(`Auth email ${emailType} sent successfully to ${user.email}`);

    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in auth-email-hook:", errorMessage);
    return new Response(
      JSON.stringify({
        error: {
          http_code: 500,
          message: errorMessage,
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
