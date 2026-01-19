/**
 * TikTok API Client
 * Handles OAuth and content posting to TikTok
 */

import { randomBytes, createHash } from "crypto";

const TIKTOK_API_BASE = "https://open.tiktokapis.com";

export interface TikTokTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  open_id: string;
  scope: string;
  token_type: string;
}

export interface TikTokUserInfo {
  open_id: string;
  union_id?: string;
  avatar_url?: string;
  display_name?: string;
  username?: string;
}

export interface TikTokPhotoPostRequest {
  post_mode: "DIRECT_POST";
  media_type: "PHOTO";
  photo_images: string[]; // Array of public image URLs
  caption?: string;
  privacy_level?: "PUBLIC_TO_EVERYONE" | "MUTUAL_FOLLOW_FEED" | "SELF_ONLY";
}

export interface TikTokPostResponse {
  data: {
    publish_id: string;
    upload_url?: string;
  };
  error?: {
    code: string;
    message: string;
    log_id: string;
  };
}

/**
 * TikTok OAuth Error structure
 * According to TikTok OAuth Error Handling documentation:
 * https://developers.tiktok.com/doc/oauth-error-handling
 */
export interface TikTokError {
  error: string;
  error_description?: string;
  log_id?: string;
}

/**
 * Parse TikTok error response
 * Handles both JSON error responses and plain text errors
 */
export function parseTikTokError(errorText: string): TikTokError {
  try {
    const parsed = JSON.parse(errorText);
    return {
      error: parsed.error || 'unknown_error',
      error_description: parsed.error_description,
      log_id: parsed.log_id,
    };
  } catch {
    // If not JSON, it might be a simple error message
    // Try to extract error information from plain text
    return {
      error: 'unknown_error',
      error_description: errorText,
    };
  }
}

/**
 * Generate a random code verifier for PKCE
 */
function generateCodeVerifier(): string {
  // Generate 32 random bytes (256 bits) and convert to base64url
  return randomBytes(32)
    .toString("base64url")
    .replace(/=/g, "")
    .substring(0, 128);
}

/**
 * Generate code challenge from verifier (SHA256 hash, base64url encoded)
 */
function generateCodeChallenge(verifier: string): string {
  // Create SHA256 hash of the verifier
  const hash = createHash("sha256").update(verifier).digest();
  // Convert to base64url encoding
  return hash
    .toString("base64url")
    .replace(/=/g, "");
}

/**
 * Get TikTok OAuth authorization URL with PKCE
 * 
 * Note: If you receive a "non_sandbox_target" error, it means:
 * 1. Your app is in Sandbox mode in TikTok Developer Portal
 * 2. The TikTok account you're trying to log in with is not added as a "Target User"
 * 
 * To fix:
 * - Go to TikTok Developer Portal > Your App > Sandbox Settings > Target Users
 * - Add the TikTok account you want to test with
 * - OR move your app to Production mode (requires TikTok approval)
 */
export function getTikTokAuthUrl(
  redirectUri: string,
  csrfState: string,
): { url: string; codeVerifier: string } {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  if (!clientKey) {
    throw new Error("TIKTOK_CLIENT_KEY is not set");
  }

  // Generate PKCE code verifier and challenge
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  const params = new URLSearchParams({
    client_key: clientKey,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "user.info.basic,video.publish,video.upload",
    state: csrfState,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  // Add target_environment parameter if specified (for production mode)
  // This helps TikTok understand we're targeting production, not sandbox
  const targetEnvironment = process.env.TIKTOK_TARGET_ENVIRONMENT;
  if (targetEnvironment) {
    params.set("target_environment", targetEnvironment);
  }

  return {
    url: `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`,
    codeVerifier,
  };
}

/**
 * Exchange authorization code for access token with PKCE
 */
export async function exchangeTikTokCode(
  code: string,
  redirectUri: string,
  codeVerifier: string,
): Promise<TikTokTokenResponse> {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

  if (!clientKey || !clientSecret) {
    throw new Error("TikTok credentials are not set");
  }

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
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    const tiktokError = parseTikTokError(errorText);
    
    // Log error details including log_id for TikTok support
    console.error("[TikTok OAuth] Token exchange error:", {
      error: tiktokError.error,
      error_description: tiktokError.error_description,
      log_id: tiktokError.log_id,
      status: response.status,
    });

    // Build error message with log_id if available
    let errorMessage = `TikTok token exchange failed: ${tiktokError.error}`;
    if (tiktokError.error_description) {
      errorMessage += ` - ${tiktokError.error_description}`;
    }
    if (tiktokError.log_id) {
      errorMessage += ` (Log ID: ${tiktokError.log_id})`;
    }
    
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Refresh TikTok access token
 */
export async function refreshTikTokToken(
  refreshToken: string,
): Promise<TikTokTokenResponse> {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

  if (!clientKey || !clientSecret) {
    throw new Error("TikTok credentials are not set");
  }

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
        refresh_token: refreshToken,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    const tiktokError = parseTikTokError(errorText);
    
    // Log error details including log_id for TikTok support
    console.error("[TikTok OAuth] Token refresh error:", {
      error: tiktokError.error,
      error_description: tiktokError.error_description,
      log_id: tiktokError.log_id,
      status: response.status,
    });

    // Build error message with log_id if available
    let errorMessage = `TikTok token refresh failed: ${tiktokError.error}`;
    if (tiktokError.error_description) {
      errorMessage += ` - ${tiktokError.error_description}`;
    }
    if (tiktokError.log_id) {
      errorMessage += ` (Log ID: ${tiktokError.log_id})`;
    }
    
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Get user info from TikTok
 */
export async function getTikTokUserInfo(
  accessToken: string,
): Promise<TikTokUserInfo> {
  const response = await fetch(
    `${TIKTOK_API_BASE}/v2/user/info/query/?fields=open_id,union_id,avatar_url,display_name,username`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    const tiktokError = parseTikTokError(errorText);
    
    // Log error details including log_id for TikTok support
    console.error("[TikTok API] User info error:", {
      error: tiktokError.error,
      error_description: tiktokError.error_description,
      log_id: tiktokError.log_id,
      status: response.status,
    });

    // Handle specific error cases
    if (tiktokError.error_description?.includes("Unsupported path") || 
        tiktokError.error_description?.includes("Janus")) {
      // This error often occurs in sandbox mode or when the endpoint is not available
      const errorMessage = `TikTok user info endpoint not available. This may occur in sandbox mode. ${tiktokError.log_id ? `Log ID: ${tiktokError.log_id}` : ''}`;
      throw new Error(errorMessage);
    }

    // Build error message with log_id if available
    let errorMessage = `Failed to get TikTok user info: ${tiktokError.error}`;
    if (tiktokError.error_description) {
      errorMessage += ` - ${tiktokError.error_description}`;
    }
    if (tiktokError.log_id) {
      errorMessage += ` (Log ID: ${tiktokError.log_id})`;
    }
    
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.data.user;
}

/**
 * Post photo carousel to TikTok
 */
export async function postTikTokPhoto(
  accessToken: string,
  request: TikTokPhotoPostRequest,
): Promise<TikTokPostResponse> {
  const response = await fetch(
    `${TIKTOK_API_BASE}/v2/post/publish/content/init/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `TikTok post failed: ${data.error?.message || response.statusText}`,
    );
  }

  return data;
}
