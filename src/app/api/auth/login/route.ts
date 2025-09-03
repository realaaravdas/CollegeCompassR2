// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { lucia } from '@/lib/auth';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { Argon2id } from 'oslo/password';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
    }

    const existingUser = await db.getUser(username);
    if (!existingUser) {
      return NextResponse.json({ message: 'Incorrect username or password' }, { status: 400 });
    }

    const validPassword = await new Argon2id().verify(existingUser.passwordHash, password);
    if (!validPassword) {
      return NextResponse.json({ message: 'Incorrect username or password' }, { status: 400 });
    }

    const session = await lucia.createSession(existingUser.username, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    const cookieStore = await cookies();
    cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    return NextResponse.json({ message: 'Logged in successfully', user: { username: existingUser.username } }, { status: 200 });
  } catch (e: any) {
    console.error('Login error:', e);
    return NextResponse.json({ message: 'An unknown error occurred' }, { status: 500 });
  }
}
