import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Nicht autorisiert" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's auth token to verify identity
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Nicht eingeloggt" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Deleting account for user:", user.id);

    // Use service role client for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // First get the user's public.users id
    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (userData) {
      // Delete all messages where user is sender
      const { error: deleteMessagesError } = await supabaseAdmin
        .from("messages")
        .delete()
        .eq("sender_id", userData.id);

      if (deleteMessagesError) {
        console.error("Error deleting messages:", deleteMessagesError);
      }

      // Delete all connections where user is involved
      const { error: deleteConnectionsError } = await supabaseAdmin
        .from("connections")
        .delete()
        .or(`from_user.eq.${userData.id},to_user.eq.${userData.id}`);

      if (deleteConnectionsError) {
        console.error("Error deleting connections:", deleteConnectionsError);
      }
    }

    // Delete user data from public.users
    const { error: deleteDataError } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("auth_user_id", user.id);

    if (deleteDataError) {
      console.error("Error deleting user data:", deleteDataError);
    }

    // Delete storage files (avatars)
    const { data: files } = await supabaseAdmin.storage
      .from("avatars")
      .list(user.id);

    if (files && files.length > 0) {
      const filePaths = files.map((file) => `${user.id}/${file.name}`);
      await supabaseAdmin.storage.from("avatars").remove(filePaths);
      console.log("Deleted avatar files:", filePaths);
    }

    // Delete auth account
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteAuthError) {
      console.error("Error deleting auth user:", deleteAuthError);
      return new Response(
        JSON.stringify({ error: "Konto konnte nicht gelöscht werden" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Successfully deleted account for user:", user.id);

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
