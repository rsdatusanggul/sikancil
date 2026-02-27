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
import { RevisiRbaService } from './revisi-rba.service';
import { CreateRevisiRbaDto, UpdateRevisiRbaDto, QueryRevisiRbaDto, ApproveRevisiDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Revisi RBA')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('revisi-rba')
export class RevisiRbaController {
  constructor(private readonly revisiRbaService: RevisiRbaService) {}

  @Post()
  @ApiOperation({ summary: 'Create new revisi RBA' })
  @ApiResponse({ status: 201, description: 'Revisi created successfully' })
  @ApiResponse({ status: 400, description: 'RBA not found' })
  create(@Body() createDto: CreateRevisiRbaDto, @Request() req) {
    return this.revisiRbaService.create(createDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all revisi with filtering' })
  @ApiResponse({ status: 200, description: 'List of revisi' })
  findAll(@Query() queryDto: QueryRevisiRbaDto) {
    return this.revisiRbaService.findAll(queryDto);
  }

  @Get('by-rba/:rbaId')
  @ApiOperation({ summary: 'Get revisi by RBA ID' })
  @ApiResponse({ status: 200, description: 'List of revisi for RBA' })
  findByRBA(@Param('rbaId') rbaId: string) {
    return this.revisiRbaService.findByRBA(rbaId);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending revisi (not approved yet)' })
  @ApiResponse({ status: 200, description: 'List of pending revisi' })
  findPendingRevisi() {
    return this.revisiRbaService.findPendingRevisi();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find revisi by ID' })
  @ApiResponse({ status: 200, description: 'Revisi found' })
  @ApiResponse({ status: 404, description: 'Revisi not found' })
  findOne(@Param('id') id: string) {
    return this.revisiRbaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update revisi (only if not approved)' })
  @ApiResponse({ status: 200, description: 'Revisi updated successfully' })
  @ApiResponse({ status: 400, description: 'Revisi already approved' })
  update(@Param('id') id: string, @Body() updateDto: UpdateRevisiRbaDto, @Request() req) {
    return this.revisiRbaService.update(id, updateDto, req.user.sub);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve revisi' })
  @ApiResponse({ status: 200, description: 'Revisi approved successfully' })
  @ApiResponse({ status: 400, description: 'Revisi already approved' })
  approveRevisi(@Param('id') id: string, @Body() approveDto: ApproveRevisiDto, @Request() req) {
    return this.revisiRbaService.approveRevisi(id, req.user.sub, approveDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete revisi (only if not approved)' })
  @ApiResponse({ status: 204, description: 'Revisi deleted' })
  @ApiResponse({ status: 400, description: 'Cannot delete approved revisi' })
  remove(@Param('id') id: string) {
    return this.revisiRbaService.remove(id);
  }
}
