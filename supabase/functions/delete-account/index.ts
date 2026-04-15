import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

serve(async (req) => {
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Nicht autorisiert" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      console.error("Auth error:", claimsError);
      return new Response(
        JSON.stringify({ error: "Nicht eingeloggt" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authUserId = claimsData.claims.sub as string;
    console.log("Deleting account for user:", authUserId);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("auth_user_id", authUserId)
      .single();

    if (userData) {
      const { error: deleteMessagesError } = await supabaseAdmin
        .from("messages")
        .delete()
        .eq("sender_id", userData.id);

      if (deleteMessagesError) {
        console.error("Error deleting messages:", deleteMessagesError);
      }

      const { error: deleteConnectionsError } = await supabaseAdmin
        .from("connections")
        .delete()
        .or(`from_user.eq.${userData.id},to_user.eq.${userData.id}`);

      if (deleteConnectionsError) {
        console.error("Error deleting connections:", deleteConnectionsError);
      }
    }

    const { error: deleteDataError } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("auth_user_id", authUserId);

    if (deleteDataError) {
      console.error("Error deleting user data:", deleteDataError);
    }

    const { data: files } = await supabaseAdmin.storage
      .from("avatars")
      .list(authUserId);

    if (files && files.length > 0) {
      const filePaths = files.map((file) => `${authUserId}/${file.name}`);
      await supabaseAdmin.storage.from("avatars").remove(filePaths);
      console.log("Deleted avatar files:", filePaths);
    }

    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(authUserId);

    if (deleteAuthError) {
      console.error("Error deleting auth user:", deleteAuthError);
      return new Response(
        JSON.stringify({ error: "Konto konnte nicht gelöscht werden" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Successfully deleted account for user:", authUserId);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    const message = error instanceof Error ? error.message : "Ein Fehler ist aufgetreten";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
