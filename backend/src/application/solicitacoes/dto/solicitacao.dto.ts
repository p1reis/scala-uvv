import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { SituacaoSolicitacao } from "../../../domain/entity/solicitacao.entity";

export const CriarSolicitacaoSchema = z.object({
  horarioId: z.string().uuid("O ID do horário é obrigatório."),
  turmaId: z.string().uuid("O ID da turma é obrigatório."),
  justificativa: z
    .string()
    .min(10, "A justificativa deve ter pelo menos 10 caracteres.")
    .max(500, "A justificativa deve ter no máximo 500 caracteres.")
    .trim(),
});

export const AtualizarSituacaoSolicitacaoSchema = z.object({
  situacao: z.enum([SituacaoSolicitacao.ACEITO, SituacaoSolicitacao.RECUSADO], {
    required_error: "A situação é obrigatória.",
    invalid_type_error: "A situação deve ser 'aceito' ou 'recusado'.",
  }),
});

export class CriarSolicitacao extends createZodDto(CriarSolicitacaoSchema) {}
export class AtualizarSituacaoSolicitacao extends createZodDto(
  AtualizarSituacaoSolicitacaoSchema,
) {}
