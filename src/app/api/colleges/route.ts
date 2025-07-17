// src/app/api/colleges/route.ts
import { NextResponse } from 'next/server';
import { lucia } from '@/lib/auth';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

async function getUsername() {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) return null;
  const { user } = await lucia.validateSession(sessionId);
  return user?.id ?? null;
}

export async function GET() {
  const username = await getUsername();
  if (!username) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userData = await db.getUserData(username);
  return NextResponse.json({ colleges: userData?.colleges || [] });
}

export async function POST(request: Request) {
  const username = await getUsername();
  if (!username) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const { colleges } = await request.json();
  await db.saveUserData(username, { colleges });
  return NextResponse.json({ message: 'Data saved' });
}
