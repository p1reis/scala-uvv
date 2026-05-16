import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Solicitacao } from "../../domain/entity/solicitacao.entity";
import { Turma } from "../../domain/entity/turma.entity";
import { AtualizarTurma, CriarTurma } from "./dto/turma.dto";

@Injectable()
export class TurmasService {
  constructor(
    @InjectRepository(Turma)
    private readonly turmaRepository: Repository<Turma>,

    @InjectRepository(Solicitacao)
    private readonly solicitacaoRepository: Repository<Solicitacao>,
  ) {}

  async criar(dados: CriarTurma): Promise<Turma> {
    const turma = this.turmaRepository.create(dados);
    return await this.turmaRepository.save(turma);
  }

  async listar(): Promise<Turma[]> {
    return await this.turmaRepository.find({
      order: { curso: "ASC", semestre: "ASC", codigo: "ASC" },
    });
  }

  async atualizar(id: string, dados: AtualizarTurma): Promise<Turma> {
    const turma = await this.turmaRepository.findOneBy({ id });
    if (!turma) throw new NotFoundException("Turma não encontrada.");

    Object.assign(turma, dados);
    return await this.turmaRepository.save(turma);
  }

  async remover(id: string): Promise<void> {
    const turma = await this.turmaRepository.findOneBy({ id });
    if (!turma) throw new NotFoundException("Turma não encontrada.");

    const totalSolicitacoes = await this.solicitacaoRepository.count({
      where: { turmaId: id },
    });

    if (totalSolicitacoes > 0) {
      throw new BadRequestException(
        "Não é possível remover uma turma com solicitações vinculadas.",
      );
    }

    await this.turmaRepository.remove(turma);
  }
}
