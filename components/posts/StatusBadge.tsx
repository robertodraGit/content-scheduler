"use client";

import { Badge } from "@/components/ui/badge";
import { type post_status } from "@/lib/types";

interface StatusBadgeProps {
  status: post_status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants: Record<
    post_status,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
  > = {
    draft: { label: "Bozza", variant: "outline" },
    scheduled: { label: "Programmato", variant: "default" },
    publishing: { label: "Pubblicazione...", variant: "secondary" },
    published: { label: "Pubblicato", variant: "default" },
    failed: { label: "Errore", variant: "destructive" },
  };

  const config = variants[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
