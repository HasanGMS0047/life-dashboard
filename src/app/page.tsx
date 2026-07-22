"use client";

import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="auth-scenery min-h-screen flex items-center justify-center p-4 sm:p-8 relative">
      {/* Soft overlay to ensure the scenery is calm and doesn't overwhelm the UI */}
      <div className="auth-overlay absolute inset-0" />

      {/* Main Container Card resembling the app window */}
      <div className="w-full max-w-5xl bg-surface rounded-3xl border border-border shadow-2xl shadow-terracotta/10 overflow-hidden flex flex-col relative z-10">
        
        {/* Top App Bar */}
        <div className="h-14 border-b border-border flex items-center justify-between px-6">
          <button className="text-muted hover:text-foreground transition-colors">
            <RotateCcw className="w-5 h-5" />
          </button>
          
          <span className="hidden sm:block font-semibold text-sm tracking-wide">
            Life Simulator Dashboard
          </span>
          
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-terracotta transition-colors">
              Log in
            </Link>
            <Link href="/register">
              <Button size="sm" className="rounded-full bg-terracotta text-white hover:bg-terracotta/90 h-8 px-4">
                Start Setup
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 relative">
          
          <h1 className="font-serif text-5xl md:text-6xl text-foreground text-center mb-8 max-w-3xl leading-tight">
            Your Story Is A <br/> Beautiful Tapestry.
          </h1>

          <div className="relative w-full max-w-2xl aspect-[16/9] mb-8 rounded-2xl overflow-hidden border-4 border-surface shadow-md">
            <Image
              src="/cozy_desk_hero.png"
              alt="Cozy desk by the window"
              fill
              sizes="(max-width: 768px) 100vw, 672px"
              className="object-cover"
              priority
            />
          </div>

          <p className="text-sm md:text-base text-foreground font-medium mb-8 text-center max-w-lg">
            Collect memories, build relationships, and discover your heart. Then weave your journey together.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-full bg-terracotta text-white hover:bg-terracotta/90">
                Begin Your Tale
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full border-2 border-terracotta text-terracotta hover:bg-terracotta/5">
              Explore the World
            </Button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
