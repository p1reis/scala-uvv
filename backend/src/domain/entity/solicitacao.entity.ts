import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Horario } from './horario.entity';
import { Usuario } from './usuario.entity';
import { Turma } from './turma.entity';

export enum SituacaoSolicitacao {
  ACEITO = 'aceito',
  RECUSADO = 'recusado',
}

@Entity('solicitacoes')
export class Solicitacao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'horario_id' })
  horarioId: string;

  @ManyToOne(() => Horario, { nullable: false })
  @JoinColumn({ name: 'horario_id' })
  horario: Horario;

  @Column({ type: 'text' })
  justificativa: string;

  @Column({ type: 'enum', enum: SituacaoSolicitacao })
  situacao: SituacaoSolicitacao;

  @Column({ name: 'professor_id' })
  professorId: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.solicitacoes, { nullable: false })
  @JoinColumn({ name: 'professor_id' })
  professor: Usuario;

  @Column({ name: 'turma_id' })
  turmaId: string;

  @ManyToOne(() => Turma, (turma) => turma.solicitacoes, { nullable: false })
  @JoinColumn({ name: 'turma_id' })
  turma: Turma;
}
