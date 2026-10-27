import "server-only";

import { neon } from "@neondatabase/serverless";

export type DatabaseSql = (strings: TemplateStringsArray, ...parameters: unknown[]) => Promise<Record<string, unknown>[]>;

export const getDatabase = (): DatabaseSql => {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL 환경변수가 필요합니다.");
  return neon(process.env.DATABASE_URL);
};
