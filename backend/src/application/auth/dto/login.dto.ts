import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Informe um e-mail valido.").trim().toLowerCase(),
  senha: z.string().min(1, "Informe sua senha."),
  rememberMe: z.boolean().optional().default(false),
});

export class Login extends createZodDto(LoginSchema) {}
