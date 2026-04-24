import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import type { Repository } from "typeorm";
import { TipoUsuario, Usuario } from "../../domain/entity/usuario.entity";

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async onApplicationBootstrap() {
    const count = await this.usuarioRepository.count();

    if (count === 0) {
      this.logger.log("Banco de dados vazio. Iniciando Mock de Dados...");

      const senhaPadrao = "senha123";
      const senhaCriptografada = await bcrypt.hash(senhaPadrao, 10);

      const organizador = this.usuarioRepository.create({
        nome: "Norminda",
        email: "norminda@uvv.br",
        senhaHash: senhaCriptografada,
        tipo: TipoUsuario.ORGANIZADOR,
      });

      const professor = this.usuarioRepository.create({
        nome: "Edgar",
        email: "edgar@uvv.br",
        senhaHash: senhaCriptografada,
        tipo: TipoUsuario.PROFESSOR,
      });

      await this.usuarioRepository.save([organizador, professor]);

      this.logger.log("Seeder finalizado! Usuários criados com sucesso.");
    } else {
      this.logger.log("O banco de dados já possui usuários. Seeder ignorado.");
    }
  }
}
