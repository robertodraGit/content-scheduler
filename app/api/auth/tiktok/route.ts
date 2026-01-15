import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTikTokAuthUrl } from "@/lib/social/tiktok";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/auth/tiktok/callback`;
  const state = Buffer.from(user.id).toString("base64");

  const authUrl = getTikTokAuthUrl(redirectUri, state);
  redirect(authUrl);
}
