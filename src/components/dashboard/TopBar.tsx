"use client";

import { useState } from "react";
import { Sun, Moon, User, Menu, HelpCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useThemeStore } from "@/store/themeStore";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { HelpModal } from "@/components/dashboard/HelpModal";

const PAGE_TITLES: { href: string; label: string }[] = [
  { href: "/dashboard/replay", label: "Life Replay" },
  { href: "/dashboard/calendar", label: "Calendar" },
  { href: "/dashboard/heatmap", label: "Heatmap" },
  { href: "/dashboard/timeline", label: "Timeline" },
  { href: "/dashboard/journal", label: "Journal" },
  { href: "/dashboard/gallery", label: "Memory Gallery" },
  { href: "/dashboard/patterns", label: "Heart Patterns" },
  { href: "/dashboard/account", label: "Your Account" },
  { href: "/dashboard", label: "Main Home" },
];

function getPageTitle(pathname: string) {
  const match = PAGE_TITLES.find(
    (p) => pathname === p.href || pathname.startsWith(`${p.href}/`)
  );
  return match?.label ?? "Main Home";
}

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const { data: session } = useSession();
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-4 md:px-6 shrink-0 bg-surface/50">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -m-2 text-muted hover:text-foreground transition-colors shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="font-semibold text-sm tracking-wide text-foreground flex items-center gap-2 truncate">
          {title}
        </div>
      </div>

      <div className="flex-1 max-w-sm mx-auto hidden md:block">
        <SearchBar />
      </div>

      <div className="flex items-center gap-4 text-muted">
        <button
          onClick={() => setHelpOpen(true)}
          title="What does what?"
          className="p-2 -m-2 hover:text-foreground transition-colors"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
        <button
          onClick={() => setTheme(theme === "day" ? "night" : "day")}
          title={theme === "day" ? "Switch to night" : "Switch to day"}
          className="p-2 -m-2 hover:text-foreground transition-colors"
        >
          {theme === "day" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <Link
          href="/dashboard/account"
          title={session?.user?.email ? `Account (${session.user.email})` : "Account"}
          className="w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center overflow-hidden cursor-pointer hover:border-terracotta transition-colors"
        >
          <User className="w-4 h-4 text-muted" />
        </Link>
      </div>

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </header>
  );
}
