"use client";

import { useEffect, useState, Suspense } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/form/Button";

function VerifyContent() {
  const t = useTranslations("Auth.verify");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify?token=${token}`);
        if (response.ok) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (err) {
        setStatus("error");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-100 dark:bg-zinc-900 dark:border-zinc-800 text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{t("title")}</h1>
        
        {status === "loading" && (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-600 dark:text-zinc-400">{t("verifying")}</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6">
            <div className="text-green-500 text-5xl">✓</div>
            <p className="text-gray-600 dark:text-zinc-400">{t("success")}</p>
            <Link href="/login" className="block">
              <Button className="w-full">{t("loginLink")}</Button>
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6">
            <div className="text-red-500 text-5xl">✕</div>
            <p className="text-gray-600 dark:text-zinc-400">{t("error")}</p>
            <Link href="/login" className="block">
              <Button variant="outline" className="w-full">{t("loginLink")}</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyContent />
    </Suspense>
  );
}
