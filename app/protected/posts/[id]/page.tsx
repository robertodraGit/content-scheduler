import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PostCard } from "@/components/posts/PostCard";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { DeletePostButton } from "@/components/posts/DeletePostButton";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { id } = await params;

  const { data: post, error } = await supabase
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

  if (error || !post) {
    redirect("/protected/dashboard");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">
            Dettaglio post
          </h1>
          <p className="text-sm text-muted-foreground">
            Rivedi contenuti, stato di pubblicazione e programmazione.
          </p>
        </div>
        {post.status !== "published" && post.status !== "publishing" && (
          <DeletePostButton postId={post.id} />
        )}
      </div>

      <PostCard post={post} />
    </div>
  );
}
