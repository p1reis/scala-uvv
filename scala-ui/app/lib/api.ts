import "server-only";

import { getSession } from "./session";

const apiUrl = process.env.SCALA_API_URL ?? "http://localhost:3001";

export type TipoUsuario = "professor" | "organizador";
export type SituacaoSolicitacao = "pendente" | "aceito" | "recusado";

export type Predio = {
  id: string;
  nome: string;
  espacos?: Espaco[];
};

export type Espaco = {
  id: string;
  nome: string;
  capacidade: number;
  tipo: "sala" | "laboratorio";
  predioId: string;
  predio?: Predio;
};

export type Agenda = {
  id: string;
  ano: number;
};

export type Turma = {
  id: string;
  curso: string;
  codigo: string;
  semestre: number;
  horario: "matutino" | "noturno";
};

export type Horario = {
  id: string;
  inicio: string;
  fim: string;
  espacoId: string;
  turmaId: string | null;
  alocadoId: string | null;
  espaco?: Espaco;
  agenda?: Agenda;
  turma?: Turma | null;
};

export type Solicitacao = {
  id: string;
  horarioId: string;
  justificativa: string;
  situacao: SituacaoSolicitacao;
  professorId: string;
  turmaId: string;
  horario?: Horario;
  professor?: {
    id: string;
    nome: string;
    email: string;
  };
  turma?: Turma;
};

type FetchOptions = RequestInit & {
  token?: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

async function readError(response: Response) {
  try {
    const data = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(data.message)) return data.message.join(" ");
    return data.message ?? "Não foi possível concluir a operação.";
  } catch {
    return "Não foi possível concluir a operação.";
  }
}

export async function scalaFetch<T>(
  path: string,
  { token, headers, ...init }: FetchOptions = {},
): Promise<T> {
  const session = token ? null : await getSession();
  const accessToken = token ?? session?.token;

  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ApiError(await readError(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function getDashboardData(token: string) {
  const [predios, espacos, agendas, turmas, horarios, solicitacoes] =
    await Promise.all([
      scalaFetch<Predio[]>("/espacos/predios", { token }),
      scalaFetch<Espaco[]>("/espacos/salas", { token }),
      scalaFetch<Agenda[]>("/agenda/agendas", { token }),
      scalaFetch<Turma[]>("/turmas", { token }),
      scalaFetch<Horario[]>("/agenda", { token }),
      scalaFetch<Solicitacao[]>("/solicitacoes", { token }),
    ]);

  return {
    predios,
    espacos,
    agendas,
    turmas,
    horarios,
    solicitacoes,
  };
}
