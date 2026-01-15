/**
 * TikTok API Client
 * Handles OAuth and content posting to TikTok
 */

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
 * Get TikTok OAuth authorization URL
 */
export function getTikTokAuthUrl(redirectUri: string, state?: string): string {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  if (!clientKey) {
    throw new Error("TIKTOK_CLIENT_KEY is not set");
  }

  const params = new URLSearchParams({
    client_key: clientKey,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "user.info.basic,video.publish",
    state: state || "",
  });

  return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeTikTokCode(
  code: string,
  redirectUri: string,
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
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`TikTok token exchange failed: ${error}`);
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
    const error = await response.text();
    throw new Error(`TikTok token refresh failed: ${error}`);
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
    const error = await response.text();
    throw new Error(`Failed to get TikTok user info: ${error}`);
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
