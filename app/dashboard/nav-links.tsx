"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { t } from "@/lib/i18n";
import { DashboardIcon, SchoolIcon, TestIcon } from "@/components/ui/Icons";

export default function NavLinks() {
  const pathname = usePathname();

  const links = [
    {
      href: "/dashboard",
      label: t("nav.dashboard"),
      shortLabel: "Asosiy",
      icon: DashboardIcon,
      exact: true,
    },
    {
      href: "/dashboard/classes",
      label: t("nav.classes"),
      shortLabel: t("nav.classes"),
      icon: SchoolIcon,
      exact: false,
    },
    {
      href: "/dashboard/tests",
      label: t("nav.tests"),
      shortLabel: t("nav.tests"),
      icon: TestIcon,
      exact: false,
    },
  ];

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = link.exact
          ? pathname === link.href
          : pathname === link.href || pathname.startsWith(link.href + "/");

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-150 shrink-0 ${
              isActive
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-900 dark:border-zinc-100 shadow-2xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-transparent"
            }`}
          >
            <Icon
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors shrink-0 ${
                isActive
                  ? "text-white dark:text-zinc-900"
                  : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
              }`}
            />
            <span className="hidden xs:inline sm:hidden">{link.shortLabel}</span>
            <span className="hidden sm:inline">{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
