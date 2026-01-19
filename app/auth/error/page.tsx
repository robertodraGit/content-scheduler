import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthShell } from "@/components/auth-shell";
import { Suspense } from "react";

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      {params?.error ? (
        <p className="text-sm text-muted-foreground">
          Code error: {params.error}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          An unspecified error occurred.
        </p>
      )}
    </>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  return (
    <AuthShell>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Qualcosa è andato storto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Suspense>
            <ErrorContent searchParams={searchParams} />
          </Suspense>
          <p className="text-xs text-muted-foreground">
            Se il problema persiste, riprova tra qualche minuto oppure effettua
            nuovamente l&apos;accesso.
          </p>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
