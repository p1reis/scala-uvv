import { redirect } from "next/navigation";
import { ScheduleManager } from "../components/schedule-manager";
import { getDashboardData } from "../lib/api";
import { getSession } from "../lib/session";

type HorariosPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function HorariosPage({
  searchParams,
}: HorariosPageProps) {
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
    <ScheduleManager
      agendas={data.agendas}
      counts={{
        horarios: data.horarios.length,
        salas: data.espacos.length,
        solicitacoes: pendingRequests,
        turmas: data.turmas.length,
      }}
      espacos={data.espacos}
      horarios={data.horarios}
      message={{
        error: firstParam(params.error),
        success: firstParam(params.success),
      }}
      turmas={data.turmas}
      user={session.user}
    />
  );
}
