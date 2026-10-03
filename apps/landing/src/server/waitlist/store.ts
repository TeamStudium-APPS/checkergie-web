import type { AgeGroup, Gender } from "@checkergie/api";

export interface WaitlistProfile {
  ageGroup: AgeGroup | null;
  gender: Gender | null;
}

export interface WaitlistStore {
  subscribe(email: string): Promise<{ created: boolean }>;
  updateProfile(email: string, profile: WaitlistProfile): Promise<void>;
}

export class WaitlistStoreUnavailableError extends Error {
  constructor() {
    super("대기 명단 저장소에 일시적으로 연결할 수 없습니다.");
    this.name = "WaitlistStoreUnavailableError";
  }
}

export const storeErrorStatus = (error: unknown) => (error instanceof WaitlistStoreUnavailableError ? 503 : 500);

export const normalizeEmail = (email: string) => email.trim().toLowerCase();
