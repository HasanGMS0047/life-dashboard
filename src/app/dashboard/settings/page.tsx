"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Sun, Moon, Download, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { useThemeStore } from "@/store/themeStore";
import { exportData, importData } from "@/lib/backup";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const [importStatus, setImportStatus] = useState<{ type: "error" | "success"; message: string } | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameStatus, setNameStatus] = useState<{ type: "error" | "success"; message: string } | null>(null);

  useEffect(() => {
    if (session?.user?.name !== undefined) setName(session.user.name ?? "");
  }, [session?.user?.name]);

  const handleNameSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameLoading(true);
    setNameStatus(null);
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setNameStatus({ type: "error", message: data?.error || "Couldn't save your name." });
        return;
      }
      await updateSession({ name: data.name ?? null });
      setNameStatus({ type: "success", message: "Name updated." });
    } catch (err) {
      console.error("Name update failed", err);
      setNameStatus({ type: "error", message: "Couldn't save your name. Please try again." });
    } finally {
      setNameLoading(false);
    }
  };

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ type: "error" | "success"; message: string } | null>(
    null
  );

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (newPassword.length < 8) {
      setPasswordStatus({ type: "error", message: "New password must be at least 8 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: "error", message: "New passwords don't match." });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setPasswordStatus({ type: "error", message: data?.error || "Couldn't update your password." });
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordStatus({ type: "success", message: "Password updated." });
    } catch (err) {
      console.error("Password update failed", err);
      setPasswordStatus({ type: "error", message: "Couldn't update your password. Please try again." });
    } finally {
      setPasswordLoading(false);
    }
  };

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
        <h3 className="font-serif text-lg font-semibold text-foreground mb-1">Account</h3>
        <p className="text-sm text-muted mb-5">Update your name or password.</p>

        <form onSubmit={handleNameSave} className="flex flex-col gap-2 mb-6">
          <label className="text-sm font-medium text-foreground" htmlFor="account-name">
            Name
          </label>
          <div className="flex flex-wrap gap-3">
            <input
              id="account-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="flex-1 min-w-[12rem] bg-background/50 border border-border rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta/50 placeholder:text-muted/70"
            />
            <Button type="submit" disabled={nameLoading} size="sm" className="shrink-0">
              {nameLoading ? "Saving..." : "Save Name"}
            </Button>
          </div>
          {nameStatus && (
            <p className={cn("text-sm", nameStatus.type === "success" ? "text-olive" : "text-terracotta")}>
              {nameStatus.message}
            </p>
          )}
        </form>

        <form onSubmit={handlePasswordSave} className="flex flex-col gap-2 pt-5 border-t border-border">
          <span className="text-sm font-medium text-foreground">Password</span>
          <PasswordInput
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            autoComplete="current-password"
          />
          <PasswordInput
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password (min. 8 characters)"
            autoComplete="new-password"
          />
          <PasswordInput
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            autoComplete="new-password"
          />
          <Button type="submit" disabled={passwordLoading} size="sm" className="self-start mt-1">
            {passwordLoading ? "Saving..." : "Change Password"}
          </Button>
          {passwordStatus && (
            <p className={cn("text-sm", passwordStatus.type === "success" ? "text-olive" : "text-terracotta")}>
              {passwordStatus.message}
            </p>
          )}
        </form>
      </Card>

      <Card className="p-6 bg-background border-2 mt-6">
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
