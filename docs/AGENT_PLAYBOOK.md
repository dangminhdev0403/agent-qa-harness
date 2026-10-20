# AI Agent Autonomous Playbook (Compact Execution Spec)
> **Audience**: AI Coding Agents (Antigravity, Codex, Orca). Language: English (Machine-optimal imperative grammar, dense whitespace).

---

## 1. AGENT OPERATIONAL STATE MACHINE
```text
[Prompt Received]
  ├── Trigger matches ("Bật harness" | "test harness" | ambiguous test intent)?
  │     ├── 1. EXEC: `agent-harness sync` (Auto-discover routes/sockets/mutations/portless).
  │     ├── 2. PREFLIGHT PREREQUISITE AUDIT: `agent-harness audit:prerequisites`.
  │     │       └── Missing Auth Wall credentials or Dynamic Fixtures? -> HALT & PROMPT USER. Never run superficial tests.
  │     ├── 3. CALL: `ask_question` tool with 4 options (Dual-Pass, Mode 1 Code, Mode 2 Flow, Status).
  │     └── 4. SUBAGENT SWARM DISPATCH (Accelerated parallel execution):
  │              ├── Worker 1 (flash): `agent-harness test:code --auto-start`
  │              └── Worker 2 (inherit): `agent-harness test:flow` on dedicated Chrome window (`new_page`)
  ├── Feature Code Finished?
  │     ├── EXEC: `agent-harness add:<flow|socket|concurrency> "<name>"` (Deduplicates & upgrades in-place).
  │     └── EXEC: `agent-harness run` (Mandatory zero-excuse verification gate).
  └── Outcome Check:
        ├── EXIT 0 -> Write summary, conclude task.
        ├── EXIT 2 (CIRCUIT BREAKER) -> HALT immediately. Max 3 retries exceeded. Escalate to human.
        └── EXIT 1 (FAILURE) -> READ `harness-out/INCIDENT_PACK.json`, launch `qa-branch-fixer` (`Workspace: 'branch'`), patch root cause, re-probe.
```

---

## 2. DEDICATED CHROME WINDOW LIFECYCLE PROTOCOL (STRICT ANTI-COLLISION)
Subagents performing Mode 2 or interactive browser testing MUST adhere to dedicated window boundaries:
1. `new_page` (`url: "http://localhost:3000/..."`): MANDATORY. Never hijack active tabs. Spawn a dedicated Chrome window/tab and store returned `pageId`.
2. `select_page` (`pageId`): Bind active context to dedicated target before executing actions.
3. `list_console_messages`: Assert ZERO `error` level messages (unhandled rejections, type errors, React hydration errors).
4. `list_network_requests`: Assert ZERO `4xx` or `5xx` responses on all background fetches/XHR.
5. `fill` / `click`: Perform user journey actions declared in `harness.config.json` flows.
6. `wait_for` (`selector` or delay): Ensure DOM element is visible; verify Tab Isolation standard (In-place drawer/modal, zero cross-tab redirect).
7. `take_screenshot` (`filePath: "harness-out/screenshots/<sessionId>/..."`): Persist checkpoint image.
8. `close_page` (`pageId`): MANDATORY TEARDOWN. Close dedicated target upon test completion (PASS or FAIL) to prevent resource leakage.

---

## 3. SUB-AGENT SWARM ACCELERATION ARCHITECTURE
Coordinator agent accelerates verification by dispatching concurrent subagents:
- **Worker 1 (`QA Code Gatekeeper`)**: `invoke_subagent` (`TypeName: "self"`, `Role: "QA Code Gatekeeper"`, `Model: "flash"`, `Workspace: "inherit"`). Runs `agent-harness test:code --auto-start`. Executes Tiers 0, 1, 2 in background.
- **Worker 2 (`QA Flow Inspector`)**: `invoke_subagent` (`TypeName: "self"`, `Role: "QA Flow Inspector"`, `Model: "inherit"`, `Workspace: "inherit"`). Drives dedicated Chrome window via `new_page` -> flows -> `close_page`.
- **Worker 3 (`QA Branch Fixer`)**: If failure occurs, spawn with `Workspace: "branch"`. Operates in isolated branch workspace (`git checkout -b harness-fix/...`), inspects `harness-out/INCIDENT_PACK.json`, applies minimal atomic fix, verifies via `agent-harness probe:<tier>`, and merges back only when green. Prevents ping-pong multi-agent loops.

