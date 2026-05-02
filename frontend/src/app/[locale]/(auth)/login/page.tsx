"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/form/Button";
import { Input } from "@/components/ui/form/Input";
import Link from "next/link";
import { toast } from "sonner";

export default function LoginPage() {
  const t = useTranslations("Auth.login");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t("error"));
      }

      toast.success(t("success") || "Successfully logged in!");
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-100 dark:bg-zinc-900 dark:border-zinc-800">
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">{t("title")}</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label={t("email")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="chef@cookeasy.com"
          />
          
          <Input
            label={t("password")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="********"
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            {t("submit")}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600 dark:text-zinc-400">
          {t("noAccount")}{" "}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            {t("registerLink")}
          </Link>
        </div>
      </div>
    </div>
  );
}
