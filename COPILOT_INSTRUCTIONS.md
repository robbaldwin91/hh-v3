# Co‑Pilot Instructions: Fruit Packing Planner

Statuses: [planned] [built] [tested] [amending] [complete]

This document is the single source of truth for scope, design, and a living to‑do list. Update statuses as we build.

---

## 0) Current State
- Next.js 15 (App Router) with TypeScript and Tailwind CSS v4 scaffolded. [complete]
- Turbopack enabled for dev via `next dev --turbopack`. [complete]

---

## 1) Architecture & Tech Choices
- Next.js App Router; server components where sensible, client components for interactions. [planned]
- Styling: Tailwind v4, shadcn/ui. [planned]
- State/Data fetching: TanStack Query (React Query). [planned]
- Validation: Zod. [planned]
- Drag and drop: dnd‑kit. [planned]
- DB: Neon Postgres via Vercel env var; Prisma ORM. [planned]
- API: Route Handlers under `/app/api/*`. [planned]

Notes:
- Use Turbopack in dev; keep standard `next build` for prod initially; evaluate `--turbo` later. [planned]

---

## 2) Dependencies
Install and configure:
- Runtime: `@prisma/client @tanstack/react-query zod date-fns lucide-react @dnd-kit/core @dnd-kit/sortable @dnd-kit/modifiers @dnd-kit/utilities` [built]
- Dev: `prisma` and shadcn/ui CLI (`npx shadcn@latest`) [built]
- Optional: `react-hook-form @hookform/resolvers` for forms [built]

Tasks:
- Add React Query Provider with hydration boundary. [built]
- Initialize shadcn/ui and add components: Button, Card, Tabs, Table (TanStack Table example), Dialog, Input, Select, Badge, ScrollArea, Separator, Sheet, Tooltip, Toaster. [built]

---

## 3) Data Model (Prisma)
Core tables (from brief):
- Customer
- Order (belongsTo Customer, Product) — one Customer has many Orders; one Product has many Orders. [built]
- Product (belongsTo Customer, PunnetSize; has m2m to FruitVariant) + `multiType: boolean`. [built]
- Site (has many ProductionLine). [built]
- ProductionLine (belongsTo Site). [built]
- PunnetSize (has many Products). [built]
- Fruit (has many FruitVariant). [built]
- FruitVariant (belongsTo Fruit). [built]

Junctions and rules:
- MasterRunRate (PunnetSize ↔ ProductionLine, packsPerMinute) [built]
- SpecificRunRate (Product ↔ ProductionLine, packsPerMinute) — overrides master. [built]
- ProductVariety (Product ↔ FruitVariant, fields: `preferred: boolean`) — Product.multiType enforces 50/50 from two different Fruits. [built]
- MasterChangeover (PunnetSize → PunnetSize, minutes) [built]
- SpecificChangeover (Product → Product, minutes) — overrides master. [built]

Scheduling storage (proposal — needs confirmation):
- Plan (date/site context). [built]
- PlanItem (links Order ↔ ProductionLine with start/end, setupMinutes, runMinutes, kind: `planned` | `actual`, status). [built]

Enforcement:
- Precedence: SpecificRunRate > MasterRunRate; SpecificChangeover > MasterChangeover. [planned]
- Multi‑type Product rule: if `multiType = true`, must select varieties from two different Fruits, and production split is 50/50 by quantity. Enforce in application logic and via transactional checks. [planned]

Migration & seed:
- Create initial migration and a seed script with example Customers, Products, Lines, Rates, Changeovers. [planned]

---

## 4) API Routes (Route Handlers)
Convention: `/app/api/<resource>` with GET/POST and `/app/api/<resource>/:id` with GET/PATCH/DELETE. Input validated by Zod.

Resources:
- customers [planned]
- orders [planned]
- products [planned]
- sites [planned]
- production-lines [planned]
- punnet-sizes [planned]
- fruits [planned]
- fruit-variants [planned]
- master-run-rates [planned]
- specific-run-rates [planned]
- master-changeovers [planned]
- specific-changeovers [planned]
- product-varieties [planned]
- plans [planned]
- plan-items [planned]

Scheduling endpoint helpers:
- Compute effective run rate for (product, line) with precedence. [planned]
- Compute changeover minutes from previous product/size with precedence. [planned]
- Calculate planned start/end timestamps given quantity and rate. [planned]

---

## 5) UI: Global Layout & Navigation
- App header with nav: Planning, Admin. [built]
- Admin sub‑nav tabs for each table/junction. [planned]
- Toast provider and global styles. [planned]

---

## 6) Planning Page (`/planning`)
Layout:
- Left 80%: Gantt‑like board with swimlanes per ProductionLine. [built]
- Right 20%: Orders gallery (vertical list of demand cards). [built]

