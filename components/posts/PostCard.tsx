"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Calendar, Image as ImageIcon, MessageSquare } from "lucide-react";
import { type Post } from "@/lib/types";
import Link from "next/link";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const platformLabel = post.platform === "tiktok" ? "TikTok" : "Instagram";
  const mediaCount = post.post_media?.length || 0;

  return (
    <Link href={`/protected/posts/${post.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {platformLabel} Post
            </CardTitle>
            <StatusBadge status={post.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {post.caption && (
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.caption}
                </p>
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <ImageIcon className="h-4 w-4" />
                <span>{mediaCount} {mediaCount === 1 ? "immagine" : "immagini"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(post.scheduled_at), "PPp", { locale: it })}
                </span>
              </div>
            </div>

            {post.error_message && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {post.error_message}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
