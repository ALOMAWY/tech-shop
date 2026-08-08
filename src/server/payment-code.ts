import "server-only";
import { randomInt } from "node:crypto";

/**
 * Payment-code generation for Sham Cash QR orders.
 *
 * Format: PAY-XXXX-XXXX — uppercase alphanumeric.
 * Ambiguous characters 0/O/1/I are excluded from the alphabet.
 *
 * The `random()` parameter is injectable so tests can use a deterministic
 * source; in production it defaults to a CSPRNG (`crypto.randomInt`).
 */

export const PAYMENT_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const PAYMENT_CODE_PREFIX = "PAY";

export const PAYMENT_CODE_GROUP_LENGTH = 4;

export const PAYMENT_CODE_GROUP_COUNT = 2;

export const PAYMENT_CODE_PATTERN =
  /^PAY-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/;

export type RandomIndexSource = () => number;

export function generatePaymentCode(random: RandomIndexSource = () => randomInt(PAYMENT_CODE_ALPHABET.length)): string {
  const groups: string[] = [];
  for (let g = 0; g < PAYMENT_CODE_GROUP_COUNT; g++) {
    let group = "";
    for (let i = 0; i < PAYMENT_CODE_GROUP_LENGTH; i++) {
      group += PAYMENT_CODE_ALPHABET[random()];
    }
    groups.push(group);
  }
  return `${PAYMENT_CODE_PREFIX}-${groups.join("-")}`;
}

/**
 * Calls `insert` with freshly generated codes until one succeeds without a
 * unique-constraint violation (`isUniqueError`), or `maxAttempts` run out.
 */
export async function withUniqueRetry<T>({
  generate,
  insert,
  isUniqueError,
  maxAttempts,
}: {
  generate: () => T;
  insert: (value: T) => Promise<void>;
  isUniqueError: (err: unknown) => boolean;
  maxAttempts: number;
}): Promise<T> {
  let error: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const value = generate();
    try {
      await insert(value);
      return value;
    } catch (err) {
      if (!isUniqueError(err)) throw err;
      error = err;
    }
  }
  throw new Error(`could not create unique value after ${maxAttempts} attempts`, { cause: error });
}