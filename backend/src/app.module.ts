import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  Agenda,
  Espaco,
  Horario,
  Log,
  Predio,
  Solicitacao,
  Turma,
  Usuario,
} from "./domain/entity/index";

import { AuthModule } from "./infrastructure/auth/auth.module";
import { EspacosModule } from "./infrastructure/espacos/espacos.module";
import { AgendaModule } from './infrastructure/agenda/agenda.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        host: config.get<string>("DB_HOST"),
        port: config.get<number>("DB_PORT"),
        username: config.get<string>("DB_USERNAME"),
        password: config.get<string>("DB_PASSWORD"),
        database: config.get<string>("DB_DATABASE"),
        entities: [
          Usuario,
          Predio,
          Espaco,
          Turma,
          Agenda,
          Horario,
          Solicitacao,
          Log,
        ],
        synchronize: config.get<string>("NODE_ENV") === "development",
      }),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>("REDIS_HOST"),
          port: config.get<number>("REDIS_PORT"),
        },
      }),
    }),
    AuthModule,
    EspacosModule,
    AgendaModule,
    TypeOrmModule.forFeature([Usuario]), 
  ],
})
export class AppModule {}