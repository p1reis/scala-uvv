"use client";

import { useMemo, useState } from "react";
import {
  atualizarHorarioAction,
  criarDisponibilidadesAction,
  removerHorarioAction,
} from "../actions";
import type { Agenda, Espaco, Horario, Turma } from "../lib/api";
import type { SessionUser } from "../lib/session";
import { AppSidebar, type SidebarCounts } from "./app-sidebar";

type ScheduleManagerProps = {
  agendas: Agenda[];
  counts?: SidebarCounts;
  espacos: Espaco[];
  horarios: Horario[];
  turmas: Turma[];
  message: {
    success?: string;
    error?: string;
  };
  user: SessionUser;
};

type ViewMode = "dia" | "semana";
type WorkMode = "calendario" | "lista";

const dayStartHour = 7;
const dayEndHour = 23;
const rowHeight = 72;
const hours = Array.from(
  { length: dayEndHour - dayStartHour },
  (_, index) => dayStartHour + index,
);
const weekDayOptions = [
  ["1", "Seg"],
  ["2", "Ter"],
  ["3", "Qua"],
  ["4", "Qui"],
  ["5", "Sex"],
  ["6", "Sáb"],
  ["0", "Dom"],
];

const fieldClassName =
  "h-11 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";
const primaryButtonClassName =
  "h-11 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30";
const secondaryButtonClassName =
  "h-10 rounded-md border border-neutral-200 px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50";
const iconButtonClassName =
  "grid size-10 place-items-center rounded-md border border-neutral-200 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50";

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <path d="M3 10h18" />
      <rect height="18" rx="2" width="18" x="3" y="4" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M3 5h18" />
      <path d="M6 12h12" />
      <path d="M10 19h4" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function dateKey(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date(`${value}T12:00:00`));
}

