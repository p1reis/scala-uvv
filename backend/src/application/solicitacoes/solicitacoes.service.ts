import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Horario } from "../../domain/entity/horario.entity";
import {
  SituacaoSolicitacao,
  Solicitacao,
} from "../../domain/entity/solicitacao.entity";
import { Turma } from "../../domain/entity/turma.entity";
import { TipoUsuario, Usuario } from "../../domain/entity/usuario.entity";
import {
  AtualizarSituacaoSolicitacao,
  CriarSolicitacao,
} from "./dto/solicitacao.dto";

export type UsuarioAutenticado = {
  sub: string;
  tipo: TipoUsuario;
};

@Injectable()
export class SolicitacoesService {
  constructor(
    @InjectRepository(Solicitacao)
    private readonly solicitacaoRepository: Repository<Solicitacao>,

    @InjectRepository(Horario)
    private readonly horarioRepository: Repository<Horario>,

    @InjectRepository(Turma)
    private readonly turmaRepository: Repository<Turma>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async criar(
    dados: CriarSolicitacao,
    usuarioAutenticado: UsuarioAutenticado,
  ): Promise<Solicitacao> {
    const professor = await this.usuarioRepository.findOneBy({
      id: usuarioAutenticado.sub,
    });
    if (!professor) throw new NotFoundException("Professor não encontrado.");

    const horario = await this.horarioRepository.findOne({
      where: { id: dados.horarioId },
      relations: ["espaco", "alocado"],
    });
    if (!horario) throw new NotFoundException("Horário não encontrado.");

    if (horario.alocadoId) {
      throw new ConflictException("Este horário já possui uma reserva aceita.");
    }

    const turma = await this.turmaRepository.findOneBy({ id: dados.turmaId });
    if (!turma) throw new NotFoundException("Turma não encontrada.");

    const solicitacaoExistente = await this.solicitacaoRepository.findOne({
      where: {
        horarioId: dados.horarioId,
        professorId: professor.id,
      },
    });

    if (
      solicitacaoExistente &&
      solicitacaoExistente.situacao !== SituacaoSolicitacao.RECUSADO
    ) {
      throw new ConflictException(
        "Você já possui uma solicitação ativa para este horário.",
      );
    }

    const solicitacao = this.solicitacaoRepository.create({
      horario,
      horarioId: horario.id,
      professor,
      professorId: professor.id,
      turma,
      turmaId: turma.id,
      justificativa: dados.justificativa,
      situacao: SituacaoSolicitacao.PENDENTE,
    });

    return await this.solicitacaoRepository.save(solicitacao);
  }

  async listar(usuario: UsuarioAutenticado): Promise<Solicitacao[]> {
    const query = this.solicitacaoRepository
      .createQueryBuilder("solicitacao")
      .leftJoinAndSelect("solicitacao.horario", "horario")
      .leftJoinAndSelect("horario.espaco", "espaco")
      .leftJoinAndSelect("espaco.predio", "predio")
      .leftJoinAndSelect("solicitacao.professor", "professor")
      .leftJoinAndSelect("solicitacao.turma", "turma")
      .orderBy("horario.inicio", "DESC");

    if (usuario.tipo === TipoUsuario.PROFESSOR) {
      query.where("professor.id = :professorId", { professorId: usuario.sub });
    }

    return await query.getMany();
  }

  async atualizarSituacao(
    id: string,
    dados: AtualizarSituacaoSolicitacao,
  ): Promise<Solicitacao> {
    const solicitacao = await this.solicitacaoRepository.findOne({
      where: { id },
      relations: ["horario", "turma"],
    });

    if (!solicitacao)
      throw new NotFoundException("Solicitação não encontrada.");

    if (solicitacao.situacao !== SituacaoSolicitacao.PENDENTE) {
      throw new BadRequestException("Esta solicitação já foi avaliada.");
    }

    const horario = await this.horarioRepository.findOne({
      where: { id: solicitacao.horarioId },
      relations: ["alocado"],
    });
    if (!horario) throw new NotFoundException("Horário não encontrado.");

    if (dados.situacao === SituacaoSolicitacao.ACEITO) {
      if (horario.alocadoId && horario.alocadoId !== solicitacao.id) {
        throw new ConflictException("Este horário já possui reserva aceita.");
      }

      solicitacao.situacao = SituacaoSolicitacao.ACEITO;
      await this.solicitacaoRepository.save(solicitacao);

      horario.alocado = solicitacao;
      horario.alocadoId = solicitacao.id;
      await this.horarioRepository.save(horario);

      await this.solicitacaoRepository
        .createQueryBuilder()
        .update(Solicitacao)
        .set({ situacao: SituacaoSolicitacao.RECUSADO })
        .where("horario_id = :horarioId", { horarioId: solicitacao.horarioId })
        .andWhere("id != :id", { id: solicitacao.id })
        .andWhere("situacao = :situacao", {
          situacao: SituacaoSolicitacao.PENDENTE,
        })
        .execute();

      return solicitacao;
    }

    solicitacao.situacao = SituacaoSolicitacao.RECUSADO;
    return await this.solicitacaoRepository.save(solicitacao);
  }
}
