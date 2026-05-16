import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, LessThan, MoreThan, Not, Repository } from "typeorm";

import { Agenda } from "../../domain/entity/agenda.entity";
import { Espaco } from "../../domain/entity/espaco.entity";
import { Horario } from "../../domain/entity/horario.entity";
import { Solicitacao } from "../../domain/entity/solicitacao.entity";
import { Turma } from "../../domain/entity/turma.entity";
import {
  AtualizarAlocacao,
  CriarAgenda,
  CriarAlocacao,
  CriarDisponibilidades,
} from "./dto/agenda.dto";

function formatDateOnly(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

@Injectable()
export class AgendaService {
  constructor(
    @InjectRepository(Horario)
    private readonly horarioRepository: Repository<Horario>,

    @InjectRepository(Espaco)
    private readonly espacoRepository: Repository<Espaco>,

    @InjectRepository(Turma)
    private readonly turmaRepository: Repository<Turma>,

    @InjectRepository(Agenda)
    private readonly agendaRepository: Repository<Agenda>,

    @InjectRepository(Solicitacao)
    private readonly solicitacaoRepository: Repository<Solicitacao>,
  ) {}

  private anoAtual() {
    return new Date().getFullYear();
  }

  private async buscarOuCriarAgendaAtual(): Promise<Agenda> {
    const ano = this.anoAtual();
    const agendaExistente = await this.agendaRepository.findOne({
      where: { ano },
    });

    if (agendaExistente) return agendaExistente;

    const agenda = this.agendaRepository.create({ ano });
    return await this.agendaRepository.save(agenda);
  }

  async criarAgenda(dados: CriarAgenda): Promise<Agenda> {
    const ano = dados.ano ?? this.anoAtual();
    if (ano !== this.anoAtual()) {
      throw new BadRequestException("Só é possível criar agenda do ano atual.");
    }

    const agendaExistente = await this.agendaRepository.findOne({
      where: { ano },
    });

    if (agendaExistente) return agendaExistente;

    const agenda = this.agendaRepository.create({ ano });
    return await this.agendaRepository.save(agenda);
  }

  async listarAgendas(): Promise<Agenda[]> {
    return [await this.buscarOuCriarAgendaAtual()];
  }

  async criarDisponibilidades(
    dados: CriarDisponibilidades,
  ): Promise<{ criados: number; ignorados: number; horarios: Horario[] }> {
    const agenda = dados.agendaId
      ? await this.agendaRepository.findOneBy({ id: dados.agendaId })
      : await this.buscarOuCriarAgendaAtual();
    if (!agenda) throw new NotFoundException("A agenda informada não existe.");

    const espacos = await this.espacoRepository.find({
      where: { id: In(dados.espacoIds) },
    });
    if (espacos.length !== dados.espacoIds.length) {
      throw new NotFoundException("Uma ou mais salas não foram encontradas.");
    }

    const diasSemana = new Set(dados.diasSemana);
    const dataCursor = new Date(`${dados.dataInicio}T00:00:00`);
    const dataFinal = new Date(`${dados.dataFim}T00:00:00`);
    const horariosCriados: Horario[] = [];
    let ignorados = 0;

    while (dataCursor <= dataFinal) {
      if (diasSemana.has(dataCursor.getDay())) {
        const data = formatDateOnly(dataCursor);
        const inicio = new Date(`${data}T${dados.horaInicio}:00`);
        const fim = new Date(`${data}T${dados.horaFim}:00`);

        for (const espaco of espacos) {
          const conflito = await this.horarioRepository.findOne({
            where: {
              espaco: { id: espaco.id },
              inicio: LessThan(fim),
              fim: MoreThan(inicio),
            },
          });

          if (conflito) {
            ignorados += 1;
            continue;
          }

          const horario = this.horarioRepository.create({
            agenda,
            espaco,
            inicio,
            fim,
            turma: null,
          });
          horariosCriados.push(await this.horarioRepository.save(horario));
        }
      }

      dataCursor.setDate(dataCursor.getDate() + 1);
    }

    return {
      criados: horariosCriados.length,
      ignorados,
      horarios: horariosCriados,
    };
  }

  async listarTurmas(): Promise<Turma[]> {
    return await this.turmaRepository.find({
      order: { curso: "ASC", semestre: "ASC", codigo: "ASC" },
    });
  }

  async alocarTurma(dados: CriarAlocacao): Promise<Horario> {
    const agenda = await this.agendaRepository.findOneBy({
      id: dados.agendaId,
    });
    if (!agenda) throw new NotFoundException("A agenda informada não existe.");

    const espaco = await this.espacoRepository.findOneBy({
      id: dados.espacoId,
    });
    if (!espaco) throw new NotFoundException("O espaço informado não existe.");

    let turma = null;
    if (dados.turmaId) {
      turma = await this.turmaRepository.findOneBy({ id: dados.turmaId });
      if (!turma) throw new NotFoundException("A turma informada não existe.");
    }

    const dataInicio = new Date(dados.inicio);
    const dataFim = new Date(dados.fim);

    const conflito = await this.horarioRepository.findOne({
      where: {
        espaco: { id: dados.espacoId },
        inicio: LessThan(dataFim),
        fim: MoreThan(dataInicio),
      },
      relations: ["turma"],
    });

    if (conflito) {
      const nomeOcupante = conflito.turma
        ? conflito.turma.codigo
        : "bloqueado/outro evento";
      throw new ConflictException(
        `Alerta de Conflito: O espaço '${espaco.nome}' já está reservado para '${nomeOcupante}' neste intervalo de tempo.`,
      );
    }

    const novoHorario = this.horarioRepository.create({
      inicio: dataInicio,
      fim: dataFim,
      espaco,
      agenda,
      turma,
    });

    return await this.horarioRepository.save(novoHorario);
  }

  async listarGrade(
    espacoId?: string,
    turmaId?: string,
    data?: string,
  ): Promise<Horario[]> {
    const query = this.horarioRepository
      .createQueryBuilder("horario")
      .leftJoinAndSelect("horario.espaco", "espaco")
      .leftJoinAndSelect("horario.turma", "turma")
      .leftJoinAndSelect("horario.agenda", "agenda");

    if (espacoId) query.andWhere("espaco.id = :espacoId", { espacoId });
    if (turmaId) query.andWhere("turma.id = :turmaId", { turmaId });
    if (data) query.andWhere("DATE(horario.inicio) = :data", { data });

    return await query.orderBy("horario.inicio", "ASC").getMany();
  }

  async atualizarAlocacao(
    id: string,
    dados: AtualizarAlocacao,
  ): Promise<Horario> {
    const horarioExistente = await this.horarioRepository.findOne({
      where: { id },
      relations: ["espaco", "agenda", "turma"],
    });

    if (!horarioExistente)
      throw new NotFoundException("Horário não encontrado.");

    const dataInicio = dados.inicio
      ? new Date(dados.inicio)
      : horarioExistente.inicio;
    const dataFim = dados.fim ? new Date(dados.fim) : horarioExistente.fim;
    const espacoId = dados.espacoId || horarioExistente.espaco.id;

    const conflito = await this.horarioRepository.findOne({
      where: {
        id: Not(id),
        espaco: { id: espacoId },
        inicio: LessThan(dataFim),
        fim: MoreThan(dataInicio),
      },
    });

    if (conflito)
      throw new ConflictException(
        "A nova alteração gera um conflito de horário neste espaço.",
      );

    if (dados.turmaId !== undefined) {
      if (dados.turmaId === null) {
        horarioExistente.turma = null;
      } else {
        const turmaNova = await this.turmaRepository.findOneBy({
          id: dados.turmaId,
        });
        if (!turmaNova) throw new NotFoundException("A nova turma não existe.");
        horarioExistente.turma = turmaNova;
      }
    }

    if (dados.espacoId) {
      const espacoNovo = await this.espacoRepository.findOneBy({
        id: dados.espacoId,
      });
      if (!espacoNovo) throw new NotFoundException("O novo espaço não existe.");
      horarioExistente.espaco = espacoNovo;
    }

    if (dados.agendaId) {
      const agendaNova = await this.agendaRepository.findOneBy({
        id: dados.agendaId,
      });
      if (!agendaNova) throw new NotFoundException("A nova agenda não existe.");
      horarioExistente.agenda = agendaNova;
    }

    horarioExistente.inicio = dataInicio;
    horarioExistente.fim = dataFim;

    return await this.horarioRepository.save(horarioExistente);
  }

  async removerAlocacao(id: string): Promise<void> {
    const horario = await this.horarioRepository.findOneBy({ id });
    if (!horario)
      throw new NotFoundException(`O horário com ID ${id} não foi encontrado.`);

    const totalSolicitacoes = await this.solicitacaoRepository.count({
      where: { horarioId: id },
    });

    if (totalSolicitacoes > 0) {
      throw new BadRequestException(
        "Não é possível remover um horário com solicitações vinculadas.",
      );
    }

    await this.horarioRepository.remove(horario);
  }
}
