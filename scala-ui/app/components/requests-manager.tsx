import { avaliarSolicitacaoAction } from "../actions";
import type { Solicitacao } from "../lib/api";
import type { SessionUser } from "../lib/session";
import { AppSidebar, type SidebarCounts } from "./app-sidebar";

type RequestsManagerProps = {
  counts?: SidebarCounts;
  message: {
    success?: string;
    error?: string;
  };
  solicitacoes: Solicitacao[];
  user: SessionUser;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusClassName(status: Solicitacao["situacao"]) {
  if (status === "aceito") return "bg-emerald-50 text-emerald-700";
  if (status === "recusado") return "bg-red-50 text-red-700";
  return "bg-amber-50 text-amber-700";
}

function StatusBadge({ status }: { status: Solicitacao["situacao"] }) {
  return (
    <span
      className={`inline-flex h-7 items-center rounded-md px-2 text-xs font-semibold ${statusClassName(
        status,
      )}`}
    >
      {status}
    </span>
  );
}

function EvaluationForm({
  solicitacaoId,
  situacao,
}: {
  solicitacaoId: string;
  situacao: "aceito" | "recusado";
}) {
  return (
    <form action={avaliarSolicitacaoAction}>
      <input name="solicitacaoId" type="hidden" value={solicitacaoId} />
      <input name="situacao" type="hidden" value={situacao} />
      <input name="redirectTo" type="hidden" value="/solicitacoes" />
      <button
        className={
          situacao === "aceito"
            ? "h-10 rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
            : "h-10 rounded-md border border-neutral-200 px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
        }
        type="submit"
      >
        {situacao === "aceito" ? "Aceitar" : "Recusar"}
      </button>
    </form>
  );
}

export function RequestsManager({
  counts,
  message,
  solicitacoes,
  user,
}: RequestsManagerProps) {
  const pending = solicitacoes.filter(
    (solicitacao) => solicitacao.situacao === "pendente",
  );
  const evaluated = solicitacoes.filter(
    (solicitacao) => solicitacao.situacao !== "pendente",
  );
  const orderedSolicitacoes = [...pending, ...evaluated];

  return (
    <main className="min-h-dvh bg-neutral-50 text-neutral-950 lg:flex">
      <AppSidebar counts={counts} user={user} />

      <section className="min-w-0 flex-1">
      <header className="border-b border-neutral-200 bg-white px-5 py-4 sm:px-8 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
              <p className="text-xs font-medium uppercase text-neutral-400">
                Perfil organizador
              </p>
              <h1 className="text-lg font-semibold text-neutral-950">
                Solicitações de reserva
              </h1>
            </div>

          <span className="rounded-md bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            {pending.length} pendentes
          </span>
        </div>
      </header>

      <div className="space-y-6 px-5 py-6 sm:px-8 lg:px-10">
        <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-[0_1px_10px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">
                Fila de avaliação
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-neutral-950">
                Aceite ou recuse reservas solicitadas por professores.
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-neutral-500">
                Solicitações pendentes aparecem primeiro. Ao aceitar, o horário
                fica alocado e pedidos concorrentes podem ser recusados.
              </p>
            </div>
            <div className="grid min-w-72 grid-cols-3 gap-3">
              <div className="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase text-neutral-400">
                  Total
                </p>
                <p className="mt-1 text-xl font-semibold text-neutral-950">
                  {solicitacoes.length}
                </p>
              </div>
              <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase text-amber-600">
                  Pendentes
                </p>
                <p className="mt-1 text-xl font-semibold text-amber-800">
                  {pending.length}
                </p>
              </div>
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase text-emerald-600">
                  Avaliadas
                </p>
                <p className="mt-1 text-xl font-semibold text-emerald-800">
                  {evaluated.length}
                </p>
              </div>
            </div>
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

        <section className="rounded-lg border border-neutral-200 bg-white shadow-[0_1px_10px_rgba(15,23,42,0.04)]">
          <div className="border-b border-neutral-200 px-5 py-4">
            <h2 className="text-base font-semibold text-neutral-950">
              Pedidos de reserva
            </h2>
          </div>

          {orderedSolicitacoes.length === 0 ? (
            <p className="m-5 rounded-md border border-dashed border-neutral-200 px-4 py-5 text-sm text-neutral-500">
              Nenhuma solicitação recebida.
            </p>
          ) : (
            <div className="max-h-[620px] space-y-3 overflow-y-auto p-5">
              {orderedSolicitacoes.map((solicitacao) => (
                <article
                  className="rounded-lg border border-neutral-200 bg-white p-4"
                  key={solicitacao.id}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-neutral-950">
                          {solicitacao.horario?.espaco?.nome ?? "Sala"}
                        </h3>
                        <StatusBadge status={solicitacao.situacao} />
                      </div>

                      <div className="grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
                        <div>
                          <p className="text-xs font-semibold uppercase text-neutral-400">
                            Professor
                          </p>
                          <p className="mt-1 font-medium text-neutral-900">
                            {solicitacao.professor?.nome ?? "Professor"}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {solicitacao.professor?.email ?? "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase text-neutral-400">
                            Local
                          </p>
                          <p className="mt-1 text-neutral-700">
                            {solicitacao.horario?.espaco?.predio?.nome ??
                              "Prédio não informado"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase text-neutral-400">
                            Horário
                          </p>
                          <p className="mt-1 text-neutral-700">
                            {solicitacao.horario
                              ? formatDateTime(solicitacao.horario.inicio)
                              : "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase text-neutral-400">
                            Turma
                          </p>
                          <p className="mt-1 text-neutral-700">
                            {solicitacao.turma
                              ? `${solicitacao.turma.codigo} · ${solicitacao.turma.curso}`
                              : "-"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase text-neutral-400">
                          Justificativa
                        </p>
                        <p className="mt-1 text-sm text-neutral-600">
                          {solicitacao.justificativa}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      {solicitacao.situacao === "pendente" ? (
                        <>
                          <EvaluationForm
                            solicitacaoId={solicitacao.id}
                            situacao="aceito"
                          />
                          <EvaluationForm
                            solicitacaoId={solicitacao.id}
                            situacao="recusado"
                          />
                        </>
                      ) : (
                        <span className="inline-flex h-10 items-center rounded-md bg-neutral-100 px-3 text-sm font-medium text-neutral-500">
                          Avaliada
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
      </section>
    </main>
  );
}
