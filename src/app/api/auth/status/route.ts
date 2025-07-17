// src/app/api/auth/status/route.ts
import { NextResponse } from 'next/server';
import { lucia } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const { session, user } = await lucia.validateSession(sessionId);

  if (!session) {
    const sessionCookie = lucia.createBlankSessionCookie();
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    return NextResponse.json({ user: null }, { status: 401 });
  }

  if (session.fresh) {
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  }

  return NextResponse.json({ user: { username: user.id } }, { status: 200 });
}
