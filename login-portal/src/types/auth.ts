// ============================================================
// AUTH TYPES — LabCore ELIS Security Portal
// ============================================================

export type UserRole =
  | "ADMIN"
  | "SUPER_ADMIN"
  | "BRANCH_ADMIN"
  | "FRONT_DESK"
  | "LAB_TECH"
  | "PATHOLOGIST"
  | "DOCTOR"
  | "ACCOUNTANT"
  | "AUDITOR";

export type AccountStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "LOCKED";

export interface AuthUser {
  id: string;
  employeeCode: string;
  email: string;
  fullName: string;
  name: string;
  role: UserRole;
  mfaEnabled: boolean;
  passwordExpired: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    // Normal login
    accessToken?: string;
    refreshToken?: string;
    tokenType?: string;
    user?: AuthUser;
    sessionId?: string;
    expiresAt?: string;
    idleTimeoutMinutes?: number;
    // MFA required
    requiresMfa?: boolean;
    mfaToken?: string;
    // MFA setup
    requiresMfaSetup?: boolean;
    otpauthUrl?: string;
    backupCodes?: string[];
  };
}

export interface Session {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  lastSeenAt: string;
  createdAt: string;
  revokedAt: string | null;
  revokeReason: string | null;
}

export interface SecurityEvent {
  id: string;
  action: string;
  ipAddress?: string;
  createdAt: string;
  newData?: Record<string, unknown>;
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Very Weak" | "Weak" | "Fair" | "Strong" | "Very Strong";
  color: string;
  suggestions: string[];
}
