import { redirect } from "next/navigation";
import { RequestsManager } from "../components/requests-manager";
import { getDashboardData } from "../lib/api";
import { getSession } from "../lib/session";

type SolicitacoesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SolicitacoesPage({
  searchParams,
}: SolicitacoesPageProps) {
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
    <RequestsManager
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
      solicitacoes={data.solicitacoes}
      user={session.user}
    />
  );
}
