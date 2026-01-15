"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

interface DeletePostButtonProps {
  postId: string;
}

export function DeletePostButton({ postId }: DeletePostButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Sei sicuro di voler eliminare questo post?")) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Errore nell'eliminazione del post");
      }

      router.push("/protected/dashboard");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Errore sconosciuto");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="destructive"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Eliminazione...
        </>
      ) : (
        <>
          <Trash2 className="h-4 w-4 mr-2" />
          Elimina
        </>
      )}
    </Button>
  );
}
