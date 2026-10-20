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

---

## 4. TIER-BY-TIER SELF-HEALING DIAGNOSTICS
- **Tier 0 (Static/Contract)**: Font floor violation (`text-[10px]`, `text-[11px]`), missing `text-balance` on headings, or Zod schema mismatch. Fix: Floor at `text-xs` (12px), inject `text-balance` on titles, align Zod schema in `domain/schemas/` with DTO and call `parseWithZod`.
- **Tier 1 (Realtime Socket)**: Event listener timed out after 3000ms. Fix: Align room name in gateway and event publisher; check `authProvider` login configuration.
- **Tier 2 (Concurrency Gate)**: Multiple HTTP 200 responses received during concurrent burst. Fix: Enforce Optimistic Locking (version column check) or Pessimistic Transaction Lock (`SELECT FOR UPDATE`) in database service.
- **Tier 3 (Browser Runtime/Hydration)**: Console error or background network 500. Fix: Move client-only browser APIs (`localStorage`, `window`) to `useEffect` or wrap in Zustand `safeStorage`; verify API route prefix `/api/v1`.
