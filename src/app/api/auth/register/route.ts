// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { lucia } from '@/lib/auth';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { Argon2id } from 'oslo/password';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || username.length < 3) {
      return NextResponse.json({ message: 'Username must be at least 3 characters' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existingUser = await db.getUser(username);
    if (existingUser) {
      return NextResponse.json({ message: 'Username is already taken' }, { status: 400 });
    }

    const passwordHash = await new Argon2id().hash(password);
    await db.createUser({ username, passwordHash });
    await db.saveUserData(username, { colleges: [] }); // Create initial empty data

    const session = await lucia.createSession(username, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    return NextResponse.json({ message: 'User registered successfully', user: { username } }, { status: 201 });
  } catch (e: any) {
    console.error('Registration error:', e);
    return NextResponse.json({ message: 'An unknown error occurred' }, { status: 500 });
  }
}
