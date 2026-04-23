import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../../domain/entity/usuario.entity'; 
import { Login } from './login.dto'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    private jwtService: JwtService,
  ) {}

  async login(login: Login) {
    // buscar usuario
    const usuario = await this.usuarioRepository.findOne({
      where: { email: login.email },
    });

    if (!usuario) {
      throw new UnauthorizedException('E-mail incorreto');
    }

    // compara as senhas 
    const senhaValida = await bcrypt.compare(login.senha, usuario.senhaHash);

    if (!senhaValida) {
      throw new UnauthorizedException('Senha incorreta');
    }

    // gera o token JWT com  payload 
    const payload = { 
      sub: usuario.id, 
      email: usuario.email, 
      tipo: usuario.tipo 
    };

    return {
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        tipo: usuario.tipo,
      },
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}