import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  console.log("unsubscribe-email invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let email: string | null = null;
    const url = new URL(req.url);

    // GET: URL parameter (footer link click)
    if (req.method === "GET") {
      email = url.searchParams.get("email");
    }

    // POST: Form data (Gmail One-Click) or JSON
    if (req.method === "POST") {
      const contentType = req.headers.get("content-type") || "";

      if (contentType.includes("application/x-www-form-urlencoded")) {
        email = url.searchParams.get("email");
        if (!email) {
          try {
            const text = await req.text();
            const params = new URLSearchParams(text);
            email = params.get("email");
          } catch (_e) {
            // Could not parse form data
          }
        }
      } else if (contentType.includes("application/json")) {
        try {
          const body = await req.json();
          email = body.email || url.searchParams.get("email");
        } catch (_e) {
          email = url.searchParams.get("email");
        }
      } else {
        email = url.searchParams.get("email");
      }
    }

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email parameter required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email format and length
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.length > 254 || !emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Always execute the update — returns 0 rows if email doesn't exist.
    // No branching on result to keep response timing constant.
    await supabase
      .from("users")
      .update({ email_notifications_enabled: false })
      .eq("email", email);

    console.log("Unsubscribe request processed");

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("Error in unsubscribe-email");
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
