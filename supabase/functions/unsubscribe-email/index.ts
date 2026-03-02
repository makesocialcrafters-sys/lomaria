import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  console.log("unsubscribe-email invoked, method:", req.method);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let email: string | null = null;
    const url = new URL(req.url);

    // GET: URL parameter (footer link click)
    if (req.method === "GET") {
      email = url.searchParams.get("email");
      console.log("GET request, email from URL:", email);
    }

    // POST: Form data (Gmail One-Click) or JSON
    if (req.method === "POST") {
      const contentType = req.headers.get("content-type") || "";
      console.log("POST request, content-type:", contentType);

      if (contentType.includes("application/x-www-form-urlencoded")) {
        // Gmail One-Click sends POST with form data
        // The email should still be in the URL parameter
        email = url.searchParams.get("email");
        
        // Try to parse form data as fallback
        if (!email) {
          try {
            const text = await req.text();
            const params = new URLSearchParams(text);
            email = params.get("email");
            console.log("Email from form data:", email);
          } catch (e) {
            console.log("Could not parse form data:", e);
          }
        }
      } else if (contentType.includes("application/json")) {
        try {
          const body = await req.json();
          email = body.email || url.searchParams.get("email");
          console.log("Email from JSON body:", email);
        } catch (e) {
          console.log("Could not parse JSON:", e);
          email = url.searchParams.get("email");
        }
      } else {
        // Default: try URL parameter
        email = url.searchParams.get("email");
      }
    }

    if (!email) {
      console.error("No email parameter provided");
      return new Response(
        JSON.stringify({ error: "Email parameter required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email format and length
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.length > 254 || !emailRegex.test(email)) {
      console.error("Invalid email format");
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase
      .from("users")
      .update({ email_notifications_enabled: false })
      .eq("email", email)
      .select("id");

    if (error) {
      console.error("Error updating preference:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log("No user found with email:", email);
      // Still return success to prevent email enumeration
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Email notifications disabled successfully");

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in unsubscribe-email:", errorMessage);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
