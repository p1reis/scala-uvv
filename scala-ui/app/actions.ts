"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, scalaFetch } from "./lib/api";
import { clearSession } from "./lib/session";

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function numberValue(formData: FormData, key: string) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : 0;
}

function isoDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Data inválida.");
  }

  return date.toISOString();
}

function redirectWithStatus(
  path: string,
  type: "success" | "error",
  message: string,
): never {
  redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

function apiMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Não foi possível concluir a operação.";
}

async function mutate(
  callback: () => Promise<unknown>,
  successMessage: string,
  path = "/",
): Promise<never> {
  try {
    await callback();
  } catch (error) {
    redirectWithStatus(path, "error", apiMessage(error));
  }

  revalidatePath("/");
  revalidatePath("/horarios");
  revalidatePath("/salas");
  revalidatePath("/solicitacoes");
  revalidatePath("/turmas");
  redirectWithStatus(path, "success", successMessage);
}

export async function criarPredioAction(formData: FormData) {
  const nome = text(formData, "nome");

  return mutate(
    () =>
      scalaFetch("/espacos/predios", {
        method: "POST",
        body: JSON.stringify({ nome }),
      }),
    "Prédio criado.",
    "/salas",
  );
}

export async function criarSalaAction(formData: FormData) {
  const nome = text(formData, "nome");
  const capacidade = numberValue(formData, "capacidade");
  const tipo = text(formData, "tipo");
  const predioId = text(formData, "predioId");

  return mutate(
    () =>
      scalaFetch("/espacos/salas", {
        method: "POST",
        body: JSON.stringify({ nome, capacidade, tipo, predioId }),
      }),
    "Sala criada.",
    "/salas",
  );
}

export async function criarTurmaAction(formData: FormData) {
  const curso = text(formData, "curso");
  const codigo = text(formData, "codigo");
  const semestre = numberValue(formData, "semestre");
  const horario = text(formData, "horario");

  return mutate(
    () =>
      scalaFetch("/turmas", {
        method: "POST",
        body: JSON.stringify({ curso, codigo, semestre, horario }),
      }),
    "Turma criada.",
    "/turmas",
  );
}

export async function criarAgendaAction(formData: FormData) {
  const ano = numberValue(formData, "ano");

  return mutate(
    () =>
      scalaFetch("/agenda/agendas", {
        method: "POST",
        body: JSON.stringify({ ano }),
      }),
    "Agenda anual cadastrada.",
    "/horarios",
  );
}

export async function criarDisponibilidadesAction(formData: FormData) {
  const agendaId = text(formData, "agendaId");
  const espacoIds = formData
    .getAll("espacoIds")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const diasSemana = formData
    .getAll("diasSemana")
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value));
  const dataInicio = text(formData, "dataInicio");
  const dataFim = text(formData, "dataFim");
  const horaInicio = text(formData, "horaInicio");
  const horaFim = text(formData, "horaFim");

  return mutate(
    () =>
      scalaFetch("/agenda/disponibilidades", {
        method: "POST",
        body: JSON.stringify({
          agendaId: agendaId || undefined,
          espacoIds,
          diasSemana,
          dataInicio,
          dataFim,
          horaInicio,
          horaFim,
        }),
      }),
    "Disponibilidades criadas.",
    "/horarios",
  );
}

export async function criarHorarioAction(formData: FormData) {
  const agendaId = text(formData, "agendaId");
  const espacoId = text(formData, "espacoId");
  const turmaId = text(formData, "turmaId");
  const inicio = text(formData, "inicio");
  const fim = text(formData, "fim");

  return mutate(
    () =>
      scalaFetch("/agenda", {
        method: "POST",
        body: JSON.stringify({
          agendaId,
          espacoId,
          turmaId: turmaId || undefined,
          inicio: isoDateTime(inicio),
          fim: isoDateTime(fim),
        }),
      }),
    "Horário criado.",
    "/horarios",
  );
}

export async function atualizarHorarioAction(formData: FormData) {
  const horarioId = text(formData, "horarioId");
  const agendaId = text(formData, "agendaId");
  const espacoId = text(formData, "espacoId");
  const turmaId = text(formData, "turmaId");
  const inicio = text(formData, "inicio");
  const fim = text(formData, "fim");

  return mutate(
    () =>
      scalaFetch(`/agenda/${horarioId}`, {
        method: "PATCH",
        body: JSON.stringify({
          agendaId,
          espacoId,
          turmaId: turmaId || null,
          inicio: isoDateTime(inicio),
          fim: isoDateTime(fim),
        }),
      }),
    "Horário atualizado.",
    "/horarios",
  );
}

export async function removerHorarioAction(formData: FormData) {
  const horarioId = text(formData, "horarioId");

  return mutate(
    () =>
      scalaFetch(`/agenda/${horarioId}`, {
        method: "DELETE",
      }),
    "Horário removido.",
    "/horarios",
  );
}

export async function solicitarReservaAction(formData: FormData) {
  const horarioId = text(formData, "horarioId");
  const turmaId = text(formData, "turmaId");
  const justificativa = text(formData, "justificativa");
  const redirectTo = text(formData, "redirectTo") || "/";

  return mutate(
    () =>
      scalaFetch("/solicitacoes", {
        method: "POST",
        body: JSON.stringify({ horarioId, turmaId, justificativa }),
      }),
    "Solicitação enviada.",
    redirectTo,
  );
}

export async function avaliarSolicitacaoAction(formData: FormData) {
  const solicitacaoId = text(formData, "solicitacaoId");
  const situacao = text(formData, "situacao");
  const redirectTo = text(formData, "redirectTo") || "/";

  return mutate(
    () =>
      scalaFetch(`/solicitacoes/${solicitacaoId}/situacao`, {
        method: "PATCH",
        body: JSON.stringify({ situacao }),
      }),
    situacao === "aceito" ? "Solicitação aceita." : "Solicitação recusada.",
    redirectTo,
  );
}
