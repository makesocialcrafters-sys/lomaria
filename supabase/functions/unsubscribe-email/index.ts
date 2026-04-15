import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

async function checkRateLimit(
  supabase: ReturnType<typeof createClient>,
  clientIP: string,
  action: string,
  maxRequests: number,
  windowMs: number
): Promise<boolean> {
  const { data: existing } = await supabase
    .from("rate_limits")
    .select("request_count, window_start")
    .eq("user_id", clientIP)
    .eq("action", action)
    .maybeSingle();

  const now = new Date();

  if (existing) {
    const windowStart = new Date(existing.window_start);
    if (now.getTime() - windowStart.getTime() > windowMs) {
      // Window expired, reset
      await supabase
        .from("rate_limits")
        .update({ request_count: 1, window_start: now.toISOString() })
        .eq("user_id", clientIP)
        .eq("action", action);
      return false;
    }
    if (existing.request_count >= maxRequests) {
      return true; // Rate limited
    }
    await supabase
      .from("rate_limits")
      .update({ request_count: existing.request_count + 1 })
      .eq("user_id", clientIP)
      .eq("action", action);
    return false;
  }

  // First request
  await supabase
    .from("rate_limits")
    .insert({ user_id: clientIP, action, request_count: 1, window_start: now.toISOString() });
  return false;
}

serve(async (req: Request) => {
  console.log("unsubscribe-email invoked");

  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // IP-based rate limiting: 5 requests per minute
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const isLimited = await checkRateLimit(supabase, clientIP, "unsubscribe", 5, 60_000);
    if (isLimited) {
      return new Response(
        JSON.stringify({ error: "Too many requests" }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let email: string | null = null;
    const url = new URL(req.url);

    if (req.method === "GET") {
      email = url.searchParams.get("email");
    }

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.length > 254 || !emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

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
      { status: 500, headers: { "Content-Type": "application/json", ...getCorsHeaders(req) } }
    );
  }
});
