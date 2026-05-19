import { redirect } from "next/navigation";
import { ClassesManager } from "../components/classes-manager";
import { getDashboardData } from "../lib/api";
import { getSession } from "../lib/session";

type TurmasPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TurmasPage({ searchParams }: TurmasPageProps) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.user.tipo !== "organizador") {
    redirect("/");
  }

  const params = searchParams ? await searchParams : {};
  const data = await getDashboardData(session.token);
  const pendingRequests = data.solicitacoes.filter(
    (solicitacao) => solicitacao.situacao === "pendente",
  ).length;

  return (
    <ClassesManager
      counts={{
        horarios: data.horarios.length,
        salas: data.espacos.length,
        solicitacoes: pendingRequests,
        turmas: data.turmas.length,
      }}
      message={{
        error: firstParam(params.error),
        success: firstParam(params.success),
      }}
      turmas={data.turmas}
      user={session.user}
    />
  );
}
