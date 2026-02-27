import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuditService } from '../../modules/audit/audit.service';
import { AuditAction, AuditStatus } from '../../modules/audit/entities/audit-log.entity';

const METHOD_ACTION_MAP: Record<string, string> = {
  POST:   AuditAction.CREATE,
  PUT:    AuditAction.UPDATE,
  PATCH:  AuditAction.UPDATE,
  DELETE: AuditAction.DELETE,
};

const PATH_ACTION_OVERRIDE: Record<string, string> = {
  '/approve': AuditAction.APPROVE,
  '/reject':  AuditAction.REJECT,
  '/submit':  AuditAction.SUBMIT,
  '/verify':  AuditAction.VERIFY,
  '/cancel':  AuditAction.CANCEL,
  '/export':  AuditAction.EXPORT,
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, user, ip, headers } = req;

    // Skip: GET request, endpoint audit, dan /auth (dilog manual di AuthController)
    if (method === 'GET' || url.includes('/audit') || url.includes('/auth')) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((responseBody) => {
        const action   = this.resolveAction(method, url);
        const entityId = responseBody?.id ?? req.params?.id;

        this.auditService.log({
          userId:      user?.id,
          userName:    user?.fullName ?? user?.username,
          userNip:     user?.nip,
          userRole:    user?.role,
          unitKerja:   user?.unitKerja,
          action,
          entityType:  this.resolveEntityType(url),
          entityId,
          entityLabel: responseBody?.nomorDokumen ?? responseBody?.nama ?? responseBody?.name,
          newValue:    this.sanitize(responseBody),
          status:      AuditStatus.SUCCESS,
          ipAddress:   this.extractIp(ip, headers),
          userAgent:   headers['user-agent'],
        });
      }),
      catchError((error) => {
        const auditAction =
          error?.status === 403 ? AuditAction.FORBIDDEN :
          error?.status === 401 ? AuditAction.UNAUTHORIZED :
          this.resolveAction(method, url);

        this.auditService.log({
          userId:       user?.id,
          userName:     user?.fullName ?? user?.username,
          userNip:      user?.nip,
          userRole:     user?.role,
          action:       auditAction,
          entityType:   this.resolveEntityType(url),
          status:       AuditStatus.FAILED,
          errorMessage: error?.message,
          ipAddress:    this.extractIp(ip, headers),
          userAgent:    headers['user-agent'],
        });

        return throwError(() => error);
      }),
    );
  }

  private resolveAction(method: string, url: string): string {
    for (const [path, action] of Object.entries(PATH_ACTION_OVERRIDE)) {
      if (url.includes(path)) return action;
    }
    return METHOD_ACTION_MAP[method] ?? AuditAction.VIEW;
  }

  private resolveEntityType(url: string): string {
    if (url.includes('/spp'))      return 'SPP';
    if (url.includes('/spm'))      return 'SPM';
    if (url.includes('/sp2d'))     return 'SP2D';
    if (url.includes('/jurnal'))   return 'JURNAL';
    if (url.includes('/bku'))      return 'BKU';
    if (url.includes('/spj'))      return 'SPJ';
    if (url.includes('/rba'))      return 'RBA';
    if (url.includes('/rak'))      return 'RAK';
    if (url.includes('/dpa'))      return 'DPA';
    if (url.includes('/pegawai'))  return 'PEGAWAI';
    if (url.includes('/supplier')) return 'SUPPLIER';
    if (url.includes('/laporan'))  return 'LAPORAN';
    if (url.includes('/users'))    return 'USER';
    if (url.includes('/auth'))     return 'SESSION';
    if (url.includes('/bukti-bayar')) return 'KWI';
    return 'SYSTEM';
  }

  private sanitize(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    const { password, token, hash, prevHash, refreshToken, ...safe } = obj;
    return safe;
  }

  private extractIp(ip: string, headers: Record<string, string>): string {
    // Ambil IP nyata jika ada proxy (X-Forwarded-For)
    const forwarded = headers['x-forwarded-for'];
    if (forwarded) return forwarded.split(',')[0].trim();
    return ip;
  }
}
