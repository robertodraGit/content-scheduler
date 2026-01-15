import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  exchangeTikTokCode,
  getTikTokUserInfo,
} from "@/lib/social/tiktok";

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
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/auth/tiktok/callback`;
    const tokenResponse = await exchangeTikTokCode(code, redirectUri);

    // Get user info
    const userInfo = await getTikTokUserInfo(tokenResponse.access_token);

    // Calculate token expiration
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setSeconds(
      tokenExpiresAt.getSeconds() + tokenResponse.expires_in,
    );

    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setSeconds(
      refreshTokenExpiresAt.getSeconds() + tokenResponse.refresh_expires_in,
    );

    // Save or update social account
    const { error: dbError } = await supabase
      .from("social_accounts")
      .upsert(
        {
          user_id: user.id,
          platform: "tiktok",
          access_token: tokenResponse.access_token,
          refresh_token: tokenResponse.refresh_token,
          token_expires_at: tokenExpiresAt.toISOString(),
          refresh_token_expires_at: refreshTokenExpiresAt.toISOString(),
          platform_user_id: tokenResponse.open_id,
          platform_username: userInfo.username || userInfo.display_name || null,
        },
        {
          onConflict: "user_id,platform",
        },
      );

    if (dbError) {
      console.error("Database error:", dbError);
      redirect("/protected/settings?error=database_error");
    }

    redirect("/protected/settings?success=tiktok_connected");
  } catch (error) {
    console.error("TikTok OAuth error:", error);
    redirect(
      `/protected/settings?error=${encodeURIComponent(error instanceof Error ? error.message : "unknown_error")}`,
    );
  }
}
