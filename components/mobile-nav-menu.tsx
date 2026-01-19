"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export function MobileNavMenu() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <DropdownMenuTrigger asChild className="md:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full hover:bg-landing-soft"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
          <span className="sr-only">Menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 rounded-2xl border border-border/50 shadow-lg bg-card p-2 mt-2"
      >
        <DropdownMenuItem asChild>
          <Link
            href="/protected/dashboard"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium cursor-pointer hover:bg-landing-soft transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/protected/posts/new"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium cursor-pointer hover:bg-landing-soft transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Nuovo post
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/protected/settings"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium cursor-pointer hover:bg-landing-soft transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Impostazioni
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
