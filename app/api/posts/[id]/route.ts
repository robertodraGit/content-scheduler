import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deletePostImages } from "@/lib/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { data, error } = await supabase
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
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Check if post exists and belongs to user
  const { data: existingPost } = await supabase
    .from("posts")
    .select("id, status")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!existingPost) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Don't allow editing published or publishing posts
  if (
    existingPost.status === "published" ||
    existingPost.status === "publishing"
  ) {
    return NextResponse.json(
      { error: "Cannot edit published or publishing posts" },
      { status: 400 },
    );
  }

  const body = await request.json();
  const { scheduled_at, caption } = body;

  const updateData: Record<string, unknown> = {};
  if (scheduled_at !== undefined) updateData.scheduled_at = scheduled_at;
  if (caption !== undefined) updateData.caption = caption;

  const { data, error } = await supabase
    .from("posts")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Check if post exists and belongs to user
  const { data: post } = await supabase
    .from("posts")
    .select("id, status")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Don't allow deleting published or publishing posts
  if (post.status === "published" || post.status === "publishing") {
    return NextResponse.json(
      { error: "Cannot delete published or publishing posts" },
      { status: 400 },
    );
  }

  // Delete images from storage
  await deletePostImages(user.id, id);

  // Delete post (cascade will delete post_media)
  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
