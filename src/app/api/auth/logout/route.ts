// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { lucia } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const sessionCookie = lucia.createBlankSessionCookie();
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    return NextResponse.json({ message: 'Logged out' }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'An unknown error occurred' }, { status: 500 });
  }
}
