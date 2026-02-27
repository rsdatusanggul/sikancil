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
import { SubOutputRbaService } from './sub-output-rba.service';
import { CreateSubOutputRbaDto, UpdateSubOutputRbaDto, QuerySubOutputRbaDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Sub Output RBA')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sub-output-rba')
export class SubOutputRbaController {
  constructor(private readonly subOutputRbaService: SubOutputRbaService) {}

  @Post()
  @ApiOperation({ summary: 'Create new sub output RBA' })
  @ApiResponse({ status: 201, description: 'Sub Output RBA created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed or output not found' })
  @ApiResponse({ status: 409, description: 'Sub Output code + tahun combination already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createDto: CreateSubOutputRbaDto) {
    return this.subOutputRbaService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sub output RBA with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'List of sub output RBA' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query() queryDto: QuerySubOutputRbaDto) {
    return this.subOutputRbaService.findAll(queryDto);
  }

  @Get('by-output/:outputId')
  @ApiOperation({ summary: 'Get all sub outputs for specific output' })
  @ApiParam({ name: 'outputId', description: 'Output RBA UUID' })
  @ApiResponse({ status: 200, description: 'List of sub outputs for the output' })
  @ApiResponse({ status: 404, description: 'Output not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByOutput(@Param('outputId') outputId: string) {
    return this.subOutputRbaService.findByOutput(outputId);
  }

  @Get('by-year/:tahun')
  @ApiOperation({ summary: 'Get all sub outputs for specific year' })
  @ApiParam({ name: 'tahun', example: 2024, description: 'Tahun anggaran' })
  @ApiResponse({ status: 200, description: 'List of sub outputs for the year' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByYear(@Param('tahun') tahun: string) {
    return this.subOutputRbaService.findByYear(parseInt(tahun, 10));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find sub output RBA by ID' })
  @ApiParam({ name: 'id', description: 'Sub Output RBA UUID' })
  @ApiResponse({ status: 200, description: 'Sub Output RBA found' })
  @ApiResponse({ status: 404, description: 'Sub Output RBA not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.subOutputRbaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update sub output RBA' })
  @ApiParam({ name: 'id', description: 'Sub Output RBA UUID' })
  @ApiResponse({ status: 200, description: 'Sub Output RBA updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 404, description: 'Sub Output RBA not found' })
  @ApiResponse({ status: 409, description: 'Sub Output code + tahun combination already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(@Param('id') id: string, @Body() updateDto: UpdateSubOutputRbaDto) {
    return this.subOutputRbaService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete sub output RBA (hard delete)' })
  @ApiParam({ name: 'id', description: 'Sub Output RBA UUID' })
  @ApiResponse({ status: 204, description: 'Sub Output RBA deleted' })
  @ApiResponse({ status: 404, description: 'Sub Output RBA not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string) {
    return this.subOutputRbaService.remove(id);
  }
}
