import { DashboardHome } from "./components/dashboard-home";
import { redirect } from "next/navigation";
import { getDashboardData } from "./lib/api";
import { getSession } from "./lib/session";

type HomePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const params = searchParams ? await searchParams : {};
  const data = await getDashboardData(session.token);

  return (
    <DashboardHome
      data={data}
      message={{
        error: firstParam(params.error),
        success: firstParam(params.success),
      }}
      user={session.user}
    />
  );
}
