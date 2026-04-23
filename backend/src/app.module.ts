import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
 Usuario, Predio, Espaco, Turma, Agenda, Horario, Solicitacao, Log
} from './domain/entity/index'

import { AuthModule } from './infrastructure/auth/auth.module';
import { SeederService } from './infrastructure/database/seeder.service';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
        // autoLoadEntities: true,
        entities: [Usuario, Predio, Espaco, Turma, Agenda, Horario, Solicitacao, Log],
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
    TypeOrmModule.forFeature([Usuario]),
  ],
  providers: [SeederService],
})
export class AppModule {}
