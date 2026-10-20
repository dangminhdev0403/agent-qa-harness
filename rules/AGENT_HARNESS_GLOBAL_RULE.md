<!-- AGENT_HARNESS_PROTOCOL_V2: COMPACT MACHINE SPECIFICATION -->
## Mandatory Autonomous QA & Living Harness Protocol (Agent Spec)
All AI agents (Antigravity, Codex, Orca) MUST strictly execute this deterministic state machine:

### 1. TRIGGER HANDLING ("Bật harness" | "kích hoạt harness" | "test harness" | Ambiguous QA request)
1. **Preflight Sync**: Execute `agent-harness sync`. Auto-scans routes, socket gateways, mutations, creates/upgrades `harness.config.json`.
2. **Disambiguation Gate**: Invoke `ask_question` tool with 4 options:
   - `(Recommended) Full Dual-Pass Swarm Verification (Code Stability + Dedicated Chrome Flow)`
   - `Mode 1: Code & System Stability Gate (tsc, build, static rules, sockets, concurrency)`
   - `Mode 2: Chrome DevTools MCP & Browser Flows on Dedicated Window (0-console, 0-net-4xx/5xx, screenshots)`
   - `Inspect Synced Map & Current Status Only`
3. **Subagent Swarm Dispatch (Speed Acceleration)**:
   - Worker 1 (`QA Code Gatekeeper`, model: flash): `agent-harness test:code --auto-start`.
   - Worker 2 (`QA Flow Inspector`, model: inherit): Spawn dedicated window via `new_page(url)`, bind with `select_page`, verify flows, teardown with `close_page`. NEVER hijack open tabs.
   - Multi-Persona Verification: Execute `agent-harness subagents:personas` to spawn Guest, Receptionist, and Owner subagents on 3 dedicated Chrome windows to verify end-to-end realtime flow without session collisions.

### 2. FEATURE DEVELOPMENT SYNC (Living Harness Spec)
Never finalize code without syncing the harness spec. Before task completion:
- New UI Screen/Route: `agent-harness add:flow "<feature-name>"`
- New Socket Event: `agent-harness add:socket "<feature-name>"`
- New Mutation/Approval: `agent-harness add:concurrency "<feature-name>"`
(The engine deduplicates by semantic signature and performs in-place upgrades).

### 3. SELF-HEALING & CIRCUIT BREAKER PROTOCOL
- **Exit Code 0 (PASS)**: Task verified. Finalize report.
- **Exit Code 2 (CIRCUIT_BREAKER_TRIPPED)**: STOP IMMEDIATELY. Max 3 remediation retries exceeded. DO NOT attempt further automated edits. Report blocker directly to user to prevent multi-agent infinite ping-pong.
- **Exit Code 1 (FAIL)**:
  1. Read `harness-out/INCIDENT_PACK.json` to extract failure tier, target, and payload.
  2. Launch isolated subagent: `invoke_subagent` (`Role: "QA Branch Fixer"`, `Workspace: "branch"`).
  3. Apply scoped fix strictly to failing gateway/controller/component.
  4. Re-run targeted probe: `agent-harness probe:<tier>` until green before merging.

### 4. PREREQUISITE INSPECTION & ASK-BEFORE-PROCEED INVARIANT (ANTI-SUPERFICIALITY GATE)
STRICT INVARIANT: Agents are FORBIDDEN from executing shallow/superficial partial tests (e.g. testing only unauthenticated landing pages when requested to test full project features) and falsely declaring full verification.
1. **Preflight Audit**: Before executing Mode 2 or full runs, execute `agent-harness audit:prerequisites`.
2. **Missing Prerequisite Check**: If routes require authentication (/owner, /hotels, /admin, /staff) but credentials/personas are missing, or dynamic parameters ([hotelId], [qrCode]) lack fixture substitutions:
   - DO NOT silently fall back to testing only public pages.
   - HALT AND ASK: Explicitly prompt user (via `ask_question` or inquiry) to provide credentials/fixtures or authorize automated test fixture seeding.
3. **Execution Gate**: Only proceed to full suite execution once all necessary prerequisites are satisfied or user explicitly grants `--force` bypass.

### 5. UNIVERSAL ROLE-BASED MODULE PARTITIONING & SUBAGENT SWARM DISPATCH (FOR ANY PROJECT)
To prevent superficial testing and avoid cookie collisions across user roles, routes in ANY repository are partitioned into discrete modules (via `config.modules` in `harness.config.json` or automatic heuristic clustering):
- **Universal Stacks** (SaaS, E-commerce, ERP, Fintech, Portals):
  - `public`: Landing, Docs, Pricing, Login, Register (unauthenticated).
  - `portal` / `user`: User Workspace, Account, Orders, Settings (requires `USER` auth).
  - `admin`: Backoffice, Platform Admin, System Logs (requires `ADMIN` auth).
  - `partner`: Merchant, Vendor, Service Provider (requires `VENDOR` auth).
