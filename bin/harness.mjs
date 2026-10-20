#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { executeHarness } from '../src/index.mjs';

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

async function main() {
  if (args.includes('--help') || args.includes('-h') || command === 'help') {
    printHelp();
    process.exit(0);
  }

  if (command === 'init') {
    await handleInit();
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
