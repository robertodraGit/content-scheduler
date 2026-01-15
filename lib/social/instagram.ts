/**
 * Instagram Graph API Client
 * Handles OAuth and content posting to Instagram
 */

const FACEBOOK_API_BASE = "https://graph.facebook.com/v21.0";

export interface InstagramTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface InstagramLongLivedToken {
  access_token: string;
  token_type: string;
  expires_in: number; // seconds
}

export interface InstagramUser {
  id: string;
  username: string;
  account_type: "BUSINESS" | "CREATOR";
}

export interface InstagramMediaContainer {
  id: string;
}

export interface InstagramPublishResponse {
  id: string;
}

/**
 * Get Instagram/Facebook OAuth authorization URL
 */
export function getInstagramAuthUrl(redirectUri: string, state?: string): string {
  const appId = process.env.INSTAGRAM_APP_ID;
  if (!appId) {
    throw new Error("INSTAGRAM_APP_ID is not set");
  }

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "instagram_basic,instagram_content_publish,pages_read_engagement",
    state: state || "",
  });

  return `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`;
}

/**
 * Exchange authorization code for short-lived access token
 */
export async function exchangeInstagramCode(
  code: string,
  redirectUri: string,
): Promise<InstagramTokenResponse> {
  const appId = process.env.INSTAGRAM_APP_ID;
  const appSecret = process.env.INSTAGRAM_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error("Instagram credentials are not set");
  }

  const response = await fetch(
    `${FACEBOOK_API_BASE}/oauth/access_token`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const url = new URL(`${FACEBOOK_API_BASE}/oauth/access_token`);
  url.searchParams.set("client_id", appId);
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("code", code);
  url.searchParams.set("redirect_uri", redirectUri);

  const finalResponse = await fetch(url.toString(), {
    method: "GET",
  });

  if (!finalResponse.ok) {
    const error = await finalResponse.text();
    throw new Error(`Instagram token exchange failed: ${error}`);
  }

  return finalResponse.json();
}

/**
 * Exchange short-lived token for long-lived token (60 days)
 */
export async function getLongLivedToken(
  shortLivedToken: string,
): Promise<InstagramLongLivedToken> {
  const appId = process.env.INSTAGRAM_APP_ID;
  const appSecret = process.env.INSTAGRAM_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error("Instagram credentials are not set");
  }

  const url = new URL(`${FACEBOOK_API_BASE}/oauth/access_token`);
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", appId);
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("fb_exchange_token", shortLivedToken);

  const response = await fetch(url.toString(), {
    method: "GET",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get long-lived token: ${error}`);
  }

  return response.json();
}

/**
 * Get Instagram Business Account ID from Facebook Page
 * Returns the Instagram Business Account ID associated with the user's pages
 */
export async function getInstagramBusinessAccount(
  accessToken: string,
): Promise<InstagramUser> {
  // First, get user's pages
  const pagesResponse = await fetch(
    `${FACEBOOK_API_BASE}/me/accounts?access_token=${accessToken}`,
  );

  if (!pagesResponse.ok) {
    throw new Error("Failed to get Facebook pages");
  }

  const pagesData = await pagesResponse.json();
  const pages = pagesData.data;

  if (!pages || pages.length === 0) {
    throw new Error("No Facebook pages found. Please connect a page first.");
  }

  // Get the first page's Instagram Business Account
  const pageId = pages[0].id;
  const igAccountResponse = await fetch(
    `${FACEBOOK_API_BASE}/${pageId}?fields=instagram_business_account&access_token=${accessToken}`,
  );

  if (!igAccountResponse.ok) {
    throw new Error("Failed to get Instagram Business Account");
  }

  const igAccountData = await igAccountResponse.json();
  const igAccountId = igAccountData.instagram_business_account?.id;

  if (!igAccountId) {
    throw new Error(
      "Instagram Business Account not found. Please ensure your Instagram account is connected to a Facebook Page.",
    );
  }

  // Get Instagram account details
  const igUserResponse = await fetch(
    `${FACEBOOK_API_BASE}/${igAccountId}?fields=id,username,account_type&access_token=${accessToken}`,
  );

  if (!igUserResponse.ok) {
    throw new Error("Failed to get Instagram account details");
  }

  return igUserResponse.json();
}

/**
 * Create a carousel item (child media container)
 */
export async function createCarouselItem(
  igUserId: string,
  accessToken: string,
  imageUrl: string,
  caption?: string,
): Promise<InstagramMediaContainer> {
  const url = new URL(`${FACEBOOK_API_BASE}/${igUserId}/media`);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("image_url", imageUrl);
  url.searchParams.set("is_carousel_item", "true");
  if (caption) {
    url.searchParams.set("caption", caption);
  }

  const response = await fetch(url.toString(), {
    method: "POST",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create carousel item: ${error}`);
  }

  return response.json();
}

/**
 * Create carousel container (parent)
 */
export async function createCarousel(
  igUserId: string,
  accessToken: string,
  childrenIds: string[],
  caption?: string,
): Promise<InstagramMediaContainer> {
  const url = new URL(`${FACEBOOK_API_BASE}/${igUserId}/media`);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("media_type", "CAROUSEL");
  url.searchParams.set("children", childrenIds.join(","));
  if (caption) {
    url.searchParams.set("caption", caption);
  }

  const response = await fetch(url.toString(), {
    method: "POST",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create carousel: ${error}`);
  }

  return response.json();
}

/**
 * Publish carousel to Instagram
 */
export async function publishCarousel(
  igUserId: string,
  accessToken: string,
  creationId: string,
): Promise<InstagramPublishResponse> {
  const url = new URL(`${FACEBOOK_API_BASE}/${igUserId}/media_publish`);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("creation_id", creationId);

  const response = await fetch(url.toString(), {
    method: "POST",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to publish carousel: ${error}`);
  }

  return response.json();
}

/**
 * Post carousel to Instagram (complete flow)
 */
export async function postInstagramCarousel(
  igUserId: string,
  accessToken: string,
  imageUrls: string[],
  caption?: string,
): Promise<InstagramPublishResponse> {
  // Step 1: Create carousel items
  const childrenIds: string[] = [];
  for (const imageUrl of imageUrls) {
    const item = await createCarouselItem(igUserId, accessToken, imageUrl);
    childrenIds.push(item.id);
  }

  // Step 2: Create carousel container
  const carousel = await createCarousel(igUserId, accessToken, childrenIds, caption);

  // Step 3: Publish carousel
  return publishCarousel(igUserId, accessToken, carousel.id);
}
