# AGENTS.md

Repo status: **greenfield** — `docs/PRD.md` (Arabic product spec) + `theme-demo.html` (approved visual theme). No application code yet.

## 1. Source of truth

- `docs/PRD.md` — product requirements (Arabic). Sections 1-9 = features/rules; §11 = agent instructions. Read fully before building.
- `theme-demo.html` — the **visual theme reference** (single-page demo of all tokens/components). **Supersedes PRD §10 palette**: the theme was changed from green PCB to a **blue solder-mask PCB** base with a **vivid LED accent family** (see §8). If it disagrees with PRD §10 colors, this file wins. The owner confirmed diverging from the PRD.
- `AGENTS.md` — technical constitution: stack, architecture, data model, conventions (this file).

## 2. Tech stack (decided)

MERN (PRD §9 suggestion) is rejected. Chosen: **Next.js full-stack TypeScript** — one deployable unit, type-safe end-to-end, mature Arabic/RTL ecosystem, fits a single-owner shop.

### Frontend
- **Next.js 15 (App Router) + React 19 + TypeScript (strict)**
- **next-intl** — Arabic is default locale, fully RTL. `dir="rtl"` from app root; never hardcode `left/right` — use logical properties (`margin-inline-start`, `inset-inline-start`, etc.) and Tailwind `ms-/me-/ps-/pe-` variants.
- **Tailwind CSS v4** as the utility layer only; every color comes from CSS custom properties (tokens, §8). No hardcoded hex in components.
- **@phosphor-icons/react** — the only icon family. No SVG hand-drawing, no emoji in UI.
- **next/font**: Space Grotesk (display), IBM Plex Sans Arabic (Arabic body), Inter (Latin body), JetBrains Mono (SKU/price/codes/trust).
- **Zustand** — cart state + client temp UI state only.
- **TanStack Query** — client-side mutations/cache for interactive pages; Server Components for static reads.
- **react-hook-form + Zod** — all forms; zod schemas are the single source of validation.
- Charts for dashboard: **Recharts** (small, well-known).

### Backend
- **Next.js Route Handlers** (`app/api/**/route.ts`) for file uploads and external integrations.
- **Server Actions** for all normal mutations (use `useFormState`/`useFormStatus`; every action validates with Zod before touching DB).
- Node 20+, `pnpm` as the only package manager.

### Database
- **PostgreSQL 16 + Prisma ORM**. Prisma schema is the single source of truth for the data model (§5).
- All models carry `created_at`, models that change carry `updated_at` (default `now()`).
- Local dev: `docker compose up -d postgres` (`compose.yaml` at repo root; port `5432`).
- No MongoDB. No data constraints in app code that the schema can enforce (unique, cascade).

### Auth & sessions
- **Auth.js (NextAuth v5)**, credentials provider only — **no OAuth, no self-registration**.
- Owner seeds the first account (see §5.6 seed). Sessions = JWT in cookie; `session.user.role` gate everything via middleware + a `requireRole(role)` helper on every server action/route.
- Passwords hashed with **bcryptjs** (cost 12).
- Blocked customers: middleware checks `is_blocked` on every session load; blocked → signed out.

### Quality gates (run in this order, always)
- `pnpm lint` (ESLint + Next config), `pnpm typecheck` (`tsc --noEmit`), `pnpm test` (Vitest + React Testing Library), `pnpm test:e2e` (Playwright) on critical flows: owner login, product CRUD, checkout → payment code, order status chain, discount apply.

## 3. Build order (minimal → biggest feature) and what each milestone uses

| Milestone | Features | Key tech |
|---|---|---|
| **M1 — Skeleton** | Theme applied, auth (owner + customer login, no self-reg), owner/customer layouts (RTL) | Next.js, Auth.js, next-intl, tokens |
| Products where buyable for authorized customers only |
| **M2 — Catalog + Cart** | Product grid w/ filter belt (4 seed categories), dynamic categories from DB, product CRUD (images, multi-images, dynamic features), cart, checkout |
| **M3 — Payments** | Sham Cash + QR payment codes, order chain `CREATED → AWAITING_PAYMENT → PAID → PREPARING → DELIVERED`, manual COD (no discount), prepaid |
| **M4 — Owner ops** | Customer account management (create/block/rating), trust_score, discount codes (product+customer scope), messages, send ready carts |
| **M5 — Growth** | Notifications (Email via Resend; WhatsApp/Telegram behind a `Notifier` interface stub), statistics dashboard (Recharts), audit log, search/filter, order recovery |
| **M6 — Polish** | PWA (next-pwa or manual service worker when M5 settles), MOQ, employee subroles (future-safe roles array in User, not separate table) |

