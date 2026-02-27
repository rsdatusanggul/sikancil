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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ChartOfAccountsService } from './chart-of-accounts.service';
import { CreateChartOfAccountDto, UpdateChartOfAccountDto, QueryChartOfAccountDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Chart of Accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chart-of-accounts')
export class ChartOfAccountsController {
  constructor(private readonly chartOfAccountsService: ChartOfAccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new chart of account' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({ status: 409, description: 'Account code already exists' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@Body() createDto: CreateChartOfAccountDto, @Request() req) {
    return this.chartOfAccountsService.create(createDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all chart of accounts with filtering' })
  @ApiResponse({ status: 200, description: 'List of accounts' })
  findAll(@Query() queryDto: QueryChartOfAccountDto) {
    return this.chartOfAccountsService.findAll(queryDto);
  }

  @Get('hierarchy')
  @ApiOperation({ summary: 'Get account hierarchy tree' })
  @ApiResponse({ status: 200, description: 'Hierarchical account structure' })
  getHierarchy() {
    return this.chartOfAccountsService.getHierarchy();
  }

  @Get('detail')
  @ApiOperation({ summary: 'Get detail accounts only (for transactions)' })
  @ApiResponse({ status: 200, description: 'List of detail accounts' })
  getDetailAccounts() {
    return this.chartOfAccountsService.getDetailAccounts();
  }

  @Get('by-code/:kodeRekening')
  @ApiOperation({ summary: 'Find account by code' })
  @ApiResponse({ status: 200, description: 'Account found' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  findByCode(@Param('kodeRekening') kodeRekening: string) {
    return this.chartOfAccountsService.findByCode(kodeRekening);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find account by ID' })
  @ApiResponse({ status: 200, description: 'Account found' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  findOne(@Param('id') id: string) {
    return this.chartOfAccountsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update account' })
  @ApiResponse({ status: 200, description: 'Account updated successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 409, description: 'Account code already exists' })
  update(@Param('id') id: string, @Body() updateDto: UpdateChartOfAccountDto, @Request() req) {
    return this.chartOfAccountsService.update(id, updateDto, req.user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate account (soft delete)' })
  @ApiResponse({ status: 204, description: 'Account deactivated' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete account with children' })
  remove(@Param('id') id: string) {
    return this.chartOfAccountsService.remove(id);
  }
}
