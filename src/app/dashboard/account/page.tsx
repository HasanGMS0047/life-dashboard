"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { Sun, Moon, Download, Upload, LogOut, X as XIcon, User as UserIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { useThemeStore } from "@/store/themeStore";
import { exportData, importData } from "@/lib/backup";
import { cn } from "@/lib/utils";

type AccentKey = "terracotta" | "olive" | "mustard" | "blush" | "sky";

const ACCENTS: { key: AccentKey; label: string; swatch: string; border: string; text: string }[] = [
  { key: "terracotta", label: "Terracotta", swatch: "bg-terracotta", border: "border-terracotta", text: "text-terracotta" },
  { key: "olive", label: "Olive", swatch: "bg-olive", border: "border-olive", text: "text-olive" },
  { key: "mustard", label: "Mustard", swatch: "bg-mustard", border: "border-mustard", text: "text-mustard" },
  { key: "blush", label: "Blush", swatch: "bg-blush", border: "border-blush", text: "text-blush" },
  { key: "sky", label: "Sky", swatch: "bg-sky", border: "border-sky", text: "text-sky" },
];

function TagInput({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const value = draft.trim();
    if (!value) return;
    if (!items.includes(value)) onChange([...items, value]);
    setDraft("");
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1.5 bg-terracotta/10 text-terracotta border border-terracotta/20 rounded-full px-3 py-1 text-xs font-medium"
          >
            {item}
            <button
              type="button"
              onClick={() => onChange(items.filter((i) => i !== item))}
              className="hover:text-foreground transition-colors"
              aria-label={`Remove ${item}`}
            >
              <XIcon className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          }
        }}
        onBlur={commit}
        placeholder={placeholder}
        className="bg-background/50 border border-border rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta/50 placeholder:text-muted/70"
      />
    </div>
  );
}

export default function AccountPage() {
  const { data: session, update: updateSession } = useSession();
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const [name, setName] = useState("");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameStatus, setNameStatus] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ type: "error" | "success"; message: string } | null>(
    null
  );

  const [favoriteColor, setFavoriteColor] = useState<AccentKey | null>(null);
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [pets, setPets] = useState<string[]>([]);
  const [prefsLoading, setPrefsLoading] = useState(false);
  const [prefsStatus, setPrefsStatus] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const [importStatus, setImportStatus] = useState<{ type: "error" | "success"; message: string } | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session?.user?.name !== undefined) setName(session.user.name ?? "");
  }, [session?.user?.name]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/account");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setFavoriteColor((data.favoriteColor as AccentKey) ?? null);
        setHobbies(Array.isArray(data.hobbies) ? data.hobbies : []);
        setPets(Array.isArray(data.pets) ? data.pets : []);
      } catch (err) {
        console.error("Couldn't load preferences", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const accent = ACCENTS.find((a) => a.key === favoriteColor) ?? null;

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

  const savePrefs = async (next: { favoriteColor?: AccentKey | null; hobbies?: string[]; pets?: string[] }) => {
    setPrefsLoading(true);
    setPrefsStatus(null);
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setPrefsStatus({ type: "error", message: data?.error || "Couldn't save your preferences." });
        return;
      }
      setPrefsStatus({ type: "success", message: "Preferences saved." });
    } catch (err) {
      console.error("Preferences update failed", err);
      setPrefsStatus({ type: "error", message: "Couldn't save your preferences. Please try again." });
    } finally {
      setPrefsLoading(false);
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
          Your Account.
        </h1>
        <p className="text-muted text-lg mt-2 font-medium">Make this space feel like yours.</p>
      </motion.div>

      <Card className="p-6 bg-background border-2 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 min-w-0">
          <div
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center shrink-0 border-2",
              accent ? accent.border : "border-border"
            )}
          >
            <UserIcon className={cn("w-6 h-6", accent ? accent.text : "text-muted")} />
          </div>
          <div className="min-w-0">
            <p className="font-serif text-lg font-semibold text-foreground truncate">
              {session?.user?.name || "Your Account"}
            </p>
            <p className="text-sm text-muted truncate">{session?.user?.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="shrink-0 gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </Card>

      <Card className="p-6 bg-background border-2 mt-6">
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
        <h3 className="font-serif text-lg font-semibold text-foreground mb-1">Preferences</h3>
        <p className="text-sm text-muted mb-5">A few little things that make this you.</p>

        <div className="flex flex-col gap-2 mb-6">
          <span className="text-sm font-medium text-foreground">Favorite Color</span>
          <div className="flex gap-3">
            {ACCENTS.map((a) => (
              <button
                key={a.key}
                type="button"
                title={a.label}
                onClick={() => {
                  const next = favoriteColor === a.key ? null : a.key;
                  setFavoriteColor(next);
                  savePrefs({ favoriteColor: next });
                }}
                className={cn(
                  "w-9 h-9 rounded-full border-2 transition-all",
                  a.swatch,
                  favoriteColor === a.key ? "border-foreground scale-110" : "border-transparent"
                )}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-6">
          <span className="text-sm font-medium text-foreground">Hobbies</span>
          <TagInput
            items={hobbies}
            onChange={(next) => {
              setHobbies(next);
              savePrefs({ hobbies: next });
            }}
            placeholder="Add a hobby and press Enter"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">Pets</span>
          <TagInput
            items={pets}
            onChange={(next) => {
              setPets(next);
              savePrefs({ pets: next });
            }}
            placeholder="Add a pet's name and press Enter"
          />
        </div>

        {prefsStatus && (
          <p className={cn("text-sm mt-4", prefsStatus.type === "success" ? "text-olive" : "text-terracotta")}>
            {prefsStatus.message}
          </p>
        )}
        {prefsLoading && <p className="text-sm mt-4 text-muted">Saving...</p>}
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
