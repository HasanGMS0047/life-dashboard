"use client";

import { useEffect } from "react";
import { Home, BookOpen, Heart, Grid, User, Clapperboard, Clock, Images, X, CalendarDays } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SearchBar } from "@/components/dashboard/SearchBar";

const navItems = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: CalendarDays, label: "Calendar", href: "/dashboard/calendar" },
  { icon: Clock, label: "Timeline", href: "/dashboard/timeline" },
  { icon: BookOpen, label: "Journal", href: "/dashboard/journal" },
  { icon: Images, label: "Gallery", href: "/dashboard/gallery" },
  { icon: Heart, label: "Heart Patterns", href: "/dashboard/patterns" },
  { icon: Grid, label: "Heatmap", href: "/dashboard/heatmap" },
  { icon: User, label: "Account", href: "/dashboard/account" },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    onMobileClose();
    // Only pathname should re-trigger this — onMobileClose is stable enough in practice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {/* Desktop rail */}
      <aside className="hidden md:flex w-16 h-full border-r border-border flex-col items-center py-4 bg-surface/50">
        <Link
          href="/dashboard/replay"
          title="Life Replay"
          className={cn(
            "mb-8 w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
            pathname.startsWith("/dashboard/replay")
              ? "bg-terracotta/10 text-terracotta shadow-sm border border-terracotta/20"
              : "text-muted hover:bg-black/5 hover:text-foreground"
          )}
        >
          <Clapperboard className="w-5 h-5" />
        </Link>

        <nav className="flex-1 flex flex-col gap-4 w-full px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={cn(
                  "w-full aspect-square rounded-2xl flex items-center justify-center transition-all",
                  isActive
                    ? "bg-terracotta/10 text-terracotta shadow-sm border border-terracotta/20"
                    : "text-muted hover:bg-black/5 hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
            />
            <motion.div
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-0 left-0 bottom-0 w-72 max-w-[80vw] bg-surface z-50 md:hidden flex flex-col p-4 gap-4 shadow-2xl overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <span className="font-serif text-lg font-semibold text-foreground">Menu</span>
                <button
                  onClick={onMobileClose}
                  className="p-2 -m-2 text-muted hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <SearchBar />

              <Link
                href="/dashboard/replay"
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
                  pathname.startsWith("/dashboard/replay")
                    ? "bg-terracotta/10 text-terracotta"
                    : "text-foreground hover:bg-black/5"
                )}
              >
                <Clapperboard className="w-5 h-5" />
                <span className="text-sm font-medium">Life Replay</span>
              </Link>

              <nav className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
                        isActive
                          ? "bg-terracotta/10 text-terracotta"
                          : "text-foreground hover:bg-black/5"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
