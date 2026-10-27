import { NeonDbError } from "@neondatabase/serverless";
import { getDatabase } from "../database";
import { normalizeEmail, WaitlistStoreUnavailableError, type WaitlistStore } from "./store";

const TRANSIENT_SQLSTATE_PREFIXES = ["08", "53", "57P", "40001", "40P01"];

const isTransient = (error: unknown) => {
  if (!(error instanceof NeonDbError)) return false;
  if (!error.code) return error.sourceError !== undefined;
  return TRANSIENT_SQLSTATE_PREFIXES.some((prefix) => error.code?.startsWith(prefix));
};

const run = async <T>(query: () => Promise<T>) => {
  try {
    return await query();
  } catch (error) {
    throw isTransient(error) ? new WaitlistStoreUnavailableError() : error;
  }
};

export const createWaitlistStore = (connect = getDatabase): WaitlistStore => ({
  warmUp: () => run(async () => {
    const sql = connect();
    await sql`SELECT 1`;
  }),

  subscribe: (email, policyVersion) => run(async () => {
    const sql = connect();
    const rows = await sql`
      WITH registered AS (
        INSERT INTO waitlist (email, policy_version) VALUES (${normalizeEmail(email)}, ${policyVersion})
        ON CONFLICT (email) DO NOTHING
        RETURNING email
      )
      INSERT INTO mail_outbox (email, kind)
      SELECT email, 'welcome' FROM registered
      RETURNING id
    `;
    return { created: rows.length === 1 };
  }),

  updateProfile: (email, { ageGroup, gender }) => run(async () => {
    const sql = connect();
    await sql`
      UPDATE waitlist SET age_group = ${ageGroup}, gender = ${gender}
      WHERE email = ${normalizeEmail(email)}
    `;
  }),
});

export const neonWaitlistStore = createWaitlistStore();
