import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTikTokAuthUrl } from "@/lib/social/tiktok";
import { cookies } from "next/headers";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const csrfState = Math.random().toString(36).substring(2);
  const cookieStore = await cookies();
  cookieStore.set('csrfState', csrfState, { maxAge: 60000 });

  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/auth/tiktok/callback`;
  const state = Buffer.from(user.id).toString("base64");

  const { url: authUrl, codeVerifier } = getTikTokAuthUrl(redirectUri, csrfState);
  
  // Store code verifier in cookie for later use in callback
  cookieStore.set('tiktok_code_verifier', codeVerifier, { 
    maxAge: 600, // 10 minutes
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  redirect(authUrl);
}
