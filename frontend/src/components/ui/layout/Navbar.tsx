"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { Menu, X, Globe, User, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const t = useTranslations("Common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleLocale = () => {
    const nextLocale = locale === "en" ? "no" : "en";
    router.replace(pathname, { locale: nextLocale });
  };

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    router.push("/login");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold tracking-tight text-primary-dark">
              {t("appName")}
            </Link>
            <div className="hidden md:flex md:items-center md:gap-6">
              <Link
                href="/recipes"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === "/recipes" ? "text-primary-dark" : "text-muted"
                }`}
              >
                {t("nav.recipes")}
              </Link>
              <Link
                href="/friends"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === "/friends" ? "text-primary-dark" : "text-muted"
                }`}
              >
                {t("nav.friends")}
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleLocale}
              aria-label="Toggle language"
              className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted hover:bg-border/20"
            >
              <Globe className="h-3 w-3" />
              {locale}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={`/u/${user.username}`}
                  className={`flex items-center gap-2 rounded-full border p-1 pr-3 transition-colors ${
                    pathname.startsWith(`/u/${user.username}`)
                      ? "border-primary-verylight bg-primary-verylight/30"
                      : "border-border"
                  }`}
                >
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                    pathname.startsWith(`/u/${user.username}`)
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary-verylight text-primary-dark"
                  }`}>
                    <User className="h-4 w-4" />
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${
                    pathname.startsWith(`/u/${user.username}`) ? "text-primary-dark" : ""
                  }`}>
                    {user.username}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/10 transition-colors"
                >
                  <LogOut className="h-3 w-3" />
                  {t("nav.logout")}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className={`hidden sm:block text-sm font-medium transition-colors hover:text-primary ${
                  pathname === "/login" ? "text-primary-dark" : "text-muted"
                }`}
              >
                {t("nav.profile")}
              </Link>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              className="rounded-md p-2 text-muted hover:bg-border/20 md:hidden"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="border-b border-border bg-background md:hidden">
          <div className="space-y-1 px-4 py-3">
            <Link
              href="/recipes"
              className={`block rounded-md px-3 py-2 text-base font-medium transition-colors ${
                pathname === "/recipes"
                  ? "bg-primary-verylight/50 text-primary-dark"
                  : "text-muted hover:bg-border/10"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.recipes")}
            </Link>
            <Link
              href="/friends"
              className={`block rounded-md px-3 py-2 text-base font-medium transition-colors ${
                pathname === "/friends"
                  ? "bg-primary-verylight/50 text-primary-dark"
                  : "text-muted hover:bg-border/10"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.friends")}
            </Link>
            {user ? (
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                {t("nav.logout")}
              </button>
            ) : (
              <Link
                href="/login"
                className={`block rounded-md px-3 py-2 text-base font-medium transition-colors ${
                  pathname === "/login"
                    ? "bg-primary-verylight/50 text-primary-dark"
                    : "text-muted hover:bg-border/10"
              }`}
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

