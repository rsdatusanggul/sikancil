import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AnggaranBelanjaRbaService } from './anggaran-belanja-rba.service';
import { CreateAnggaranBelanjaRbaDto, UpdateAnggaranBelanjaRbaDto, QueryAnggaranBelanjaRbaDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Anggaran Belanja RBA')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('anggaran-belanja-rba')
export class AnggaranBelanjaRbaController {
  constructor(private readonly anggaranBelanjaRbaService: AnggaranBelanjaRbaService) {}

  @Post()
  @ApiOperation({ summary: 'Create new anggaran belanja RBA' })
  @ApiResponse({ status: 201, description: 'Anggaran belanja RBA created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed or references not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createDto: CreateAnggaranBelanjaRbaDto) {
    return this.anggaranBelanjaRbaService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all anggaran belanja RBA with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'List of anggaran belanja RBA' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query() queryDto: QueryAnggaranBelanjaRbaDto) {
    return this.anggaranBelanjaRbaService.findAll(queryDto);
  }

  @Get('by-output/:outputId')
  @ApiOperation({ summary: 'Get all anggaran belanja for specific output' })
  @ApiParam({ name: 'outputId', description: 'Output RBA UUID' })
  @ApiResponse({ status: 200, description: 'List of anggaran belanja for the output' })
  @ApiResponse({ status: 404, description: 'Output not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByOutput(@Param('outputId') outputId: string) {
    return this.anggaranBelanjaRbaService.findByOutput(outputId);
  }

  @Get('by-sub-output/:subOutputId')
  @ApiOperation({ summary: 'Get all anggaran belanja for specific sub output' })
  @ApiParam({ name: 'subOutputId', description: 'Sub Output RBA UUID' })
  @ApiResponse({ status: 200, description: 'List of anggaran belanja for the sub output' })
  @ApiResponse({ status: 404, description: 'Sub output not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findBySubOutput(@Param('subOutputId') subOutputId: string) {
    return this.anggaranBelanjaRbaService.findBySubOutput(subOutputId);
  }

  @Get('by-rekening/:kodeRekening/:tahun')
  @ApiOperation({ summary: 'Get anggaran belanja by kode rekening and year' })
  @ApiParam({ name: 'kodeRekening', description: 'Kode Rekening' })
  @ApiParam({ name: 'tahun', description: 'Tahun anggaran' })
  @ApiResponse({ status: 200, description: 'List of anggaran belanja for the rekening and year' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByRekening(
    @Param('kodeRekening') kodeRekening: string,
    @Param('tahun') tahun: string,
  ) {
    return this.anggaranBelanjaRbaService.findByRekening(kodeRekening, parseInt(tahun, 10));
  }

  @Get('total-pagu/output/:outputId')
  @ApiOperation({ summary: 'Get total pagu for specific output' })
  @ApiParam({ name: 'outputId', description: 'Output RBA UUID' })
  @ApiResponse({ status: 200, description: 'Total pagu for the output' })
  @ApiResponse({ status: 404, description: 'Output not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getTotalPaguByOutput(@Param('outputId') outputId: string) {
    return this.anggaranBelanjaRbaService.getTotalPaguByOutput(outputId);
  }

  @Get('total-pagu/sub-output/:subOutputId')
  @ApiOperation({ summary: 'Get total pagu for specific sub output' })
  @ApiParam({ name: 'subOutputId', description: 'Sub Output RBA UUID' })
  @ApiResponse({ status: 200, description: 'Total pagu for the sub output' })
  @ApiResponse({ status: 404, description: 'Sub output not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getTotalPaguBySubOutput(@Param('subOutputId') subOutputId: string) {
    return this.anggaranBelanjaRbaService.getTotalPaguBySubOutput(subOutputId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find anggaran belanja RBA by ID' })
  @ApiParam({ name: 'id', description: 'Anggaran Belanja RBA UUID' })
  @ApiResponse({ status: 200, description: 'Anggaran belanja RBA found' })
  @ApiResponse({ status: 404, description: 'Anggaran belanja RBA not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.anggaranBelanjaRbaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update anggaran belanja RBA' })
  @ApiParam({ name: 'id', description: 'Anggaran Belanja RBA UUID' })
  @ApiResponse({ status: 200, description: 'Anggaran belanja RBA updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 404, description: 'Anggaran belanja RBA not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(@Param('id') id: string, @Body() updateDto: UpdateAnggaranBelanjaRbaDto) {
    return this.anggaranBelanjaRbaService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete anggaran belanja RBA' })
  @ApiParam({ name: 'id', description: 'Anggaran Belanja RBA UUID' })
  @ApiResponse({ status: 204, description: 'Anggaran belanja RBA deleted' })
  @ApiResponse({ status: 404, description: 'Anggaran belanja RBA not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string) {
    return this.anggaranBelanjaRbaService.remove(id);
  }
}
