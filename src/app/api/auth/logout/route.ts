import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, SESSION_COOKIE_NAME } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);

    if (auth.authenticated && auth.user) {
      await recordAuditLog({
        institutionId: auth.institutionId,
        userId: auth.user.id,
        userName: auth.user.name,
        userRole: auth.role,
        action: 'LOGOUT',
        module: 'AUTH',
        description: `User ${auth.user.name} logged out.`,
        req,
      });
    }

    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

    // Clear session cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error: any) {
    console.error('API /auth/logout error:', error);
    return NextResponse.json({ success: false, error: 'Logout failed' }, { status: 500 });
  }
}
