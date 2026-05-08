import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { EspacosService } from '../../../application/espacos/espacos.service';
import { 
  CriarPredio, CriarEspaco, AtualizarPredio, AtualizarEspaco 
} from '../../../application/espacos/dto/espacos-dto';

@ApiTags('Prédios e Espaços da UVV')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiResponse({ status: 401, description: 'Não autorizado, token ausente ou inválido.' })
@ApiResponse({ status: 403, description: 'Acesso negado, ação requer cargo maior.' })
@Controller('espacos')
export class EspacosController {
  
  constructor(private readonly espacosService: EspacosService) {}

  @Post('predios')
  @Roles('organizador')
  @ApiOperation({ summary: 'Cadastrar um novo prédio no campus' })
  @ApiResponse({ status: 201, description: 'Prédio cadastrado com sucesso.' })
  @ApiBody({ type: CriarPredio })
  async criarPredio(@Body() body: CriarPredio) {
    return this.espacosService.criarPredio(body);
  }

  @Get('predios')
  @Roles('organizador', 'professor')
  @ApiOperation({ summary: 'Listar todos os prédios e suas salas' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso.' })
  async listarPredios() {
    return this.espacosService.listarPredios();
  }

  @Patch('predios/:id')
  @Roles('organizador')
  @ApiOperation({ summary: 'Atualizar dados de um prédio existente' })
  @ApiParam({ name: 'id', description: 'UUID do prédio' })
  @ApiBody({ type: AtualizarPredio })
  @ApiResponse({ status: 200, description: 'Prédio atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Prédio não encontrado.' })
  async atualizarPredio(@Param('id') id: string, @Body() body: AtualizarPredio) {
    return this.espacosService.atualizarPredio(id, body);
  }

  @Delete('predios/:id')
  @Roles('organizador')
  @ApiOperation({ summary: 'Remover um prédio' })
  @ApiParam({ name: 'id', description: 'UUID do prédio' })
  @ApiResponse({ status: 200, description: 'Prédio removido com sucesso.' })
  @ApiResponse({ status: 400, description: 'Não é possível remover prédio com salas vinculadas.' })
  async removerPredio(@Param('id') id: string) {
    return this.espacosService.removerPredio(id);
  }


  @Post('salas')
  @Roles('organizador')
  @ApiOperation({ summary: 'Cadastrar uma nova sala ou laboratório' })
  @ApiBody({ type: CriarEspaco })
  @ApiResponse({ status: 201, description: 'Espaço cadastrado com sucesso.' })
  @ApiResponse({ status: 404, description: 'O ID do prédio informado não existe.' })
  async criarEspaco(@Body() body: CriarEspaco) {
    return this.espacosService.criarEspaco(body);
  }

  @Get('salas')
  @Roles('organizador', 'professor')
  @ApiOperation({ summary: 'Listar todas as salas e laboratórios' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso.' })
  async listarEspacos() {
    return this.espacosService.listarEspacos();
  }

  @Patch('salas/:id')
  @Roles('organizador')
  @ApiOperation({ summary: 'Atualizar dados de uma sala ou laboratório' })
  @ApiParam({ name: 'id', description: 'UUID do espaço' })
  @ApiBody({ type: AtualizarEspaco })
  @ApiResponse({ status: 200, description: 'Espaço atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Espaço não encontrado.' })
  async atualizarEspaco(@Param('id') id: string, @Body() body: AtualizarEspaco) {
    return this.espacosService.atualizarEspaco(id, body);
  }

  @Delete('salas/:id')
  @Roles('organizador')
  @ApiOperation({ summary: 'Remover uma sala ou laboratório' })
  @ApiParam({ name: 'id', description: 'UUID do espaço' })
  @ApiResponse({ status: 200, description: 'Espaço removido com sucesso.' })
  async removerEspaco(@Param('id') id: string) {
    return this.espacosService.removerEspaco(id);
  }
}