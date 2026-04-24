"use client";

import { useActionState, useState } from "react";
import { EyeOff } from "./icons";
import { loginAction } from "../login/actions";

const inputClassName =
  "h-12 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-900 shadow-[0_1px_8px_rgba(18,18,18,0.04)] outline-none transition placeholder:text-neutral-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, {
    error: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      className="mt-11 w-full"
      action={formAction}
      aria-label="Login institucional"
    >
      <div className="space-y-6">
        <label className="block">
          <span className="text-xs font-semibold text-neutral-900">Email</span>
          <input
            className={`${inputClassName} mt-2`}
            type="email"
            name="email"
            autoComplete="email"
            placeholder="nome@uvv.br"
            required
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-neutral-900">
            Password
          </span>
          <span className="relative mt-2 block">
            <input
              className={`${inputClassName} pr-11`}
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              placeholder="Digite sua senha"
              required
            />
            <button
              className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded text-neutral-400 transition hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              type="button"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((current) => !current)}
            >
              <EyeOff className="size-5" />
            </button>
          </span>
        </label>
      </div>

      {state.error ? (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {state.error}
        </p>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-4 text-sm">
        <label className="flex min-w-0 items-center gap-2 text-neutral-400">
          <input
            className="size-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
            type="checkbox"
            name="remember"
          />
          <span>Salvar sessão</span>
        </label>

        <a
          className="shrink-0 font-medium text-indigo-700 transition hover:text-indigo-900"
          href="#"
        >
          Esqueci minha senha
        </a>
      </div>

      <button
        className="mt-7 h-12 w-full rounded-md bg-indigo-600 px-4 text-sm font-medium text-white shadow-[0_12px_22px_rgba(67,56,202,0.22)] transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:bg-indigo-400"
        type="submit"
        disabled={isPending}
      >
        {isPending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
