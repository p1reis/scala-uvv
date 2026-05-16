import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

type AuthenticatedRequest = Request & {
  user?: unknown;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException("Token não encontrado. Faça login.");
    }

    try {
      // Verifica se o token é válido
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>("JWT_SECRET"),
      });

      // Guarda os dados do utilizador no request
      request.user = payload;
    } catch {
      throw new UnauthorizedException("Token inválido ou expirado.");
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
