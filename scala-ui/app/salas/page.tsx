import { redirect } from "next/navigation";
import { ProfessorRooms } from "../components/professor-rooms";
import { RoomsManager } from "../components/rooms-manager";
import { getDashboardData } from "../lib/api";
import { getSession } from "../lib/session";

type SalasPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SalasPage({ searchParams }: SalasPageProps) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const params = searchParams ? await searchParams : {};
  const data = await getDashboardData(session.token);
  const message = {
    error: firstParam(params.error),
    success: firstParam(params.success),
  };
  const pendingRequests = data.solicitacoes.filter(
    (solicitacao) => solicitacao.situacao === "pendente",
  ).length;
  const counts = {
    horarios: data.horarios.length,
    salas: data.espacos.length,
    solicitacoes: pendingRequests,
    turmas: data.turmas.length,
  };

  if (session.user.tipo !== "organizador") {
    return (
      <ProfessorRooms
        agendas={data.agendas}
        counts={counts}
        espacos={data.espacos}
        horarios={data.horarios}
        message={message}
        solicitacoes={data.solicitacoes}
        turmas={data.turmas}
        user={session.user}
      />
    );
  }

  return (
    <RoomsManager
      counts={counts}
      espacos={data.espacos}
      message={message}
      predios={data.predios}
      user={session.user}
    />
  );
}
