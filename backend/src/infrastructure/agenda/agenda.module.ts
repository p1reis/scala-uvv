import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Nossas entidades do domínio
import { Horario } from '../../domain/entity/horario.entity';
import { Espaco } from '../../domain/entity/espaco.entity';
import { Turma } from '../../domain/entity/turma.entity';
import { Agenda } from '../../domain/entity/agenda.entity';

// Serviço e Controller
import { AgendaService } from '../../application/agenda/agenda.service';
import { AgendaController } from './controllers/agenda.controller';

@Module({
  imports: [
  
    TypeOrmModule.forFeature([Horario, Espaco, Turma, Agenda]),
  ],
  providers: [AgendaService],
  controllers: [AgendaController],
  exports: [AgendaService], 
})
export class AgendaModule {}