import { isWaitlistAlreadyRegisteredError } from "@checkergie/api";

const STORAGE_KEY = "checkergie:waitlist:unconfirmed-subscription";
const UNCONFIRMED_SUBSCRIPTION_TTL = 10 * 60 * 1000;

interface UnconfirmedSubscription {
  emailHash: string;
  savedAt: number;
}

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

export const hasUnconfirmedSubscription = async (email: string) => {
  const unconfirmedSubscription = readUnconfirmedSubscription();
  if (!unconfirmedSubscription || isExpired(unconfirmedSubscription)) return false;
  return unconfirmedSubscription.emailHash === (await toEmailHash(email));
};

const isExpired = ({ savedAt }: UnconfirmedSubscription) => Date.now() - savedAt > UNCONFIRMED_SUBSCRIPTION_TTL;

export const finishFailedSubscription = (error: unknown, hasUnconfirmedAttempt: boolean) => {
  if (!isWaitlistAlreadyRegisteredError(error)) throw error;
  forgetUnconfirmedSubscription();
  if (hasUnconfirmedAttempt) return;
  throw error;
};

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
