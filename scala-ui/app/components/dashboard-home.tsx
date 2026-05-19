import Link from "next/link";
import { AppSidebar } from "./app-sidebar";
import type {
  Agenda,
  Espaco,
  Horario,
  Predio,
  Solicitacao,
  Turma,
} from "../lib/api";
import type { SessionUser } from "../lib/session";

type DashboardData = {
  predios: Predio[];
  espacos: Espaco[];
  agendas: Agenda[];
  turmas: Turma[];
  horarios: Horario[];
  solicitacoes: Solicitacao[];
};

type DashboardHomeProps = {
  user: SessionUser;
  data: DashboardData;
  message: {
    success?: string;
    error?: string;
  };
};

function StatGrid({
  data,
  isOrganizer,
}: {
  data: DashboardData;
  isOrganizer: boolean;
}) {
  const pending = data.solicitacoes.filter(
    (solicitacao) => solicitacao.situacao === "pendente",
  ).length;
  const available = data.horarios.filter((horario) => !horario.alocadoId).length;
  const accepted = data.solicitacoes.filter(
    (solicitacao) => solicitacao.situacao === "aceito",
  ).length;

  const stats = isOrganizer
    ? [
        ["Salas cadastradas", String(data.espacos.length)],
        ["Horários disponíveis", String(available)],
        ["Solicitações pendentes", String(pending)],
      ]
    : [
        ["Salas disponíveis", String(data.espacos.length)],
        ["Horários abertos", String(available)],
        ["Reservas aceitas", String(accepted)],
      ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map(([label, value]) => (
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
  );
}

function QuickActions({ isOrganizer }: { isOrganizer: boolean }) {
  const actions = isOrganizer
    ? [
        {
          href: "/salas",
          title: "Salas e prédios",
          description: "Cadastre prédios, salas e laboratórios.",
          cta: "Gerenciar salas",
          featured: false,
        },
        {
          href: "/turmas",
          title: "Turmas",
          description: "Mantenha as turmas disponíveis para reservas.",
          cta: "Gerenciar turmas",
          featured: false,
        },
        {
          href: "/horarios",
          title: "Horários",
          description: "Organize a disponibilidade anual por sala.",
          cta: "Abrir agenda",
          featured: true,
        },
        {
          href: "/solicitacoes",
          title: "Solicitações",
          description: "Avalie pedidos de reserva enviados por professores.",
          cta: "Avaliar reservas",
          featured: false,
        },
      ]
    : [
        {
          href: "/salas",
          title: "Reservar sala",
          description: "Escolha uma sala, veja a agenda disponível e solicite a reserva.",
          cta: "Ver salas",
          featured: true,
        },
      ];

  return (
    <section className="grid gap-4 lg:grid-cols-4">
      {actions.map((action) => (
        <article
          className={`rounded-lg border p-5 shadow-[0_1px_10px_rgba(15,23,42,0.04)] ${
            action.featured
              ? "border-indigo-100 bg-indigo-50"
              : "border-neutral-200 bg-white"
          }`}
          key={action.title}
        >
          <h2
            className={`text-lg font-semibold ${
              action.featured ? "text-indigo-950" : "text-neutral-950"
            }`}
          >
            {action.title}
          </h2>
          <p
            className={`mt-1 min-h-10 text-sm ${
              action.featured ? "text-indigo-700" : "text-neutral-500"
            }`}
          >
            {action.description}
          </p>
          <Link
            className="mt-5 inline-flex h-11 items-center rounded-md bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700"
            href={action.href}
          >
            {action.cta}
          </Link>
        </article>
      ))}
    </section>
  );
}

function ProfileSummary({
  data,
  isOrganizer,
}: {
  data: DashboardData;
  isOrganizer: boolean;
}) {
  const pending = data.solicitacoes.filter(
    (solicitacao) => solicitacao.situacao === "pendente",
  ).length;
  const availableRooms = new Set(
    data.horarios
      .filter((horario) => !horario.alocadoId)
      .map((horario) => horario.espacoId),
  ).size;

  const items = isOrganizer
    ? [
        ["Estrutura", `${data.predios.length} prédios e ${data.espacos.length} salas`],
        ["Cadastros", `${data.turmas.length} turmas ativas`],
        ["Pendências", `${pending} solicitações aguardando avaliação`],
      ]
    : [
        ["Disponibilidade", `${availableRooms} salas com horários abertos`],
        ["Agenda atual", `${data.agendas[0]?.ano ?? new Date().getFullYear()}`],
        ["Minhas solicitações", `${data.solicitacoes.length} enviadas`],
      ];

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-[0_1px_10px_rgba(15,23,42,0.04)]">
      <h2 className="text-base font-semibold text-neutral-950">
        Resumo operacional
      </h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {items.map(([label, value]) => (
          <div
            className="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3"
            key={label}
          >
            <p className="text-xs font-semibold uppercase text-neutral-400">
              {label}
            </p>
            <p className="mt-1 text-sm font-medium text-neutral-800">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DashboardHome({ data, message, user }: DashboardHomeProps) {
  const isOrganizer = user.tipo === "organizador";
  const pending = data.solicitacoes.filter(
    (solicitacao) => solicitacao.situacao === "pendente",
  ).length;

  return (
    <main className="min-h-dvh bg-neutral-50 text-neutral-950 lg:flex">
      <AppSidebar
        counts={{
          horarios: data.horarios.length,
          salas: data.espacos.length,
          solicitacoes: pending,
          turmas: data.turmas.length,
        }}
        user={user}
      />

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-16 items-center justify-between border-b border-neutral-200 bg-white px-5 py-3 sm:px-8 lg:px-10">
          <div>
            <p className="text-xs font-medium uppercase text-neutral-400">
              Plataforma Scala
            </p>
            <h1 className="text-lg font-semibold text-neutral-950">
              Dashboard
            </h1>
          </div>

          <span className="rounded-md bg-neutral-100 px-3 py-1 text-xs font-semibold capitalize text-neutral-600">
            {isOrganizer ? "Organizador" : "Professor"}
          </span>
        </header>

        <div className="space-y-8 px-5 py-6 sm:px-8 lg:px-10">
          <section
            id="visao-geral"
            className="rounded-lg border border-neutral-200 bg-white p-6 shadow-[0_1px_10px_rgba(15,23,42,0.04)]"
          >
            <p className="text-sm font-medium text-neutral-500">
              {isOrganizer ? "Perfil organizador" : "Perfil professor"}
            </p>
            <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-neutral-950">
                  Olá, {user.nome ?? user.email}.
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-neutral-500">
                  {isOrganizer
                    ? "Acompanhe a estrutura de salas e acesse os cadastros principais do Scala."
                    : "Acompanhe a disponibilidade geral e acesse a tela de salas para solicitar reservas."}
                </p>
              </div>
              <Link
                className="inline-flex h-11 items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700"
                href={isOrganizer ? "/horarios" : "/salas"}
              >
                {isOrganizer ? "Gerenciar horários" : "Reservar sala"}
              </Link>
            </div>
          </section>

          {message.success ? (
            <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {message.success}
            </p>
          ) : null}
          {message.error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {message.error}
            </p>
          ) : null}

          <StatGrid data={data} isOrganizer={isOrganizer} />
          <QuickActions isOrganizer={isOrganizer} />
          <ProfileSummary data={data} isOrganizer={isOrganizer} />
        </div>
      </section>
    </main>
  );
}
