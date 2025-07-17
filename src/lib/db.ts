// src/lib/db.ts
import fs from 'fs/promises';
import path from 'path';
import type { User, UserData } from './types';

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
  
  // --- Session Management (for lucia) ---
  getSessions: async (): Promise<{ id: string, userId: string, expiresAt: Date }[]> => {
    const sessions = await readJsonFile(SESSIONS_FILE, []);
    // Filter out expired sessions
    const validSessions = sessions.filter((s: { expiresAt: string | number | Date; }) => new Date(s.expiresAt) > new Date());
    if (validSessions.length < sessions.length) {
      await db.saveAllSessions(validSessions);
    }
    return validSessions.map((s: { expiresAt: string | number | Date; }) => ({ ...s, expiresAt: new Date(s.expiresAt) }));
  },
  saveSession: async (session: { id: string, userId: string, expiresAt: Date }): Promise<void> => {
    const sessions = await db.getSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    if(existingIndex > -1) {
        sessions[existingIndex] = session;
    } else {
        sessions.push(session);
    }
    await db.saveAllSessions(sessions);
  },
  saveAllSessions: (sessions: any[]): Promise<void> => writeJsonFile(SESSIONS_FILE, sessions),
};
