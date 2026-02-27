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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BankAccountService } from './bank-account.service';
import { CreateBankAccountDto, UpdateBankAccountDto, QueryBankAccountDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Bank Accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bank-account')
export class BankAccountController {
  constructor(private readonly bankAccountService: BankAccountService) {}

  @Post()
  @ApiOperation({ summary: 'Create new bank account' })
  @ApiResponse({ status: 201, description: 'Bank account created successfully' })
  @ApiResponse({ status: 409, description: 'Bank code or account number already exists' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@Body() createDto: CreateBankAccountDto, @Request() req) {
    return this.bankAccountService.create(createDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bank accounts with filtering' })
  @ApiResponse({ status: 200, description: 'List of bank accounts' })
  findAll(@Query() queryDto: QueryBankAccountDto) {
    return this.bankAccountService.findAll(queryDto);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active bank accounts' })
  @ApiResponse({ status: 200, description: 'List of active bank accounts' })
  getActiveAccounts() {
    return this.bankAccountService.getActiveAccounts();
  }

  @Get('primary')
  @ApiOperation({ summary: 'Get primary bank account' })
  @ApiResponse({ status: 200, description: 'Primary bank account' })
  @ApiResponse({ status: 404, description: 'No primary account found' })
  getPrimaryAccount() {
    return this.bankAccountService.getPrimaryAccount();
  }

  @Get('by-number/:nomorRekening')
  @ApiOperation({ summary: 'Find bank account by account number' })
  @ApiResponse({ status: 200, description: 'Bank account found' })
  @ApiResponse({ status: 404, description: 'Bank account not found' })
  findByAccountNumber(@Param('nomorRekening') nomorRekening: string) {
    return this.bankAccountService.findByAccountNumber(nomorRekening);
  }

  @Get('by-bank/:namaBank')
  @ApiOperation({ summary: 'Find bank accounts by bank name' })
  @ApiResponse({ status: 200, description: 'List of bank accounts' })
  getAccountsByBank(@Param('namaBank') namaBank: string) {
    return this.bankAccountService.getAccountsByBank(namaBank);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find bank account by ID' })
  @ApiResponse({ status: 200, description: 'Bank account found' })
  @ApiResponse({ status: 404, description: 'Bank account not found' })
  findOne(@Param('id') id: string) {
    return this.bankAccountService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update bank account' })
  @ApiResponse({ status: 200, description: 'Bank account updated successfully' })
  @ApiResponse({ status: 404, description: 'Bank account not found' })
  @ApiResponse({ status: 409, description: 'Bank code or account number already exists' })
  update(@Param('id') id: string, @Body() updateDto: UpdateBankAccountDto, @Request() req) {
    return this.bankAccountService.update(id, updateDto, req.user.sub);
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Close bank account' })
  @ApiResponse({ status: 200, description: 'Bank account closed successfully' })
  @ApiResponse({ status: 404, description: 'Bank account not found' })
  @ApiResponse({ status: 400, description: 'Cannot close primary account' })
  closeAccount(@Param('id') id: string) {
    return this.bankAccountService.closeAccount(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate bank account (soft delete)' })
  @ApiResponse({ status: 204, description: 'Bank account deactivated' })
  @ApiResponse({ status: 404, description: 'Bank account not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete primary account' })
  remove(@Param('id') id: string) {
    return this.bankAccountService.remove(id);
  }
}
