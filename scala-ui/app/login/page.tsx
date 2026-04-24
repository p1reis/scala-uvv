import { LoginForm } from "../components/login-form";
import { LoginHero } from "../components/login-hero";
import { LogoLockup } from "../components/logo-lockup";
import { redirect } from "next/navigation";
import { getSession } from "../lib/session";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  return (
    <main className="grid min-h-dvh bg-white lg:grid-cols-2">
      <section className="flex min-h-dvh items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
        <div className="flex w-full max-w-[430px] flex-col items-center">
          <div className="mt-20 w-full sm:mt-24">
            <div className="text-center">
              <h1 className="text-[32px] font-bold leading-tight text-neutral-950 sm:text-[36px]">
                Bem vindo!
              </h1>
              <p className="mt-3 text-base font-light text-neutral-400 sm:text-lg">
                Entre com seu e-mail e senha institucional
              </p>
            </div>

            <LoginForm />
          </div>

          <LogoLockup />
        </div>
      </section>

      <LoginHero />
    </main>
  );
}
