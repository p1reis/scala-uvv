import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EspacosService } from "../../application/espacos/espacos.service";
import { Espaco } from "../../domain/entity/espaco.entity";
import { Predio } from "../../domain/entity/predio.entity";
import { EspacosController } from "./controllers/espacos.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Predio, Espaco])],
  controllers: [EspacosController],
  providers: [EspacosService],
  exports: [EspacosService],
})
export class EspacosModule {}
