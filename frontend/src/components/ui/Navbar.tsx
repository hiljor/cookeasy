"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { Menu, X, Globe, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const t = useTranslations("Common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleLocale = () => {
    const nextLocale = locale === "en" ? "no" : "en";
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-black/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold tracking-tight text-orange-600">
              {t("appName")}
            </Link>
            <div className="hidden md:flex md:items-center md:gap-6">
              <Link href="/recipes" className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white">
                {t("nav.recipes")}
              </Link>
              <Link href="/friends" className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white">
                {t("nav.friends")}
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleLocale}
              className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
            >
              <Globe className="h-3 w-3" />
              {locale}
            </button>

            {user ? (
              <Link href={`/u/${user.username}`} className="flex items-center gap-2 rounded-full border border-zinc-200 p-1 pr-3 dark:border-zinc-800">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30">
                  <User className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium hidden sm:block">{user.username}</span>
              </Link>
            ) : (
              <Link href="/login" className="hidden sm:block text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white">
                {t("nav.profile")}
              </Link>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-md p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 md:hidden"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black md:hidden">
          <div className="space-y-1 px-4 py-3">
            <Link
              href="/recipes"
              className="block rounded-md px-3 py-2 text-base font-medium text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.recipes")}
            </Link>
            <Link
              href="/friends"
              className="block rounded-md px-3 py-2 text-base font-medium text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.friends")}
            </Link>
            {!user && (
              <Link
                href="/login"
                className="block rounded-md px-3 py-2 text-base font-medium text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("nav.profile")}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
