"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useDailyLogStore } from "@/store/dailyLogStore";

export function CheckInConfirmBar() {
  const draft = useDailyLogStore((s) => s.draft);
  const confirming = useDailyLogStore((s) => s.confirming);
  const confirmCheckIn = useDailyLogStore((s) => s.confirmCheckIn);
  const [justSaved, setJustSaved] = useState(false);
  const [failed, setFailed] = useState(false);

  const pendingCount = Object.keys(draft).length;
  const visible = pendingCount > 0 || justSaved;

  const handleConfirm = async () => {
    setFailed(false);
    const ok = await confirmCheckIn();
    if (ok) {
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1400);
    } else {
      setFailed(true);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-5 inset-x-0 z-40 flex justify-center px-4 pointer-events-none"
        >
          <div className="pointer-events-auto flex items-center gap-3 bg-surface border border-border rounded-full shadow-2xl px-4 py-2.5">
            {pendingCount > 0 ? (
              <>
                <span className="text-sm font-medium">
                  {failed ? (
                    <span className="text-terracotta">Couldn&apos;t save — try again</span>
                  ) : (
                    <span className="text-foreground">
                      {pendingCount} {pendingCount === 1 ? "update" : "updates"} to check in
                    </span>
                  )}
                </span>
                <button
                  onClick={handleConfirm}
                  disabled={confirming}
                  className="flex items-center gap-1.5 bg-terracotta text-white text-sm font-medium rounded-full px-4 py-1.5 hover:bg-terracotta/90 transition-colors disabled:opacity-60"
                >
                  {confirming ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  Confirm
                </button>
              </>
            ) : (
              <span className="flex items-center gap-1.5 text-sm text-olive font-medium">
                <Check className="w-3.5 h-3.5" /> Saved
              </span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
