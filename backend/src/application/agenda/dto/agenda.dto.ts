import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const BaseAlocacaoSchema = z.object({
  agendaId: z.string().uuid("O ID da agenda é obrigatório."),
  espacoId: z.string().uuid("O ID do espaço é obrigatório."),
  turmaId: z
    .string()
    .uuid("O ID da turma é obrigatório.")
    .nullable()
    .optional(),
  inicio: z
    .string()
    .datetime({ message: "A data de início deve ser no formato válido." }),
  fim: z
    .string()
    .datetime({ message: "A data de fim deve ser no formato válido." }),
});

export const CriarAlocacaoSchema = BaseAlocacaoSchema.refine(
  (dados) => new Date(dados.fim) > new Date(dados.inicio),
  {
    message: "A data/hora de fim deve ser posterior à data/hora de início.",
    path: ["fim"],
  },
);

export const AtualizarAlocacaoSchema = BaseAlocacaoSchema.partial();

export const CriarAgendaSchema = z.object({
  ano: z
    .number()
    .int()
    .min(2020, "Ano inválido.")
    .max(2100, "Ano inválido.")
    .optional(),
});

export const CriarDisponibilidadesSchema = z
  .object({
    agendaId: z.string().uuid("O ID da agenda é obrigatório.").optional(),
    espacoIds: z
      .array(z.string().uuid("ID do espaço inválido."))
      .min(1, "Selecione pelo menos uma sala."),
    dataInicio: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inicial inválida."),
    dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data final inválida."),
    horaInicio: z.string().regex(/^\d{2}:\d{2}$/, "Hora inicial inválida."),
    horaFim: z.string().regex(/^\d{2}:\d{2}$/, "Hora final inválida."),
    diasSemana: z
      .array(z.number().int().min(0).max(6))
      .min(1, "Selecione pelo menos um dia da semana."),
  })
  .refine((dados) => dados.dataFim >= dados.dataInicio, {
    message: "A data final deve ser posterior ou igual à data inicial.",
    path: ["dataFim"],
  })
  .refine((dados) => dados.horaFim > dados.horaInicio, {
    message: "A hora final deve ser posterior à hora inicial.",
    path: ["horaFim"],
  });

export class CriarAlocacao extends createZodDto(CriarAlocacaoSchema) {}
export class AtualizarAlocacao extends createZodDto(AtualizarAlocacaoSchema) {}
export class CriarAgenda extends createZodDto(CriarAgendaSchema) {}
export class CriarDisponibilidades extends createZodDto(
  CriarDisponibilidadesSchema,
) {}
