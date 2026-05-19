import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SolicitacoesService } from "../../application/solicitacoes/solicitacoes.service";
import { Horario } from "../../domain/entity/horario.entity";
import { Solicitacao } from "../../domain/entity/solicitacao.entity";
import { Turma } from "../../domain/entity/turma.entity";
import { Usuario } from "../../domain/entity/usuario.entity";
import { SolicitacoesController } from "./controllers/solicitacoes.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Solicitacao, Horario, Turma, Usuario])],
  controllers: [SolicitacoesController],
  providers: [SolicitacoesService],
  exports: [SolicitacoesService],
})
export class SolicitacoesModule {}
