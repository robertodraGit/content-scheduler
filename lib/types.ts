export type platform_type = "tiktok" | "instagram";
export type post_status = "draft" | "scheduled" | "publishing" | "published" | "failed";
export type media_type = "image" | "video";

export interface PostMedia {
  id: string;
  post_id: string;
  storage_path: string;
  public_url: string;
  position: number;
  media_type: media_type;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  platform: platform_type;
  status: post_status;
  scheduled_at: string;
  published_at: string | null;
  caption: string | null;
  error_message: string | null;
  platform_post_id: string | null;
  created_at: string;
  updated_at: string;
  post_media?: PostMedia[];
}

export interface SocialAccount {
  id: string;
  user_id: string;
  platform: platform_type;
  platform_user_id: string;
  platform_username: string | null;
  created_at: string;
  updated_at: string;
}
