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
