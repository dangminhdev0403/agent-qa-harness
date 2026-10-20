/**
 * Universal Realtime Socket Probe Driver
 * Tests real-time connectivity, handshakes, room isolation, and event round-trips.
 */
export async function runSocketProbe(config) {
  if (!config.realtime.enabled || config.realtime.scenarios.length === 0) {
    return { skipped: true, reason: 'Realtime testing is disabled or has no scenarios.' };
  }

  const results = [];
  console.log(`\n[Realtime Probe] Starting execution of ${config.realtime.scenarios.length} scenario(s)...`);

  for (const scenario of config.realtime.scenarios) {
    const startedAt = Date.now();
    console.log(`  -> Running scenario: "${scenario.name}" (${scenario.description || 'No description'})`);

    try {
      const outcome = await executeScenario(scenario, config);
      const durationMs = Date.now() - startedAt;
      results.push({
        scenario: scenario.name,
        passed: true,
        durationMs,
        details: outcome
      });
      console.log(`    PASS (${durationMs}ms)`);
    } catch (err) {
      const durationMs = Date.now() - startedAt;
      results.push({
        scenario: scenario.name,
        passed: false,
        durationMs,
        error: err.message,
        stack: err.stack
      });
      console.error(`    FAIL (${durationMs}ms): ${err.message}`);
    }
  }

  const allPassed = results.every(r => r.passed);
  return {
    passed: allPassed,
    results,
    summary: `${results.filter(r => r.passed).length}/${results.length} scenarios passed`
  };
}

async function executeScenario(scenario, config) {
  const timeoutMs = scenario.timeoutMs || 5000;
  const baseUrl = config.baseUrl;
  const provider = scenario.provider || config.realtime.provider || 'socket.io';

  if (provider === 'socket.io') {
    return executeSocketIoScenario(scenario, baseUrl, timeoutMs);
  } else if (provider === 'ws') {
    return executeRawWsScenario(scenario, baseUrl, timeoutMs);
  } else {
    throw new Error(`Unsupported realtime provider: ${provider}`);
  }
}

async function executeSocketIoScenario(scenario, baseUrl, timeoutMs) {
  let io;
  try {
    const module = await import('socket.io-client');
    io = module.io || module.default?.io || module.default;
  } catch (err) {
    throw new Error(
      `Package 'socket.io-client' is required for Socket.io scenarios. Please run: npm install socket.io-client`
    );
  }

  return new Promise((resolve, reject) => {
    const { receiver, trigger } = scenario;
    const socketUrl = `${baseUrl}${receiver.endpoint || ''}`;

    const socket = io(socketUrl, {
      auth: receiver.auth || {},
      query: receiver.query || {},
      transports: receiver.transports || ['websocket', 'polling'],
      timeout: timeoutMs,
      reconnection: false
    });

    let timeoutTimer = null;
    let isSettled = false;

    const cleanup = () => {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      socket.disconnect();
    };

    timeoutTimer = setTimeout(() => {
      if (isSettled) return;
      isSettled = true;
      cleanup();
      reject(new Error(
        `Socket timeout after ${timeoutMs}ms. Event "${receiver.listenEvent}" was never received at endpoint "${socketUrl}".`
      ));
    }, timeoutMs);

    socket.on('connect_error', (err) => {
      if (isSettled) return;
      isSettled = true;
      cleanup();
      reject(new Error(`Socket connection error on ${socketUrl}: ${err.message}`));
    });

    socket.on('connect', async () => {
      // Socket connected successfully, now bind listener
      socket.on(receiver.listenEvent, (payload) => {
        if (isSettled) return;
        isSettled = true;
        cleanup();

        // Optional payload assertion
        if (receiver.assertPayload) {
          try {
            assertPayload(payload, receiver.assertPayload);
          } catch (assertErr) {
            return reject(assertErr);
          }
        }

        resolve({
          message: `Received expected event "${receiver.listenEvent}"`,
          receivedPayload: payload
        });
      });

      // Once listener is armed, execute the trigger action
      try {
        await executeTriggerAction(trigger, baseUrl);
      } catch (triggerErr) {
        if (isSettled) return;
        isSettled = true;
        cleanup();
        reject(new Error(`Failed to fire trigger action: ${triggerErr.message}`));
      }
    });
  });
}

async function executeRawWsScenario(scenario, baseUrl, timeoutMs) {
  let WS = globalThis.WebSocket;
  if (!WS) {
    try {
      const module = await import('ws');
      WS = module.WebSocket || module.default;
    } catch {
      throw new Error(`WebSocket is not globally available. Please install 'ws': npm install ws`);
    }
  }

  return new Promise((resolve, reject) => {
    const { receiver, trigger } = scenario;
    const wsUrl = (baseUrl + (receiver.endpoint || '')).replace(/^http/, 'ws');
    const ws = new WS(wsUrl);

    let timeoutTimer = null;
    let isSettled = false;

    const cleanup = () => {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      try { ws.close(); } catch {}
    };

    timeoutTimer = setTimeout(() => {
      if (isSettled) return;
      isSettled = true;
      cleanup();
      reject(new Error(`Raw WebSocket timeout after ${timeoutMs}ms on ${wsUrl}`));
    }, timeoutMs);

    ws.on('error', (err) => {
      if (isSettled) return;
      isSettled = true;
      cleanup();
      reject(new Error(`WebSocket error on ${wsUrl}: ${err.message}`));
    });

    ws.on('open', async () => {
      ws.on('message', (data) => {
        if (isSettled) return;
        try {
          const parsed = JSON.parse(data.toString());
          if (receiver.matchField && parsed[receiver.matchField] === receiver.expectedValue) {
            isSettled = true;
            cleanup();
            resolve({ message: 'Matching message received', payload: parsed });
          } else if (!receiver.matchField) {
            isSettled = true;
            cleanup();
            resolve({ message: 'Message received', payload: parsed });
          }
        } catch {
          // Non-JSON or unmatched, keep listening
        }
      });

      try {
        await executeTriggerAction(trigger, baseUrl);
      } catch (triggerErr) {
        if (isSettled) return;
        isSettled = true;
        cleanup();
        reject(new Error(`Trigger action failed: ${triggerErr.message}`));
      }
    });
  });
}

async function executeTriggerAction(trigger, baseUrl) {
  if (!trigger) return;

  if (trigger.type === 'http') {
    const url = trigger.url || `${baseUrl}${trigger.path || ''}`;
    const method = (trigger.method || 'POST').toUpperCase();
    const headers = {
      'Content-Type': 'application/json',
      ...(trigger.headers || {})
    };

    const res = await fetch(url, {
      method,
      headers,
      body: trigger.body ? JSON.stringify(trigger.body) : undefined
    });

    if (!res.ok && !trigger.allowHttpError) {
      const text = await res.text().catch(() => '');
      throw new Error(`Trigger HTTP call failed with status ${res.status}: ${text.slice(0, 200)}`);
    }
  }
}

function assertPayload(actual, expectedPattern) {
  for (const [key, expectedValue] of Object.entries(expectedPattern)) {
    if (actual[key] !== expectedValue) {
      throw new Error(`Payload mismatch at key "${key}". Expected: ${JSON.stringify(expectedValue)}, Actual: ${JSON.stringify(actual[key])}`);
    }
  }
}
