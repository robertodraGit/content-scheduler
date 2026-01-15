import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";

const TIKTOK_API_BASE = "https://open.tiktokapis.com";

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get TikTok accounts that need token refresh (within 24 hours of expiration)
    const refreshThreshold = new Date();
    refreshThreshold.setHours(refreshThreshold.getHours() + 24);

    const { data: accounts, error: accountsError } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("platform", "tiktok")
      .not("refresh_token", "is", null)
      .lte("token_expires_at", refreshThreshold.toISOString());

    if (accountsError) {
      console.error("Error fetching accounts:", accountsError);
      return new Response(
        JSON.stringify({ error: accountsError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!accounts || accounts.length === 0) {
      return new Response(
        JSON.stringify({ message: "No tokens to refresh" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const clientKey = Deno.env.get("TIKTOK_CLIENT_KEY");
    const clientSecret = Deno.env.get("TIKTOK_CLIENT_SECRET");

    if (!clientKey || !clientSecret) {
      throw new Error("TikTok credentials not configured");
    }

    const results = [];

    for (const account of accounts) {
      try {
        // Refresh token
        const response = await fetch(
          `${TIKTOK_API_BASE}/v2/oauth/token/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              client_key: clientKey,
              client_secret: clientSecret,
              grant_type: "refresh_token",
              refresh_token: account.refresh_token!,
            }),
          },
        );

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Token refresh failed: ${error}`);
        }

        const tokenData = await response.json();

        // Calculate new expiration dates
        const tokenExpiresAt = new Date();
        tokenExpiresAt.setSeconds(
          tokenExpiresAt.getSeconds() + tokenData.expires_in,
        );

        const refreshTokenExpiresAt = new Date();
        refreshTokenExpiresAt.setSeconds(
          refreshTokenExpiresAt.getSeconds() + tokenData.refresh_expires_in,
        );

        // Update account
        await supabase
          .from("social_accounts")
          .update({
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            token_expires_at: tokenExpiresAt.toISOString(),
            refresh_token_expires_at: refreshTokenExpiresAt.toISOString(),
          })
          .eq("id", account.id);

        results.push({ accountId: account.id, status: "success" });
      } catch (error) {
        console.error(`Error refreshing token for account ${account.id}:`, error);
        results.push({
          accountId: account.id,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${accounts.length} accounts`,
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
