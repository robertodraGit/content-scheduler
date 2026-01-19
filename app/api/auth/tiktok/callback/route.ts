import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  exchangeTikTokCode,
  getTikTokUserInfo,
} from "@/lib/social/tiktok";
import { cookies } from "next/headers";

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

  // Get code verifier from cookie
  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get('tiktok_code_verifier')?.value;

  if (!codeVerifier) {
    redirect("/protected/settings?error=missing_code_verifier");
  }

  try {
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/auth/tiktok/callback`;
    
    console.log("[TikTok Callback] Starting token exchange...");
    const tokenResponse = await exchangeTikTokCode(code, redirectUri, codeVerifier);
    console.log("[TikTok Callback] Token exchange successful. Open ID:", tokenResponse.open_id);
    
    // Clear the code verifier cookie after use
    cookieStore.delete('tiktok_code_verifier');

    // Get user info (optional - if it fails, we'll use open_id from token response)
    let userInfo: { open_id: string; username?: string; display_name?: string } | null = null;
    try {
      console.log("[TikTok Callback] Fetching user info...");
      userInfo = await getTikTokUserInfo(tokenResponse.access_token);
      console.log("[TikTok Callback] User info retrieved:", {
        open_id: userInfo.open_id,
        username: userInfo.username,
        display_name: userInfo.display_name,
      });
    } catch (userInfoError) {
      // Extract log_id from error message if present
      const errorMessage = userInfoError instanceof Error ? userInfoError.message : String(userInfoError);
      const logIdMatch = errorMessage.match(/Log ID: ([^\s\)]+)/);
      const logId = logIdMatch ? logIdMatch[1] : undefined;
      
      console.warn("[TikTok Callback] Failed to fetch user info, using open_id from token:", {
        error: errorMessage,
        log_id: logId,
        note: "This is expected in sandbox mode or when user info endpoint is unavailable",
      });
      
      // Use open_id from token response as fallback
      userInfo = {
        open_id: tokenResponse.open_id,
      };
    }

    // Calculate token expiration with validation
    const now = new Date();
    let tokenExpiresAt: Date | null = null;
    let refreshTokenExpiresAt: Date | null = null;

    // Validate and calculate access token expiration
    if (tokenResponse.expires_in && typeof tokenResponse.expires_in === 'number' && tokenResponse.expires_in > 0) {
      tokenExpiresAt = new Date(now);
      tokenExpiresAt.setSeconds(tokenExpiresAt.getSeconds() + tokenResponse.expires_in);
    } else {
      console.warn("[TikTok Callback] Invalid or missing expires_in, using default 24 hours");
      tokenExpiresAt = new Date(now);
      tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 24); // Default 24 hours
    }

    // Validate and calculate refresh token expiration
    if (tokenResponse.refresh_expires_in && typeof tokenResponse.refresh_expires_in === 'number' && tokenResponse.refresh_expires_in > 0) {
      refreshTokenExpiresAt = new Date(now);
      refreshTokenExpiresAt.setSeconds(refreshTokenExpiresAt.getSeconds() + tokenResponse.refresh_expires_in);
    } else {
      console.warn("[TikTok Callback] Invalid or missing refresh_expires_in, using default 365 days");
      refreshTokenExpiresAt = new Date(now);
      refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 365); // Default 365 days
    }

    // Validate dates before converting to ISO string
    if (isNaN(tokenExpiresAt.getTime())) {
      console.error("[TikTok Callback] Invalid tokenExpiresAt date, using default");
      tokenExpiresAt = new Date(now);
      tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 24);
    }

    if (isNaN(refreshTokenExpiresAt.getTime())) {
      console.error("[TikTok Callback] Invalid refreshTokenExpiresAt date, using default");
      refreshTokenExpiresAt = new Date(now);
      refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 365);
    }

    // Prepare data for database
    const accountData = {
      user_id: user.id,
      platform: "tiktok",
      access_token: tokenResponse.access_token,
      refresh_token: tokenResponse.refresh_token,
      token_expires_at: tokenExpiresAt.toISOString(),
      refresh_token_expires_at: refreshTokenExpiresAt.toISOString(),
      platform_user_id: tokenResponse.open_id,
      platform_username: userInfo?.username || userInfo?.display_name || null,
    };

    console.log("[TikTok Callback] Saving account data to database...", {
      user_id: accountData.user_id,
      platform: accountData.platform,
      platform_user_id: accountData.platform_user_id,
      platform_username: accountData.platform_username,
    });

    // Save or update social account
    const { data: savedAccount, error: dbError } = await supabase
      .from("social_accounts")
      .upsert(accountData, {
        onConflict: "user_id,platform",
      })
      .select();

    if (dbError) {
      console.error("[TikTok Callback] Database error:", {
        message: dbError.message,
        details: dbError.details,
        hint: dbError.hint,
        code: dbError.code,
      });
      redirect("/protected/settings?error=database_error");
    }

    console.log("[TikTok Callback] Account saved successfully:", savedAccount?.[0]?.id);

    // Invalidate cache for settings page to show updated data
    revalidatePath("/protected/settings");

    redirect("/protected/settings?success=tiktok_connected");
  } catch (error) {
    // Extract log_id from error message if present
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const logIdMatch = errorMessage.match(/Log ID: ([^\s\)]+)/);
    const logId = logIdMatch ? logIdMatch[1] : undefined;
    
    console.error("[TikTok Callback] OAuth error:", {
      error: errorMessage,
      log_id: logId,
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      note: logId ? `Include this log_id when contacting TikTok support: ${logId}` : undefined,
    });
    
    redirect(
      `/protected/settings?error=${encodeURIComponent(errorMessage)}`,
    );
  }
}
