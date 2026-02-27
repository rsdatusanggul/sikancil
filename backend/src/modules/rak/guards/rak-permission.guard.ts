import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RakService } from '../services/rak.service';
import { RakStatus } from '../entities/rak-subkegiatan.entity';

@Injectable()
export class RakPermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rakService: RakService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const rakId = request.params.id;

    if (!rakId) {
      return true;
    }

    // Admin can always access
    if (user.role === 'ADMIN' || user.role === 'ADMIN_KEUANGAN') {
      return true;
    }

    // Get RAK to check ownership/permissions
    try {
      const rak = await this.rakService.findOne(rakId);

      // PPTK can only edit their own RAK in DRAFT status
      if (user.role === 'PPTK') {
        if (rak.created_by === user.id) {
          return true;
        }
      }

      // Verifikator and PPKD can view and approve
      if (user.role === 'VERIFIKATOR' || user.role === 'PPKD') {
        return true;
      }

      throw new ForbiddenException('Anda tidak memiliki akses ke RAK ini');
    } catch (error) {
      throw new ForbiddenException('RAK tidak ditemukan');
    }
  }
}