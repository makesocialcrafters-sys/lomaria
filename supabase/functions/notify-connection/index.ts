import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

// Study program labels
const STUDY_PROGRAMS: Record<string, string> = {
  bachelor_wiso: "Bachelor Wirtschafts- und Sozialwissenschaften",
  bachelor_bwl: "Bachelor Betriebswirtschaft",
  bachelor_vwl: "Bachelor Volkswirtschaft",
  bachelor_wire: "Bachelor Wirtschaftsrecht",
  master_finance: "Master Finance",
  master_marketing: "Master Marketing",
  master_management: "Master Management",
  master_other: "Master (Sonstige)",
  phd: "Doktorat/PhD",
};

const emailWrapper = (content: string, recipientEmail: string) => `
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
            <td align="center" style="padding-top: 24px;">
              <a href="https://lomaria.at/unsubscribe?email=${encodeURIComponent(recipientEmail)}" 
                 style="font-size: 11px; color: ${BRAND_COLORS.textMuted}; text-decoration: underline;">
                E-Mail-Benachrichtigungen abbestellen
              </a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 16px;">
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

interface NotifyRequest {
  type: "contact_request" | "request_accepted" | "new_message";
  connectionId?: string;
  messageId?: string;
  fromUserId: string;
  toUserId: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("notify-connection invoked, method:", req.method);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { type, connectionId, fromUserId, toUserId, message }: NotifyRequest = body;

    console.log("Request body:", JSON.stringify(body));
    console.log(`Notify connection: ${type} from ${fromUserId} to ${toUserId}`);

    // Fetch sender info
    const { data: sender, error: senderError } = await supabase
      .from("users")
      .select("first_name, last_name, study_program, email")
      .eq("id", fromUserId)
      .single();

    if (senderError || !sender) {
      console.error("Error fetching sender:", senderError);
      throw new Error("Sender not found");
    }

    // Fetch recipient info
    const { data: recipient, error: recipientError } = await supabase
      .from("users")
      .select("first_name, last_name, email, email_notifications_enabled")
      .eq("id", toUserId)
      .single();

    if (recipientError || !recipient) {
      console.error("Error fetching recipient:", recipientError);
      throw new Error("Recipient not found");
    }

    // Check if email notifications are enabled
    if (recipient.email_notifications_enabled === false) {
      console.log(`Email notifications disabled for user ${toUserId}, skipping`);
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "notifications_disabled" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const senderName = `${sender.first_name || ""} ${sender.last_name || ""}`.trim() || "Ein Nutzer";
    const senderProgram = sender.study_program ? STUDY_PROGRAMS[sender.study_program] || sender.study_program : undefined;
    const recipientName = recipient.first_name || "dort";
    const recipientEmail = recipient.email;
    const appUrl = "https://lomaria.at";

    let subject = "";
    let htmlContent = "";

    if (type === "contact_request") {
      subject = `${senderName} möchte sich mit dir vernetzen`;
      htmlContent = emailWrapper(`
        <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 600; color: ${BRAND_COLORS.text};">
          Neue Kontaktanfrage
        </h2>
        <p style="margin: 0 0 24px 0; font-size: 16px; color: ${BRAND_COLORS.textMuted}; line-height: 1.6;">
          Hallo ${recipientName},
        </p>
        <div style="background-color: ${BRAND_COLORS.background}; border-radius: 12px; padding: 20px; margin-bottom: 24px; border-left: 3px solid ${BRAND_COLORS.gold};">
          <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: ${BRAND_COLORS.gold};">
            ${senderName}
          </p>
          ${senderProgram ? `<p style="margin: 0 0 12px 0; font-size: 14px; color: ${BRAND_COLORS.textMuted};">${senderProgram}</p>` : ''}
          ${message ? `<p style="margin: 0; font-size: 15px; color: ${BRAND_COLORS.text}; font-style: italic; line-height: 1.5;">"${message}"</p>` : ''}
        </div>
        <a href="${appUrl}/contacts" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_COLORS.gold}, ${BRAND_COLORS.goldLight}); color: ${BRAND_COLORS.background}; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
          Anfrage ansehen
        </a>
      `, recipientEmail);
    } else if (type === "request_accepted") {
      subject = `${senderName} hat deine Anfrage angenommen! 🎉`;
      htmlContent = emailWrapper(`
        <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 600; color: ${BRAND_COLORS.text};">
          Gute Nachrichten!
        </h2>
        <p style="margin: 0 0 24px 0; font-size: 16px; color: ${BRAND_COLORS.textMuted}; line-height: 1.6;">
          Hallo ${recipientName},
        </p>
        <div style="background-color: ${BRAND_COLORS.background}; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
          <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: ${BRAND_COLORS.gold};">
            ${senderName}
          </p>
          ${senderProgram ? `<p style="margin: 0; font-size: 14px; color: ${BRAND_COLORS.textMuted};">${senderProgram}</p>` : ''}
        </div>
        <p style="margin: 0 0 24px 0; font-size: 15px; color: ${BRAND_COLORS.text}; line-height: 1.6; text-align: center;">
          hat deine Kontaktanfrage angenommen.<br>Ihr könnt jetzt miteinander chatten!
        </p>
        <div style="text-align: center;">
          <a href="${appUrl}/chats/${connectionId}" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_COLORS.gold}, ${BRAND_COLORS.goldLight}); color: ${BRAND_COLORS.background}; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
            Chat öffnen
          </a>
        </div>
      `, recipientEmail);
    } else if (type === "new_message") {
      const preview = message && message.length > 100 ? message.substring(0, 100) + "..." : message;
      subject = `Neue Nachricht von ${senderName}`;
      htmlContent = emailWrapper(`
        <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 600; color: ${BRAND_COLORS.text};">
          Neue Nachricht
        </h2>
        <p style="margin: 0 0 24px 0; font-size: 16px; color: ${BRAND_COLORS.textMuted}; line-height: 1.6;">
          Hallo ${recipientName},
        </p>
        <div style="background-color: ${BRAND_COLORS.background}; border-radius: 12px; padding: 20px; margin-bottom: 24px; border-left: 3px solid ${BRAND_COLORS.gold};">
          <p style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: ${BRAND_COLORS.gold};">
            ${senderName}
          </p>
          <p style="margin: 0; font-size: 15px; color: ${BRAND_COLORS.text}; line-height: 1.5;">
            "${preview}"
          </p>
        </div>
        <a href="${appUrl}/chats/${connectionId}" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_COLORS.gold}, ${BRAND_COLORS.goldLight}); color: ${BRAND_COLORS.background}; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
          Antworten
        </a>
      `, recipientEmail);
    }

    console.log(`Sending email to ${recipientEmail} with subject: ${subject}`);
    
    const { error } = await resend.emails.send({
      from: "Lomaria <hi@hi.lomaria.at>",
      to: [recipientEmail],
      subject,
      html: htmlContent,
      headers: {
        "List-Unsubscribe": `<https://lomaria.at/unsubscribe?email=${encodeURIComponent(recipientEmail)}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    if (error) {
      console.error("Error sending email:", error);
      throw error;
    }

    console.log(`Email sent successfully: ${type} to ${recipientEmail}`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in notify-connection:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
