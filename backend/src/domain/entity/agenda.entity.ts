import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Horario } from "./horario.entity";

export enum SemestreAgenda {
  PRIMEIRO = "primeiro",
  SEGUNDO = "segundo",
}

@Entity("agendas")
export class Agenda {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: SemestreAgenda })
  semestre: SemestreAgenda;

  @Column({ type: "int" })
  ano: number;

  @OneToMany(
    () => Horario,
    (horario) => horario.agenda,
  )
  horarios: Horario[];
}
