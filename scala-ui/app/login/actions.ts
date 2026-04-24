"use server";

import { redirect } from "next/navigation";
import { setSession } from "../lib/session";

type LoginState = {
  error: string;
};

type LoginResponse = {
  access_token: string;
};

const apiUrl = process.env.SCALA_API_URL ?? "http://localhost:3001";

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("password") ?? "");
  const rememberMe = formData.get("remember") === "on";

  if (!email || !senha) {
    return { error: "Informe e-mail e senha." };
  }

  let data: LoginResponse;

  try {
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, senha, rememberMe }),
      cache: "no-store",
    });

    if (!response.ok) {
      return { error: "E-mail ou senha invalidos." };
    }

    data = (await response.json()) as LoginResponse;
  } catch {
    return { error: "Nao foi possivel conectar ao servidor." };
  }

  if (!data.access_token) {
    return { error: "Resposta de autenticacao invalida." };
  }

  await setSession(data.access_token, rememberMe);
  redirect("/");
}
