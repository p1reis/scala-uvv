import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  AtualizarTurma,
  CriarTurma,
} from "../../../application/turmas/dto/turma.dto";
import { TurmasService } from "../../../application/turmas/turmas.service";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";

@ApiTags("Turmas")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiResponse({ status: 401, description: "Não autorizado." })
@ApiResponse({ status: 403, description: "Acesso negado." })
@Controller("turmas")
export class TurmasController {
  constructor(private readonly turmasService: TurmasService) {}

  @Post()
  @Roles("organizador")
  @ApiOperation({ summary: "Cadastrar uma turma" })
  @ApiBody({ type: CriarTurma })
  async criar(@Body() body: CriarTurma) {
    return this.turmasService.criar(body);
  }

  @Get()
  @Roles("organizador", "professor")
  @ApiOperation({ summary: "Listar turmas" })
  async listar() {
    return this.turmasService.listar();
  }

  @Patch(":id")
  @Roles("organizador")
  @ApiOperation({ summary: "Atualizar uma turma" })
  @ApiBody({ type: AtualizarTurma })
  async atualizar(@Param("id") id: string, @Body() body: AtualizarTurma) {
    return this.turmasService.atualizar(id, body);
  }

  @Delete(":id")
  @Roles("organizador")
  @ApiOperation({ summary: "Remover uma turma" })
  async remover(@Param("id") id: string) {
    await this.turmasService.remover(id);
    return { mensagem: "Turma removida com sucesso!" };
  }
}