### 3.1 Multi-Persona Concurrent Swarm (Guest vs Receptionist vs Hotel Owner)
To test cross-system realtime interactions, spawn 3 concurrent persona subagents via `agent-harness subagents:personas`:
1. `QA Guest Persona`: Dedicated window (`new_page` -> `/guest`). Places room/amenity order. Asserts instant submission status.
2. `QA Receptionist Persona`: Dedicated window (`new_page` -> `/owner/operations`). Asserts realtime incoming toast/sound within 3000ms. Clicks "Approve".
3. `QA Hotel Owner Persona`: Dedicated window (`new_page` -> `/owner/dashboard`). Asserts tape chart status update, revenue increment, and 0 console errors.
All 3 personas operate on independent Chrome windows concurrently without session leakage.

### 3.2 Universal Role-Based Module Swarm & Interactive 2-Step Flow (For ANY Project)
When testing full application capabilities, routes are partitioned into discrete modules based on RBAC roles (either declared in `harness.config.json` via `config.modules`, or auto-inferred universally across any Web/SaaS/E-commerce/Hospitality stack):
- **Universal Project Modules** (E-commerce, SaaS, CRM, Portals):
  - `public`: Landing, Docs, Pricing, Login, Register (unauthenticated).
  - `portal` / `user`: User Dashboard, Account, Settings, Orders (`USER` / `CUSTOMER`).
  - `admin`: Backoffice, Platform Management, System Logs (`SUPER_ADMIN`).
  - `partner`: Merchant, Vendor, Service Provider (`VENDOR` / `PARTNER`).
- **Domain Preset Modules** (e.g. VietSage Hotel PMS):
  - `public`, `guest_os`, `frontdesk`, `owner`, `marketplace`, `admin`.

**Universal Deterministic 2-Step Selection Protocol**:
- Step 1: Prompt Disambiguation (Dual-Pass vs Code vs Flow vs Status).
- Step 2: If Flow or Full Test selected -> Harness automatically detects and presents the Project's Role Modules. Agent prompts user to pick a target module or launch full multi-module subagent swarm (`agent-harness subagents:modules`).
- Isolated Context: Each module subagent receives an isolated browser session (`isolatedContext: "mod-<id>-<entropy>"`), ensuring cookies and state never bleed across roles.

### 3.3 Mandatory Subagent Invocation Invariant (Direct Tool Calling)
STRICT INVARIANT: When the user requests subagent execution (e.g. "thực thi các test flow các module với sub_agents", "bắn lệnh sub_agents", "chạy subagent swarm"):
- The Coordinator Agent is **STRICTLY FORBIDDEN** from merely printing text, returning JSON to the user, or stopping.
- The Coordinator Agent **MUST IMMEDIATELY EXECUTE** the `invoke_subagent` tool calls for each module worker in the plan.
- Each subagent worker executes its flow on its dedicated Chrome window via `new_page(url, isolatedContext)` and reports back results automatically.

---

## 4. TIER-BY-TIER SELF-HEALING DIAGNOSTICS
- **Tier 0 (Static/Contract)**: Font floor violation (`text-[10px]`, `text-[11px]`), missing `text-balance` on headings, or Zod schema mismatch. Fix: Floor at `text-xs` (12px), inject `text-balance` on titles, align Zod schema in `domain/schemas/` with DTO and call `parseWithZod`.
- **Tier 1 (Realtime Socket)**: Event listener timed out after 3000ms. Fix: Align room name in gateway and event publisher; check `authProvider` login configuration.
- **Tier 2 (Concurrency Gate)**: Multiple HTTP 200 responses received during concurrent burst. Fix: Enforce Optimistic Locking (version column check) or Pessimistic Transaction Lock (`SELECT FOR UPDATE`) in database service.
- **Tier 3 (Browser Runtime/Hydration)**: Console error or background network 500. Fix: Move client-only browser APIs (`localStorage`, `window`) to `useEffect` or wrap in Zustand `safeStorage`; verify API route prefix `/api/v1`.

---

