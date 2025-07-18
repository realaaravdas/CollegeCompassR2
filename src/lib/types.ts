export interface Essay {
  id: string;
  title: string;
  completed: boolean;
}

export interface College {
  id: string;
  name: string;
  deadlines: string;
  applicationPortal: string;
  majors: string[];
  acceptanceRate: string;
  gpa?: number;
  testScore?: number;
  testType?: 'SAT' | 'ACT';
  selectedMajor?: string;
  estimatedAcceptanceRate?: {
    rate: number;
    reasoning: string;
  };
  studentProfile?: {
    gpa: number;
    activities: string;
    actScore: number;
    satScore: number;
  };
  essays: Essay[];
  numberOfEssays: number;
}

export interface User {
  username: string;
  passwordHash: string;
}

export interface UserData {
  colleges: College[];
}
