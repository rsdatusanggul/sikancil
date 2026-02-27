import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AuditService, LogParams } from './audit.service';

@Processor('audit-queue')
export class AuditProcessor extends WorkerHost {
  private readonly logger = new Logger(AuditProcessor.name);

  constructor(private readonly auditService: AuditService) {
    super();
  }

  async process(job: Job<LogParams>): Promise<void> {
    try {
      await this.auditService.writeLog(job.data);
    } catch (err) {
      this.logger.error(`Audit job ${job.id} failed: ${err?.message}`);
      throw err; // BullMQ akan retry otomatis sesuai konfigurasi attempts
    }
  }
}
