import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getInstagramAuthUrl } from "@/lib/social/instagram";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/auth/instagram/callback`;
  const state = Buffer.from(user.id).toString("base64");

  const authUrl = getInstagramAuthUrl(redirectUri, state);
  redirect(authUrl);
}
