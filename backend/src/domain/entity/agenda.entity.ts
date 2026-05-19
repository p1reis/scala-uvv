import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Horario } from "./horario.entity";

@Entity("agendas")
export class Agenda {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "int" })
  ano: number;

  @OneToMany(
    () => Horario,
    (horario) => horario.agenda,
  )
  horarios: Horario[];
}
