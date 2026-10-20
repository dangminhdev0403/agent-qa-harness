# AI Agent Autonomous Playbook (Compact Execution Spec)

> **Audience**: AI Coding Agents (Antigravity, Codex, Orca).
> **Language**: English (Machine-optimal imperative grammar). Compact whitespace for minimal token usage.

---

## 1. AGENT OPERATIONAL STATE MACHINE

```text
[Prompt Received]
  ├── Trigger matches ("Bật harness" | "test harness" | ambiguous test intent)?
  │     ├── 1. EXEC: `agent-harness sync` (Auto-discover routes/sockets/mutations).
  │     ├── 2. CALL: `ask_question` tool with 4 options (Full Dual-Pass, Mode 1 Code, Mode 2 Flow, Status).
  │     └── 3. EXEC: Selected mode with `--auto-start` and `--isolate-branch`.
  │
  ├── Feature Code Finished?
  │     ├── EXEC: `agent-harness add:<flow|socket|concurrency> "<name>"` (Deduplicates & upgrades in-place).
  │     └── EXEC: `agent-harness run` (Mandatory zero-excuse verification gate).
  │
  └── Outcome Check:
        ├── EXIT 0 -> Write summary, conclude task.
        ├── EXIT 2 (CIRCUIT BREAKER) -> HALT immediately. Max 3 retries exceeded. Escalate to human.
        └── EXIT 1 (FAILURE) -> READ `harness-out/INCIDENT_PACK.json`, isolate on `harness-fix/...`, patch root cause, re-probe.
```

---

## 2. CHROME DEVTOOLS MCP DIRECT INTERACTION PROTOCOL

When Mode 2 or interactive browser testing is triggered, invoke `chrome-devtools-mcp` tools in exact sequence:
1. `navigate_page` (`url: "http://localhost:3000/..."`): Load target route.
2. `list_console_messages`: Assert ZERO `error` level messages (unhandled promise rejections, type errors, React hydration errors).
3. `list_network_requests`: Assert ZERO `4xx` or `5xx` responses on all background fetches/XHR.
4. `fill` / `click`: Perform user journey actions declared in `harness.config.json` flows.
5. `wait_for` (`selector` or delay): Ensure DOM element is visible; verify Tab Isolation standard (In-place drawer/modal, zero cross-tab redirect).
6. `take_screenshot` (`filePath: "harness-out/screenshots/..."`): Persist checkpoint image.

---

## 3. TIER-BY-TIER SELF-HEALING DIAGNOSTICS

### Tier 0: Static & Contract Violations
- **Error**: Font floor violation (`text-[10px]`, `text-[11px]`), missing `text-balance` on headings, or Zod schema mismatch.
- **Remediation**: Floor at `text-xs` (12px), inject `text-balance` on titles, align Zod schema in `domain/schemas/` with DTO and call `parseWithZod`.

### Tier 1: Realtime Socket Probe Timeout
- **Error**: Event listener timed out after 3000ms.
- **Root Causes**: (a) Room mismatch (e.g. `hotel:123` vs `hotel_123` or missing tenant prefix); (b) Expired JWT handshake token; (c) Event name casing mismatch (`REQUEST_CREATED` vs `request_created`).
- **Remediation**: Align room name in gateway and event publisher; check `authProvider` login configuration.

### Tier 2: Concurrency Gate Failure (Double-Approval / Race Condition)
- **Error**: Multiple HTTP 200 responses received during concurrent burst (expected single-winner 200, N-1 conflict 409).
- **Remediation**: Enforce Optimistic Locking (version column check) or Pessimistic Transaction Lock (`SELECT FOR UPDATE`) in database service.

### Tier 3: Browser Runtime & Hydration Crashes
- **Error**: Console error or background network 500.
- **Remediation**: Move client-only browser APIs (`localStorage`, `window`) to `useEffect` or wrap in Zustand `safeStorage`; verify API route prefix `/api/v1`.
