import { useTranslations } from "next-intl";
import { Search, ChefHat } from "lucide-react";
import { Link } from "@/i18n/routing";
import Navbar from "@/components/ui/layout/Navbar";
import { Button } from "@/components/ui/form/Button";

export default function Home() {
  const t = useTranslations("HomePage");

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <main className="flex flex-1 flex-col items-center">
        {/* Daily Recipe Placeholder */}
        <section className="w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-zinc-900 shadow-xl dark:bg-zinc-800">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="relative flex h-48 flex-col justify-end p-6 sm:h-64 sm:p-10">
              <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                <ChefHat className="h-3 w-3" />
                {t("dailyRecipe")}
              </span >
              <h2 className="text-2xl font-bold text-white sm:text-4xl">
                Creamy Mushroom Risotto
              </h2>
              <p className="mt-2 max-w-xl text-zinc-300">
                A comforting Italian classic made with Arborio rice, fresh forest mushrooms, and plenty of Parmesan.
              </p>
            </div>
            {/* Simple decorative placeholder image/gradient */}
            <div className="absolute top-0 right-0 -z-10 h-full w-full bg-gradient-to-br from-primary/20 to-transparent"></div>
          </div>
        </section>

        {/* Hero Search Section */}
        <section className="flex w-full flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:py-24">
          <h1 className="mb-8 text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-6xl">
            {t("title")}
          </h1>
          
          <div className="relative w-full max-w-2xl">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-5 w-5 text-zinc-400" />
            </div>
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              className="h-16 w-full rounded-2xl border border-zinc-200 bg-white pl-12 pr-4 text-lg shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            />
          </div>

          <div className="mt-8 flex flex-row items-center gap-4">
            <Link href="/register">
              <Button size="lg" className="rounded-xl px-8 shadow-lg shadow-primary/20">
                {t("getStarted")}
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="rounded-xl px-8 bg-white dark:bg-white-900">
                {t("login")}
              </Button>
            </Link>
          </div>

          <p className="mt-12 max-w-md text-zinc-500 dark:text-zinc-400">
            {t("description")}
          </p>
        </section>
      </main>

      <footer className="border-t border-zinc-200 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800">
        <p>&copy; {new Date().getFullYear()} Cookeasy. All rights reserved.</p>
      </footer>
    </div>
  );
}
