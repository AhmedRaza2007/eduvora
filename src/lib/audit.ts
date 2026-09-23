import { NextRequest } from 'next/server';
import { db } from './db';

export interface AuditLogParams {
  institutionId?: string | null;
  userId?: string | null;
  userName?: string | null;
  userRole?: string | null;
  action: string;
  module: string;
  description: string;
  details?: Record<string, any> | string | null;
  req?: NextRequest;
}

export async function recordAuditLog(params: AuditLogParams): Promise<void> {
  try {
    let ipAddress: string | null = null;
    if (params.req) {
      ipAddress =
        params.req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        params.req.headers.get('x-real-ip') ||
        null;
    }

    const detailsStr =
      params.details && typeof params.details === 'object'
        ? JSON.stringify(params.details)
        : params.details || null;

    await db.auditLog.create({
      data: {
        institutionId: params.institutionId || null,
        userId: params.userId || null,
        userName: params.userName || null,
        userRole: params.userRole || null,
        action: params.action,
        module: params.module,
        description: params.description,
        details: detailsStr,
        ipAddress,
      },
    });
  } catch (error) {
    // Audit logging should never crash the main transaction
    console.warn('Failed to record audit log:', error);
  }
}
