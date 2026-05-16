import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Agenda } from "../../domain/entity/agenda.entity";
import { Espaco } from "../../domain/entity/espaco.entity";
// Nossas entidades do domínio
import { Horario } from "../../domain/entity/horario.entity";
import { Solicitacao } from "../../domain/entity/solicitacao.entity";
import { Turma } from "../../domain/entity/turma.entity";

// Serviço e Controller
import { AgendaService } from "../../application/agenda/agenda.service";
import { AgendaController } from "./controllers/agenda.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([Horario, Espaco, Turma, Agenda, Solicitacao]),
  ],
  providers: [AgendaService],
  controllers: [AgendaController],
  exports: [AgendaService],
})
export class AgendaModule {}
