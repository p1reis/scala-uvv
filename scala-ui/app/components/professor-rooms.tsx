"use client";

import { useMemo, useState } from "react";
import { solicitarReservaAction } from "../actions";
import type { Agenda, Espaco, Horario, Solicitacao, Turma } from "../lib/api";
import type { SessionUser } from "../lib/session";
import { AppSidebar, type SidebarCounts } from "./app-sidebar";

type ProfessorRoomsProps = {
  agendas: Agenda[];
  counts?: SidebarCounts;
  espacos: Espaco[];
  horarios: Horario[];
  message: {
    success?: string;
    error?: string;
  };
  solicitacoes: Solicitacao[];
  turmas: Turma[];
  user: SessionUser;
};

const fieldClassName =
  "h-11 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";
const textareaClassName =
  "min-h-28 w-full resize-y rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";
const secondaryButtonClassName =
  "h-10 rounded-md border border-neutral-200 px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

function formatTimeRange(horario: Horario) {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${formatter.format(new Date(horario.inicio))} - ${formatter.format(
    new Date(horario.fim),
  )}`;
}

function statusClassName(status: Solicitacao["situacao"]) {
  if (status === "aceito") return "bg-emerald-50 text-emerald-700";
  if (status === "recusado") return "bg-red-50 text-red-700";
  return "bg-amber-50 text-amber-700";
}

function groupByDay(horarios: Horario[]) {
  return horarios.reduce<Record<string, Horario[]>>((acc, horario) => {
    const key = horario.inicio.slice(0, 10);
    acc[key] = [...(acc[key] ?? []), horario];
    return acc;
  }, {});
}

export function ProfessorRooms({
  agendas,
  counts,
  espacos,
  horarios,
  message,
  solicitacoes,
  turmas,
  user,
}: ProfessorRoomsProps) {
  const [query, setQuery] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState(espacos[0]?.id ?? "");
  const [selectedSchedule, setSelectedSchedule] = useState<Horario | null>(
    null,
  );

  const availableSchedules = useMemo(
    () =>
      horarios
        .filter((horario) => !horario.alocadoId)
        .sort(
          (a, b) =>
            new Date(a.inicio).getTime() - new Date(b.inicio).getTime(),
        ),
    [horarios],
  );

  const roomsWithAvailability = useMemo(() => {
    const availableByRoom = availableSchedules.reduce<Record<string, number>>(
      (acc, horario) => {
        acc[horario.espacoId] = (acc[horario.espacoId] ?? 0) + 1;
        return acc;
      },
      {},
    );
    const normalizedQuery = query.trim().toLowerCase();

    return espacos
      .filter((espaco) => {
        if (!normalizedQuery) return true;
        return [espaco.nome, espaco.predio?.nome, espaco.tipo]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(normalizedQuery));
      })
      .map((espaco) => ({
        ...espaco,
        availableCount: availableByRoom[espaco.id] ?? 0,
      }))
      .sort((a, b) => b.availableCount - a.availableCount);
  }, [availableSchedules, espacos, query]);

  const selectedRoom =
    roomsWithAvailability.find((espaco) => espaco.id === selectedRoomId) ??
    roomsWithAvailability[0] ??
    null;

  const selectedRoomSchedules = selectedRoom
    ? availableSchedules.filter((horario) => horario.espacoId === selectedRoom.id)
    : [];
  const schedulesByDay = groupByDay(selectedRoomSchedules);

  return (
    <main className="min-h-dvh bg-neutral-50 text-neutral-950 lg:flex">
      <AppSidebar counts={counts} user={user} />

      <section className="min-w-0 flex-1">
      <header className="border-b border-neutral-200 bg-white px-5 py-4 sm:px-8 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase text-neutral-400">
                Perfil professor
              </p>
              <h1 className="text-lg font-semibold text-neutral-950">
                Reservar sala
              </h1>
            </div>

          <span className="rounded-md bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
            {availableSchedules.length} horários disponíveis
          </span>
        </div>
      </header>

      <div className="space-y-5 px-5 py-5 sm:px-8 lg:px-10">
       
        <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-[0_1px_10px_rgba(15,23,42,0.04)]">
          <h2 className="text-base font-semibold text-neutral-950">
            Minhas solicitações recentes
          </h2>
          {solicitacoes.length === 0 ? (
            <p className="mt-4 rounded-md border border-dashed border-neutral-200 px-4 py-5 text-sm text-neutral-500">
              Você ainda não enviou solicitações.
            </p>
          ) : (
            <div className="mt-4 max-h-[360px] overflow-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-neutral-50 text-xs font-semibold uppercase text-neutral-500">
                  <tr>
                    <th className="px-4 py-3">Sala</th>
                    <th className="px-4 py-3">Horário</th>
                    <th className="px-4 py-3">Turma</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {solicitacoes.slice(0, 8).map((solicitacao) => (
                    <tr key={solicitacao.id}>
                      <td className="px-4 py-3 font-medium text-neutral-900">
                        {solicitacao.horario?.espaco?.nome ?? "Sala"}
                      </td>
                      <td className="px-4 py-3 text-neutral-600">
                        {solicitacao.horario
                          ? `${formatDate(solicitacao.horario.inicio)} · ${formatTimeRange(
                              solicitacao.horario,
                            )}`
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-neutral-600">
                        {solicitacao.turma?.codigo ?? "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex h-7 items-center rounded-md px-2 text-xs font-semibold ${statusClassName(
                            solicitacao.situacao,
                          )}`}
                        >
                          {solicitacao.situacao}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-[0_1px_10px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">
                Agenda {agendas[0]?.ano ?? new Date().getFullYear()}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-neutral-950">
                Escolha uma sala e envie sua solicitação.
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-neutral-500">
                Clique em uma sala para ver os horários abertos. A reserva fica
                pendente até a avaliação do organizador.
              </p>
            </div>
            <div className="grid min-w-64 grid-cols-2 gap-3">
              <div className="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase text-neutral-400">
                  Salas
                </p>
                <p className="mt-1 text-xl font-semibold text-neutral-950">
                  {espacos.length}
                </p>
              </div>
              <div className="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase text-neutral-400">
                  Horários
                </p>
                <p className="mt-1 text-xl font-semibold text-neutral-950">
                  {availableSchedules.length}
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

        <section className="grid gap-2 xl:grid-cols-2 xl:items-start">
          <div className="rounded-lg border border-neutral-200 bg-white shadow-[0_1px_10px_rgba(15,23,42,0.04)]">
            <div className="border-b border-neutral-200 p-4">
              <label className="block">
                <span className="text-xs font-semibold text-neutral-600">
                  Buscar sala
                </span>
                <input
                  className={`${fieldClassName} mt-1`}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Nome, prédio ou tipo"
                  type="search"
                  value={query}
                />
              </label>
            </div>

            <div className="max-h-[520px] overflow-y-auto p-3">
              {roomsWithAvailability.length === 0 ? (
                <p className="rounded-md border border-dashed border-neutral-200 px-4 py-5 text-sm text-neutral-500">
                  Nenhuma sala encontrada.
                </p>
              ) : (
                <div className="space-y-2">
                  {roomsWithAvailability.map((espaco) => {
                    const selected = selectedRoom?.id === espaco.id;

                    return (
                      <button
                        className={`w-full rounded-md border p-4 text-left transition ${
                          selected
                            ? "border-indigo-300 bg-indigo-50"
                            : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50"
                        }`}
                        key={espaco.id}
                        onClick={() => setSelectedRoomId(espaco.id)}
                        type="button"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-semibold text-neutral-950">
                              {espaco.nome}
                            </h3>
                            <p className="mt-1 text-xs text-neutral-500">
                              {espaco.predio?.nome ?? "Prédio não informado"} ·{" "}
                              {espaco.tipo}
                            </p>
                          </div>
                          <span
                            className={`rounded-md px-2 py-1 text-xs font-semibold ${
                              espaco.availableCount > 0
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-neutral-100 text-neutral-500"
                            }`}
                          >
                            {espaco.availableCount} horários
                          </span>
                        </div>
                        <p className="mt-3 text-xs font-medium text-neutral-500">
                          {espaco.capacidade} lugares
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-[0_1px_10px_rgba(15,23,42,0.04)]">
            <div className="border-b border-neutral-200 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-neutral-400">
                    Agenda disponível
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-neutral-950">
                    {selectedRoom?.nome ?? "Selecione uma sala"}
                  </h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    {selectedRoom
                      ? `${selectedRoom.predio?.nome ?? "Prédio não informado"} · ${selectedRoom.capacidade} lugares`
                      : "Escolha uma sala na lista para ver os horários."}
                  </p>
                </div>
                <span className="inline-flex h-8 items-center self-start rounded-md bg-neutral-100 px-3 text-xs font-semibold text-neutral-600">
                  {selectedRoomSchedules.length} horários
                </span>
              </div>
            </div>

            <div className="max-h-[520px] overflow-y-auto p-5">
              {!selectedRoom ? (
                <p className="rounded-md border border-dashed border-neutral-200 px-4 py-5 text-sm text-neutral-500">
                  Nenhuma sala selecionada.
                </p>
              ) : selectedRoomSchedules.length === 0 ? (
                <p className="rounded-md border border-dashed border-neutral-200 px-4 py-5 text-sm text-neutral-500">
                  Esta sala não possui horários disponíveis no momento.
                </p>
              ) : (
                <div className="space-y-5 pr-1">
                  {Object.entries(schedulesByDay).map(([day, daySchedules]) => (
                    <section key={day}>
                      <h3 className="text-sm font-semibold capitalize text-neutral-700">
                        {formatDate(day)}
                      </h3>
                      <div className="mt-3 grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                        {daySchedules.map((horario) => (
                          <button
                            className="rounded-md border border-neutral-200 bg-white p-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                            key={horario.id}
                            onClick={() => setSelectedSchedule(horario)}
                            type="button"
                          >
                            <span className="text-sm font-semibold text-neutral-950">
                              {formatTimeRange(horario)}
                            </span>
                            <span className="mt-2 block text-xs font-medium text-neutral-500">
                              Agenda {horario.agenda?.ano ?? agendas[0]?.ano}
                            </span>
                          </button>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

      </div>

      {selectedSchedule ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 px-4 py-6"
          onClick={() => setSelectedSchedule(null)}
        >
          <div
            aria-modal="true"
            className="w-full max-w-xl rounded-lg border border-neutral-200 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="border-b border-neutral-200 px-5 py-4">
              <p className="text-xs font-semibold uppercase text-neutral-400">
                Solicitar reserva
              </p>
              <h2 className="mt-1 text-lg font-semibold text-neutral-950">
                {selectedRoom?.nome ?? "Sala"}
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                {formatDate(selectedSchedule.inicio)} ·{" "}
                {formatTimeRange(selectedSchedule)}
              </p>
            </div>

            <form action={solicitarReservaAction} className="space-y-4 p-5">
              <input name="horarioId" type="hidden" value={selectedSchedule.id} />
              <input name="redirectTo" type="hidden" value="/salas" />

              <label className="block">
                <span className="text-xs font-semibold text-neutral-700">
                  Turma
                </span>
                <select
                  className={`${fieldClassName} mt-1`}
                  disabled={turmas.length === 0}
                  name="turmaId"
                  required
                >
                  <option value="">Selecione uma turma</option>
                  {turmas.map((turma) => (
                    <option key={turma.id} value={turma.id}>
                      {turma.codigo} · {turma.curso} · {turma.semestre}º
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-neutral-700">
                  Justificativa
                </span>
                <textarea
                  className={`${textareaClassName} mt-1`}
                  maxLength={500}
                  minLength={10}
                  name="justificativa"
                  placeholder="Descreva o motivo da reserva"
                  required
                />
              </label>

              {turmas.length === 0 ? (
                <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                  Não há turmas cadastradas para vincular a esta solicitação.
                </p>
              ) : null}

              <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
                <button
                  className={secondaryButtonClassName}
                  onClick={() => setSelectedSchedule(null)}
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  className="h-10 rounded-md bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
                  disabled={turmas.length === 0}
                  type="submit"
                >
                  Enviar solicitação
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
      </section>
    </main>
  );
}
