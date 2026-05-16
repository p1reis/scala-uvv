import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TurmasService } from "../../application/turmas/turmas.service";
import { Solicitacao } from "../../domain/entity/solicitacao.entity";
import { Turma } from "../../domain/entity/turma.entity";
import { TurmasController } from "./controllers/turmas.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Turma, Solicitacao])],
  controllers: [TurmasController],
  providers: [TurmasService],
  exports: [TurmasService],
})
export class TurmasModule {}