## 5. DEEP UI INTERACTION, CRUD & DRAG-AND-DROP PROTOCOL
Static URL navigation or stopping at login is strictly insufficient. For all UI flow tests, agents MUST execute active DOM interactions using Chrome MCP tools:
1. **DOM Snapshot & Element Discovery**: Call `take_snapshot(pageId)` on every tested screen to obtain element `uid`s (buttons, tabs, inputs, draggable cards).
2. **CRUD Operations (Create / Read / Update / Delete)**:
   - **CREATE**: Click "Thêm phòng", "Tạo mới", or "Đặt dịch vụ" button. Verify Modal/Drawer opens in-place (verifying Tab Isolation: zero full-page redirects). Fill input fields via `fill(pageId, uid, value)`. Submit form and verify the new item appears in the list.
   - **READ / TABS**: Click top tabs (`[role="tab"]`), category filters, and sorting headers (TanStack table sort). Assert view updates in-place without page reload.
   - **UPDATE**: Click edit buttons on a table row or card. Modify values and save -> verify in-place feedback.
   - **DELETE / CANCEL**: Click cancel/delete button -> verify confirmation dialog (`SwalVietSage`) -> confirm or dismiss safely.
3. **Drag-and-Drop Operations (Tape Chart & Room Grids)**:
   - For schedules, room grids, or sortable lists built with `@dnd-kit`:
   - Locate the source reservation/room card (`from_uid`) and destination cell/room (`to_uid`).
   - Call `drag(pageId, from_uid, to_uid)` to execute drag-and-drop reallocation.
   - Verify reservation bar / room moves smoothly to the new slot without layout breaks or uncaught console errors.
4. **End-to-End Realtime Journey (Khách -> Lễ tân -> Chủ khách sạn)**:
   - Guest Subagent (`/g/[qrCode]`): Selects service, submits room request, receives request ID.
   - Frontdesk Subagent (`/staff/front-desk`): Receives realtime WebSocket update, clicks "Tiếp nhận" / "Hoàn thành", verifies status badge transitions without reload.
   - Owner Subagent (`/owner/dashboard`): Verifies room status and metrics update.

---

## 6. FIX VS NO-FIX BOUNDARY PROTOCOL (RBAC & DATABASE INVARIANTS)
When failures occur during UI flow testing, agents MUST observe strict remediation boundaries:

### 🔴 Strictly Forbidden to Touch / Bypass (Report Only):
1. **RBAC & Authorization Gates**: NEVER remove `@UseGuards()`, bypass permission checks, or elevate roles just to force a test to pass. RBAC protection is deliberate security policy.
2. **Database Schema & Raw Data**: NEVER run schema migrations, reset tables, or tamper with database records during UI testing. Every database error (500 Internal, Prisma query failure, FK constraint) MUST be logged into `harness-out/INCIDENT_PACK.json` and reported as **"Lỗi Database (Chờ xử lý)"**.

### 🟢 Authorized & Encouraged to Remediate (In-Place Fixes):
1. **Error Notification Copywriting & UX**: Upgrade raw technical error codes (`403 Forbidden`, `500 Internal`, `TypeError`) into clear, human-readable toasts/alerts (e.g. *"Bạn không có quyền thực hiện thao tác này"* instead of unhandled exceptions or white-screen crashes).
2. **Frontend UI/UX Bugs**: Unresponsive buttons (`onClick` swallowed), missing drawer state reset, z-index clipping, broken form validations, font floor violations (< 12px), missing `text-balance`.
3. **Frontend-Backend Contract Binding**: Align form payload keys with backend DTOs, fix incorrect URL query parameters, add missing loading/error states.

---

## 7. MANDATORY REPORT-ONLY INCIDENT PROTOCOL (ROOT CAUSE ESCALATION)
Whenever an issue is encountered that CANNOT or MUST NOT be fixed in-place (due to DB invariants, missing migrations, RBAC security policy, or 3rd-party dependencies):
- **NEVER FAIL SILENTLY**: Agents are strictly forbidden from ignoring, suppressing, or bypassing the failure.
- **MANDATORY INCIDENT DOSSIER**: Emit an explicit root-cause report containing:
  1. **Route & Endpoint**: The exact frontend URL and backend endpoint path with HTTP status code.
  2. **Root Cause Diagnosis**: The exact technical failure (e.g. Prisma P2022 column missing, pending migration, RBAC guard mismatch).
  3. **Non-Fix Rationale**: Explanation of the architectural invariant preventing automated fix (e.g. *Zero-DB-Tampering standard forbids automated schema migration*).
  4. **Remediation Plan for Human Lead / DBA**: Exact SQL or CLI commands required to resolve the issue safely.
