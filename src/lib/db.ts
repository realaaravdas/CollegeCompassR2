// src/lib/db.ts
import fs from 'fs/promises';
import path from 'path';
import type { User, UserData } from './types';

interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
}

// In a real app, use a proper database.
// For this prototype, we'll use JSON files.
const DB_DIR = path.join(process.cwd(), 'local-db');
const USERS_FILE = path.join(DB_DIR, 'users.json');
const SESSIONS_FILE = path.join(DB_DIR, 'sessions.json');

// Ensure DB directory exists
const ensureDbDir = async () => {
  try {
    await fs.access(DB_DIR);
  } catch {
    await fs.mkdir(DB_DIR, { recursive: true });
  }
};

const readJsonFile = async <T>(filePath: string, defaultValue: T): Promise<T> => {
  try {
    await ensureDbDir();
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      await writeJsonFile(filePath, defaultValue);
      return defaultValue;
    }
    throw error;
  }
};

const writeJsonFile = async <T>(filePath: string, data: T): Promise<void> => {
  await ensureDbDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

// --- User Management ---
const getUsers = async (): Promise<User[]> => readJsonFile(USERS_FILE, []);
const saveUsers = (users: User[]): Promise<void> => writeJsonFile(USERS_FILE, users);

// --- Session Management ---
const getSessions = async (): Promise<Session[]> => {
    const sessions = await readJsonFile<Session[]>(SESSIONS_FILE, []);
    // Filter out expired sessions on read
    const now = new Date();
    const validSessions = sessions.filter(s => new Date(s.expiresAt) > now);
    if (validSessions.length < sessions.length) {
        await writeJsonFile(SESSIONS_FILE, validSessions);
    }
    return validSessions;
};
const saveAllSessions = (sessions: Session[]): Promise<void> => writeJsonFile(SESSIONS_FILE, sessions);


export const db = {
  getUser: async (username: string): Promise<User | undefined> => {
    const users = await getUsers();
    return users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  },
  createUser: async (user: User): Promise<void> => {
    const users = await getUsers();
    users.push(user);
    await saveUsers(users);
  },

  // --- User Data (Colleges) Management ---
  getUserData: async (username: string): Promise<UserData | undefined> => {
    const userDataPath = path.join(DB_DIR, `${username}.data.json`);
    return readJsonFile(userDataPath, { colleges: [] });
  },
  saveUserData: async (username: string, data: UserData): Promise<void> => {
    const userDataPath = path.join(DB_DIR, `${username}.data.json`);
    await writeJsonFile(userDataPath, data);
  },
  
  // --- Session Management (for lucia adapter) ---
  getSession: async (sessionId: string): Promise<Session | null> => {
    const sessions = await getSessions();
    return sessions.find(s => s.id === sessionId) ?? null;
  },
  getUserSessions: async (userId: string): Promise<Session[]> => {
      const sessions = await getSessions();
      return sessions.filter(s => s.userId === userId);
  },
  saveSession: async (session: Session): Promise<void> => {
    const sessions = await getSessions();
    sessions.push(session);
    await saveAllSessions(sessions);
  },
  updateSessionExpiration: async(sessionId: string, expiresAt: Date): Promise<void> => {
    const sessions = await getSessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    if (sessionIndex > -1) {
        sessions[sessionIndex].expiresAt = expiresAt;
        await saveAllSessions(sessions);
    }
  },
  deleteSession: async (sessionId: string): Promise<void> => {
      let sessions = await getSessions();
      sessions = sessions.filter(s => s.id !== sessionId);
      await saveAllSessions(sessions);
  },
  deleteUserSessions: async(userId: string): Promise<void> => {
      let sessions = await getSessions();
      sessions = sessions.filter(s => s.userId !== userId);
      await saveAllSessions(sessions);
  }
};
