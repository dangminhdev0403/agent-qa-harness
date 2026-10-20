#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { executeHarness } from '../src/index.mjs';
import { appendScenario, syncDiscoveredToConfig } from '../src/core/scenario-builder.mjs';
import { autoDiscoverProject } from '../src/core/auto-discover.mjs';
import { IsolationManager } from '../src/core/isolation-manager.mjs';
import { checkAndSyncProject } from '../src/core/smart-sync.mjs';

const args = process.argv.slice(2);
const command = args[0] || 'run';

function printHelp() {
  console.log(`
Agent QA Harness - Bộ khung kiểm thử tự động đa tầng cho AI Agents & Archon

Cách dùng:
  agent-harness [lệnh] [tùy chọn]

2 CHẾ ĐỘ KIỂM THỬ CHÍNH:
  test:code            [CHẾ ĐỘ 1] Test Code & Độ Ổn Định Hệ Thống (Types, Build, UI Rules, Sockets, Concurrency)
  test:flow            [CHẾ ĐỘ 2] Test Flow Luồng & Giao Diện Người Dùng (Chrome DevTools, UI Actions, 0-Console Error)
  run                  Chạy toàn diện cả 2 chế độ (Dual-pass)

CÁC LỆNH TỰ ĐỘNG HÓA & TIỆN ÍCH:
  sync                 TỰ ĐỘNG KIỂM TRA & ĐỒNG BỘ (Bật harness: tự quét nếu thiếu rồi sẵn sàng chạy)
  discover             TỰ ĐỘNG quét dự án và tạo/đồng bộ kịch bản (Zero-effort setup)
  init                 Khởi tạo file cấu hình mẫu harness.config.json tại thư mục hiện tại
  add:flow <tên>       Thêm/Nâng cấp kịch bản UI Flow mới (Tự động lọc trùng)
  add:socket <tên>     Thêm/Nâng cấp kịch bản kiểm tra Realtime Socket
  add:concurrency <tên>Thêm/Nâng cấp kịch bản kiểm tra Duyệt tranh chấp (Concurrency)
  probe:socket         Chỉ chạy Tier 1 (Kiểm tra kết nối Realtime Socket)
  probe:concurrency    Chỉ chạy Tier 2 (Kiểm tra tranh chấp Concurrency & Idempotency)
  probe:browser        Chỉ chạy Tier 3 (Kiểm tra Route trình duyệt & Lỗi Console)

TÙY CHỌN BẢO VỆ & AN TOÀN:
  --auto-start         Tự động khởi động máy chủ bằng START (npm run start) nếu chưa chạy (TUYỆT ĐỐI KHÔNG CHẠY DEV)
  --no-kill            Giữ nguyên máy chủ tiếp tục chạy sau khi test xong (không kill process)
  --isolate-branch     TỰ ĐỘNG TÁCH NHÁNH GIT CÔ LẬP ('harness-fix/...') khi có lỗi để tránh xung đột giữa 2 agents
  --max-retries <n>    Giới hạn số lần thử sửa lỗi tự động (Mặc định: 3, ngắt mạch chống vòng lặp vô tận)
  --mode <code|flow|all> Chọn chế độ thực thi (mặc định: all)
  --config <đường_dẫn>   Chỉ định file cấu hình harness.config.json tùy chỉnh
  --tier <0|1|2|3>       Chỉ chạy một Tier cụ thể
  --help, -h             Hiển thị trợ giúp này
`);
}

async function handleInit() {
  const target = path.resolve(process.cwd(), 'harness.config.json');
  if (fs.existsSync(target)) {
    console.error(` Lỗi: harness.config.json đã tồn tại trong thư mục: ${process.cwd()}`);
    process.exit(1);
  }

  const samplePath = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '../templates/harness.config.sample.json');
  if (fs.existsSync(samplePath)) {
    fs.copyFileSync(samplePath, target);
  } else {
    const fallback = {
      project: path.basename(process.cwd()),
      baseUrl: "http://localhost:3000",
      server: { autoStart: false, startCommand: "npm run start" },
      static: { enabled: true, commands: [] },
      realtime: { enabled: false, scenarios: [] },
      concurrency: { enabled: false, scenarios: [] },
      browser: { enabled: false, routes: [] }
    };
    fs.writeFileSync(target, JSON.stringify(fallback, null, 2), 'utf8');
  }

  console.log(` Khởi tạo thành công harness.config.json tại: ${target}`);
}

