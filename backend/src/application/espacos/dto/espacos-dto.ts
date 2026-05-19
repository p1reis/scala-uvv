import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { TipoEspaco } from "../../../domain/entity/espaco.entity";

export const CriarPredioSchema = z.object({
  nome: z
    .string()
    .min(2, "O nome do prédio deve ter pelo menos 2 caracteres.")
    .trim(),
});

export class CriarPredio extends createZodDto(CriarPredioSchema) {}

export const CriarEspacoSchema = z.object({
  nome: z
    .string()
    .min(2, "O nome do espaço deve ter pelo menos 2 caracteres.")
    .trim(),
  capacidade: z
    .number()
    .int()
    .positive("A capacidade deve ser maior que zero."),

  tipo: z.nativeEnum(TipoEspaco, {
    required_error: "O tipo é obrigatório.",
    invalid_type_error:
      "O tipo deve ser obrigatoriamente 'sala' ou 'laboratorio'.",
  }),

  predioId: z.string().uuid("ID do prédio inválido."),
});

export const AtualizarPredioSchema = CriarPredioSchema.partial();
export class AtualizarPredio extends createZodDto(AtualizarPredioSchema) {}

export const AtualizarEspacoSchema = CriarEspacoSchema.partial();
export class AtualizarEspaco extends createZodDto(AtualizarEspacoSchema) {}

export class CriarEspaco extends createZodDto(CriarEspacoSchema) {}