Each milestone ships working before the next starts. No feature from M4+ lands in M2.

## 4. Architecture — code layout

```
src/
  app/                       # App Router pages
    [locale]/                # ar only for now
      login/                 # public
      (store)/               # customer app — no parentheses = route group
        page.tsx             # catalog + filter belt
        product/[id]/
        cart/
        checkout/
        orders/
        settings/
      (owner)/               # owner dashboard (all behind requireUser('owner'))
        dashboard/
        products/  categories/  customers/  orders/  discounts/
        messages/  carts/  settings/
    api/                     # route handlers only (uploads, webhooks)
      upload/route.ts
      notify/route.ts
  components/
    ui/                      # design-system primitives (Button, Card, Badge, Input, Modal, ...)
    store/                   # customer app components (ProductCard, FilterBelt, CartDrawer)
    owner/                   # owner dashboard components (OrderTable, TrustBadge, ...)
    shared/                  # (SectionTitle, TraceDivider, ThemeToggle, ...)
  features/                  # colocated feature code per domain
    products/  orders/  payments/  discounts/  messages/  customers/  notifications/
    <feature>/{ components.ts → server.ts (actions/queries) → schemas.ts → types.ts }
  lib/
    tokens.css constants.ts  format.ts  auth.ts  db.ts  mail.ts  notify.ts
  server/                    # db-only logic & domain rules
    payment-code.ts  trust.ts  carts.ts
prisma/
  schema.prisma  migrations/  seed.ts
public/  (static only; never uploads)
storage/  (uploaded product images; served via guarded route)
```

- Route groups `(store)` / `(owner)` enforce layout+aria/route separation; owner pages individually `requireAdmin()` — never rely on layout guards alone.
- Feature boundaries: **components may not call Prisma**. Data access lives in `src/code/*` (server-only. `import "server-only"` enforced by ESLint rule) — Server Components import these, client components get data via Server Actions/TanStack Query.

## 5. Data model (Prisma — authoritative, decides DB)

```ts
enum Role { owner, customer }
enum OrderStatus { RECEIVED, AWAITING_PAYMENT, PAID, PREPARING, DELIVERED }
enum PaymentMethod { SHAM_CASH_QR, COD, PREPAID }

model User {
  id           String  @id @default(cuid())
  email        String  @unique
  passwordHash String
  role         Role    @default(customer)
  address      String?
  rating       Float   @default(0)
  trustScore   Int     @default(0)      // owner-only. never in customer queries/API
  isBlocked    Boolean @default(false)
  createdBy    String?                   // owner id
  carts        Cart[]  messages[] orders[]
}
model Product {
  id, name, categoryId (FK → Category, NOT a string) — categories are rows, never code
  images[] features[] quantity Int (stock) price Float
}
model Category { id String @id, name, slug @unique, order Int }
model Order {
  customer, items OrderItem[] status OrderStatus?
  total, paymentMethod, discountCode?, paymentCode?, createdAt
}
model PaymentCode { id, orderId @unique, code @unique, status, createdAt }
model DiscountCode { code @unique, type (PERCENT|FIXED), value, applicableProducts[], applicableCustomers[], expiry, active }
model Cart { id, customer, items[], createdBy Owner? — owner-sent carts allowed }
model Message { id, senderId, receiverId, content, seenAt?, sentAt }
model AuditLog { id, actorId, action, entityType, entityId, meta Json, at }
```

**Protected-field rules:** `trustScore` and `passwordHash` are filtered out of every non-owner projection at the Prisma level (use `select` whitelists in `src/code`, never `include`/spread full rows to API responses). Order list (owner) includes each customer's `rating` + `trustScore`; customer never receives it.

