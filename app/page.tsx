import { Hero } from "@/components/hero";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-landing-orange flex items-center justify-center px-4 py-10">
      <div className="relative max-w-5xl w-full bg-landing-surface rounded-[32px] border border-border/50 shadow-[0_24px_80px_rgba(15,23,42,0.24)] overflow-hidden">
        {/* Top border accent */}
        <div className="h-2 w-full bg-gradient-to-r from-[#FF6B35] via-[#8B5CF6] to-[#22C55E]" />

        {/* Content */}
        <div className="px-6 sm:px-10 pt-6 sm:pt-8 pb-10 sm:pb-14">
          {/* Navbar */}
          <nav className="flex items-center justify-between mb-10 sm:mb-14 text-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-landing-soft">
                <span className="h-4 w-4 rounded-sm bg-[#FF6B35]" />
              </span>
              <div className="flex flex-col leading-tight">
                <span className="font-semibold tracking-tight">
                  Content Scheduler
                </span>
                <span className="text-[11px] text-muted-foreground">
                  TikTok &amp; Instagram
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/auth/login"
                className="hidden sm:inline-flex items-center rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center rounded-full bg-foreground text-background px-4 sm:px-5 py-1.5 text-xs font-semibold shadow-sm hover:bg-foreground/90 transition-colors"
              >
                Inizia gratis
              </Link>
            </div>
          </nav>

          {/* Hero */}
          <Hero />

          {/* Feature grid */}
          <section className="mt-10 grid gap-4 sm:gap-5 sm:grid-cols-2">
            <div className="rounded-3xl bg-feature-orange/90 text-foreground/95 p-5 sm:p-6 flex flex-col justify-between shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-sm">
                  ⏱
                </span>
                <span className="h-8 w-8 rounded-full border border-black/10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-semibold">
                  Pianificazione intelligente
                </h3>
                <p className="text-xs sm:text-sm text-black/80">
                  Imposta una volta il tuo calendario editoriale e lascia che il
                  sistema pubblichi i contenuti nei momenti migliori per te.
                </p>
              </div>
            </div>

            <div className="rounded-3xl bg-feature-purple text-foreground/95 p-5 sm:p-6 flex flex-col justify-between shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm">
                  📲
                </span>
                <span className="h-8 w-8 rounded-full border border-white/20" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-semibold">
                  Multi‑piattaforma
                </h3>
                <p className="text-xs sm:text-sm text-white/90">
                  Pianifica una volta, pubblica su TikTok e Instagram
                  contemporaneamente mantenendo il controllo sui dettagli.
                </p>
              </div>
            </div>

            <div className="rounded-3xl bg-feature-green text-foreground/95 p-5 sm:p-6 flex flex-col justify-between shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-sm">
                  📈
                </span>
                <span className="h-8 w-8 rounded-full border border-black/10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-semibold">
                  Insight immediati
                </h3>
                <p className="text-xs sm:text-sm text-black/80">
                  Visualizza performance, orari migliori e risultati delle
                  campagne in un unico pannello chiaro.
                </p>
              </div>
            </div>

            <div className="rounded-3xl bg-feature-gray text-foreground/95 p-5 sm:p-6 flex flex-col justify-between shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-sm">
                  ⚙️
                </span>
                <span className="h-8 w-8 rounded-full border border-black/10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-semibold">
                  Automazione completa
                </h3>
                <p className="text-xs sm:text-sm text-black/80">
                  Dalle bozze alla pubblicazione: reminder, approvazioni e
                  pubblicazione automatica, senza passare dal telefono.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