function datetimeLocal(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function clock(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function minutesFromStart(value: string) {
  const date = new Date(value);
  return date.getHours() * 60 + date.getMinutes() - dayStartHour * 60;
}

function durationMinutes(horario: Horario) {
  return Math.max(
    30,
    Math.round(
      (new Date(horario.fim).getTime() - new Date(horario.inicio).getTime()) /
        60000,
    ),
  );
}

function addDays(date: string, days: number) {
  const nextDate = new Date(`${date}T12:00:00`);
  nextDate.setDate(nextDate.getDate() + days);
  return dateKey(nextDate);
}

function startOfWeek(date: string) {
  const current = new Date(`${date}T12:00:00`);
  const day = current.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  current.setDate(current.getDate() + diff);
  return dateKey(current);
}

function addHours(date: string, hour: number, duration = 1) {
  return {
    inicio: `${date}T${String(hour).padStart(2, "0")}:00`,
    fim: `${date}T${String(hour + duration).padStart(2, "0")}:00`,
  };
}

function agendaLabel(agenda?: Agenda) {
  return agenda ? `Agenda ${agenda.ano}` : `Agenda ${new Date().getFullYear()}`;
}

function sameDate(first: string, second: string) {
  return dateKey(first) === second;
}

export function ScheduleManager({
  agendas,
  counts,
  espacos,
  horarios,
  message,
  turmas,
  user,
}: ScheduleManagerProps) {
  const today = dateKey(new Date());
  const currentAgenda = agendas[0];
  const [workMode, setWorkMode] = useState<WorkMode>("calendario");
  const [viewMode, setViewMode] = useState<ViewMode>("dia");
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedRoomId, setSelectedRoomId] = useState("todas");
  const [buildingFilter, setBuildingFilter] = useState("todos");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [capacityFilter, setCapacityFilter] = useState("");
  const [roomSearch, setRoomSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [selectedHorarioId, setSelectedHorarioId] = useState<string | null>(
    null,
  );
  const [draft, setDraft] = useState(() => addHours(today, 8, 1));

  const sortedRooms = useMemo(
    () =>
      [...espacos].sort((first, second) =>
        first.nome.localeCompare(second.nome, "pt-BR"),
      ),
    [espacos],
  );
  const buildings = useMemo(() => {
    const unique = new Map<string, string>();
    for (const room of sortedRooms) {
      if (room.predio?.id && room.predio.nome) {
        unique.set(room.predio.id, room.predio.nome);
      }
    }
    return Array.from(unique, ([id, nome]) => ({ id, nome })).sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR"),
    );
  }, [sortedRooms]);
  const filteredRooms = useMemo(() => {
    const minimumCapacity = Number(capacityFilter);
    const normalizedSearch = roomSearch.trim().toLowerCase();

    return sortedRooms.filter((room) => {
      const matchesBuilding =
        buildingFilter === "todos" || room.predio?.id === buildingFilter;
      const matchesType = typeFilter === "todos" || room.tipo === typeFilter;
      const matchesCapacity =
        !capacityFilter ||
        (Number.isFinite(minimumCapacity) && room.capacidade >= minimumCapacity);
      const matchesSearch =
        !normalizedSearch ||
        room.nome.toLowerCase().includes(normalizedSearch) ||
        room.predio?.nome?.toLowerCase().includes(normalizedSearch);

      return matchesBuilding && matchesType && matchesCapacity && matchesSearch;
    });
  }, [buildingFilter, capacityFilter, roomSearch, sortedRooms, typeFilter]);
  const selectedRoom =
    filteredRooms.find((espaco) => espaco.id === selectedRoomId) ??
    filteredRooms[0] ??
    sortedRooms[0];
  const visibleDayRooms =
    selectedRoomId === "todas"
      ? filteredRooms.slice(0, 8)
      : filteredRooms.filter((espaco) => espaco.id === selectedRoomId);
  const weekDates = useMemo(() => {
    const firstDay = startOfWeek(selectedDate);
    return Array.from({ length: 7 }, (_, index) => addDays(firstDay, index));
  }, [selectedDate]);
  const columns =
    viewMode === "dia"
      ? visibleDayRooms.map((room) => ({
          id: room.id,
          label: room.nome,
          detail: `${room.predio?.nome ?? "Prédio não informado"} · ${
            room.capacidade
          } lugares`,
          date: selectedDate,
          roomId: room.id,
        }))
      : weekDates.map((date) => ({
          id: date,
          label: formatDateLabel(date),
          detail: selectedRoom?.nome ?? "Selecione uma sala",
          date,
          roomId: selectedRoom?.id ?? "",
        }));

  const selectedHorario =
    horarios.find((horario) => horario.id === selectedHorarioId) ?? null;
  const visibleSchedules = useMemo(() => {
    const roomIds = new Set(filteredRooms.map((room) => room.id));

    if (viewMode === "dia") {
      return horarios.filter(
        (horario) =>
          sameDate(horario.inicio, selectedDate) && roomIds.has(horario.espacoId),
      );
    }

    const weekSet = new Set(weekDates);
    return horarios.filter(
      (horario) =>
        weekSet.has(dateKey(horario.inicio)) &&
        (!selectedRoom || horario.espacoId === selectedRoom.id),
    );
  }, [filteredRooms, horarios, selectedDate, selectedRoom, viewMode, weekDates]);
  const listSchedules = useMemo(() => {
    const roomIds = new Set(filteredRooms.map((room) => room.id));
    return horarios
      .filter((horario) => roomIds.has(horario.espacoId))
      .sort(
        (first, second) =>
          new Date(first.inicio).getTime() - new Date(second.inicio).getTime(),
      );
  }, [filteredRooms, horarios]);

  const totalReservados = visibleSchedules.filter(
    (horario) => horario.alocadoId,
  ).length;
  const totalDisponiveis = visibleSchedules.length - totalReservados;
  const formKey = selectedHorario?.id ?? `${draft.inicio}-${draft.fim}`;
  const activeFilters = [
    buildingFilter !== "todos",
    typeFilter !== "todos",
    Boolean(capacityFilter),
    Boolean(roomSearch.trim()),
  ].filter(Boolean).length;

  function moveDate(direction: -1 | 1) {
    setSelectedDate((current) =>
      addDays(current, direction * (viewMode === "dia" ? 1 : 7)),
    );
    setSelectedHorarioId(null);
  }

  function prepareDraft(date: string, roomId: string, hour: number) {
    setSelectedHorarioId(null);
    setSelectedDate(date);
    setSelectedRoomId(roomId);
    setDraft(addHours(date, hour, 1));
    setAvailabilityOpen(true);
  }

  return (
    <main className="min-h-dvh bg-neutral-50 text-neutral-950 lg:flex">
      <AppSidebar counts={counts} user={user} />

      <section className="min-w-0 flex-1">
        <header className="border-b border-neutral-200 bg-white px-5 py-4 sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase text-neutral-400">
                Plataforma Scala
              </p>
              <h1 className="text-xl font-semibold text-neutral-950">
                Gestão de horários
              </h1>
            </div>

            <span className="rounded-md bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
              {horarios.length} horários · {espacos.length} salas
            </span>
          </div>
        </header>

        <div className="px-4 py-5 sm:px-6 lg:px-8">
          <section className="min-w-0 space-y-4">
          <div className="rounded-lg border border-neutral-200 bg-white p-3 shadow-[0_1px_10px_rgba(15,23,42,0.04)]">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                  <button
                    aria-label="Voltar"
                    className={iconButtonClassName}
                    onClick={() => moveDate(-1)}
                    type="button"
                  >
                    ←
                  </button>
                  <input
                    className={`${fieldClassName} w-44`}
                    onChange={(event) => {
                      setSelectedDate(event.target.value);
                      setSelectedHorarioId(null);
                      setDraft(addHours(event.target.value, 8, 1));
                    }}
                    type="date"
                    value={selectedDate}
                  />
                  <button
                    aria-label="Avançar"
                    className={iconButtonClassName}
                    onClick={() => moveDate(1)}
                    type="button"
                  >
                    →
                  </button>
                  <button
                    className="h-10 rounded-md border border-neutral-200 px-3 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
                    onClick={() => {
                      setSelectedDate(today);
                      setSelectedHorarioId(null);
                    }}
                    type="button"
                  >
                    Hoje
                  </button>
              </div>

              <div className="grid h-10 grid-cols-2 rounded-md border border-neutral-200 bg-neutral-50 p-1">
                  {(["calendario", "lista"] as const).map((mode) => (
                    <button
                      aria-label={mode === "calendario" ? "Calendário" : "Lista"}
                      className={`grid size-8 place-items-center rounded text-sm font-semibold transition ${
                        workMode === mode
                          ? "bg-white text-indigo-700 shadow-sm"
                          : "text-neutral-600 hover:text-neutral-950"
                      }`}
                      key={mode}
                      onClick={() => {
                        setWorkMode(mode);
                        setSelectedHorarioId(null);
                      }}
                      title={mode === "calendario" ? "Calendário" : "Lista"}
                      type="button"
                    >
                      {mode === "calendario" ? <CalendarIcon /> : <ListIcon />}
                    </button>
                  ))}
              </div>

              <label className="block">
                <select
                  aria-label="Sala"
                  className={`${fieldClassName} w-56`}
                  onChange={(event) => {
                    setSelectedRoomId(event.target.value);
                    setSelectedHorarioId(null);
                  }}
                  value={selectedRoomId}
                >
                  {viewMode === "dia" ? (
                    <option value="todas">Todas as salas</option>
                  ) : null}
                  {filteredRooms.map((espaco) => (
                    <option key={espaco.id} value={espaco.id}>
                      {espaco.nome}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid h-10 grid-cols-2 rounded-md border border-neutral-200 bg-neutral-50 p-1">
                  {(["dia", "semana"] as const).map((mode) => (
                    <button
                      aria-label={mode === "dia" ? "Visão diária" : "Visão semanal"}
                      className={`grid size-8 place-items-center rounded text-xs font-semibold transition ${
                        viewMode === mode
                          ? "bg-white text-indigo-700 shadow-sm"
                          : "text-neutral-600 hover:text-neutral-950"
                      }`}
                      key={mode}
                      onClick={() => {
                        setViewMode(mode);
                        setSelectedHorarioId(null);
                        if (mode === "semana" && selectedRoomId === "todas") {
                          setSelectedRoomId(sortedRooms[0]?.id ?? "todas");
                        }
                      }}
                      title={mode === "dia" ? "Dia" : "Semana"}
                      type="button"
                    >
                      {mode === "dia" ? "D" : "S"}
                    </button>
                  ))}
              </div>

              <button
                className="relative h-10 rounded-md border border-neutral-200 px-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
                onClick={() => setFiltersOpen(true)}
                type="button"
              >
                <span className="flex items-center gap-2">
                  <FilterIcon />
                  Filtros
                </span>
                {activeFilters > 0 ? (
                  <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                    {activeFilters}
                  </span>
                ) : null}
              </button>

              <button
                className="h-10 rounded-md bg-indigo-600 px-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                onClick={() => setAvailabilityOpen(true)}
                type="button"
              >
                <span className="flex items-center gap-2">
                  <PlusIcon />
                  Disponibilidade
                </span>
              </button>

              <div className="ml-auto grid grid-cols-3 gap-2 text-center">
                {[
                  ["Horários", visibleSchedules.length],
                  ["Disponíveis", totalDisponiveis],
                  ["Reservados", totalReservados],
                ].map(([label, value]) => (
                  <div
                    className="min-w-20 rounded-md border border-neutral-200 px-2 py-1.5"
                    key={label}
                  >
                    <p className="text-base font-semibold text-neutral-950">
                      {value}
                    </p>
                    <p className="text-xs text-neutral-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

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

          {workMode === "calendario" ? (
          <div className="overflow-auto rounded-lg border border-neutral-200 bg-white shadow-[0_1px_10px_rgba(15,23,42,0.04)]">
            <div
              className="grid min-w-[920px]"
              style={{
                gridTemplateColumns: `76px repeat(${Math.max(
                  columns.length,
                  1,
                )}, minmax(180px, 1fr))`,
              }}
            >
              <div className="sticky left-0 top-0 z-30 border-b border-r border-neutral-200 bg-neutral-50 px-3 py-3 text-xs font-semibold text-neutral-500">
                Hora
              </div>
              {columns.length > 0 ? (
                columns.map((column) => (
                  <div
                    className="sticky top-0 z-20 border-b border-r border-neutral-200 bg-neutral-50 px-3 py-3"
                    key={column.id}
                  >
                    <p className="truncate text-sm font-semibold text-neutral-950">
                      {column.label}
                    </p>
                    <p className="truncate text-xs text-neutral-500">
                      {column.detail}
                    </p>
                  </div>
                ))
              ) : (
                <div className="border-b border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-500">
                  Nenhuma sala cadastrada
                </div>
              )}

              <div
                className="sticky left-0 z-10 border-r border-neutral-200 bg-neutral-50"
                style={{ height: hours.length * rowHeight }}
              >
                {hours.map((hour) => (
                  <div
                    className="border-b border-neutral-200 px-3 pt-2 text-xs font-medium text-neutral-500"
                    key={hour}
                    style={{ height: rowHeight }}
                  >
                    {String(hour).padStart(2, "0")}:00
                  </div>
                ))}
              </div>

              {columns.map((column) => {
                const schedules = visibleSchedules.filter(
                  (horario) =>
                    horario.espacoId === column.roomId &&
                    sameDate(horario.inicio, column.date),
                );

                return (
                  <div
                    className="relative border-r border-neutral-200"
                    key={column.id}
                    style={{ height: hours.length * rowHeight }}
                  >
                    {hours.map((hour) => (
                      <button
                        aria-label={`Criar disponibilidade em ${column.label} às ${hour}:00`}
                        className="absolute left-0 right-0 border-b border-neutral-100 text-left transition hover:bg-indigo-50/60"
                        key={hour}
                        onClick={() =>
                          prepareDraft(column.date, column.roomId, hour)
                        }
                        style={{
                          top: (hour - dayStartHour) * rowHeight,
                          height: rowHeight,
                        }}
                        type="button"
                      />
                    ))}

                    {schedules.map((horario) => {
                      const top = Math.max(0, minutesFromStart(horario.inicio));
                      const height = Math.min(
                        hours.length * rowHeight - top,
                        (durationMinutes(horario) / 60) * rowHeight,
                      );
                      const active = selectedHorarioId === horario.id;

                      return (
                        <button
                          className={`absolute left-2 right-2 z-10 overflow-hidden rounded-md border px-3 py-2 text-left shadow-sm transition ${
                            active
                              ? "border-indigo-500 bg-indigo-600 text-white"
                              : horario.alocadoId
                                ? "border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-300"
                                : "border-indigo-100 bg-indigo-50 text-indigo-950 hover:border-indigo-300"
                          }`}
                          key={horario.id}
                          onClick={() => setSelectedHorarioId(horario.id)}
                          style={{
                            top: (top / 60) * rowHeight,
                            minHeight: 44,
                            height,
                          }}
                          type="button"
                        >
                          <span className="block text-xs font-semibold">
                            {clock(horario.inicio)} - {clock(horario.fim)}
                          </span>
                          <span className="mt-1 block truncate text-sm font-semibold">
                            {horario.turma
                              ? `${horario.turma.codigo} · ${horario.turma.curso}`
                              : "Disponível"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-[0_1px_10px_rgba(15,23,42,0.04)]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-neutral-50 text-xs font-semibold uppercase text-neutral-500">
                    <tr>
                      <th className="px-4 py-3">Sala</th>
                      <th className="px-4 py-3">Prédio</th>
                      <th className="px-4 py-3">Início</th>
                      <th className="px-4 py-3">Fim</th>
                      <th className="px-4 py-3">Turma</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {listSchedules.length === 0 ? (
                      <tr>
                        <td
                          className="px-4 py-10 text-center text-sm text-neutral-500"
                          colSpan={6}
                        >
                          Nenhum horário encontrado com os filtros atuais.
                        </td>
                      </tr>
                    ) : (
                      listSchedules.map((horario) => (
                        <tr
                          className="cursor-pointer transition hover:bg-neutral-50"
                          key={horario.id}
                          onClick={() => setSelectedHorarioId(horario.id)}
                        >
                          <td className="px-4 py-3 font-semibold text-neutral-950">
                            {horario.espaco?.nome ?? "Sala"}
                          </td>
                          <td className="px-4 py-3 text-neutral-600">
                            {horario.espaco?.predio?.nome ?? "-"}
                          </td>
                          <td className="px-4 py-3 text-neutral-600">
                            {new Intl.DateTimeFormat("pt-BR", {
                              dateStyle: "short",
                              timeStyle: "short",
                            }).format(new Date(horario.inicio))}
                          </td>
                          <td className="px-4 py-3 text-neutral-600">
                            {new Intl.DateTimeFormat("pt-BR", {
                              dateStyle: "short",
                              timeStyle: "short",
                            }).format(new Date(horario.fim))}
                          </td>
                          <td className="px-4 py-3 text-neutral-600">
                            {horario.turma?.codigo ?? "Disponível"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex h-7 items-center rounded-md px-2 text-xs font-semibold ${
                                horario.alocadoId
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-neutral-100 text-neutral-600"
                              }`}
                            >
                              {horario.alocadoId ? "reservado" : "disponível"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

      </div>

      {filtersOpen ? (
        <div
          aria-labelledby="filters-modal-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/45 px-4 py-6 backdrop-blur-[2px]"
          role="dialog"
        >
          <button
            aria-label="Fechar filtros"
            className="absolute inset-0 cursor-default"
            onClick={() => setFiltersOpen(false)}
            type="button"
          />
          <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-6 py-5">
              <div>
                <h2
                  className="text-lg font-semibold text-neutral-950"
                  id="filters-modal-title"
                >
                  Filtros
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Refine a visualização por prédio, tipo, capacidade ou nome.
                </p>
              </div>
              <button
                aria-label="Fechar filtros"
                className="grid size-9 place-items-center rounded-md border border-neutral-200 text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-900"
                onClick={() => setFiltersOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="grid gap-4 px-6 py-6 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-semibold text-neutral-700">
                  Prédio
                </span>
                <select
                  className={`${fieldClassName} mt-1`}
                  onChange={(event) => {
                    setBuildingFilter(event.target.value);
                    setSelectedHorarioId(null);
                  }}
                  value={buildingFilter}
                >
                  <option value="todos">Todos</option>
                  {buildings.map((building) => (
                    <option key={building.id} value={building.id}>
                      {building.nome}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-neutral-700">
                  Tipo
                </span>
                <select
                  className={`${fieldClassName} mt-1`}
                  onChange={(event) => {
                    setTypeFilter(event.target.value);
                    setSelectedHorarioId(null);
                  }}
                  value={typeFilter}
                >
                  <option value="todos">Todos</option>
                  <option value="sala">Sala</option>
                  <option value="laboratorio">Laboratório</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-neutral-700">
                  Capacidade mínima
                </span>
                <input
                  className={`${fieldClassName} mt-1`}
                  min={1}
                  onChange={(event) => setCapacityFilter(event.target.value)}
                  placeholder="Ex.: 40"
                  type="number"
                  value={capacityFilter}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-neutral-700">
                  Buscar sala
                </span>
                <input
                  className={`${fieldClassName} mt-1`}
                  onChange={(event) => setRoomSearch(event.target.value)}
                  placeholder="Nome ou prédio"
                  type="search"
                  value={roomSearch}
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 border-t border-neutral-200 bg-neutral-50 px-6 py-4">
              <button
                className={secondaryButtonClassName}
                onClick={() => {
                  setBuildingFilter("todos");
                  setTypeFilter("todos");
                  setCapacityFilter("");
                  setRoomSearch("");
                  setSelectedHorarioId(null);
                }}
                type="button"
              >
                Limpar
              </button>
              <button
                className={primaryButtonClassName}
                onClick={() => setFiltersOpen(false)}
                type="button"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {availabilityOpen ? (
        <div
          aria-labelledby="availability-modal-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/45 px-4 py-6 backdrop-blur-[2px]"
          role="dialog"
        >
          <button
            aria-label="Fechar criação de disponibilidade"
            className="absolute inset-0 cursor-default"
            onClick={() => setAvailabilityOpen(false)}
            type="button"
          />
          <div className="relative z-10 flex max-h-[calc(100dvh-48px)] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-6 py-5">
              <div>
                <h2
                  className="text-lg font-semibold text-neutral-950"
                  id="availability-modal-title"
                >
                  Criar disponibilidade
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Crie horários pontuais ou recorrentes na agenda anual.
                </p>
              </div>
              <button
                aria-label="Fechar criação de disponibilidade"
                className="grid size-9 place-items-center rounded-md border border-neutral-200 text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-900"
                onClick={() => setAvailabilityOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>

            <form action={criarDisponibilidadesAction} className="flex min-h-0 flex-col">
              <div className="grid gap-4 overflow-y-auto px-6 py-6 md:grid-cols-2">
                <input
                  name="agendaId"
                  type="hidden"
                  value={currentAgenda?.id ?? ""}
                />

                <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600 md:col-span-2">
                  {agendaLabel(currentAgenda)}
                </div>

                <fieldset className="md:col-span-2">
                  <legend className="text-xs font-semibold text-neutral-700">
                    Salas
                  </legend>
                  <div className="mt-2 grid max-h-40 gap-2 overflow-auto rounded-md border border-neutral-200 p-2 md:grid-cols-2">
                    {sortedRooms.length > 0 ? (
                      sortedRooms.map((espaco) => (
                        <label
                          className="flex items-center gap-2 rounded px-2 py-1 text-sm text-neutral-700 hover:bg-neutral-50"
                          key={espaco.id}
                        >
                          <input
                            className="size-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                            defaultChecked={
                              selectedRoomId !== "todas" &&
                              selectedRoomId === espaco.id
                            }
                            name="espacoIds"
                            type="checkbox"
                            value={espaco.id}
                          />
                          <span>{espaco.nome}</span>
                        </label>
                      ))
                    ) : (
                      <p className="px-2 py-3 text-sm text-neutral-500">
                        Nenhuma sala cadastrada.
                      </p>
                    )}
                  </div>
                </fieldset>

                <label className="block">
                  <span className="text-xs font-semibold text-neutral-700">
                    Início do período
                  </span>
                  <input
                    className={`${fieldClassName} mt-1`}
                    defaultValue={dateKey(draft.inicio)}
                    name="dataInicio"
                    required
                    type="date"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-neutral-700">
                    Fim do período
                  </span>
                  <input
                    className={`${fieldClassName} mt-1`}
                    defaultValue={
                      viewMode === "semana"
                        ? addDays(startOfWeek(selectedDate), 6)
                        : dateKey(draft.inicio)
                    }
                    name="dataFim"
                    required
                    type="date"
                  />
                </label>

                <fieldset className="md:col-span-2">
                  <legend className="text-xs font-semibold text-neutral-700">
                    Dias de repetição
                  </legend>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
                    {weekDayOptions.map(([value, label]) => (
                      <label
                        className="flex h-10 items-center justify-center gap-2 rounded-md border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                        key={value}
                      >
                        <input
                          className="size-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                          defaultChecked={
                            viewMode === "semana"
                              ? ["1", "2", "3", "4", "5"].includes(value)
                              : String(
                                  new Date(`${selectedDate}T12:00:00`).getDay(),
                                ) === value
                          }
                          name="diasSemana"
                          type="checkbox"
                          value={value}
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <label className="block">
                  <span className="text-xs font-semibold text-neutral-700">
                    Hora inicial
                  </span>
                  <input
                    className={`${fieldClassName} mt-1`}
                    defaultValue={datetimeLocal(draft.inicio).slice(11, 16)}
                    name="horaInicio"
                    required
                    type="time"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-neutral-700">
                    Hora final
                  </span>
                  <input
                    className={`${fieldClassName} mt-1`}
                    defaultValue={datetimeLocal(draft.fim).slice(11, 16)}
                    name="horaFim"
                    required
                    type="time"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t border-neutral-200 bg-neutral-50 px-6 py-4">
                <button
                  className={secondaryButtonClassName}
                  onClick={() => setAvailabilityOpen(false)}
                  type="button"
                >
                  Cancelar
                </button>
                <button className={primaryButtonClassName} type="submit">
                  Criar disponibilidade
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {selectedHorario ? (
        <div
          aria-labelledby="schedule-edit-modal-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/45 px-4 py-6 backdrop-blur-[2px]"
          role="dialog"
        >
          <button
            aria-label="Fechar edição de horário"
            className="absolute inset-0 cursor-default"
            onClick={() => setSelectedHorarioId(null)}
            type="button"
          />
          <div className="relative z-10 flex max-h-[calc(100dvh-48px)] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-6 py-5">
              <div>
                <h2
                  className="text-lg font-semibold text-neutral-950"
                  id="schedule-edit-modal-title"
                >
                  Editar horário
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Ajuste sala, turma e intervalo do bloco selecionado.
                </p>
              </div>
              <button
                aria-label="Fechar edição de horário"
                className="grid size-9 place-items-center rounded-md border border-neutral-200 text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-900"
                onClick={() => setSelectedHorarioId(null)}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-6">
              <form
                action={atualizarHorarioAction}
                className="space-y-3"
                key={formKey}
              >
                <input name="horarioId" type="hidden" value={selectedHorario.id} />
                <input
                  name="agendaId"
                  type="hidden"
                  value={selectedHorario.agenda?.id ?? currentAgenda?.id ?? ""}
                />

                <label className="block">
                  <span className="text-xs font-semibold text-neutral-700">
                    Sala
                  </span>
                  <select
                    className={`${fieldClassName} mt-1`}
                    defaultValue={selectedHorario.espacoId}
                    name="espacoId"
                    required
                  >
                    {sortedRooms.map((espaco) => (
                      <option key={espaco.id} value={espaco.id}>
                        {espaco.nome}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-semibold text-neutral-700">
                      Início
                    </span>
                    <input
                      className={`${fieldClassName} mt-1`}
                      defaultValue={datetimeLocal(selectedHorario.inicio)}
                      name="inicio"
                      required
                      type="datetime-local"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-neutral-700">
                      Fim
                    </span>
                    <input
                      className={`${fieldClassName} mt-1`}
                      defaultValue={datetimeLocal(selectedHorario.fim)}
                      name="fim"
                      required
                      type="datetime-local"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-xs font-semibold text-neutral-700">
                    Turma
                  </span>
                  <select
                    className={`${fieldClassName} mt-1`}
                    defaultValue={selectedHorario.turmaId ?? ""}
                    name="turmaId"
                  >
                    <option value="">Disponível para reserva</option>
                    {turmas.map((turma) => (
                      <option key={turma.id} value={turma.id}>
                        {turma.codigo} · {turma.curso} · {turma.semestre}º
                      </option>
                    ))}
                  </select>
                </label>

                <button className={`${primaryButtonClassName} w-full`} type="submit">
                  Salvar alterações
                </button>
              </form>

              <form action={removerHorarioAction} className="mt-3">
                <input name="horarioId" type="hidden" value={selectedHorario.id} />
                <button
                  className="h-10 w-full rounded-md border border-red-200 px-3 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                  type="submit"
                >
                  Remover horário
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
      </section>
    </main>
  );
}
