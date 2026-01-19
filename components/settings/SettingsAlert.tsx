"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { X, CheckCircle2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export function SettingsAlert() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success) {
      const messages: Record<string, string> = {
        tiktok_connected: "Account TikTok collegato con successo!",
        instagram_connected: "Account Instagram collegato con successo!",
      };
      setMessage({
        type: "success",
        text: messages[success] || "Operazione completata con successo!",
      });
    } else if (error) {
      const messages: Record<string, string> = {
        no_code: "Codice di autorizzazione mancante. Riprova.",
        missing_code_verifier: "Errore nella verifica del codice. Riprova.",
        database_error: "Errore nel salvataggio dei dati. Riprova più tardi.",
        unknown_error: "Si è verificato un errore sconosciuto.",
      };
      setMessage({
        type: "error",
        text: messages[error] || decodeURIComponent(error),
      });
    }

    // Auto-dismiss after 5 seconds
    if (success || error) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (!message) return null;

  return (
    <Card
      className={`mb-6 ${
        message.type === "success"
          ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
          : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
      }`}
    >
      <div className="p-4 flex items-start gap-3">
        {message.type === "success" ? (
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
        ) : (
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
        )}
        <p
          className={`flex-1 text-sm ${
            message.type === "success"
              ? "text-green-800 dark:text-green-200"
              : "text-red-800 dark:text-red-200"
          }`}
        >
          {message.text}
        </p>
        <button
          onClick={() => setMessage(null)}
          className={`flex-shrink-0 ${
            message.type === "success"
              ? "text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
              : "text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
          }`}
          aria-label="Chiudi messaggio"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}
