import fs from 'node:fs';
import path from 'node:path';
import { DEFAULT_CONFIG_NAMES } from './config-loader.mjs';

/**
 * Appends or upgrades a scenario in harness.config.json.
 * Features smart deduplication and in-place upgrade to avoid stale/duplicate tests.
 */
export function appendScenario(cwd, type, scenarioPayload) {
  const { config, targetFile } = readConfig(cwd);

  if (type === 'flow' || type === 'browser') {
    if (!config.browser) config.browser = { enabled: true, flows: [] };
    if (!config.browser.flows) config.browser.flows = [];

    // Tìm kiếm trùng lặp: theo tên HOẶC theo URL bắt đầu
    const firstUrl = scenarioPayload.steps?.[0]?.url;
    const existingIdx = config.browser.flows.findIndex(
      f => f.name === scenarioPayload.name || (firstUrl && f.steps?.[0]?.url === firstUrl)
    );

    if (existingIdx !== -1) {
      const oldName = config.browser.flows[existingIdx].name;
      config.browser.flows[existingIdx] = {
        ...config.browser.flows[existingIdx],
        ...scenarioPayload,
        name: scenarioPayload.name || oldName
      };
      console.log(` [UPGRADE] Đã nâng cấp kịch bản UI Flow: "${oldName}" (Không tạo trùng)`);
    } else {
      config.browser.flows.push(scenarioPayload);
      console.log(` [MỚI] Đã thêm mới kịch bản UI Flow: "${scenarioPayload.name}"`);
    }
    config.browser.enabled = true;
  } else if (type === 'socket' || type === 'realtime') {
    if (!config.realtime) config.realtime = { enabled: true, provider: 'socket.io', scenarios: [] };
    if (!config.realtime.scenarios) config.realtime.scenarios = [];

    // Tìm kiếm trùng lặp: theo tên HOẶC theo cặp (endpoint + listenEvent)
    const ep = scenarioPayload.receiver?.endpoint;
    const ev = scenarioPayload.receiver?.listenEvent;
    const existingIdx = config.realtime.scenarios.findIndex(
      s => s.name === scenarioPayload.name || (ep && ev && s.receiver?.endpoint === ep && s.receiver?.listenEvent === ev)
    );

    if (existingIdx !== -1) {
      const oldName = config.realtime.scenarios[existingIdx].name;
      config.realtime.scenarios[existingIdx] = {
        ...config.realtime.scenarios[existingIdx],
        ...scenarioPayload,
        name: scenarioPayload.name || oldName
      };
      console.log(` [UPGRADE] Đã nâng cấp kịch bản Realtime Socket: "${oldName}"`);
    } else {
      config.realtime.scenarios.push(scenarioPayload);
      console.log(` [MỚI] Đã thêm mới kịch bản Realtime Socket: "${scenarioPayload.name}"`);
    }
    config.realtime.enabled = true;
  } else if (type === 'concurrency') {
    if (!config.concurrency) config.concurrency = { enabled: true, scenarios: [] };
    if (!config.concurrency.scenarios) config.concurrency.scenarios = [];

    // Tìm kiếm trùng lặp: theo tên HOẶC theo cặp (method + path)
    const m = (scenarioPayload.method || 'POST').toUpperCase();
    const p = scenarioPayload.path;
    const existingIdx = config.concurrency.scenarios.findIndex(
      s => s.name === scenarioPayload.name || (p && (s.method || 'POST').toUpperCase() === m && s.path === p)
    );

    if (existingIdx !== -1) {
      const oldName = config.concurrency.scenarios[existingIdx].name;
      config.concurrency.scenarios[existingIdx] = {
        ...config.concurrency.scenarios[existingIdx],
        ...scenarioPayload,
        name: scenarioPayload.name || oldName
      };
      console.log(` [UPGRADE] Đã nâng cấp kịch bản Concurrency: "${oldName}"`);
    } else {
      config.concurrency.scenarios.push(scenarioPayload);
      console.log(` [MỚI] Đã thêm mới kịch bản Concurrency: "${scenarioPayload.name}"`);
    }
    config.concurrency.enabled = true;
  } else {
    throw new Error(`Loại kịch bản không hợp lệ: "${type}".`);
  }

  fs.writeFileSync(targetFile, JSON.stringify(config, null, 2), 'utf8');
}