**Payment-code generation (`src/code/payments.ts`):** format `PAY-XXXX-XXXX` uppercase alphanumerics (`crypto.randomBytes` + reject ambiguous chars 0/O/1/I), **unique constraint in schema + retry on duplicate**; code only usable after owner marks order as `AWAITING_PAYMENT`; paid on verification by owner, one `PaymentCode` per order.

**Order status chain** (owner-driven transitions, guarded rule table in `src/code/orders.ts`):
`RECEIVED → AWAITING_PAYMENT → PAID` (owner confirms) `→ PREPARING → DELIVERED`. COD skips code; PREPAID requires payment before `PREPARING`. Discounts apply only to `SHAM_CASH_QR` and `PREPAID`, never COD.

**Cart toggle choice (PRD §9 open point, decided):** customer can adjust quantities inside an owner-sent cart, but cannot change items or approve/reject wholesale — only quantity per line; owner sees a diff flag.

## 6. Dev workflow & commands (Windows)

```powershell
pnpm install
docker compose up -d postgres        # or point DATABASE_URL elsewhere
pnpm prisma migrate dev             # after each schema change
pnpm prisma db seed                 # seed.ts: owner account + 4 categories + sample products
pnpm dev
```
- `.env` needs `DATABASE_URL`, `AUTH_SECRET`, `RESEND_API_KEY` (later). Commits are `feat: / fix: / refactor: / test: / docs:` (Conventional-ish, no scope requirement).
- Never run `pnpm prisma db push` in committed migrations; use `migrate dev` and keep `prisma/migrations`.

### GitHub workflow (agreed with owner — always follow)
- One repo per app, generated on GitHub (remote `origin`, default branch `main`).
- **Every feature gets its own branch** named `feature/<short-slug>` (e.g. `feature/cart`); commit the whole milestone there.
- **Never merge a feature branch until the owner explicitly confirms the feature works** ("success message").
- After owner approval, merge with `git merge --no-ff` (or a PR if requested) and delete the local+remote branch.
- At the **end of the full implementation**, ask the owner for permission to merge into `main`; merge **only if explicitly accepted**. Do not merge to `main` proactively.
- Never force-push; never commit secrets or `.env`; keep `main` always deployable.

## 7. Naming rules (everything new must follow)

- **Files/folders:** kebab-case for paths (`product-form.tsx`); **components PascalCase** inside them (`ProductForm.tsx`); page files `page.tsx`, `layout.tsx`, `route.ts` always lowercase exact.
- **Components:** noun-based `PascalCase` — `ProductCard`, `FilterBelt`, `OrderStatus`, `TrustScoreChip`. **UI primitives get no prefix** (`Button`, `Card`, `Input`, `Modal`, `Badge`) and are the only files in `components/ui/`.
- **Hooks:** `use` + PascalCase (`useCart`, `useDiscountCodes`); custom hooks return nothing but tuple/object typed.
- **Functions (JS):** camelCase verbs; server logic get domain prefix only when ambiguous (`createOrder`, `applyDiscount`). Booleans start with `is`/`has`/`can` (`isBlocked`).
- **Types/interfaces:** `PascalCase`, domain suffix `Dto` when meant for the client boundary (`ProductDto`, `OrderDto`). Do not name `type` vs `interface` differently — types for unions/objects, interfaces for contracts of multiples members.
- **Enums/constants:** `SCREAMING_SNAKE` in DB enums (Prisma) & TS constants; CSS var names are `--kebab-case` (see §8) token names must `--color-bg-surface-1` style, Token names persist across themes.
- **API/query/params:** REST-ish route names always plural noun (`/api/products/...`); server actions named by intent verb (`createProduct`, `confirmPayment`); query params camelCase on the client boundary, snake_case in DB columns drops via Prisma `@map`.
- **i18n:** all UI strings from `messages/ar.json` — no inline Arabic strings in components; keys `feature.action` nesting (`catalog.addToCart`); use `useTranslations('catalog')`.
- **Dates:** always `Intl.DateTimeFormat('ar-IQ')` via `lib/format.ts`; ISO 8601 UTC in DB (Prisma DateTime, Prisma stores UTC; display in server clock only via employee-visible formats w/ timezone label).
- **Money:** integer smallest unit? No — currency is IQD with decimals (`price` Decimal in Prisma, `Float` avoided; format via `Intl.NumberFormat('ar-IQ', {style:'currency', currency:'IQD'})`). `price` column `Decimal(10,2)` named `price`, avoid float math.

