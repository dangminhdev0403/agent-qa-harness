#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { executeHarness } from '../src/index.mjs';
import { appendScenario } from '../src/core/scenario-builder.mjs';

const args = process.argv.slice(2);
const command = args[0] || 'run';

function printHelp() {
  console.log(`
Agent QA Harness - Bộ khung kiểm thử tự động đa tầng cho AI Agents & Archon

Cách dùng:
  agent-harness [lệnh] [tùy chọn]

Các lệnh khả dụng:
  run                  Chạy toàn bộ quy trình kiểm thử (mặc định)
  init                 Khởi tạo file cấu hình mẫu harness.config.json tại thư mục hiện tại
  add:flow <tên>       Thêm nhanh một kịch bản UI Flow mới khi vừa phát triển tính năng
  add:socket <tên>     Thêm nhanh một kịch bản kiểm tra Realtime Socket mới
  add:concurrency <tên>Thêm nhanh một kịch bản kiểm tra Duyệt tranh chấp (Concurrency)
  probe:socket         Chỉ chạy Tier 1 (Kiểm tra kết nối Realtime Socket)
  probe:concurrency    Chỉ chạy Tier 2 (Kiểm tra tranh chấp Concurrency & Idempotency)
  probe:browser        Chỉ chạy Tier 3 (Kiểm tra Route trình duyệt & Lỗi Console)

Tùy chọn:
  --config <đường_dẫn> Chỉ định file cấu hình harness.config.json tùy chỉnh
  --tier <0|1|2|3>     Chỉ chạy một Tier cụ thể
  --help, -h           Hiển thị trợ giúp này
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
      static: { enabled: true, commands: [] },
      realtime: { enabled: false, scenarios: [] },
      concurrency: { enabled: false, scenarios: [] },
      browser: { enabled: false, routes: [] }
    };
    fs.writeFileSync(target, JSON.stringify(fallback, null, 2), 'utf8');
  }

  console.log(` Khởi tạo thành công harness.config.json tại: ${target}`);
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
        expected200: 1,
        expectedConflictOrBad: 4
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

  try {
    const { overallPassed } = await executeHarness({
      cwd: process.cwd(),
      configPath,
      tier
    });

    process.exit(overallPassed ? 0 : 1);
  } catch (err) {
    console.error(`\n[LỖI NGHIÊM TRỌNG] Quá trình kiểm thử thất bại: ${err.message}`);
    process.exit(1);
  }
}

main();
