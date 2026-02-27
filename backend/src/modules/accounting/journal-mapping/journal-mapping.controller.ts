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
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JournalMappingService } from './journal-mapping.service';
import { CreateMappingRuleDto, UpdateMappingRuleDto } from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('accounting/journal-mappings')
@UseGuards(JwtAuthGuard)
export class JournalMappingController {
  constructor(private readonly mappingService: JournalMappingService) {}

  /**
   * Create a new mapping rule
   * POST /api/v1/accounting/journal-mappings
   */
  @Post()
  async create(@Body() createDto: CreateMappingRuleDto, @Request() req) {
    createDto.createdBy = req.user?.username || 'system';
    return this.mappingService.create(createDto);
  }

  /**
   * Get all mapping rules
   * GET /api/v1/accounting/journal-mappings
   */
  @Get()
  async findAll(@Query('isActive') isActive?: string) {
    const activeFilter = isActive !== undefined ? isActive === 'true' : undefined;
    return this.mappingService.findAll(activeFilter);
  }

  /**
   * Get mapping rule by ID
   * GET /api/v1/accounting/journal-mappings/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.mappingService.findOne(id);
  }

  /**
   * Get mapping rule by sourceType
   * GET /api/v1/accounting/journal-mappings/source-type/:sourceType
   */
  @Get('source-type/:sourceType')
  async findBySourceType(@Param('sourceType') sourceType: string) {
    return this.mappingService.findBySourceType(sourceType);
  }

  /**
   * Update mapping rule
   * PATCH /api/v1/accounting/journal-mappings/:id
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateMappingRuleDto,
    @Request() req,
  ) {
    updateDto.updatedBy = req.user?.username || 'system';
    return this.mappingService.update(id, updateDto);
  }

  /**
   * Delete mapping rule
   * DELETE /api/v1/accounting/journal-mappings/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.mappingService.remove(id);
  }

  /**
   * Activate mapping rule
   * POST /api/v1/accounting/journal-mappings/:id/activate
   */
  @Post(':id/activate')
  async activate(@Param('id') id: string) {
    return this.mappingService.activate(id);
  }

  /**
   * Deactivate mapping rule
   * POST /api/v1/accounting/journal-mappings/:id/deactivate
   */
  @Post(':id/deactivate')
  async deactivate(@Param('id') id: string) {
    return this.mappingService.deactivate(id);
  }

  /**
   * Test mapping rule with sample amount
   * POST /api/v1/accounting/journal-mappings/:id/test
   */
  @Post(':id/test')
  async testRule(@Param('id') id: string, @Body('amount') amount: number) {
    return this.mappingService.testRule(id, amount);
  }
}
