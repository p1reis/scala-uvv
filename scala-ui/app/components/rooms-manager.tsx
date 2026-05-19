"use client";

import { useState } from "react";
import { criarPredioAction, criarSalaAction } from "../actions";
import type { Espaco, Predio } from "../lib/api";
import type { SessionUser } from "../lib/session";
import { AppSidebar, type SidebarCounts } from "./app-sidebar";

type RoomsManagerProps = {
  counts?: SidebarCounts;
  espacos: Espaco[];
  predios: Predio[];
  message: {
    success?: string;
    error?: string;
  };
  user: SessionUser;
};

type ActiveTab =   "salas" | "predios";

const fieldClassName =
  "h-11 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";
const primaryButtonClassName =
  "h-11 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30";
const secondaryButtonClassName =
  "h-10 rounded-md border border-neutral-200 px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50";

function EmptyTable({ children }: { children: React.ReactNode }) {
  return (
    <tr>
      <td className="px-6 py-14 text-center text-sm text-neutral-500" colSpan={5}>
        {children}
      </td>
    </tr>
  );
}

export function RoomsManager({
  counts,
  espacos,
  message,
  predios,
  user,
}: RoomsManagerProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("salas");
  const [modalOpen, setModalOpen] = useState(false);
  const salasPorPredio = new Map<string, number>();

  for (const espaco of espacos) {
    salasPorPredio.set(
      espaco.predioId,
      (salasPorPredio.get(espaco.predioId) ?? 0) + 1,
    );
  }

  const activeLabel = activeTab === "predios" ? "prédio" : "sala";

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
              Salas e prédios
            </h1>
          </div>

          <span className="rounded-md bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
            {espacos.length} salas · {predios.length} prédios
          </span>
        </div>
      </header>

      <div className="space-y-6 px-5 py-6 sm:px-8 lg:px-10">
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

        <section className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-[0_1px_18px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 px-6 py-5">
            <div>
              <h2 className="text-xl font-semibold text-neutral-950">
                Cadastro acadêmico
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Consulte e cadastre prédios, salas e laboratórios.
              </p>
            </div>

            <button
              className={primaryButtonClassName}
              onClick={() => setModalOpen(true)}
              type="button"
            >
              Adicionar {activeLabel}
            </button>
          </div>

          <div className="flex gap-1 border-b border-neutral-200 bg-neutral-50/60 px-6 pt-4">
            {[
              ["salas", "Salas", espacos.length],
              ["predios", "Prédios", predios.length],
            ].map(([value, label, count]) => (
              <button
                className={`rounded-t-md px-4 py-2 text-sm font-semibold transition ${
                  activeTab === value
                    ? "border border-b-white border-neutral-200 bg-white text-indigo-700"
                    : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                }`}
                key={value}
                onClick={() => setActiveTab(value as ActiveTab)}
                type="button"
              >
                {label}
                <span className="ml-2 rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                  {count}
                </span>
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            {activeTab === "predios" ? (
              <table className="w-full min-w-[860px] table-fixed text-left text-sm">
                <colgroup>
                  <col className="w-[48%]" />
                  <col className="w-[22%]" />
                  <col className="w-[30%]" />
                </colgroup>
                <thead className="border-b border-neutral-200 bg-white text-xs font-semibold uppercase text-neutral-400">
                  <tr>
                    <th className="px-6 py-4">Prédio</th>
                    <th className="px-6 py-4">Salas</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {predios.length === 0 ? (
                    <EmptyTable>Nenhum prédio cadastrado.</EmptyTable>
                  ) : (
                    predios.map((predio) => (
                      <tr
                        className="transition hover:bg-neutral-50/80"
                        key={predio.id}
                      >
                        <td className="px-6 py-5">
                          <div>
                            <p className="text-base font-semibold text-neutral-950">
                              {predio.nome}
                            </p>
                            <p className="mt-1 truncate font-mono text-xs text-neutral-400">
                              {predio.id}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="inline-flex h-8 items-center rounded-md bg-neutral-100 px-3 text-sm font-semibold text-neutral-700">
                            {salasPorPredio.get(predio.id) ??
                              predio.espacos?.length ??
                              0}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="inline-flex h-8 items-center rounded-md bg-emerald-50 px-3 text-xs font-semibold text-emerald-700">
                            Ativo
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full min-w-[980px] table-fixed text-left text-sm">
                <colgroup>
                  <col className="w-[28%]" />
                  <col className="w-[24%]" />
                  <col className="w-[16%]" />
                  <col className="w-[14%]" />
                  <col className="w-[18%]" />
                </colgroup>
                <thead className="border-b border-neutral-200 bg-white text-xs font-semibold uppercase text-neutral-400">
                  <tr>
                    <th className="px-6 py-4">Sala</th>
                    <th className="px-6 py-4">Prédio</th>
                    <th className="px-6 py-4">Tipo</th>
                    <th className="px-6 py-4">Capacidade (pessoas)</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {espacos.length === 0 ? (
                    <EmptyTable>Nenhuma sala cadastrada.</EmptyTable>
                  ) : (
                    espacos.map((espaco) => (
                      <tr
                        className="transition hover:bg-neutral-50/80"
                        key={espaco.id}
                      >
                        <td className="px-6 py-5">
                          <div>
                            <p className="text-base font-semibold text-neutral-950">
                              {espaco.nome}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-neutral-600">
                          {espaco.predio?.nome ?? "Prédio não informado"}
                        </td>
                        <td className="px-6 py-5">
                          <span className="inline-flex h-8 items-center rounded-md bg-indigo-50 px-3 text-xs font-semibold capitalize text-indigo-700">
                            {espaco.tipo}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-semibold text-neutral-800">
                            {espaco.capacidade}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="inline-flex h-8 items-center rounded-md bg-emerald-50 px-3 text-xs font-semibold text-emerald-700">
                            Ativa
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      {modalOpen ? (
        <div
          aria-labelledby="room-modal-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/45 px-4 py-6 backdrop-blur-[2px]"
          role="dialog"
        >
          <button
            aria-label="Fechar modal"
            className="absolute inset-0 cursor-default"
            onClick={() => setModalOpen(false)}
            type="button"
          />
          <div className="relative z-10 flex max-h-[calc(100dvh-48px)] w-full max-w-xl flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-6 py-5">
              <div>
                <h2
                  className="text-lg font-semibold text-neutral-950"
                  id="room-modal-title"
                >
                  Adicionar {activeLabel}
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  {activeTab === "predios"
                    ? "Cadastre um prédio para organizar as salas."
                    : "Cadastre uma sala ou laboratório em um prédio."}
                </p>
              </div>
              <button
                aria-label="Fechar modal"
                className="grid size-9 place-items-center rounded-md border border-neutral-200 text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-900"
                onClick={() => setModalOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>

            {activeTab === "predios" ? (
              <form action={criarPredioAction} className="flex min-h-0 flex-col">
                <div className="space-y-4 overflow-y-auto px-6 py-6">
                  <label className="block">
                    <span className="text-xs font-semibold text-neutral-700">
                      Nome do prédio
                    </span>
                    <input
                      autoFocus
                      className={`${fieldClassName} mt-1`}
                      name="nome"
                      placeholder="Ex.: Bloco 3"
                      required
                    />
                  </label>
                </div>
                <div className="flex justify-end gap-2 border-t border-neutral-200 bg-neutral-50 px-6 py-4">
                  <button
                    className={secondaryButtonClassName}
                    onClick={() => setModalOpen(false)}
                    type="button"
                  >
                    Cancelar
                  </button>
                  <button className={primaryButtonClassName} type="submit">
                    Salvar prédio
                  </button>
                </div>
              </form>
            ) : (
              <form action={criarSalaAction} className="flex min-h-0 flex-col">
                <div className="grid gap-4 overflow-y-auto px-6 py-6 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="text-xs font-semibold text-neutral-700">
                      Nome da sala
                    </span>
                    <input
                      autoFocus
                      className={`${fieldClassName} mt-1`}
                      name="nome"
                      placeholder="Ex.: Sala 204"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-neutral-700">
                      Capacidade
                    </span>
                    <input
                      className={`${fieldClassName} mt-1`}
                      min={1}
                      name="capacidade"
                      required
                      type="number"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-neutral-700">
                      Tipo
                    </span>
                    <select
                      className={`${fieldClassName} mt-1`}
                      name="tipo"
                      required
                    >
                      <option value="sala">Sala</option>
                      <option value="laboratorio">Laboratório</option>
                    </select>
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-xs font-semibold text-neutral-700">
                      Prédio
                    </span>
                    <select
                      className={`${fieldClassName} mt-1`}
                      name="predioId"
                      required
                    >
                      <option value="">Selecione</option>
                      {predios.map((predio) => (
                        <option key={predio.id} value={predio.id}>
                          {predio.nome}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="flex justify-end gap-2 border-t border-neutral-200 bg-neutral-50 px-6 py-4">
                  <button
                    className={secondaryButtonClassName}
                    onClick={() => setModalOpen(false)}
                    type="button"
                  >
                    Cancelar
                  </button>
                  <button className={primaryButtonClassName} type="submit">
                    Salvar sala
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
      </section>
    </main>
  );
}
