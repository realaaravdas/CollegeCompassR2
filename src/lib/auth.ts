// src/lib/auth.ts
import { Lucia } from 'lucia';
import { db } from './db';
import type { Session, User } from 'lucia';

// This is a custom adapter that connects Lucia to our JSON file db.
const adapter = {
  getSessionAndUser: async (
    sessionId: string
  ): Promise<[Session | null, User | null]> => {
    const session = await db.getSession(sessionId);
    if (!session) return [null, null];

    const user = await db.getUser(session.userId);
    if (!user) return [null, null];

    return [
      {
        id: session.id,
        userId: user.username,
        expiresAt: new Date(session.expiresAt),
        attributes: {},
      },
      {
        id: user.username,
        attributes: {
          username: user.username,
        },
      },
    ];
  },
  getUserSessions: async (userId: string) => {
    const sessions = await db.getUserSessions(userId);
    return sessions.map((s) => ({
      id: s.id,
      userId: s.userId,
      expiresAt: new Date(s.expiresAt),
      attributes: {},
    }));
  },
  setSession: async (session: Session) => {
    await db.saveSession({
      id: session.id,
      userId: session.userId,
      expiresAt: session.expiresAt,
    });
  },
  updateSessionExpiration: async (sessionId: string, expiresAt: Date) => {
    await db.updateSessionExpiration(sessionId, expiresAt);
  },
  deleteSession: async (sessionId: string) => {
    await db.deleteSession(sessionId);
  },
  deleteUserSessions: async (userId: string) => {
    await db.deleteUserSessions(userId);
  },
};

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === 'production',
    },
  },
  getUserAttributes: (attributes) => {
    return {
      username: attributes.username,
    };
  },
});

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      username: string;
    };
  }
}
