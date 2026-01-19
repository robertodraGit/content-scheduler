import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthShell } from "@/components/auth-shell";
import Link from "next/link";

export default function Page() {
  return (
    <AuthShell>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Controlla la tua email</CardTitle>
          <CardDescription>
            Ti abbiamo inviato un link per confermare l&apos;account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Apri la casella di posta che hai usato per registrarti e segui le
            istruzioni per attivare il tuo profilo su Content Scheduler.
          </p>
          <p className="text-xs text-muted-foreground">
            Se non trovi l&apos;email, controlla anche nella cartella spam o
            promozioni.
          </p>
          <div className="pt-2">
            <Link
              href="/auth/login"
              className="text-sm font-medium underline underline-offset-4"
            >
              Vai al login
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
