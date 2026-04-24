import { cookies } from "next/headers";

const sessionCookieName = "scala_session";

export type SessionUser = {
  id: string;
  nome?: string;
  email: string;
  tipo: string;
};

export type Session = {
  token: string;
  user: SessionUser;
};

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const [, payload] = token.split(".");

  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  if (!token) {
    return null;
  }

  const payload = decodeJwtPayload(token);
  const expiresAt = typeof payload?.exp === "number" ? payload.exp * 1000 : 0;

  if (!payload || expiresAt <= Date.now()) {
    return null;
  }

  return {
    token,
    user: {
      id: String(payload.sub),
      nome: typeof payload.nome === "string" ? payload.nome : undefined,
      email: String(payload.email),
      tipo: String(payload.tipo),
    },
  };
}

export async function setSession(token: string, rememberMe: boolean) {
  const cookieStore = await cookies();

  cookieStore.set(sessionCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(rememberMe ? { maxAge: 60 * 60 * 24 * 30 } : {}),
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
}
