import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "../../application/auth/auth.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Login } from "../../application/auth/login.dto";

@ApiTags("Autenticação")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: "Autenticar usuário", 
    description: "Valida as credenciais dos usuários." 
  })
  @ApiResponse({ status: 200, description: "Login realizado com sucesso." })
  @ApiResponse({ status: 400, description: "Erro de validação." })
  @ApiResponse({ status: 401, description: "Credenciais incorretas." })
  async login(@Body() login: Login) {
    return this.authService.login(login);
  }
}
