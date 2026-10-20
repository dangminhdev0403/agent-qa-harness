import fs from 'node:fs';
import path from 'node:path';
import { loadHarnessConfig, DEFAULT_CONFIG_NAMES } from './config-loader.mjs';

/**
 * Appends a new scenario or flow directly into harness.config.json
 * to ensure new features are continuously recorded and never forgotten.
 */
export function appendScenario(cwd, type, scenarioPayload) {
  let targetFile = null;
  for (const name of DEFAULT_CONFIG_NAMES) {
    const candidate = path.resolve(cwd, name);
    if (fs.existsSync(candidate)) {
      targetFile = candidate;
      break;
    }
  }

  if (!targetFile) {
    throw new Error(`Không tìm thấy harness.config.json trong ${cwd}. Hãy chạy 'agent-harness init' trước.`);
  }

  const raw = fs.readFileSync(targetFile, 'utf8');
  const config = JSON.parse(raw);

  if (type === 'flow' || type === 'browser') {
    if (!config.browser) config.browser = { enabled: true, flows: [] };
    if (!config.browser.flows) config.browser.flows = [];

    const existingIdx = config.browser.flows.findIndex(f => f.name === scenarioPayload.name);
    if (existingIdx !== -1) {
      config.browser.flows[existingIdx] = scenarioPayload;
      console.log(` Đã cập nhật kịch bản UI Flow: "${scenarioPayload.name}"`);
    } else {
      config.browser.flows.push(scenarioPayload);
      console.log(` Đã thêm mới kịch bản UI Flow: "${scenarioPayload.name}"`);
    }
    config.browser.enabled = true;
  } else if (type === 'socket' || type === 'realtime') {
    if (!config.realtime) config.realtime = { enabled: true, provider: 'socket.io', scenarios: [] };
    if (!config.realtime.scenarios) config.realtime.scenarios = [];

    const existingIdx = config.realtime.scenarios.findIndex(s => s.name === scenarioPayload.name);
    if (existingIdx !== -1) {
      config.realtime.scenarios[existingIdx] = scenarioPayload;
      console.log(` Đã cập nhật kịch bản Realtime Socket: "${scenarioPayload.name}"`);
    } else {
      config.realtime.scenarios.push(scenarioPayload);
      console.log(` Đã thêm mới kịch bản Realtime Socket: "${scenarioPayload.name}"`);
    }
    config.realtime.enabled = true;
  } else if (type === 'concurrency') {
    if (!config.concurrency) config.concurrency = { enabled: true, scenarios: [] };
    if (!config.concurrency.scenarios) config.concurrency.scenarios = [];

    const existingIdx = config.concurrency.scenarios.findIndex(s => s.name === scenarioPayload.name);
    if (existingIdx !== -1) {
      config.concurrency.scenarios[existingIdx] = scenarioPayload;
      console.log(` Đã cập nhật kịch bản Concurrency: "${scenarioPayload.name}"`);
    } else {
      config.concurrency.scenarios.push(scenarioPayload);
      console.log(` Đã thêm mới kịch bản Concurrency: "${scenarioPayload.name}"`);
    }
    config.concurrency.enabled = true;
  } else {
    throw new Error(`Loại kịch bản không hợp lệ: "${type}". Hỗ trợ: 'flow', 'socket', 'concurrency'.`);
  }

  fs.writeFileSync(targetFile, JSON.stringify(config, null, 2), 'utf8');
  console.log(` Đã lưu thành công vào: ${targetFile}\n`);
}
