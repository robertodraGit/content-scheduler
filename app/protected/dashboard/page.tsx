import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PostCard } from "@/components/posts/PostCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch all posts
  const { data: allPosts } = await supabase
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

  const scheduledPosts = allPosts?.filter((p) => p.status === "scheduled") || [];
  const publishedPosts = allPosts?.filter((p) => p.status === "published") || [];
  const failedPosts = allPosts?.filter((p) => p.status === "failed") || [];

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/protected/posts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Post
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Tutti ({allPosts?.length || 0})</TabsTrigger>
          <TabsTrigger value="scheduled">
            Programmati ({scheduledPosts.length})
          </TabsTrigger>
          <TabsTrigger value="published">
            Pubblicati ({publishedPosts.length})
          </TabsTrigger>
          <TabsTrigger value="failed">Errori ({failedPosts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {allPosts && allPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nessun post ancora. Crea il tuo primo post!</p>
              <Link href="/protected/posts/new">
                <Button className="mt-4">Crea Post</Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="scheduled" className="mt-6">
          {scheduledPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scheduledPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Nessun post programmato
            </div>
          )}
        </TabsContent>

        <TabsContent value="published" className="mt-6">
          {publishedPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {publishedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Nessun post pubblicato
            </div>
          )}
        </TabsContent>

        <TabsContent value="failed" className="mt-6">
          {failedPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {failedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Nessun errore
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
