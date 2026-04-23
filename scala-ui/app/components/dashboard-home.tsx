"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

const navigationItems = [
  "Inicio",
  "Reservas",
  "Salas",
  "Horarios",
  "Solicitacoes",
  "Configuracoes",
];

function subscribeToAuthChanges(callback: () => void) {
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener("storage", callback);
  };
}

function readAuthSnapshot() {
  return localStorage.getItem("scala:isAuthenticated") === "true";
}

export function DashboardHome() {
  const router = useRouter();
  const isAuthenticated = useSyncExternalStore(
    subscribeToAuthChanges,
    readAuthSnapshot,
    () => false,
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  function handleLogout() {
    localStorage.removeItem("scala:isAuthenticated");
    router.replace("/login");
  }

  if (!isAuthenticated) {
    return (
      <main className="grid min-h-dvh place-items-center bg-neutral-50 text-sm font-medium text-neutral-500">
        Verificando acesso...
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh bg-neutral-50 text-neutral-950">
      <aside className="hidden w-72 shrink-0 border-r border-neutral-200 bg-white px-5 py-6 lg:flex lg:flex-col">
        <div className="flex items-center gap-3">
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
        </div>

        <nav className="mt-10 space-y-1" aria-label="Menu principal">
          {navigationItems.map((item, index) => (
            <a
              key={item}
              className={`flex h-11 items-center rounded-md px-3 text-sm font-medium transition ${
                index === 0
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
              }`}
              href="#"
            >
              {item}
            </a>
          ))}
        </nav>

        <button
          className="mt-auto h-11 rounded-md border border-neutral-200 px-3 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-950"
          type="button"
          onClick={handleLogout}
        >
          Sair
        </button>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-5 sm:px-8 lg:px-10">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-400">
              Plataforma Scala
            </p>
            <h1 className="text-lg font-semibold text-neutral-950">
              Painel inicial
            </h1>
          </div>

          <button
            className="h-10 rounded-md border border-neutral-200 px-3 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-950 lg:hidden"
            type="button"
            onClick={handleLogout}
          >
            Sair
          </button>
        </header>

        <div className="px-5 py-6 sm:px-8 lg:px-10">
          <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-[0_1px_10px_rgba(15,23,42,0.04)]">
            <p className="text-sm font-medium text-indigo-700">
              Acesso autorizado
            </p>
            <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-neutral-950">
              Bem-vindo a sua futura plataforma de gestao e reservas de salas.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-500">
              Esta tela inicial e um ponto de partida para o dashboard. A
              protecao atual acontece apenas no front end usando localStorage,
              como mock temporario.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              ["Reservas hoje", "12"],
              ["Salas disponiveis", "38"],
              ["Solicitacoes pendentes", "5"],
            ].map(([label, value]) => (
              <article
                key={label}
                className="rounded-lg border border-neutral-200 bg-white p-5 shadow-[0_1px_10px_rgba(15,23,42,0.04)]"
              >
                <p className="text-sm font-medium text-neutral-500">{label}</p>
                <p className="mt-4 text-3xl font-semibold text-neutral-950">
                  {value}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
