"use client";

import { useState } from "react";
import { criarTurmaAction } from "../actions";
import type { Turma } from "../lib/api";
import type { SessionUser } from "../lib/session";
import { AppSidebar, type SidebarCounts } from "./app-sidebar";

type ClassesManagerProps = {
  counts?: SidebarCounts;
  message: {
    success?: string;
    error?: string;
  };
  turmas: Turma[];
  user: SessionUser;
};

const fieldClassName =
  "h-11 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";
const primaryButtonClassName =
  "h-11 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30";
const secondaryButtonClassName =
  "h-10 rounded-md border border-neutral-200 px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50";

export function ClassesManager({
  counts,
  message,
  turmas,
  user,
}: ClassesManagerProps) {
  const [modalOpen, setModalOpen] = useState(false);

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
            <h1 className="text-xl font-semibold text-neutral-950">Turmas</h1>
          </div>

          <span className="rounded-md bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
            {turmas.length} turmas cadastradas
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
                Cadastro de turmas
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Gerencie as turmas usadas em reservas e horários.
              </p>
            </div>

            <button
              className={primaryButtonClassName}
              onClick={() => setModalOpen(true)}
              type="button"
            >
              Adicionar turma
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] table-fixed text-left text-sm">
              <colgroup>
                <col className="w-[28%]" />
                <col className="w-[16%]" />
                <col className="w-[16%]" />
                <col className="w-[16%]" />
                <col className="w-[24%]" />
              </colgroup>
              <thead className="border-b border-neutral-200 bg-white text-xs font-semibold uppercase text-neutral-400">
                <tr>
                  <th className="px-6 py-4">Curso</th>
                  <th className="px-6 py-4">Código</th>
                  <th className="px-6 py-4">Semestre</th>
                  <th className="px-6 py-4">Turno</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {turmas.length === 0 ? (
                  <tr>
                    <td
                      className="px-6 py-14 text-center text-sm text-neutral-500"
                      colSpan={5}
                    >
                      Nenhuma turma cadastrada.
                    </td>
                  </tr>
                ) : (
                  turmas.map((turma) => (
                    <tr
                      className="transition hover:bg-neutral-50/80"
                      key={turma.id}
                    >
                      <td className="px-6 py-5">
                        <div>
                          <p className="text-base font-semibold text-neutral-950">
                            {turma.curso}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex h-8 items-center rounded-md bg-indigo-50 px-3 text-xs font-semibold text-indigo-700">
                          {turma.codigo}
                        </span>
                      </td>
                      <td className="px-6 py-5 font-semibold text-neutral-800">
                        {turma.semestre}º
                      </td>
                      <td className="px-6 py-5 capitalize text-neutral-600">
                        {turma.horario}
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
          </div>
        </section>
      </div>

      {modalOpen ? (
        <div
          aria-labelledby="class-modal-title"
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
                  id="class-modal-title"
                >
                  Adicionar turma
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Cadastre a turma que será usada nas solicitações e horários.
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

            <form action={criarTurmaAction} className="flex min-h-0 flex-col">
              <div className="grid gap-4 overflow-y-auto px-6 py-6 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="text-xs font-semibold text-neutral-700">
                    Curso
                  </span>
                  <input
                    autoFocus
                    className={`${fieldClassName} mt-1`}
                    name="curso"
                    placeholder="Ex.: Ciência da Computação"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-neutral-700">
                    Código
                  </span>
                  <input
                    className={`${fieldClassName} mt-1 uppercase`}
                    maxLength={3}
                    name="codigo"
                    placeholder="CC1"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-neutral-700">
                    Semestre
                  </span>
                  <input
                    className={`${fieldClassName} mt-1`}
                    max={12}
                    min={1}
                    name="semestre"
                    required
                    type="number"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs font-semibold text-neutral-700">
                    Turno
                  </span>
                  <select
                    className={`${fieldClassName} mt-1`}
                    name="horario"
                    required
                  >
                    <option value="matutino">Matutino</option>
                    <option value="noturno">Noturno</option>
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
                  Salvar turma
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
