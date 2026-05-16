import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Request } from "express";
import {
  AtualizarSituacaoSolicitacao,
  CriarSolicitacao,
} from "../../../application/solicitacoes/dto/solicitacao.dto";
import {
  SolicitacoesService,
  UsuarioAutenticado,
} from "../../../application/solicitacoes/solicitacoes.service";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";

type AuthenticatedRequest = Request & {
  user: UsuarioAutenticado;
};

@ApiTags("Solicitações de Reserva")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiResponse({ status: 401, description: "Não autorizado." })
@ApiResponse({ status: 403, description: "Acesso negado." })
@Controller("solicitacoes")
export class SolicitacoesController {
  constructor(private readonly solicitacoesService: SolicitacoesService) {}

  @Post()
  @Roles("professor", "organizador")
  @ApiOperation({ summary: "Solicitar reserva de uma sala em um horário" })
  @ApiBody({ type: CriarSolicitacao })
  @ApiResponse({ status: 201, description: "Solicitação criada." })
  async criar(
    @Body() body: CriarSolicitacao,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.solicitacoesService.criar(body, request.user);
  }

  @Get()
  @Roles("professor", "organizador")
  @ApiOperation({
    summary:
      "Listar solicitações do professor autenticado ou todas para organizador",
  })
  async listar(@Req() request: AuthenticatedRequest) {
    return this.solicitacoesService.listar(request.user);
  }

  @Patch(":id/situacao")
  @Roles("organizador")
  @ApiOperation({ summary: "Aceitar ou recusar uma solicitação de reserva" })
  @ApiBody({ type: AtualizarSituacaoSolicitacao })
  async atualizarSituacao(
    @Param("id") id: string,
    @Body() body: AtualizarSituacaoSolicitacao,
  ) {
    return this.solicitacoesService.atualizarSituacao(id, body);
  }
}
