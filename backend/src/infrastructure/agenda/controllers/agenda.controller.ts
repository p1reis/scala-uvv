import { Controller, Post, Body, UseGuards, Get, Delete, Param, Query, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

import { AgendaService } from '../../../application/agenda/agenda.service';
import { CriarAlocacao, AtualizarAlocacao } from '../../../application/agenda/dto/agenda.dto';

@ApiTags('Agenda de Aulas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiResponse({ status: 401, description: 'Não autorizado, token ausente ou inválido.' })
@ApiResponse({ status: 403, description: 'Acesso negado, ação requer cargo maior.' })
@Controller('agenda')
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Post()
  @Roles('organizador')
  @ApiOperation({ summary: 'Alocar uma turma em um espaço' })
  @ApiBody({ type: CriarAlocacao })
  @ApiResponse({ status: 201, description: 'Horário alocado com sucesso.' })
  @ApiResponse({ status: 409, description: 'Conflito de horário.' })
  async criarAlocacao(@Body() body: CriarAlocacao) {
    return this.agendaService.alocarTurma(body);
  }

  @Get()
  @Roles('organizador', 'professor')
  @ApiOperation({ summary: 'Listar a grade completa de horários' })
  @ApiQuery({ name: 'espacoId', required: false, description: 'Filtrar por Sala/Laboratório' })
  @ApiQuery({ name: 'turmaId', required: false, description: 'Filtrar por Turma' })
  @ApiQuery({ name: 'data', required: false, description: 'Filtrar por Data - Formato: YYYY-MM-DD' })
  @ApiResponse({ status: 200, description: 'Grade retornada com sucesso.' })
  async listarGrade(
    @Query('espacoId') espacoId?: string,
    @Query('turmaId') turmaId?: string,
    @Query('data') data?: string,
  ) {
    return this.agendaService.listarGrade(espacoId, turmaId, data);
  }

  @Patch(':id')
  @Roles('organizador')
  @ApiOperation({ summary: 'Atualizar um horário existente' })
  @ApiBody({ type: AtualizarAlocacao })
  async atualizarAlocacao(@Param('id') id: string, @Body() body: AtualizarAlocacao) {
    return this.agendaService.atualizarAlocacao(id, body);
  }

  @Delete(':id')
  @Roles('organizador')
  @ApiOperation({ summary: 'Remover um horário alocado da grade' })
  @ApiResponse({ status: 204, description: 'Horário removido com sucesso.' })
  async removerAlocacao(@Param('id') id: string) {
    await this.agendaService.removerAlocacao(id);
    return { mensagem: "Horário removido com sucesso!" }; 
  }
}