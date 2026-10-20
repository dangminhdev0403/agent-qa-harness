# Global QA Harness Architecture

## 1. Overview & Core Philosophy

The **Universal Autonomous QA Harness** (`agents-testing-with-workflow`) provides a zero-leakage, multi-tiered testing framework engineered specifically for AI Agents (Antigravity, Codex, Orca) and human engineers.

Most software defects in modern web applications fall into four major categories:
1. **Realtime Desynchronization**: WebSockets/Socket.io events dropped, misconfigured rooms, auth token expiration during handshake, Redis pub/sub latency.
2. **State & Concurrency Race Conditions**: Duplicate submissions, double-approval bugs, unhandled parallel requests corrupting state.
3. **Browser & UI Quirks**: Unhandled console errors, React hydration mismatches, silent 4xx/5xx network requests, layout overflow.
4. **Contract Drifts**: Frontend types diverging from backend schemas, broken UI design guidelines.

The harness decouples the **Universal Execution Engine** from the **Target Project Configuration**. Any repository can be tested by supplying a single declarative `harness.config.json`.

---

## 2. 4-Tier Test Pyramid

```
+--------------------------------------------------------------+
| Tier 3: Browser & Route Scanning (0-Console, 0-Net-4xx/5xx)   |
+--------------------------------------------------------------+
| Tier 2: Concurrency & State Invariants (Double-Tap Burst)     |
+--------------------------------------------------------------+
| Tier 1: Realtime Socket Probe (Handshake, Rooms, Latency)    |
+--------------------------------------------------------------+
| Tier 0: Static & Contract Gates (UI Rules, Zod, TypeCheck)   |
+--------------------------------------------------------------+
```

### Tier 0: Static & Contract Gate
Executes fast static checks defined by the target repo.
- Design System verification (e.g., minimum font floor $\ge 12\text{px}$, typography balance).
- API contract and schema consistency assertions.
- Scoped TypeScript typechecking.

### Tier 1: Realtime Socket Probe
- Connects headless socket clients (Socket.io or native WebSocket) with realistic authentication tokens.
- Binds listener for target event.
- Executes trigger action (REST API call or socket emit).
- Asserts that target event is delivered within `timeoutMs` with matching payload structure.

### Tier 2: Concurrency & State Machine Gate
- Sends simultaneous bursts of HTTP requests (e.g. 5 concurrent calls to an approval endpoint).
- Asserts the exact expected distribution of HTTP responses (e.g., 1 HTTP 200 and 4 HTTP 409 Conflict).
- Catches race conditions and idempotency flaws before deployment.

### Tier 3: Browser & Route Health
- Scans declared web application routes.
- Enforces Zero-Tolerance on console errors, syntax errors, and uncaught exceptions.
- Checks DOM readiness and selector presence.

---

## 3. Autonomous Incident Packager & Self-Healing

When any tier fails:
1. The engine aggregates raw logs, network dumps, and stack traces.
2. An actionable `harness-out/INCIDENT_PACK.json` is generated.
3. The incident pack is consumed directly by autonomous coding agents to reproduce, locate, and patch the bug without human intervention.
