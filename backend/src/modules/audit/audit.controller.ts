import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditService } from './audit.service';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';

@ApiTags('Audit Log')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @Roles('super_admin', 'admin', 'kepala_blud')
  @ApiOperation({ summary: 'Daftar semua aktivitas user di sistem' })
  findAll(@Query() query: QueryAuditLogDto) {
    return this.auditService.findAll(query);
  }

  @Get('logs/:id')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Detail satu log aktivitas' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.auditService.findOne(id);
  }

  @Get('timeline/:entityType/:entityId')
  @Roles('super_admin', 'admin', 'kepala_blud', 'bendahara')
  @ApiOperation({ summary: 'Timeline aktivitas per dokumen' })
  getTimeline(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditService.getTimeline(entityType, entityId);
  }

  @Get('stats')
  @Roles('super_admin', 'admin', 'kepala_blud')
  @ApiOperation({ summary: 'Statistik ringkasan aktivitas' })
  getStats(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.auditService.getSummaryStats(dateFrom, dateTo);
  }
}
