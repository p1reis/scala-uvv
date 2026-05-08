import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Predio } from '../../domain/entity/predio.entity';
import { Espaco } from '../../domain/entity/espaco.entity';
import { CriarPredio, CriarEspaco, AtualizarEspaco, AtualizarPredio } from '../espacos/dto/espacos-dto';

@Injectable()
export class EspacosService {
  constructor(
    @InjectRepository(Predio)
    private readonly predioRepository: Repository<Predio>,
    
    @InjectRepository(Espaco)
    private readonly espacoRepository: Repository<Espaco>,
  ) {}

  async criarPredio(dados: CriarPredio): Promise<Predio> {
    const novoPredio = this.predioRepository.create(dados);
    return await this.predioRepository.save(novoPredio);
  }

  async listarPredios(): Promise<Predio[]> {
    return await this.predioRepository.find({ relations: ['espacos'] });
  }

  async criarEspaco(dados: CriarEspaco): Promise<Espaco> {
    
    const predioExiste = await this.predioRepository.findOne({
      where: { id: dados.predioId },
    });

    if (!predioExiste) {
      throw new NotFoundException('O prédio informado não foi encontrado no sistema.');
    }

    const novoEspaco = this.espacoRepository.create({
      nome: dados.nome,
      capacidade: dados.capacidade,
      tipo: dados.tipo,
      predio: predioExiste, 
    });

    return await this.espacoRepository.save(novoEspaco);
  }

  async listarEspacos(): Promise<Espaco[]> {
    
    return await this.espacoRepository.find({ relations: ['predio'] });
  }

  async atualizarPredio(id: string, dados: AtualizarPredio): Promise<Predio> {
    const predio = await this.predioRepository.findOneBy({ id });
    if (!predio) throw new NotFoundException('Prédio não encontrado.');
    
    Object.assign(predio, dados);
    return await this.predioRepository.save(predio);
  }

  async removerPredio(id: string): Promise<void> {
    const predio = await this.predioRepository.findOne({
      where: { id },
      relations: ['espacos'],
    });

    if (!predio) throw new NotFoundException('Prédio não encontrado.');
    
    
    if (predio.espacos.length > 0) {
      throw new BadRequestException('Não é possível remover um prédio que possui salas cadastradas.');
    }

    await this.predioRepository.remove(predio);
  }

  async atualizarEspaco(id: string, dados: AtualizarEspaco): Promise<Espaco> {
    const espaco = await this.espacoRepository.findOneBy({ id });
    if (!espaco) throw new NotFoundException('Espaço não encontrado.');

    Object.assign(espaco, dados);
    return await this.espacoRepository.save(espaco);
  }

  async removerEspaco(id: string): Promise<void> {
    const espaco = await this.espacoRepository.findOneBy({ id });
    if (!espaco) throw new NotFoundException('Espaço não encontrado.');
    
    // Futuramente, aqui validaremos se existem horários agendados antes de apagar
    await this.espacoRepository.remove(espaco);
  }

}