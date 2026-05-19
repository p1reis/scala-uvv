import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { TurnoTurma } from "../../../domain/entity/turma.entity";

export const CriarTurmaSchema = z.object({
  curso: z
    .string()
    .min(2, "O curso deve ter pelo menos 2 caracteres.")
    .max(120, "O curso deve ter no máximo 120 caracteres.")
    .trim(),
  codigo: z
    .string()
    .min(1, "O código é obrigatório.")
    .max(3, "O código deve ter no máximo 3 caracteres.")
    .trim()
    .transform((value) => value.toUpperCase()),
  semestre: z
    .number()
    .int()
    .min(1, "Semestre inválido.")
    .max(12, "Semestre inválido."),
  horario: z.nativeEnum(TurnoTurma, {
    required_error: "O turno é obrigatório.",
    invalid_type_error: "O turno deve ser 'matutino' ou 'noturno'.",
  }),
});

export const AtualizarTurmaSchema = CriarTurmaSchema.partial();

export class CriarTurma extends createZodDto(CriarTurmaSchema) {}
export class AtualizarTurma extends createZodDto(AtualizarTurmaSchema) {}
