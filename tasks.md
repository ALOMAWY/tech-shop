# tasks.md — Milestones & Tasks

> Derived from `AGENTS.md` (authoritative) + `docs/PRD.md`. Visual reference: `theme-demo.html` (supersedes PRD §10 palette). Each milestone ships working before the next starts; no M4+ feature lands in M2. UI tasks reference the exact element/components shown in `theme-demo.html`.

---

## M0 — Project Setup
**Status:** Completed.

## M1 — Skeleton (Theme + Auth + Layouts)
**Status:** Completed.

## M2 — Catalog + Cart
**Status:** In Progress.

**Goal:** customer browses fixed seeded categories and buys. Visual reference: filter belt + parts-bins product grid in demo.

- [ ] Category model query layer (`src/code/categories.ts`) — dynamic from DB, never code.
- [ ] Seed the 4 base categories with LED dot colors: accessories (copper), essential tools (mint), small parts (blue), audio/keyboards/mice (purple).
- [ ] `FilterBelt` component: tabs w/ `.f-name` + `.f-dot` + mono `.f-count`, active state = copper chip; maps 1:1 to demo markup.
- [ ] `ProductCard`: SKU mono (JetBrains), placeholder image well (per-card LED color), name, features line, mono price `د.ع / n` + stock `IN-xxxx` / amber `LOW-xxxx`, `.add` copper-ghost button.
- [ ] Store home page = grid of `ProductCard` filtered by active belt category; stock-aware low-stock badge.
- [ ] **Product CRUD (owner):** server actions `createProduct/updateProduct/deleteProduct` (Zod-validated) + `(owner)/products` list + `ProductForm` with multi-image upload, dynamic feature rows, stock, price.
- [ ] Image upload route `app/api/upload/route.ts` → `storage/`, served via guarded route; `next.config.ts` `images.unoptimized` off; alt text required.
- [ ] `useCart` (Zustand): add/remove/qty, persisted; no purchase for unauthenticated.
- [ ] `CartDrawer`: `.cart-row` rows, dashed `--line-soft` separators, total row mono, cart→checkout circuit-trace SVG (`.path-bg` + `.path-anim` + nodes).
- [ ] `(store)/checkout`: address from profile, order placement writing `Order` + `OrderItem`.
- [ ] Vitest: cart math, product validation; e2e: product CRUD + browse/add-to-cart + checkout creation.

---

## M3 — Payments

**Goal:** Sham Cash QR, manual COD, prepaid; status chain fully driven by owner. Visual: cart→checkout circuit completing in mint.

- [ ] `src/server/payment-code.ts`: `PAY-XXXX-XXXX` generation via `crypto.randomBytes`, reject 0/O/1/I, unique constraint + retry.
- [ ] `PaymentCode` create only after owner marks order `AWAITING_PAYMENT`; one code per order.
- [ ] Order status chain `RECEIVED → AWAITING_PAYMENT → PAID → PREPARING → DELIVERED` with guarded transitions in `src/server/orders.ts` (rule table); COD skips code; PREPAID requires payment before `PREPARING`.
- [ ] `OrderStatus` component: chip badges per status (mint for PAID, amber warn for AWAITING, copper for RECEIVED, etc.).
- [ ] Payment method selection during checkout (`SHAM_CASH_QR | COD | PREPAID`); COD full amount, no discounts.
- [ ] Owner order screen: details, customer info + trust, payment method, confirm-payment action revealing the code, QR panel.
- [ ] Customer order screen: reads QR/payment code + how-to-pay, verifies 🎈.
- [ ] `PaymentCode` status flow: inactive → active → used.
- [ ] Vitest: pure chain transitions, code gen uniqueness/ambiguity, discount boundary (COD). E2e: checkout → code, status chain, discount apply.

---

## M4 — Owner ops

**Goal:** full trust/messaging/read-carts, plus discount codes.

- [ ] Customer account management `(owner)/customers`: create (email + password), edit, block, unblock.
- [ ] `rating` + `trustScore` view (owner-only) on customer + order pages; never in storefront.
- [ ] `DiscountCode` CRUD: `code @unique`, type `PERCENT|FIXED`, value, `applicableProducts[]`, `applicableCustomers[]`, `expiry`, `active`.
- [ ] Discount screening persists receiver-side: applies to `SHAM_CASH_QR` + `PREPAID`, COD blocked.
- [ ] `(owner)/orders`: list with customer filter by `rating`/`trust`, status colors, action buttons chained statuses.
- [ ] Messages: `Message` model + thread UI (owner ↔ customer) + unread indicator.
- [ ] Owner `sendReadyCart`: prepare cart for a customer (owner pick products+quantities), persist; customer sees see-only with editable quantities + diff badge on list network on any change (no add/remove of lines).
- [ ] Vitest: discount math, trust boundary; E2e: block, discount apply, present cart diff.

---

## M5 — Growth

- [ ] Notification service: `Notifier` interface, `EmailNotifier` (Resend), stub WhatsApp/Telegram providers; trigger on customer-facing events (order status, recovery).
- [ ] Stats dashboard (`/dashboard`) with Recharts: bestsellers, top customers, revenue trend, time-filters.
- [ ] Audit log writes on sensitive server actions (block, discount create/delete, payment confirm).
- [ ] Advanced search / filter API + UI (customer records, orders, products).
- [ ] Order recovery: find stale `RECEIVED` orders, owner recall flow.

---

## M6 — Polish & Ship

- [ ] PWA (`next-pwa` or manual SW) — only after M5 settles.
- [ ] MOQ: per-category minimum order quantity enforced on order lines + UI messaging.

---

- [ ] Employee subroles: `roles` array on `User` (future-safe) — model only, no feature build-up.
- [ ] Final a11y pass: focus rings, `lang`/`dir`, alt text, AA contrast, `prefers-reduced-motion` disables circuit motion.
- [ ] Production build `pnpm build` clean; Lighthouse audit (a11y/best-practices).
- [ ] `.env.example` + seed-doc audit; owner final QA approval.

---

### Standing rules (AGENTS.md §6)
- Every milestone on its own `feature/<slug>` branch; never merge until owner confirms.
- Before merge: `pnpm lint` + `pnpm typecheck` + `pnpm test` + `pnpm test:e2e` green.
- Merge with `--no-ff` once approved; delete feature branch. Do not merge to `main` until owner explicitly accepts at the end.
- Use `migrate dev` — never `prisma db push` on committed migrations. No `.env`/secrets in commits.