"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { AlertCircleIcon } from "@/components/ui/Icons";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] px-4">
      <Card className="p-8 max-w-md w-full text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
          <AlertCircleIcon className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Ma&apos;lumotlarni yuklashda xatolik yuz berdi
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {error.message && !error.message.includes("441") && !error.message.includes("Minified")
            ? error.message
            : "Ma'lumotlar bazasiga ulanishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring yoki sozlamalarni tekshiring."}
        </p>
        {error.digest && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
            Xatolik kodi: {error.digest}
          </p>
        )}
        <Button onClick={() => reset()} variant="primary" className="w-full">
          Qayta yuklash
        </Button>
      </Card>
    </div>
  );
}