- **Custom Project Modules**: Declared explicitly under `config.modules` in `harness.config.json`.

**Mandatory 2-Step Interactive Option Flow**:
1. When user initiates test flow, present the primary execution options (Dual-Pass, Code, Flow, Status).
2. Upon selecting Flow or Full test, the agent MUST present the target project's detected/configured Role Modules list and allow user to select:
   - `[All] Full Parallel Swarm (Dedicated Subagents on isolated Chrome windows per module)`
   - `Individual Module (e.g. public, portal, admin, partner, or custom modules)`
3. Execute via `agent-harness test:module <id>` or dispatch parallel subagents with unique `isolatedContext: "mod-<id>-..."` per role. Never mix auth sessions across roles.

### 6. MANDATORY SUBAGENT INVOCATION STANDARD (DIRECT TOOL CALL REQUIRED)
STRICT PROTOCOL: When user triggers subagent execution ("thực thi sub_agents", "bắn lệnh subagent", "chạy swarm các module"):
1. The AI Agent MUST NOT reply with a passive text summary or simply output the JSON plan.
2. The AI Agent MUST IMMEDIATELY execute tool calls: `invoke_subagent(TypeName: "self", Role: worker.Role, Model: "inherit", Prompt: worker.Prompt)`.
3. Auto-load credentials: If `account.json` or `config.personas` exists, the subagent prompt already contains valid login credentials. Subagents execute autonomous flow testing on dedicated Chrome windows (`isolatedContext`) and report back upon completion.

### 7. DEEP UI INTERACTION, CRUD & DRAG-AND-DROP MANDATE (NO SHALLOW NAVIGATION)
STRICT INVARIANT: Merely navigating to routes or stopping at login is considered an incomplete test. Subagents MUST execute active DOM interactions using Chrome MCP tools:
1. **DOM Snapshot Discovery**: Call `take_snapshot(pageId)` to locate interactive element UIDs.
2. **CRUD Operations**:
   - **CREATE**: Click "Thêm phòng" / "Tạo mới" / "Đặt dịch vụ" -> verify Modal/Drawer opens in-place -> fill form fields via `fill(pageId, uid, value)` -> submit -> verify new item appears.
   - **READ / TABS**: Click filter pills, category buttons, and tabs (`[role="tab"]`) to verify in-place filtering without full-page reloads.
   - **UPDATE**: Click edit buttons on cards/rows -> change values -> verify saved state.
   - **DELETE / CANCEL**: Click cancel/delete button -> verify confirm dialog -> dismiss safely.
3. **Drag-and-Drop Operations (@dnd-kit)**:
   - For schedules, Tape Chart, and room allocation grids:
   - Locate source reservation element (`from_uid`) and destination cell/room (`to_uid`).
   - Call `drag(pageId, from_uid, to_uid)` to execute drag-and-drop reallocation.
   - Verify room/reservation moves to the new slot without layout breaks or uncaught console errors.
4. **Cross-Role Realtime E2E Journey**: Execute Khách (tạo yêu cầu trên /g/[qrCode]) -> Lễ tân (nhận WebSocket và bấm duyệt trên /staff/front-desk).

### 8. FIX VS NO-FIX BOUNDARY STANDARD (RBAC & DATABASE INVARIANTS)
Remediation must strictly respect architectural boundaries:
- 🔴 **STRICTLY FORBIDDEN TO TOUCH (Report Only)**:
  1. RBAC & Authorization: NEVER remove `@UseGuards()`, bypass role/permission checks, or alter auth guards just to pass a test.
  2. Database Schema & Data: NEVER run destructive DB migrations, reset tables, or corrupt database state during UI tests. Report all DB errors (500, Prisma query failure) as "Lỗi Database (Chờ xử lý)".
- 🟢 **AUTHORIZED & ENCOURAGED TO FIX**:
  1. Error Notification Copy: Upgrade raw error codes (403 Forbidden, 500 Internal, TypeError) into clean, polite, human-readable toasts/alerts (e.g. "Bạn không có quyền thực hiện thao tác này").
  2. UI/UX Bugs: Broken button clicks, missing drawer state reset, z-index clipping, broken validations, typography floor violations (< 12px), missing `text-balance`.
  3. API/DTO Binding: Align frontend form payload keys with backend schema, fix query param names.
