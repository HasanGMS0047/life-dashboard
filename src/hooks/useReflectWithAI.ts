"use client";

import { useCallback, useState } from "react";

type ReflectState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; reflection: string }
  | { status: "offline"; message: string };

export function useReflectWithAI() {
  const [state, setState] = useState<ReflectState>({ status: "idle" });

  const reflect = useCallback(async (entry: string, mood?: string) => {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/ai/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entry, mood }),
      });
      const data = await res.json();
      if (data.available) {
        setState({ status: "done", reflection: data.reflection });
      } else {
        setState({ status: "offline", message: data.message });
      }
    } catch {
      setState({
        status: "offline",
        message: "Couldn't reach the AI service. Please try again.",
      });
    }
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, reflect, reset };
}
