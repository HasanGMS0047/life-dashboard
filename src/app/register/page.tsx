"use client";

import { useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      let data: { error?: string; ok?: boolean } | null = null;
      const text = await res.text();
      if (text) {
        try {
          data = JSON.parse(text) as { error?: string; ok?: boolean };
        } catch {
          data = null;
        }
      }

      if (!res.ok) {
        setError(data?.error || "Something went wrong. Please try again.");
        return;
      }

      const signInRes = await signIn("credentials", { email, password, redirect: false });
      if (signInRes?.error) {
        setError("Your account was created, but we could not sign you in automatically. Please log in manually.");
        return;
      }

      router.push("/dashboard?new=1");
      router.refresh();
    } catch (err) {
      console.error("Registration failed", err);
      setError("We couldn't create your account right now. Please try again.");
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-8 relative"
      style={{
        backgroundImage: "url(/calm_scenery_bg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-[#f3e9d8]/60 backdrop-blur-[2px]" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm bg-surface rounded-3xl border border-border shadow-2xl shadow-terracotta/10 p-8 relative z-10"
      >
        <h1 className="font-serif text-3xl text-foreground font-semibold text-center mb-1">
          Begin your tale.
        </h1>
        <p className="text-sm text-muted text-center mb-6">
          Your own space — journal, moods, memories, all yours.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (optional)"
            className="w-full bg-background/50 border border-border rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta/50 placeholder:text-muted/70"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full bg-background/50 border border-border rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta/50 placeholder:text-muted/70"
          />
          <PasswordInput
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min. 8 characters)"
          />

          {error && <p className="text-sm text-terracotta text-center">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full mt-2">
            {loading ? "Creating your space..." : "Begin Your Tale"}
          </Button>
        </form>

        <p className="text-sm text-muted text-center mt-6">
          Already have a space?{" "}
          <Link href="/login" className="text-terracotta font-medium hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