async function handleDiscover() {
  const discovered = await autoDiscoverProject(process.cwd());
  syncDiscoveredToConfig(process.cwd(), discovered);
}

async function handleAdd(type, name) {
  if (!name) {
    console.error(` Vui lòng cung cấp tên kịch bản. Ví dụ: agent-harness add:${type} "ten-tinh-nang"`);
    process.exit(1);
  }

  let payload;
  if (type === 'flow') {
    payload = {
      name,
      description: `Kịch bản kiểm thử giao diện cho tính năng ${name}`,
      steps: [
        { action: "navigate", url: `/${name}` },
        { action: "waitFor", durationMs: 500 },
        { action: "assertNoErrors" }
      ]
    };
  } else if (type === 'socket') {
    payload = {
      name,
      description: `Kịch bản realtime socket cho tính năng ${name}`,
      receiver: {
        endpoint: "/events",
        listenEvent: `${name.toUpperCase()}_EVENT`
      },
      trigger: {
        type: "http",
        method: "POST",
        path: `/api/v1/${name}`,
        body: { example: true }
      },
      timeoutMs: 3000
    };
  } else if (type === 'concurrency') {
    payload = {
      name,
      description: `Kịch bản chống duyệt đúp / tranh chấp cho ${name}`,
      path: `/api/v1/${name}/approve`,
      method: "POST",
      concurrentBurst: 5,
      assert: {
        "expected200": 1,
        "expectedConflictOrBad": 4
      }
    };
  }

  appendScenario(process.cwd(), type, payload);
}

async function main() {
  if (args.includes('--help') || args.includes('-h') || command === 'help') {
    printHelp();
    process.exit(0);
  }

  if (command === 'init') {
    await handleInit();
    process.exit(0);
  }

  if (command === 'discover') {
    await handleDiscover();
    process.exit(0);
  }

  if (command === 'sync' || command === 'check-sync') {
    await checkAndSyncProject(process.cwd());
    process.exit(0);
  }

  if (command.startsWith('add:')) {
    const type = command.replace('add:', '');
    const name = args[1];
    await handleAdd(type, name);
    process.exit(0);
  }

  let configPath = null;
  const configIdx = args.indexOf('--config');
  if (configIdx !== -1 && args[configIdx + 1]) {
    configPath = args[configIdx + 1];
  }

  // Xác định Mode kiểm thử
  let mode = 'all';
  if (command === 'test:code') {
    mode = 'code';
  } else if (command === 'test:flow') {
    mode = 'flow';
  } else {
    const modeIdx = args.indexOf('--mode');
    if (modeIdx !== -1 && args[modeIdx + 1]) {
      mode = args[modeIdx + 1];
    }
  }

  let tier = null;
  const tierIdx = args.indexOf('--tier');
  if (tierIdx !== -1 && args[tierIdx + 1]) {
    tier = args[tierIdx + 1];
  } else if (command === 'probe:socket') {
    tier = '1';
  } else if (command === 'probe:concurrency') {
    tier = '2';
  } else if (command === 'probe:browser') {
    tier = '3';
  }

  let maxRetries = 3;
  const maxRetriesIdx = args.indexOf('--max-retries');
  if (maxRetriesIdx !== -1 && args[maxRetriesIdx + 1]) {
    maxRetries = parseInt(args[maxRetriesIdx + 1], 10) || 3;
  }

  const autoStart = args.includes('--auto-start');
  const noKill = args.includes('--no-kill');
  const isolateBranch = args.includes('--isolate-branch');

  try {
    const { overallPassed, circuitBreakerTripped } = await executeHarness({
      cwd: process.cwd(),
      configPath,
      tier,
      mode,
      autoStart,
      noKill,
      maxRemediationAttempts: maxRetries
    });

    if (!overallPassed && isolateBranch) {
      const isolationManager = new IsolationManager(process.cwd(), path.join(process.cwd(), 'harness-out'));
      await isolationManager.createIsolatedBranch('agent-fix');
    }

    if (circuitBreakerTripped) {
      console.error(`\n[DỪNG THỰC THI] Vòng lặp sửa code đã bị ngắt bởi Circuit Breaker (Quá ${maxRetries} lần thử).`);
      process.exit(2);
    }

    process.exit(overallPassed ? 0 : 1);
  } catch (err) {
    console.error(`\n[LỖI NGHIÊM TRỌNG] Quá trình kiểm thử thất bại: ${err.message}`);
    process.exit(1);
  }
}

main();
