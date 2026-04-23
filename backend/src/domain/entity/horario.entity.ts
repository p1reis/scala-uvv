import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Espaco } from './espaco.entity';
import { Agenda } from './agenda.entity';
import { Solicitacao } from './solicitacao.entity';

@Entity('horarios')
export class Horario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  inicio: Date;

  @Column({ type: 'timestamp' })
  fim: Date;

  @Column({ name: 'espaco_id' })
  espacoId: string;

  @ManyToOne(() => Espaco, (espaco) => espaco.horarios, { nullable: false })
  @JoinColumn({ name: 'espaco_id' })
  espaco: Espaco;

  @Column({ name: 'agenda_id' })
  agendaId: string;

  @ManyToOne(() => Agenda, (agenda) => agenda.horarios, { nullable: false })
  @JoinColumn({ name: 'agenda_id' })
  agenda: Agenda;

  @Column({ name: 'alocado_id', nullable: true })
  alocadoId: string | null;

  @OneToOne(() => Solicitacao, { nullable: true })
  @JoinColumn({ name: 'alocado_id' })
  alocado: Solicitacao | null;
}
