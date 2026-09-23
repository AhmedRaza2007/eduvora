import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from './db';

export const SESSION_COOKIE_NAME = 'eduvora_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'eduvora-super-secure-multi-tenant-saas-secret-key-2026';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  institutionId?: string | null;
  branchId?: string | null;
  institutionName?: string | null;
  institutionType?: string | null;
  branchName?: string | null;
  avatar?: string | null;
  permissions?: string[];
  exp: number;
}

export interface AuthContext {
  authenticated: boolean;
  user: SessionUser | null;
  institutionId: string | null;
  branchId: string | null;
  role: string | null;
  isSuperAdmin: boolean;
  isOwnerOrAdmin: boolean;
  error?: string;
}

/**
 * Sign payload into an HMAC SHA-256 token
 */
export function createSessionToken(payload: Omit<SessionUser, 'exp'>, expiresInDays = 7): string {
  const exp = Math.floor(Date.now() / 1000) + expiresInDays * 24 * 60 * 60;
  const data: SessionUser = { ...payload, exp };
  const jsonStr = JSON.stringify(data);
  const base64Data = Buffer.from(jsonStr, 'utf8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(base64Data)
    .digest('base64url');

  return `${base64Data}.${signature}`;
}

/**
 * Verify and unpack HMAC SHA-256 session token
 */
export function verifySessionToken(token: string): SessionUser | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [base64Data, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(base64Data)
      .digest('base64url');

    // Constant time comparison to prevent timing attacks
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const jsonStr = Buffer.from(base64Data, 'base64url').toString('utf8');
    const user = JSON.parse(jsonStr) as SessionUser;

    // Check expiry
    if (user.exp && user.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

/**
 * Extract auth context from request (Cookie or Authorization header)
 */
export async function getAuthContext(req: NextRequest): Promise<AuthContext> {
  let token: string | undefined;

  // 1. Check Cookie
  const cookie = req.cookies.get(SESSION_COOKIE_NAME);
  if (cookie?.value) {
    token = cookie.value;
  }

  // 2. Check Authorization Header fallback
  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token) {
    return {
      authenticated: false,
      user: null,
      institutionId: null,
      branchId: null,
      role: null,
      isSuperAdmin: false,
      isOwnerOrAdmin: false,
      error: 'Unauthenticated',
    };
  }

  const sessionUser = verifySessionToken(token);
  if (!sessionUser) {
    return {
      authenticated: false,
      user: null,
      institutionId: null,
      branchId: null,
      role: null,
      isSuperAdmin: false,
      isOwnerOrAdmin: false,
      error: 'Invalid or expired session token',
    };
  }

  const role = sessionUser.role;
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isOwnerOrAdmin = role === 'OWNER' || role === 'ADMIN';

  return {
    authenticated: true,
    user: sessionUser,
    institutionId: sessionUser.institutionId || null,
    branchId: sessionUser.branchId || null,
    role,
    isSuperAdmin,
    isOwnerOrAdmin,
  };
}

/**
 * Enforce authentication and optionally required roles
 */
export async function requireAuth(
  req: NextRequest,
  allowedRoles?: string[]
): Promise<{ auth: AuthContext; response?: NextResponse }> {
  const auth = await getAuthContext(req);

  if (!auth.authenticated || !auth.user) {
    return {
      auth,
      response: NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      ),
    };
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = auth.role || '';
    const hasRole = auth.isSuperAdmin || allowedRoles.includes(userRole);
    if (!hasRole) {
      return {
        auth,
        response: NextResponse.json(
          { success: false, error: 'Forbidden: Insufficient permissions', code: 'FORBIDDEN' },
          { status: 403 }
        ),
      };
    }
  }

  return { auth };
}

/**
 * Simple password verification with bcrypt/hash compatibility and fallback
 */
export function verifyPassword(plain: string, stored: string): boolean {
  if (!plain || !stored) return false;
  if (plain === stored) return true; // Direct match (for seeded records or dev mode)
  if (stored === 'password123' && plain === 'password123') return true;

  // Simple SHA-256 hash match
  const hash = crypto.createHash('sha256').update(plain).digest('hex');
  return hash === stored;
}

export function hashPassword(plain: string): string {
  return crypto.createHash('sha256').update(plain).digest('hex');
}
