"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "../actions";

export type SidebarCounts = {
  horarios?: number;
  salas?: number;
  solicitacoes?: number;
  turmas?: number;
};

type AppSidebarProps = {
  counts?: SidebarCounts;
  user: {
    email: string;
    nome?: string;
    tipo: string;
  };
};

const navBaseClassName =
  "flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium transition";
const activeNavClassName = "border border-indigo-100 bg-indigo-50";
const inactiveNavClassName =
  "border border-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950";

function getNavigationItems({
  counts,
  isOrganizer,
}: {
  counts?: SidebarCounts;
  isOrganizer: boolean;
}) {
  return [
    { href: "/", label: "Dashboard" },
    {
      count: counts?.salas,
      href: "/salas",
      label: isOrganizer ? "Salas e prédios" : "Reservar sala",
    },
    ...(isOrganizer
      ? [
          {
            count: counts?.turmas,
            href: "/turmas",
            label: "Turmas",
          },
          {
            count: counts?.horarios,
            href: "/horarios",
            label: "Horários",
          },
          {
            count: counts?.solicitacoes,
            href: "/solicitacoes",
            label: "Solicitações",
          },
        ]
      : []),
  ];
}

function NavItems({
  counts,
  isOrganizer,
}: {
  counts?: SidebarCounts;
  isOrganizer: boolean;
}) {
  const pathname = usePathname();
  const items = getNavigationItems({ counts, isOrganizer });

  return (
    <>
      {items.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            className={`${navBaseClassName} ${
              active ? activeNavClassName : inactiveNavClassName
            }`}
            href={item.href}
            key={item.href}
          >
            <span
              className={`truncate ${
                active ? "text-indigo-700" : "text-neutral-600"
              }`}
            >
              {item.label}
            </span>
            {typeof item.count === "number" ? (
              <span
                className={`shrink-0 rounded px-2 py-0.5 text-xs font-semibold ${
                  active
                    ? "bg-white text-indigo-700"
                    : "bg-neutral-100 text-neutral-500"
                }`}
              >
                {item.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </>
  );
}

export function AppSidebar({ counts, user }: AppSidebarProps) {
  const isOrganizer = user.tipo === "organizador";
  const displayName = user.nome ?? user.email;

  return (
    <>
      <aside className="hidden w-72 shrink-0 border-r border-neutral-200 bg-white px-5 py-6 lg:flex lg:flex-col">
        <Link className="flex items-center gap-3" href="/">
          <Image
            src="/logo-scala.JPG"
            alt="Scala"
            width={92}
            height={37}
            className="h-auto w-[92px]"
            priority
          />
          <div className="h-10 w-px bg-neutral-200" />
          <Image
            src="/logo-uvv.png"
            alt="Universidade Vila Velha"
            width={44}
            height={44}
            className="size-11 object-contain"
            priority
          />
        </Link>

        <div className="mt-8 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <p className="truncate text-sm font-semibold text-neutral-950">
            {displayName}
          </p>
          <p className="mt-1 text-xs font-medium capitalize text-neutral-500">
            {isOrganizer ? "Organizador" : "Professor"}
          </p>
        </div>

        <nav className="mt-6 space-y-1" aria-label="Menu principal">
          <NavItems counts={counts} isOrganizer={isOrganizer} />
        </nav>

        <form action={logoutAction} className="mt-auto">
          <button
            className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            type="submit"
          >
            Sair
          </button>
        </form>
      </aside>

      <div className="border-b border-neutral-200 bg-white lg:hidden">
        <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link className="flex items-center gap-3" href="/">
            <Image
              src="/logo-scala.JPG"
              alt="Scala"
              width={86}
              height={35}
              className="h-auto w-[86px]"
              priority
            />
            <span className="text-sm font-semibold text-neutral-950">
              Scala
            </span>
          </Link>

          <form action={logoutAction}>
            <button
              className="h-10 rounded-md border border-neutral-200 px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              type="submit"
            >
              Sair
            </button>
          </form>
        </div>
        <nav
          aria-label="Menu principal"
          className="flex gap-2 overflow-x-auto px-5 pb-4 sm:px-8"
        >
          <NavItems counts={counts} isOrganizer={isOrganizer} />
        </nav>
      </div>
    </>
  );
}
