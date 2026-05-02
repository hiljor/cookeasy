"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/form/Button";
import { Input } from "@/components/ui/form/Input";
import Link from "next/link";
import { toast } from "sonner";

export default function RegisterPage() {
  const t = useTranslations("Auth.register");
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        // If JSON parsing fails, treat as server error
        throw new Error("server_error");
      }

      if (!response.ok) {
        throw new Error(data.error || "server_error");
      }

      toast.success(t("success"));
      setSuccess(true);
    } catch (err: any) {
      toast.error(t(`errors.${err.message}`));
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 text-center">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-100 dark:bg-zinc-900 dark:border-zinc-800">
          <div className="mb-4 text-green-500 flex justify-center">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4 dark:text-white">{t("title")}</h1>
          <p className="text-gray-600 mb-8 dark:text-zinc-400">{t("success")}</p>
          <Link href="/login">
            <Button className="w-full">{t("loginLink")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-100 dark:bg-zinc-900 dark:border-zinc-800">
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">{t("title")}</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label={t("username")}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="chef_john"
          />

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
          {t("haveAccount")}{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            {t("loginLink")}
          </Link>
        </div>
      </div>
    </div>
  );
}