## 8.b Environment & gotchas
- `next.config.ts` needs `images.unoptimized` turned off; local uploads served via a route (not `/storage` static) so authorization can gate; product images must have `alt` text.
- Next.js on Windows: keep `pnpm dev` in one terminal; file watcher setting default is fine.
- When adding a route handler: must set the same `allowCSP`? — Next.js built-in; keep headers minimal.

## 9. Quality gates & testing
- `pnpm lint` + `pnpm typecheck` + `pnpm test` + `pnpm test:e2e` all green before any PR.
- Vitest unit: server logic (payment-code gen, order transitions, discount math) is pure → primary test targets (no DB mocking); integration tests use a test Postgres instance (`.env.test`).
- Playwright smoke suite runs against `pnpm dev` with seeded test data: 4 core journeys listed above.
- A11y checklist on every page: focus rings on all inputs (copper 2px outline), `lang="ar"` + `dir` set, alt text present, contrast AA on text vs. token bg, `prefers-reduced-motion` disables the circuit animation.

## 10. Design rules & tokens (theme — authoritative)

All in `lib/tokens.ts` imported into Tailwind v4 (`@theme` with CSS vars) — components never see raw RGB values.

Dark (default, blue solder-mask PCB):
```
--bg          #0E1B26   --surface       #162636   --surface-2 #1D3044
--copper      #FF9D5C   --mint          #3BE09F   --amber     #FFC24B
--red         #FF6B6B   --blue          #4FC3FF   --purple    #B399FF
--pink        #FF8AC8   --text          #E7ECF1   --text-2    #9AA8B5
--on-accent   #0E1B26   --line          rgba(255,157,92,.35)
```
Light (inverted, cool paper — same logic):
```
--bg #F2F4F6 --surface #E8ECF0 --surface-2 #DEE4EA --text #1C2A36 --text-2 #5D6B78
accents shift deeper: copper #C05621 mint #0E9F5F amber #C8871F red #D64545 blue #1F7FD6 purple #7450C9 pink #CE4F96
```
- Fonts/weights 400/500 only; Space Grotesk display-only; JetBrains Mono for SKU/prices/payment codes/trust.
- Flat: no gradients, no heavy shadows, no neon — shadow only tiny `rgba(0,0,0,.2)` borders. Solder-pad corner on cards (copper 8×22px top-inline), sharp cards radius 6px, dotted copper circuit dividers, filter belt = 4 categories with colored LED dots.
- ONE directed motion: cart→checkout circuit closing in mint (honor `prefers-reduced-motion`).
- Focus ring: 2px copper outline offset 2 as shown in theme-demo.
- The signature element & all above visual reference: `theme-demo.html` — build components to match it, and extend it when new states/colors appear.

## 11. Non-obvious product rules (unchanged, hard requirements)

- **No self-registration. Ever.** Only the owner creates customer accounts (with login email). Two roles only: `owner` / `customer`.
- `trust_score` protected — owner queries only (order lists show customer rating + trust score to owner only).
- Order chain & payments exactly as in §5; COD full amount no discounts.
- Categories extensible from admin panel — never hardcoded.
- Owner-only: discount codes (bound to products/customers), blocking, messages, sending ready carts.

## 12. First commits guide for this repo (when starting)

1. `pnpm create next-app@latest . --ts --app --src-dir --tailwind` (eslint, import-alias `@/*`)
2. `pnpm add prisma @prisma/client @auth/* etc.` per above, add `compose.yaml`, `.env`, seed
3. Wire `next-intl` + RTL layout + tokens into theme from `theme-demo.html`
4. Auth + `(store)`/(`(owner)`) wireframe before any feature code (M1)