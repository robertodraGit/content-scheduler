import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PostCard } from "@/components/posts/PostCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

async function DashboardContent() {
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
    <div className="flex-1 w-full flex flex-col gap-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Una vista unica su tutti i contenuti programmati e pubblicati
          </p>
        </div>
        <Link href="/protected/posts/new">
          <Button className="rounded-full px-6 py-2.5 shadow-sm hover:shadow-md transition-shadow">
            <Plus className="h-4 w-4 mr-2" />
            Nuovo post
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-feature-orange/90 p-5 border border-border/50 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground/90">Totale</span>
            <span className="text-2xl font-bold">{allPosts?.length || 0}</span>
          </div>
          <p className="text-xs text-foreground/70">Tutti i post</p>
        </div>
        <div className="rounded-2xl bg-feature-purple p-5 border border-border/50 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white/90">Programmati</span>
            <span className="text-2xl font-bold text-white">{scheduledPosts.length}</span>
          </div>
          <p className="text-xs text-white/70">In attesa di pubblicazione</p>
        </div>
        <div className="rounded-2xl bg-feature-green p-5 border border-border/50 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground/90">Pubblicati</span>
            <span className="text-2xl font-bold">{publishedPosts.length}</span>
          </div>
          <p className="text-xs text-foreground/70">Contenuti live</p>
        </div>
        <div className="rounded-2xl bg-feature-gray p-5 border border-border/50 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground/90">Errori</span>
            <span className="text-2xl font-bold">{failedPosts.length}</span>
          </div>
          <p className="text-xs text-foreground/70">Richiedono attenzione</p>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="rounded-2xl bg-card border border-border/50 shadow-sm p-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="rounded-full bg-landing-soft/60 px-1 py-1 mb-6">
            <TabsTrigger value="all" className="rounded-full">Tutti ({allPosts?.length || 0})</TabsTrigger>
            <TabsTrigger value="scheduled" className="rounded-full">
              Programmati ({scheduledPosts.length})
            </TabsTrigger>
            <TabsTrigger value="published" className="rounded-full">
              Pubblicati ({publishedPosts.length})
            </TabsTrigger>
            <TabsTrigger value="failed" className="rounded-full">Errori ({failedPosts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            {allPosts && allPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {allPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-landing-soft mb-4">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-base font-medium mb-2">Nessun post ancora</p>
                <p className="text-sm text-muted-foreground mb-6">
                  Crea il tuo primo post per iniziare a pianificare i contenuti
                </p>
                <Link href="/protected/posts/new">
                  <Button className="rounded-full px-6">Crea il primo post</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="scheduled" className="mt-0">
            {scheduledPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {scheduledPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-base font-medium mb-2">Nessun post programmato</p>
                <p className="text-sm">I post programmati appariranno qui</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="published" className="mt-0">
            {publishedPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {publishedPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-base font-medium mb-2">Nessun post pubblicato</p>
                <p className="text-sm">I post pubblicati appariranno qui</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="failed" className="mt-0">
            {failedPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {failedPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-base font-medium mb-2">Nessun errore</p>
                <p className="text-sm">Tutto funziona correttamente!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 w-full flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <p>Caricamento...</p>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
