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
import { JournalService } from './journal.service';
import { CreateJournalDto, UpdateJournalDto, JournalFilterDto } from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('accounting/journals')
@UseGuards(JwtAuthGuard)
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  /**
   * Create a new journal entry
   * POST /api/v1/accounting/journals
   */
  @Post()
  async create(@Body() createJournalDto: CreateJournalDto, @Request() req) {
    createJournalDto.createdBy = req.user?.username || 'system';
    return this.journalService.create(createJournalDto);
  }

  /**
   * Get all journals with filtering and pagination
   * GET /api/v1/accounting/journals
   */
  @Get()
  async findAll(@Query() filterDto: JournalFilterDto) {
    return this.journalService.findAll(filterDto);
  }

  /**
   * Get journal by ID
   * GET /api/v1/accounting/journals/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.journalService.findOne(id);
  }

  /**
   * Update journal (only DRAFT)
   * PATCH /api/v1/accounting/journals/:id
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateJournalDto: UpdateJournalDto,
    @Request() req,
  ) {
    updateJournalDto.updatedBy = req.user?.username || 'system';
    return this.journalService.update(id, updateJournalDto);
  }

  /**
   * Delete journal (only DRAFT)
   * DELETE /api/v1/accounting/journals/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.journalService.remove(id);
  }

  /**
   * Post journal to General Ledger
   * POST /api/v1/accounting/journals/:id/post
   */
  @Post(':id/post')
  async post(@Param('id') id: string, @Request() req) {
    const postedBy = req.user?.username || 'system';
    return this.journalService.post(id, postedBy);
  }

  /**
   * Approve journal (for manual journals)
   * POST /api/v1/accounting/journals/:id/approve
   */
  @Post(':id/approve')
  async approve(@Param('id') id: string, @Request() req) {
    const approvedBy = req.user?.username || 'system';
    return this.journalService.approve(id, approvedBy);
  }

  /**
   * Reverse journal
   * POST /api/v1/accounting/journals/:id/reverse
   */
  @Post(':id/reverse')
  async reverse(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    const reversedBy = req.user?.username || 'system';
    return this.journalService.reverse(id, reversedBy, reason);
  }
}
