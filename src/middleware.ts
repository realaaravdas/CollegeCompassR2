// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }
  // Other middleware logic can go here if needed
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
