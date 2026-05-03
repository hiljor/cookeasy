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
  const { user, logout, isLoading: isAuthLoading } = useAuth();
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
    <nav className="sticky top-0 z-50 w-full bg-primary shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold tracking-tight text-primary-foreground">
              {t("appName")}
            </Link>
            <div className="hidden md:flex md:items-center md:gap-6">
              <Link
                href="/recipes"
                className={`text-sm font-medium transition-colors hover:text-primary-foreground/80 ${
                  pathname === "/recipes" ? "text-primary-foreground underline decoration-2 underline-offset-4" : "text-primary-foreground/80"
                }`}
              >
                {t("nav.recipes")}
              </Link>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <input
              type="text"
              placeholder={t("search.placeholder") || "Search..."}
              className="w-full rounded-full bg-primary-foreground/10 px-4 py-1.5 text-sm text-primary-foreground placeholder:text-primary-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary-foreground/50"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleLocale}
              aria-label="Toggle language"
              className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary-foreground/80 hover:bg-primary-dark/20"
            >
              <Globe className="h-3 w-3" />
              {locale}
            </button>

            {isAuthLoading ? (
              <div className="flex items-center gap-2 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-primary-foreground/20" />
                <div className="hidden sm:block h-3 w-16 rounded-full bg-primary-foreground/20" />
              </div>
            ) : user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={`/u/${user.username}`}
                  className={`flex items-center gap-2 rounded-full border p-1 pr-3 transition-colors ${
                    pathname.startsWith(`/u/${user.username}`)
                      ? "border-primary-foreground bg-primary-foreground/20"
                      : "border-primary-foreground/30 hover:bg-primary-foreground/10"
                  }`}
                >
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                    pathname.startsWith(`/u/${user.username}`)
                      ? "bg-primary-foreground text-primary"
                      : "bg-primary-foreground/20 text-primary-foreground"
                  }`}>
                    <User className="h-4 w-4" />
                  </div>
                  <span className={`text-xs font-medium hidden sm:block text-primary-foreground`}>
                    {user.username}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-1 rounded-full border border-primary-foreground/30 px-3 py-1.5 text-xs font-medium text-primary-foreground/80 hover:bg-red-500/20 hover:text-white transition-colors"
                >
                  <LogOut className="h-3 w-3" />
                  {t("nav.logout")}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className={`hidden sm:block text-sm font-medium transition-colors hover:text-primary-foreground ${
                  pathname === "/login" ? "text-primary-foreground underline underline-offset-4" : "text-primary-foreground/80"
                }`}
              >
                {t("nav.profile")}
              </Link>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              className="rounded-md p-2 text-primary-foreground hover:bg-primary-dark/20 md:hidden"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden pb-3">
          <input
            type="text"
            placeholder={t("search.placeholder") || "Search..."}
            className="w-full rounded-md bg-primary-foreground/10 px-4 py-2 text-sm text-primary-foreground placeholder:text-primary-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary-foreground/50"
          />
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="border-t border-primary-foreground/10 bg-primary md:hidden">
          <div className="space-y-1 px-4 py-3">
            <Link
              href="/recipes"
              className={`block rounded-md px-3 py-2 text-base font-medium transition-colors ${
                pathname === "/recipes"
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "text-primary-foreground/80 hover:bg-primary-foreground/10"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.recipes")}
            </Link>
            {user ? (
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-primary-foreground hover:bg-red-500/20 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                {t("nav.logout")}
              </button>
            ) : (
              <Link
                href="/login"
                className={`block rounded-md px-3 py-2 text-base font-medium transition-colors ${
                  pathname === "/login"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "text-primary-foreground/80 hover:bg-primary-foreground/10"
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

