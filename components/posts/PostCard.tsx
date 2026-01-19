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
      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-border/60 rounded-2xl overflow-hidden group">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${
                post.platform === "tiktok" 
                  ? "bg-black text-white" 
                  : "bg-gradient-to-tr from-[#F97316] via-[#EC4899] to-[#6366F1] text-white"
              }`}>
                <span className="text-xs font-semibold">
                  {post.platform === "tiktok" ? "TT" : "IG"}
                </span>
              </div>
              <CardTitle className="text-base font-semibold">
                {platformLabel}
              </CardTitle>
            </div>
            <StatusBadge status={post.status} />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {post.caption && (
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {post.caption}
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border/40">
              <div className="flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5" />
                <span>{mediaCount} {mediaCount === 1 ? "media" : "media"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span className="font-medium">
                  {format(new Date(post.scheduled_at), "d MMM, HH:mm", { locale: it })}
                </span>
              </div>
            </div>

            {post.error_message && (
              <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded-lg">
                {post.error_message}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
