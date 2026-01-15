import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadImage, deletePostImages } from "@/lib/storage";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const platform = searchParams.get("platform");

  let query = supabase
    .from("posts")
    .select(
      `
      *,
      post_media (
        id,
        storage_path,
        public_url,
        position,
        media_type
      )
    `,
    )
    .eq("user_id", user.id)
    .order("scheduled_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  if (platform) {
    query = query.eq("platform", platform);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const platform = formData.get("platform") as string;
    const scheduledAt = formData.get("scheduled_at") as string;
    const caption = formData.get("caption") as string;
    const files = formData.getAll("images") as File[];

    if (!platform || !scheduledAt || files.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate platform
    if (platform !== "tiktok" && platform !== "instagram") {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
    }

    // Check if user has connected account for this platform
    const { data: socialAccount } = await supabase
      .from("social_accounts")
      .select("id")
      .eq("user_id", user.id)
      .eq("platform", platform)
      .single();

    if (!socialAccount) {
      return NextResponse.json(
        { error: `Please connect your ${platform} account first` },
        { status: 400 },
      );
    }

    // Create post
    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        platform,
        status: "scheduled",
        scheduled_at: scheduledAt,
        caption: caption || null,
      })
      .select()
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { error: postError?.message || "Failed to create post" },
        { status: 500 },
      );
    }

    // Upload images
    const mediaPromises = files.map((file, index) =>
      uploadImage(user.id, post.id, file, index),
    );

    const uploadResults = await Promise.all(mediaPromises);

    // Create post_media records
    const { error: mediaError } = await supabase.from("post_media").insert(
      uploadResults.map((result, index) => ({
        post_id: post.id,
        storage_path: result.path,
        public_url: result.publicUrl,
        position: index,
        media_type: "image",
      })),
    );

    if (mediaError) {
      // Cleanup: delete post and images
      await supabase.from("posts").delete().eq("id", post.id);
      await deletePostImages(user.id, post.id);
      return NextResponse.json(
        { error: "Failed to save media" },
        { status: 500 },
      );
    }

    // Fetch complete post with media
    const { data: completePost } = await supabase
      .from("posts")
      .select(
        `
        *,
        post_media (
          id,
          storage_path,
          public_url,
          position,
          media_type
        )
      `,
      )
      .eq("id", post.id)
      .single();

    return NextResponse.json(completePost, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
