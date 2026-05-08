import { createZodDto } from "nestjs-zod";
import { z } from "zod";


export const BaseAlocacaoSchema = z.object({
  agendaId: z.string().uuid("O ID da agenda é obrigatório."),
  espacoId: z.string().uuid("O ID do espaço é obrigatório."),
  turmaId: z.string().uuid("O ID da turma é obrigatório.").optional(),
  inicio: z.string().datetime({ message: "A data de início deve ser no formato válido." }),
  fim: z.string().datetime({ message: "A data de fim deve ser no formato válido." }),
});


export const CriarAlocacaoSchema = BaseAlocacaoSchema.refine(
  (dados) => new Date(dados.fim) > new Date(dados.inicio),
  {
    message: "A data/hora de fim deve ser posterior à data/hora de início.",
    path: ["fim"],
  }
);


export const AtualizarAlocacaoSchema = BaseAlocacaoSchema.partial();

export class CriarAlocacao extends createZodDto(CriarAlocacaoSchema) {}
export class AtualizarAlocacao extends createZodDto(AtualizarAlocacaoSchema) {}