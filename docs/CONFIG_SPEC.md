# `harness.config.json` Specification

Every repository using `agents-testing-with-workflow` configures its testing parameters via `harness.config.json` located at the project root.

---

## Root Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `project` | `string` | Directory name | Human-readable identifier for the target project. |
| `baseUrl` | `string` | `"http://localhost:3000"` | Base URL of the running application server. |
| `timeoutMs` | `number` | `30000` | Global execution timeout in milliseconds. |
| `outputDir` | `string` | `"harness-out"` | Directory where summaries and incident packs are saved. |
| `static` | `object` | `{}` | Tier 0 static verification rules. |
| `realtime` | `object` | `{}` | Tier 1 realtime socket testing scenarios. |
| `concurrency` | `object` | `{}` | Tier 2 concurrency burst scenarios. |
| `browser` | `object` | `{}` | Tier 3 browser & route health checks. |

---

## 1. `static` Configuration

```json
"static": {
  "enabled": true,
  "commands": [
    {
      "name": "UI Rules",
      "cmd": "node scripts/verify-ui-rules.cjs"
    },
    {
      "name": "Contract Check",
      "cmd": "npm run test:contracts"
    }
  ]
}
```

---

## 2. `realtime` Configuration

```json
"realtime": {
  "enabled": true,
  "provider": "socket.io", // "socket.io" | "ws"
  "scenarios": [
    {
      "name": "guest-request-roundtrip",
      "description": "Verifies that guest requests emit REQUEST_CREATED to staff",
      "receiver": {
        "endpoint": "/staff-ops",
        "auth": { "token": "Bearer test-jwt-token" },
        "listenEvent": "REQUEST_CREATED",
        "assertPayload": {
          "status": "PENDING"
        }
      },
      "trigger": {
        "type": "http",
        "method": "POST",
        "path": "/api/v1/guest/requests",
        "body": { "serviceId": "towels", "roomId": "101" }
      },
      "timeoutMs": 4000
    }
  ]
}
```

---

## 3. `concurrency` Configuration

```json
"concurrency": {
  "enabled": true,
  "scenarios": [
    {
      "name": "prevent-double-approval",
      "description": "Fires simultaneous requests to ensure single-winner semantics",
      "path": "/api/v1/orders/1/approve",
      "method": "POST",
      "concurrentBurst": 5,
      "assert": {
        "expected200": 1,
        "expectedConflictOrBad": 4
      }
    }
  ]
}
```

---

## 4. `browser` Configuration

```json
"browser": {
  "enabled": true,
  "zeroConsoleErrors": true,
  "zeroNetworkErrors": true,
  "routes": [
    { "path": "/dashboard", "waitForSelector": "[data-testid='kpi-board']" },
    { "path": "/rooms", "waitForSelector": "table" }
  ]
}
```
