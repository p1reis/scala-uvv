import Image from "next/image";
import { logoutAction } from "../actions";
import type { SessionUser } from "../lib/session";

const navigationItems = [
  "Inicio",
  "Reservas",
  "Salas",
  "Horarios",
  "Solicitacoes",
  "Configuracoes",
];

type DashboardHomeProps = {
  user: SessionUser;
};

export function DashboardHome({ user }: DashboardHomeProps) {
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

        <form action={logoutAction} className="mt-auto">
          <button
            className="h-11 w-full rounded-md border border-neutral-200 px-3 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-950"
            type="submit"
          >
            Sair
          </button>
        </form>
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

          <form action={logoutAction} className="lg:hidden">
            <button
              className="h-10 rounded-md border border-neutral-200 px-3 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-950"
              type="submit"
            >
              Sair
            </button>
          </form>
        </header>

        <div className="px-5 py-6 sm:px-8 lg:px-10">
          <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-[0_1px_10px_rgba(15,23,42,0.04)]">
            <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-neutral-950">
              Bem-vindo, {user.nome ?? user.email}.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-500">
              Seu acesso é de {user.tipo}
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
