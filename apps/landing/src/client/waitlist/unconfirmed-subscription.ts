import { isResponseLostError, isWaitlistAlreadyRegisteredError } from "@checkergie/api";

const STORAGE_KEY = "checkergie:waitlist:unconfirmed-subscription";
const UNCONFIRMED_SUBSCRIPTION_TTL = 10 * 60 * 1000;

interface UnconfirmedSubscription {
  emailHash: string;
  savedAt: number;
}

// ==================== 기록: 결과가 확인되지 않은 대기 등록을 저장소에 남기기 ====================

export const rememberUnconfirmedSubscription = async (email: string) => {
  const emailHash = await toEmailHash(email);
  if (!emailHash) return;
  writeUnconfirmedSubscription({ emailHash, savedAt: Date.now() });
};

export const forgetUnconfirmedSubscription = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    return;
  }
};

// ==================== 확인: 이전 대기 등록의 결과가 확인되지 않았는지 판단하기 ====================

export const hasUnconfirmedSubscription = async (email: string) => {
  const unconfirmedSubscription = readUnconfirmedSubscription();
  if (!unconfirmedSubscription || isExpired(unconfirmedSubscription)) return false;
  return unconfirmedSubscription.emailHash === (await toEmailHash(email));
};

const isExpired = ({ savedAt }: UnconfirmedSubscription) => Date.now() - savedAt > UNCONFIRMED_SUBSCRIPTION_TTL;

// ==================== 실패 처리: 응답 유실 후 재시도를 등록 완료로 되돌리기 ====================

export const finishFailedSubscription = (error: unknown, wasUnconfirmed: boolean) => {
  if (isResponseLostError(error)) throw error;
  forgetUnconfirmedSubscription();
  if (wasUnconfirmed && isWaitlistAlreadyRegisteredError(error)) return;
  throw error;
};

// ==================== 저장소: localStorage 읽기·쓰기와 이메일 해시 ====================

const readUnconfirmedSubscription = (): UnconfirmedSubscription | undefined => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? (JSON.parse(value) as UnconfirmedSubscription) : undefined;
  } catch {
    return undefined;
  }
};

const writeUnconfirmedSubscription = (unconfirmedSubscription: UnconfirmedSubscription) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unconfirmedSubscription));
  } catch {
    return;
  }
};

const toEmailHash = async (email: string) => {
  try {
    const bytes = new TextEncoder().encode(email.trim().toLowerCase());
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  } catch {
    return undefined;
  }
};