Features:
- Drag orders onto a ProductionLine lane with dnd‑kit. [built]
- On drop: open Planning Modal with computed setup + run duration; allow confirm/save. [built]
- Card visuals: setup segment (changeover color) then run segment; hover shows details. [built]
- Two sub‑lanes per line: top = plan, bottom = actual. [built]
- Zoom/time scale controls (e.g., 5/10/15 min grid). [planned]
- Snap to grid when placing cards. [planned]
- Collision detection to prevent overlaps within same sub‑lane. [planned]
- Persist PlanItem to DB; recalc downstream items on insert (optional v1.1). [planned]

Components:
- OrderCard (gallery). [built]
- PlanCard (planned lane). [built]
- ActualCard (actual lane). [built]
- PlanningModal (wizard for confirmation or actual capture). [built]

---

## 7) Admin (`/admin`)
- Admin shell with tabs. [built]
- CRUD tables + forms for: Customers, Orders, Products. [planned]
- CRUD for: Sites, Production Lines, Punnet Sizes. [planned]
- CRUD for: Fruits, Fruit Variants. [planned]
- CRUD for: Master/Specific Run Rates. [planned]
- CRUD for: Master/Specific Changeovers. [planned]
- CRUD for: Product Varieties with multi‑type rules. [planned]

---

## 8) Validation & Business Rules
- Zod schemas for all DTOs. [planned]
- Transactional creation for ProductVarieties updates to maintain cross‑Fruit constraint and 50/50 default split. [planned]
- Scheduling calc service with unit tests: rate selection, changeover selection, duration computation. [planned]

---

## 9) Testing
- Unit: rate/precedence, changeover precedence, 50/50 split, time calculations. [planned]
- Integration: API route handlers with Prisma test DB. [planned]
- E2E (later): Plan creation flow and admin CRUD via Playwright. [planned]

---

## 10) Deployment
- Create Neon database + role. [planned]
- Add `DATABASE_URL` to Vercel project/envs; set local `.env`. [built]
- `prisma migrate deploy` on build; seed optional via separate action. [planned]

---

## 11) Work Breakdown (Trackable Checklist)

1. Initialize dependencies and providers
- [built] Install deps (Prisma, client, dnd-kit, react-query, zod, date-fns, lucide, form libs)
- [built] Set up shadcn/ui and add base components
- [built] Add React Query Provider in root layout

2. Prisma & Database
- [built] Create `.env` with `DATABASE_URL` (local placeholder)
- [built] Define Prisma schema for core + junction tables
- [planned] Generate client and initial migration
- [planned] Seed basic data (customers, sites, lines, sizes, fruits, variants, products, run rates, changeovers)
- [planned] Confirm scheduling tables (Plan, PlanItem) with stakeholder

3. API Layer
- [planned] Route handlers for each resource (CRUD)
- [planned] Zod validation and error responses
- [planned] Scheduling helper endpoints (effectiveRate, changeover, planDuration)

4. Planning UI
- [built] Base layout: 80/20 grid
- [built] Orders gallery (fetch Orders)
- [built] Swimlanes per ProductionLine
- [built] dnd-kit drag/drop with lane targets
- [built] PlanningModal with computed setup/run; save PlanItem
- [built] Render PlanCard with segmented UI and tooltips
- [planned] Actual lane and ActualCard entry flow

5. Admin UI
- [built] Admin shell with tabs
- [planned] CRUD tables + forms for: Customers, Orders, Products
- [planned] CRUD for: Sites, Production Lines, Punnet Sizes
- [planned] CRUD for: Fruits, Fruit Variants
- [planned] CRUD for: Master/Specific Run Rates
- [planned] CRUD for: Master/Specific Changeovers
- [planned] CRUD for: Product Varieties with multi‑type rules

6. Validation & Tests
- [planned] Zod schemas for all endpoints
- [planned] Unit tests for calc/precedence logic
- [planned] Integration tests for key routes

7. Deployment
- [planned] Neon setup and connect from local
- [planned] Vercel project and env vars
- [planned] First deploy (read‑only)

---

## 12) Open Questions / Decisions
- Confirm scheduling persistence models: `Plan` and `PlanItem` (proposed). [planned]
- Time scale granularity and working day boundaries. [planned]
- Order quantities unit (packs) and whether mixed multi‑type splits are stored per PlanItem or implicitly 50/50. [planned]

---

## 13) Command Reference (PowerShell)
- Dev: `npm run dev` (Turbopack)
- Install deps: `npm i @prisma/client @tanstack/react-query zod date-fns lucide-react @dnd-kit/core @dnd-kit/sortable @dnd-kit/modifiers @dnd-kit/utilities react-hook-form @hookform/resolvers`; `npm i -D prisma`
- shadcn: `npx shadcn@latest init`
- Prisma: `npx prisma init`; `npx prisma generate`; `npx prisma migrate dev -n init`

---

Please update statuses as tasks progress: planned → built → tested → amending → complete.
