import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";

const TIKTOK_API_BASE = "https://open.tiktokapis.com";
const FACEBOOK_API_BASE = "https://graph.facebook.com/v21.0";

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get posts that are scheduled and ready to publish
    // First get posts
    const { data: postsData, error: postsError } = await supabase
      .from("posts")
      .select(
        `
        *,
        post_media (
          id,
          public_url,
          position
        )
      `,
      )
      .eq("status", "scheduled")
      .lte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true });

    if (postsError || !postsData) {
      console.error("Error fetching posts:", postsError);
      return new Response(
        JSON.stringify({ error: postsError?.message || "No posts found" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Get social accounts for each post
    const posts = await Promise.all(
      postsData.map(async (post) => {
        const { data: socialAccount } = await supabase
          .from("social_accounts")
          .select("access_token, refresh_token, platform_user_id")
          .eq("user_id", post.user_id)
          .eq("platform", post.platform)
          .single();

        return {
          ...post,
          social_accounts: socialAccount,
        };
      }),
    );

    // Filter out posts without social accounts
    const postsWithAccounts = posts.filter((p) => p.social_accounts);

    if (postsWithAccounts.length === 0) {
      return new Response(
        JSON.stringify({ message: "No posts to publish" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const results = [];

    for (const post of postsWithAccounts) {
      try {
        // Update status to publishing
        await supabase
          .from("posts")
          .update({ status: "publishing" })
          .eq("id", post.id);

        const socialAccount = post.social_accounts;
        const media = post.post_media.sort((a, b) => a.position - b.position);
        const imageUrls = media.map((m) => m.public_url);

        let platformPostId: string | null = null;

        if (post.platform === "tiktok") {
          // Publish to TikTok using Content Posting API (photo post)
          const response = await fetch(
            `${TIKTOK_API_BASE}/v2/post/publish/content/init/`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${socialAccount.access_token}`,
                "Content-Type": "application/json; charset=UTF-8",
              },
              body: JSON.stringify({
                media_type: "PHOTO",
                post_mode: "DIRECT_POST",
                post_info: {
                  description: post.caption || "",
                  privacy_level: "SELF_ONLY",
                  disable_comment: false,
                  auto_add_music: true,
                },
                source_info: {
                  source: "PULL_FROM_URL",
                  photo_images: imageUrls,
                  photo_cover_index: 0,
                },
              }),
            },
          );

          const data = await response.json();

          if (!response.ok || data.error) {
            throw new Error(
              data.error?.message || `TikTok API error: ${response.statusText}`,
            );
          }

          platformPostId = data.data?.publish_id || null;
        } else if (post.platform === "instagram") {
          // Publish to Instagram (carousel)
          const igUserId = socialAccount.platform_user_id;

          // Step 1: Create carousel items
          const childrenIds: string[] = [];
          for (const imageUrl of imageUrls) {
            const url = new URL(`${FACEBOOK_API_BASE}/${igUserId}/media`);
            url.searchParams.set("access_token", socialAccount.access_token);
            url.searchParams.set("image_url", imageUrl);
            url.searchParams.set("is_carousel_item", "true");

            const itemResponse = await fetch(url.toString(), {
              method: "POST",
            });

            if (!itemResponse.ok) {
              const error = await itemResponse.text();
              throw new Error(`Failed to create carousel item: ${error}`);
            }

            const itemData = await itemResponse.json();
            childrenIds.push(itemData.id);
          }

          // Step 2: Create carousel container
          const carouselUrl = new URL(
            `${FACEBOOK_API_BASE}/${igUserId}/media`,
          );
          carouselUrl.searchParams.set(
            "access_token",
            socialAccount.access_token,
          );
          carouselUrl.searchParams.set("media_type", "CAROUSEL");
          carouselUrl.searchParams.set("children", childrenIds.join(","));
          if (post.caption) {
            carouselUrl.searchParams.set("caption", post.caption);
          }

          const carouselResponse = await fetch(carouselUrl.toString(), {
            method: "POST",
          });

          if (!carouselResponse.ok) {
            const error = await carouselResponse.text();
            throw new Error(`Failed to create carousel: ${error}`);
          }

          const carouselData = await carouselResponse.json();

          // Step 3: Publish carousel
          const publishUrl = new URL(
            `${FACEBOOK_API_BASE}/${igUserId}/media_publish`,
          );
          publishUrl.searchParams.set(
            "access_token",
            socialAccount.access_token,
          );
          publishUrl.searchParams.set("creation_id", carouselData.id);

          const publishResponse = await fetch(publishUrl.toString(), {
            method: "POST",
          });

          if (!publishResponse.ok) {
            const error = await publishResponse.text();
            throw new Error(`Failed to publish carousel: ${error}`);
          }

          const publishData = await publishResponse.json();
          platformPostId = publishData.id;
        }

        // Update post as published
        await supabase
          .from("posts")
          .update({
            status: "published",
            published_at: new Date().toISOString(),
            platform_post_id: platformPostId,
          })
          .eq("id", post.id);

        results.push({ postId: post.id, status: "success" });
      } catch (error) {
        console.error(`Error publishing post ${post.id}:`, error);

        // Update post as failed
        await supabase
          .from("posts")
          .update({
            status: "failed",
            error_message: error instanceof Error ? error.message : "Unknown error",
          })
          .eq("id", post.id);

        results.push({
          postId: post.id,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${posts.length} posts`,
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
