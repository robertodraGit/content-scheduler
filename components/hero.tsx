export function Hero() {
  return (
    <section className="grid gap-8 sm:gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-start">
      <div className="space-y-5 sm:space-y-6">
        <p className="inline-flex items-center gap-2 rounded-full bg-landing-soft px-3 py-1 text-[11px] font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
          Piattaforma di content scheduling per creator e brand
        </p>
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground">
            Pianifica i tuoi contenuti
            <span className="block text-foreground/80">
              per TikTok e Instagram, in un unico posto.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
            Crea, programma e pubblica video e post in pochi minuti. Evita
            fogli sparsi, promemoria sul telefono e notti insonni prima delle
            campagne importanti.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <a
            href="/auth/sign-up"
            className="inline-flex items-center justify-center rounded-full bg-foreground text-background px-5 sm:px-6 py-2 text-xs sm:text-sm font-semibold shadow-sm hover:bg-foreground/90 transition-colors"
          >
            Crea un account gratuito
          </a>
          <a
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-full border border-border px-5 sm:px-6 py-2 text-xs sm:text-sm font-medium text-foreground hover:bg-landing-soft transition-colors"
          >
            Accedi alla dashboard
          </a>
        </div>
        <p className="text-[11px] sm:text-xs text-muted-foreground">
          Nessuna carta richiesta. Puoi collegare in seguito TikTok e Instagram,
          quando sei pronto.
        </p>
      </div>

      <div className="relative mt-2 sm:mt-0">
        <div className="relative rounded-3xl border border-border/70 bg-landing-soft px-4 py-4 sm:px-5 sm:py-5 shadow-inner">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Prossime pubblicazioni
              </p>
              <p className="text-sm font-medium text-foreground">
                Settimana sempre coperta
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#FBBF24]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#EF4444]" />
            </div>
          </div>

          <div className="space-y-2.5 text-[11px] sm:text-xs">
            <div className="flex items-center justify-between rounded-2xl bg-white/70 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black text-[10px] text-white">
                  TT
                </span>
                <div className="space-y-0.5">
                  <p className="font-medium text-slate-900">
                    3 video programmati
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Domani, fascia 18:00 - 20:00
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-slate-900 text-white px-2 py-0.5 text-[10px]">
                TikTok
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-white/60 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-[#F97316] via-[#EC4899] to-[#6366F1] text-[10px] text-white">
                  IG
                </span>
                <div className="space-y-0.5">
                  <p className="font-medium text-slate-900">
                    Carousel campagna Q1
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Giovedì, ore 10:30
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-white text-slate-700 border border-slate-200 px-2 py-0.5 text-[10px]">
                Instagram
              </span>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300/80 px-3 py-2 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium text-slate-800">
                  Aggiungi il tuo prossimo contenuto
                </p>
                <p className="text-[10px] text-slate-500">
                  Trascina media, scrivi la caption e scegli la data.
                </p>
              </div>
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white text-[12px]">
                +
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
