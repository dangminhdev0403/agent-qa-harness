# AI Agent Autonomous Playbook

This runbook specifies how AI Agents (Antigravity, Codex, Orca, Claude) must interact with `agents-testing-with-workflow`.

---

## 1. Zero-Excuse Verification Protocol

Before declaring any feature complete or opening a pull request, the agent MUST:
1. Ensure the target application is running locally (e.g. `npm run dev` or backend/frontend services).
2. Execute the harness:
   ```bash
   npx agent-harness run
   ```
3. Inspect the return code:
   - If code `0`: Check `harness-out/PASSED.json`. Output the summary and finalize the task.
   - If code `1`: **Do not ask the user for help yet.** Follow the Autonomous Remediation Loop below.

---

## 2. Autonomous Remediation Loop

When the harness fails:

```
[ Harness Exit 1 ]
       │
       ▼
[ Agent reads harness-out/INCIDENT_PACK.json ]
       │
       ├─► Tier 0 Failed: Fix static rule violation (e.g. font size, Zod schema).
       ├─► Tier 1 Failed: Fix Socket Gateway (check room name, JWT handshake, payload shape).
       ├─► Tier 2 Failed: Fix Concurrency (add database mutex, unique constraint, or lock).
       └─► Tier 3 Failed: Fix UI Route (check console error, network 500, hydration mismatch).
       │
       ▼
[ Agent re-runs targeted probe: npx agent-harness probe:<tier> ]
       │
       ▼
[ Full verification: npx agent-harness run ]
```

---

## 3. Realtime Socket Debugging Checklist
- Check if Socket Gateway room joins properly handle multi-tenancy prefix (`hotel:<id>`).
- Check if Redis Pub/Sub emitter broadcasts to the exact room name where the socket client resides.
- Ensure event names match between frontend hook and backend gateway (`REQUEST_CREATED` vs `request_created`).
