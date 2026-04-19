import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Espaco } from './espaco.entity';

@Entity('predios')
export class Predio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @OneToMany(() => Espaco, (espaco) => espaco.predio)
  espacos: Espaco[];
}
