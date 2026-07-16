"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Download, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useThemeStore } from "@/store/themeStore";
import { exportData, importData } from "@/lib/backup";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const [importStatus, setImportStatus] = useState<{ type: "error" | "success"; message: string } | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    const confirmed = window.confirm(
      "Importing a backup will overwrite your current journal, tracking, and other data on this device. Continue?"
    );
    if (confirmed) fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      await importData(file);
      setImportStatus({ type: "success", message: "Backup restored! Reloading..." });
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      setImportStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Couldn't import that file.",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <h1 className="font-serif text-4xl text-foreground font-semibold leading-snug">
          Settings.
        </h1>
        <p className="text-muted text-lg mt-2 font-medium">Make this space feel like yours.</p>
      </motion.div>

      <Card className="p-6 bg-background border-2">
        <h3 className="font-serif text-lg font-semibold text-foreground mb-1">Appearance</h3>
        <p className="text-sm text-muted mb-5">
          Switch between a sunlit cottage and a quiet, moonlit night.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setTheme("day")}
            className={cn(
              "flex flex-col items-center gap-2 rounded-2xl border-2 p-5 transition-colors",
              theme === "day"
                ? "border-terracotta bg-terracotta/10"
                : "border-border hover:bg-black/5"
            )}
          >
            <Sun className={cn("w-6 h-6", theme === "day" ? "text-terracotta" : "text-muted")} />
            <span
              className={cn(
                "text-sm font-medium",
                theme === "day" ? "text-terracotta" : "text-foreground"
              )}
            >
              Day
            </span>
          </button>

          <button
            onClick={() => setTheme("night")}
            className={cn(
              "flex flex-col items-center gap-2 rounded-2xl border-2 p-5 transition-colors",
              theme === "night"
                ? "border-terracotta bg-terracotta/10"
                : "border-border hover:bg-black/5"
            )}
          >
            <Moon className={cn("w-6 h-6", theme === "night" ? "text-terracotta" : "text-muted")} />
            <span
              className={cn(
                "text-sm font-medium",
                theme === "night" ? "text-terracotta" : "text-foreground"
              )}
            >
              Night
            </span>
          </button>
        </div>
      </Card>

      <Card className="p-6 bg-background border-2 mt-6">
        <h3 className="font-serif text-lg font-semibold text-foreground mb-1">Your Data</h3>
        <p className="text-sm text-muted mb-5">
          Your story is safely stored in your account, so it follows you to any device.
          Exporting a backup now and then is still a good habit for extra peace of mind.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportData}
            className="flex items-center gap-2 rounded-full border-2 border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-black/5 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export My Data
          </button>

          <button
            onClick={handleImportClick}
            className="flex items-center gap-2 rounded-full border-2 border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-black/5 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import Backup
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {importStatus && (
          <p
            className={cn(
              "text-sm mt-3",
              importStatus.type === "success" ? "text-olive" : "text-terracotta"
            )}
          >
            {importStatus.message}
          </p>
        )}
      </Card>
    </div>
  );
}
