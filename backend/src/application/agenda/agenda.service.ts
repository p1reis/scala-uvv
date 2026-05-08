import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, Not } from 'typeorm';

import { Horario } from '../../domain/entity/horario.entity';
import { Espaco } from '../../domain/entity/espaco.entity';
import { Turma } from '../../domain/entity/turma.entity';
import { Agenda } from '../../domain/entity/agenda.entity';
import { CriarAlocacao, AtualizarAlocacao } from './dto/agenda.dto';

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
  ) {}

  async alocarTurma(dados: CriarAlocacao): Promise<Horario> {
    const agenda = await this.agendaRepository.findOneBy({ id: dados.agendaId });
    if (!agenda) throw new NotFoundException('A agenda informada não existe.');

    const espaco = await this.espacoRepository.findOneBy({ id: dados.espacoId });
    if (!espaco) throw new NotFoundException('O espaço informado não existe.');

    let turma = null;
    if (dados.turmaId) {
      turma = await this.turmaRepository.findOneBy({ id: dados.turmaId });
      if (!turma) throw new NotFoundException('A turma informada não existe.');
    }

    const dataInicio = new Date(dados.inicio);
    const dataFim = new Date(dados.fim);

   
    const conflito = await this.horarioRepository.findOne({
      where: {
        espaco: { id: dados.espacoId },
        inicio: LessThan(dataFim),
        fim: MoreThan(dataInicio),
      },
      relations: ['turma'], 
    });

    if (conflito) {
      const nomeOcupante = conflito.turma ? conflito.turma.codigo : 'bloqueado/outro evento';
      throw new ConflictException(`Alerta de Conflito: O espaço '${espaco.nome}' já está reservado para '${nomeOcupante}' neste intervalo de tempo.`);
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

  async listarGrade(espacoId?: string, turmaId?: string, data?: string): Promise<Horario[]> {
    const query = this.horarioRepository.createQueryBuilder('horario')
      .leftJoinAndSelect('horario.espaco', 'espaco')
      .leftJoinAndSelect('horario.turma', 'turma')
      .leftJoinAndSelect('horario.agenda', 'agenda');

    if (espacoId) query.andWhere('espaco.id = :espacoId', { espacoId });
    if (turmaId) query.andWhere('turma.id = :turmaId', { turmaId });
    if (data) query.andWhere('DATE(horario.inicio) = :data', { data });

    return await query.orderBy('horario.inicio', 'ASC').getMany();
  }

  async atualizarAlocacao(id: string, dados: AtualizarAlocacao): Promise<Horario> {
    const horarioExistente = await this.horarioRepository.findOne({
      where: { id },
      relations: ['espaco', 'agenda', 'turma']
    });

    if (!horarioExistente) throw new NotFoundException('Horário não encontrado.');

    const dataInicio = dados.inicio ? new Date(dados.inicio) : horarioExistente.inicio;
    const dataFim = dados.fim ? new Date(dados.fim) : horarioExistente.fim;
    const espacoId = dados.espacoId || horarioExistente.espaco.id;

 
    const conflito = await this.horarioRepository.findOne({
      where: {
        id: Not(id),
        espaco: { id: espacoId },
        inicio: LessThan(dataFim),
        fim: MoreThan(dataInicio),
      }
    });

    if (conflito) throw new ConflictException('A nova alteração gera um conflito de horário neste espaço.');

    if (dados.turmaId) {
      const turmaNova = await this.turmaRepository.findOneBy({ id: dados.turmaId });
      if (!turmaNova) throw new NotFoundException('A nova turma não existe.');
      horarioExistente.turma = turmaNova;
    }

    if (dados.espacoId) {
      const espacoNovo = await this.espacoRepository.findOneBy({ id: dados.espacoId });
      if (!espacoNovo) throw new NotFoundException('O novo espaço não existe.');
      horarioExistente.espaco = espacoNovo;
    }

    horarioExistente.inicio = dataInicio;
    horarioExistente.fim = dataFim;

    return await this.horarioRepository.save(horarioExistente);
  }

  async removerAlocacao(id: string): Promise<void> {
    const horario = await this.horarioRepository.findOneBy({ id });
    if (!horario) throw new NotFoundException(`O horário com ID ${id} não foi encontrado.`);
    await this.horarioRepository.remove(horario);
  }
}