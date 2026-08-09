import "server-only";
import { randomInt } from "node:crypto";
import {
  PAYMENT_CODE_ALPHABET,
  type RandomIndexSource,
} from "@/lib/payment-code";
import { generatePaymentCode as sharedGeneratePaymentCode } from "@/lib/payment-code";

/**
 * Server entrypoint for payment codes.
 *
 * Shared generation + retry logic lives in `@/lib/payment-code`; here we only
 * swap the injectable `random()` for a CSPRNG (`crypto.randomInt`) so codes are
 * non-deterministic in production. `server-only` keeps Prisma far from clients.
 */

export const randomCryptoIndex: RandomIndexSource = () =>
  randomInt(PAYMENT_CODE_ALPHABET.length);

/**
 * Generate a payment code using the operating-system CSPRNG.
 */
export function generatePaymentCode(random: RandomIndexSource = randomCryptoIndex): string {
  return sharedGeneratePaymentCode(random);
}

export {
  PAYMENT_CODE_ALPHABET,
  PAYMENT_CODE_GROUP_COUNT,
  PAYMENT_CODE_GROUP_LENGTH,
  PAYMENT_CODE_PATTERN,
  PAYMENT_CODE_PREFIX,
  withUniqueRetry,
  type RandomIndexSource,
} from "@/lib/payment-code";