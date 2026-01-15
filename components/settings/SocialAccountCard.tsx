"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Link as LinkIcon, X } from "lucide-react";
import { type SocialAccount } from "@/lib/types";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface SocialAccountCardProps {
  platform: "tiktok" | "instagram";
  account: SocialAccount | undefined;
}

export function SocialAccountCard({
  platform,
  account,
}: SocialAccountCardProps) {
  const router = useRouter();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const platformName = platform === "tiktok" ? "TikTok" : "Instagram";
  const platformColor =
    platform === "tiktok" ? "bg-black text-white" : "bg-gradient-to-r from-purple-500 to-pink-500 text-white";

  const handleConnect = () => {
    router.push(`/api/auth/${platform}`);
  };

  const handleDisconnect = async () => {
    if (!confirm(`Sei sicuro di voler scollegare il tuo account ${platformName}?`)) {
      return;
    }

    setIsDisconnecting(true);

    try {
      const response = await fetch(`/api/auth/${platform}/disconnect`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Errore nella disconnessione");
      }

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Errore sconosciuto");
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className={`p-2 rounded ${platformColor}`}>
            {platform === "tiktok" ? "🎵" : "📷"}
          </div>
          {platformName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {account ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-green-500" />
              <span>Collegato come @{account.platform_username || "N/A"}</span>
            </div>
            <Button
              variant="outline"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Scollega
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Non hai ancora collegato il tuo account {platformName}
            </p>
            <Button onClick={handleConnect} className="w-full">
              <LinkIcon className="h-4 w-4 mr-2" />
              Collega Account
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
