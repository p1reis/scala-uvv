import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Solicitacao } from "./solicitacao.entity";

export enum TurnoTurma {
  MATUTINO = "matutino",
  NOTURNO = "noturno",
}

@Entity("turmas")
export class Turma {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  curso: string;

  @Column({ type: "varchar", length: 3 })
  codigo: string;

  @Column({ type: "int" })
  semestre: number;

  @Column({ type: "enum", enum: TurnoTurma })
  horario: TurnoTurma;

  @OneToMany(
    () => Solicitacao,
    (solicitacao) => solicitacao.turma,
  )
  solicitacoes: Solicitacao[];
}
