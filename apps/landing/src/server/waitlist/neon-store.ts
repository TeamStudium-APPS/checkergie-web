import { neon, NeonDbError } from "@neondatabase/serverless";
import { normalizeEmail, WaitlistStoreUnavailableError, type WaitlistStore } from "./store";

const TRANSIENT_SQLSTATE_PREFIXES = ["08", "53", "57P", "40001", "40P01"];

const getSql = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL 환경 변수가 필요합니다.");
  }
  return neon(connectionString, { fullResults: true });
};

const isTransient = (error: unknown) => {
  if (!(error instanceof NeonDbError)) return false;
  if (!error.code) return true;
  return TRANSIENT_SQLSTATE_PREFIXES.some((prefix) => error.code?.startsWith(prefix));
};

const run = async <T>(query: () => Promise<T>) => {
  try {
    return await query();
  } catch (error) {
    throw isTransient(error) ? new WaitlistStoreUnavailableError() : error;
  }
};

export const neonWaitlistStore: WaitlistStore = {
  subscribe: (email) => run(async () => {
    const sql = getSql();
    const { rowCount } = await sql`
      INSERT INTO waitlist (email) VALUES (${normalizeEmail(email)})
      ON CONFLICT (email) DO NOTHING
    `;
    return { created: rowCount === 1 };
  }),

  updateProfile: (email, { ageGroup, gender }) => run(async () => {
    const sql = getSql();
    await sql`
      UPDATE waitlist SET age_group = ${ageGroup}, gender = ${gender}
      WHERE email = ${normalizeEmail(email)}
    `;
  }),
};