/**
 * Merges discovered routes, gateways, and mutations into harness.config.json.
 */
export function syncDiscoveredToConfig(cwd, discovered) {
  const { config, targetFile } = readConfig(cwd);

  let addedCount = 0;
  let upgradedCount = 0;

  // 0. Đồng bộ cấu hình máy chủ & tên miền Portless nếu phát hiện
  if (discovered.server) {
    if (!config.baseUrl || config.baseUrl.includes('localhost:3000')) {
      config.baseUrl = discovered.server.baseUrl;
    }
    if (!config.server) config.server = {};
    if (!config.server.startCommand || config.server.startCommand === 'npm run start') {
      config.server.startCommand = discovered.server.startCommand;
    }
    if (!config.server.devCommand) {
      config.server.devCommand = discovered.server.devCommand;
    }
    config.server.port = discovered.server.port;
    if (discovered.server.isPortless) {
      config.server.proxy = "portless";
      config.server.appName = discovered.server.appName;
    }
  }

  // 1. Đồng bộ Routes vào browser
  if (!config.browser) config.browser = { enabled: true, routes: [], flows: [] };
  if (!config.browser.routes) config.browser.routes = [];

  for (const r of discovered.routes) {
    if (!config.browser.routes.includes(r)) {
      config.browser.routes.push(r);
      addedCount++;
    }
  }

  // 2. Đồng bộ Gateways vào realtime scenarios
  if (!config.realtime) config.realtime = { enabled: true, provider: 'socket.io', scenarios: [] };
  if (!config.realtime.scenarios) config.realtime.scenarios = [];

  for (const gw of discovered.socketGateways) {
    const exists = config.realtime.scenarios.some(
      s => s.receiver?.endpoint === gw.endpoint && s.receiver?.listenEvent === gw.event
    );
    if (!exists) {
      config.realtime.scenarios.push({
        name: `auto-${gw.event.toLowerCase()}`,
        description: `Tự động phát hiện từ file ${gw.sourceFile}`,
        receiver: { endpoint: gw.endpoint, listenEvent: gw.event },
        timeoutMs: 3000
      });
      addedCount++;
    }
  }

  // 3. Đồng bộ Concurrency mutations
  if (!config.concurrency) config.concurrency = { enabled: true, scenarios: [] };
  if (!config.concurrency.scenarios) config.concurrency.scenarios = [];

  for (const mut of discovered.mutationEndpoints) {
    const exists = config.concurrency.scenarios.some(
      c => (c.method || 'POST').toUpperCase() === mut.method && c.path === mut.path
    );
    if (!exists) {
      config.concurrency.scenarios.push({
        name: `auto-race-guard-${path.basename(mut.path)}`,
        description: `Chống duyệt đúp tự động cho ${mut.method} ${mut.path}`,
        method: mut.method,
        path: mut.path,
        concurrentBurst: 5,
        assert: { expected200: 1, expectedConflictOrBad: 4 }
      });
      addedCount++;
    }
  }

  fs.writeFileSync(targetFile, JSON.stringify(config, null, 2), 'utf8');
  console.log(` [HOÀN TẤT ĐỒNG BỘ] Đã tự động cập nhật ${addedCount} kịch bản mới vào ${targetFile}.\n`);
}

function readConfig(cwd) {
  let targetFile = null;
  for (const name of DEFAULT_CONFIG_NAMES) {
    const candidate = path.resolve(cwd, name);
    if (fs.existsSync(candidate)) {
      targetFile = candidate;
      break;
    }
  }

  if (!targetFile) {
    targetFile = path.resolve(cwd, 'harness.config.json');
    const initPayload = {
      project: path.basename(cwd),
      baseUrl: "http://localhost:3000",
      static: { enabled: true, commands: [] },
      realtime: { enabled: false, scenarios: [] },
      concurrency: { enabled: false, scenarios: [] },
      browser: { enabled: false, routes: [] }
    };
    fs.writeFileSync(targetFile, JSON.stringify(initPayload, null, 2), 'utf8');
    return { config: initPayload, targetFile };
  }

  const raw = fs.readFileSync(targetFile, 'utf8');
  return { config: JSON.parse(raw), targetFile };
}
