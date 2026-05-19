import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Lê quais cargos foram colocados no @Roles
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Se a rota não tiver o decorador @Roles, deixa passar
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Pega o utilizador que o JwtAuthGuard validou

    if (!user) {
      throw new ForbiddenException("Usuário não autenticado.");
    }

    // Verifica se o tipo de usuario está na lista de permitidos
    const hasRole = requiredRoles.includes(user.tipo);
    if (!hasRole) {
      throw new ForbiddenException(
        "Acesso negado: Você não tem permissão para realizar esta ação.",
      );
    }

    return true;
  }
}
