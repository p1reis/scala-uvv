import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Predio } from './predio.entity';
import { Horario } from './horario.entity';

export enum TipoEspaco {
  SALA = 'sala',
  LABORATORIO = 'laboratorio',
}

@Entity('espacos')
export class Espaco {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ type: 'int' })
  capacidade: number;

  @Column({ type: 'enum', enum: TipoEspaco })
  tipo: TipoEspaco;

  @Column({ name: 'predio_id' })
  predioId: string;

  @ManyToOne(() => Predio, (predio) => predio.espacos, { nullable: false })
  @JoinColumn({ name: 'predio_id' })
  predio: Predio;

  @OneToMany(() => Horario, (horario) => horario.espaco)
  horarios: Horario[];
}
