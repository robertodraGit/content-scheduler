"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MediaUploader } from "@/components/posts/MediaUploader";
import { Loader2 } from "lucide-react";

export default function NewPostPage() {
  const router = useRouter();
  const [platform, setPlatform] = useState<"tiktok" | "instagram" | "">("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [minDateTime, setMinDateTime] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!platform || !scheduledAt || files.length === 0) {
      setError("Compila tutti i campi obbligatori");
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert the local datetime selected by the user into an ISO string with timezone (UTC)
      // so that Postgres (TIMESTAMPTZ) stores the correct instant in time.
      const scheduledAtDate = new Date(scheduledAt);
      if (isNaN(scheduledAtDate.getTime())) {
        throw new Error("Data/ora di pubblicazione non valida");
      }

      const formData = new FormData();
      formData.append("platform", platform);
      formData.append("scheduled_at", scheduledAtDate.toISOString());
      if (caption) {
        formData.append("caption", caption);
      }
      files.forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Errore nella creazione del post");
      }

      router.push("/protected/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum datetime (now) on client to avoid Date mismatch between SSR and CSR
  useEffect(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setMinDateTime(now.toISOString().slice(0, 16));
  }, []);

  return (
    <div className="flex-1 w-full flex flex-col gap-8 max-w-4xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          Crea nuovo post
        </h1>
        <p className="text-sm text-muted-foreground">
          Definisci piattaforma, orario e contenuti multimediali del tuo
          prossimo contenuto.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dettagli Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Piattaforma *</Label>
              <Select
                value={platform}
                onValueChange={(value) =>
                  setPlatform(value as "tiktok" | "instagram")
                }
              >
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Seleziona piattaforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduled_at">Data e Ora di Pubblicazione *</Label>
              <Input
                id="scheduled_at"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={minDateTime}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="caption">Didascalia (opzionale)</Label>
              <Textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Aggiungi una didascalia al tuo post..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Immagini</CardTitle>
          </CardHeader>
          <CardContent>
            <MediaUploader
              onFilesChange={setFiles}
              maxFiles={10}
            />
          </CardContent>
        </Card>

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Annulla
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvataggio...
              </>
            ) : (
              "Salva Post"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
