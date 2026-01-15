import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SocialAccountCard } from "@/components/settings/SocialAccountCard";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: socialAccounts } = await supabase
    .from("social_accounts")
    .select("*")
    .eq("user_id", user.id);

  const tiktokAccount = socialAccounts?.find((a) => a.platform === "tiktok");
  const instagramAccount = socialAccounts?.find(
    (a) => a.platform === "instagram",
  );

  return (
    <div className="flex-1 w-full flex flex-col gap-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Impostazioni</h1>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Account Social</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Collega i tuoi account social per poter pubblicare contenuti
            automaticamente.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <SocialAccountCard
              platform="tiktok"
              account={tiktokAccount}
            />
            <SocialAccountCard
              platform="instagram"
              account={instagramAccount}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
