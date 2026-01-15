import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  exchangeInstagramCode,
  getLongLivedToken,
  getInstagramBusinessAccount,
} from "@/lib/social/instagram";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    redirect(`/protected/settings?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    redirect("/protected/settings?error=no_code");
  }

  try {
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/auth/instagram/callback`;
    
    // Exchange code for short-lived token
    const shortTokenResponse = await exchangeInstagramCode(code, redirectUri);

    // Exchange for long-lived token (60 days)
    const longTokenResponse = await getLongLivedToken(
      shortTokenResponse.access_token,
    );

    // Get Instagram Business Account
    const igAccount = await getInstagramBusinessAccount(
      longTokenResponse.access_token,
    );

    // Calculate token expiration (60 days)
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setSeconds(
      tokenExpiresAt.getSeconds() + longTokenResponse.expires_in,
    );

    // Save or update social account
    const { error: dbError } = await supabase
      .from("social_accounts")
      .upsert(
        {
          user_id: user.id,
          platform: "instagram",
          access_token: longTokenResponse.access_token,
          refresh_token: null, // Instagram uses long-lived tokens, no refresh needed
          token_expires_at: tokenExpiresAt.toISOString(),
          refresh_token_expires_at: null,
          platform_user_id: igAccount.id,
          platform_username: igAccount.username,
        },
        {
          onConflict: "user_id,platform",
        },
      );

    if (dbError) {
      console.error("Database error:", dbError);
      redirect("/protected/settings?error=database_error");
    }

    redirect("/protected/settings?success=instagram_connected");
  } catch (error) {
    console.error("Instagram OAuth error:", error);
    redirect(
      `/protected/settings?error=${encodeURIComponent(error instanceof Error ? error.message : "unknown_error")}`,
    );
  }
}
