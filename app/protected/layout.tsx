import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { MobileNavMenu } from "@/components/mobile-nav-menu";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center bg-background">
      <div className="flex-1 w-full flex flex-col gap-16 items-center">
        <nav className="w-full flex justify-center border-b border-border/60 h-16 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="w-full max-w-5xl flex items-center justify-between px-4 sm:px-6 lg:px-8 text-sm">
            <div className="flex items-center gap-4 sm:gap-6">
              <Link
                href={"/protected/dashboard"}
                className="flex items-center gap-2 sm:gap-3 group"
              >
                <span className="inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-border/60 bg-landing-soft group-hover:bg-landing-soft/80 transition-colors">
                  <span className="h-3 w-3 sm:h-4 sm:w-4 rounded-sm bg-[#FF6B35]" />
                </span>
                <div className="flex flex-col leading-tight">
                  <span className="text-xs sm:text-sm font-semibold tracking-tight">
                    Content Scheduler
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-muted-foreground hidden sm:block">
                    TikTok &amp; Instagram
                  </span>
                </div>
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-6">
                <Link
                  href="/protected/dashboard"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium px-2 py-1 rounded-lg hover:bg-landing-soft/50"
                >
                  Dashboard
                </Link>
                <Link
                  href="/protected/posts/new"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium px-2 py-1 rounded-lg hover:bg-landing-soft/50"
                >
                  Nuovo post
                </Link>
                <Link
                  href="/protected/settings"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium px-2 py-1 rounded-lg hover:bg-landing-soft/50"
                >
                  Impostazioni
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!hasEnvVars ? (
                <EnvVarWarning />
              ) : (
                <>
                  {/* Mobile Menu */}
                  <div className="md:hidden">
                    <MobileNavMenu />
                  </div>

                  {/* Auth Button */}
                  <Suspense>
                    <AuthButton />
                  </Suspense>
                </>
              )}
            </div>
          </div>
        </nav>
        <div className="flex-1 flex flex-col gap-10 w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </div>
    </main>
  );
}
