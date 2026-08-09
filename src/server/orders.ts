import "server-only";

/**
 * Server entrypoint for order lifecycle rules.
 *
 * All logic lives in the shared pure module `@/lib/orders` so the storefront
 * checkout UI uses exactly the same guards as server actions. This file keeps
 * the `server-only` boundary for anything that touches the database.
 */
export * from "@/lib/orders";