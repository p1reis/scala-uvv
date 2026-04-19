import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('logs')
export class Log {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  operacao: string;

  @Column({ name: 'data_hora', type: 'timestamp' })
  dataHora: Date;
}
