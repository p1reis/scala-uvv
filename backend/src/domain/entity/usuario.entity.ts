import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Solicitacao } from './solicitacao.entity';

export enum TipoUsuario {
  PROFESSOR = 'professor',
  ORGANIZADOR = 'organizador',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ name: 'senha_hash' })
  senhaHash: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'enum', enum: TipoUsuario })
  tipo: TipoUsuario;

  @OneToMany(() => Solicitacao, (solicitacao) => solicitacao.professor)
  solicitacoes: Solicitacao[];
}
