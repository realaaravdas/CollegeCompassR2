// src/lib/auth.ts
import { Lucia } from 'lucia';
import { NodeNextJsAdapter } from '@lucia-auth/adapter-nextjs/node';
import { db } from './db';

// This is a dummy adapter that doesn't actually connect to a DB.
// In a real app, you'd use Prisma, Drizzle, etc.
// For this prototype, our `db.ts` handles the JSON file logic.
const adapter = {
  // We don't need these for this simple file-based auth
  deleteSession: async () => {},
  deleteUserSessions: async () => {},
  getSessionAndUser: async (sessionId: string) => {
    // A real implementation would check a session table.
    // Here we just extract the username from the session ID.
    // This is NOT secure, just for prototyping.
    const sessions = await db.getSessions();
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return [null, null];

    const user = await db.getUser(session.userId);
    if (!user) return [null, null];

    return [
      { id: session.id, userId: user.username, expiresAt: session.expiresAt, attributes: {} },
      { id: user.username, attributes: {} },
    ];
  },
  getUserSessions: async () => [],
  setSession: async (session: { id: string, userId: string, expiresAt: Date }) => {
    await db.saveSession(session);
  },
  updateSessionExpiration: async () => {},
};

export const lucia = new Lucia(adapter as any, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === 'production',
    },
  },
  getUserAttributes: (attributes) => {
    return {
      username: attributes.id,
    };
  },
});

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      id: string;
    };
  }
}
