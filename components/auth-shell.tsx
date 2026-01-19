import Link from "next/link";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-landing-orange flex items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-lg bg-landing-surface rounded-[32px] border border-border/50 shadow-[0_24px_80px_rgba(15,23,42,0.24)] overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-[#FF6B35] via-[#8B5CF6] to-[#22C55E]" />

        <div className="px-6 sm:px-8 pt-6 sm:pt-7 pb-8 sm:pb-10">
          <nav className="flex items-center justify-between mb-8 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-landing-soft">
                <span className="h-3 w-3 rounded-sm bg-[#FF6B35]" />
              </span>
              <div className="flex flex-col leading-tight">
                <span className="font-semibold tracking-tight">
                  Content Scheduler
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Area account
                </span>
              </div>
            </div>
            <Link
              href="/"
              className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-landing-soft transition-colors"
            >
              Torna alla home
            </Link>
          </nav>

          <div className="space-y-6">{children}</div>
        </div>
      </div>
    </main>
  );
}

