#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { executeHarness } from '../src/index.mjs';
import { appendScenario, syncDiscoveredToConfig } from '../src/core/scenario-builder.mjs';
import { autoDiscoverProject } from '../src/core/auto-discover.mjs';
import { IsolationManager } from '../src/core/isolation-manager.mjs';
import { checkAndSyncProject } from '../src/core/smart-sync.mjs';
import { SubagentDispatcher } from '../src/core/subagent-dispatcher.mjs';
import { loadHarnessConfig } from '../src/core/config-loader.mjs';
import { inspectPrerequisites, inspectModulePrerequisites, STANDARD_MOCK_FIXTURES } from '../src/core/prerequisite-inspector.mjs';
import { HARNESS_MODULES, partitionRoutesByModule, detectProjectDomain } from '../src/core/module-registry.mjs';
import { runAutonomousHumanExplorer } from '../src/drivers/autonomous-human-explorer.mjs';

const args = process.argv.slice(2);
const command = args[0] || 'run';

function printHelp() {
  console.log(`
Agent QA Harness - Bộ khung kiểm thử tự động đa tầng cho AI Agents & Archon

Cách dùng:
  agent-harness [lệnh] [tùy chọn]

2 CHẾ ĐỘ KIỂM THỬ CHÍNH:
  test:auto            [TỰ ĐỘNG TOÀN DIỆN] Khởi chạy kiểm thử tự động, mô phỏng người dùng thật, quét tìm & ghi lỗi có cấu trúc
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

KIỂM TRA ĐIỀU KIỆN TIÊN QUYẾT (CHỐNG TEST QUA LOA):
  audit:prerequisites  Kiểm tra toàn diện điều kiện tiên quyết (Auth Wall, Fixtures, DB) trước khi test sâu
  check:prereq         Viết tắt của audit:prerequisites

KIỂM THỬ THEO PHÂN HỆ VAI TRÒ (ROLE-BASED MODULES):
  test:module <tên>    Chạy kiểm thử riêng cho 1 Module cụ thể
  subagents:modules    Xuất JSON kế hoạch Sub-Agents kèm invokeArgs sẵn sàng gọi trực tiếp invoke_subagent
  subagents:dispatch   Viết tắt của subagents:modules

ĐIỀU PHỐI SUB-AGENTS SONG SONG:
  subagents:plan       Xuất JSON kế hoạch điều phối 2 Sub-Agents song song (Code Tester + Flow Tester với cửa sổ Chrome riêng biệt)
  subagents:personas   Xuất JSON kế hoạch Swarm Đa Persona (Khách vãng lai, Lễ tân, Chủ khách sạn trên 3 cửa sổ Chrome riêng biệt)
  subagents:fix        Xuất JSON cấu hình Sub-Agent tự sửa lỗi trên nhánh cô lập (Workspace: 'branch')

TÙY CHỌN BẢO VỆ & AN TOÀN:
  --force              Bỏ qua kiểm tra điều kiện tiên quyết và ép chạy tiếp
  --auto-start         Tự động khởi động máy chủ bằng START (npm run start) nếu chưa chạy (TUYỆT ĐỐI KHÔNG CHẠY DEV)
  --no-kill            Giữ nguyên máy chủ tiếp tục chạy sau khi test xong (không kill process)
  --isolate-branch     TỰ ĐỘNG TÁCH NHÁNH GIT CÔ LẬP ('harness-fix/...') khi có lỗi để tránh xung đột giữa 2 agents
  --window-session <id> Gán ID phiên cửa sổ Chrome riêng biệt cho Sub-Agent (ngăn chặn xung đột tab)
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

  if (command === 'test:auto' || command === 'auto') {
    console.log(`\n======================================================`);
    console.log(` BẬT CHẾ ĐỘ AUTO TEST (MÔ PHỎNG NGƯỜI DÙNG THẬT & GHI LỖI)`);
    console.log(`======================================================`);
    await checkAndSyncProject(process.cwd());

    const config = loadHarnessConfig(process.cwd());
    const domain = detectProjectDomain(config.browser?.routes || [], config);
    console.log(` Phân loại nghiệp vụ dự án: [${domain.toUpperCase()}]`);

    const result = await runAutonomousHumanExplorer(config, {
      autoStart: args.includes('--auto-start'),
      noKill: args.includes('--no-kill')
    });

    if (result.passed) {
      console.log(`\n🎉 TẤT CẢ ROUTE VÀ THAO TÁC ĐỀU HOÀN THÀNH VỚI 0 LỖI!`);
      process.exit(0);
    } else {
      console.error(`\n⚠️ PHÁT HIỆN ${result.totalIncidents} LỖI TRONG QUÁ TRÌNH KIỂM THỬ.`);
      console.error(`Xem hồ sơ chi tiết tại: harness-out/INCIDENT_PACK.json và harness-out/SUMMARY_REPORT.md\n`);
      process.exit(1);
    }
  }

  if (command === 'sync' || command === 'check-sync') {
    await checkAndSyncProject(process.cwd());
    process.exit(0);
  }

  if (command === 'subagents:plan') {
    const dispatcher = new SubagentDispatcher(process.cwd());
    const plan = dispatcher.generateParallelPlan();
    console.log(JSON.stringify(plan, null, 2));
    process.exit(0);
  }

  if (command === 'subagents:fix') {
    const dispatcher = new SubagentDispatcher(process.cwd());
    const fixer = dispatcher.generateFixerWorker();
    console.log(JSON.stringify(fixer, null, 2));
    process.exit(0);
  }

  if (command === 'subagents:personas') {
    const dispatcher = new SubagentDispatcher(process.cwd());
    const plan = dispatcher.generatePersonaSwarmPlan();
    console.log(JSON.stringify(plan, null, 2));
    process.exit(0);
  }

  if (command === 'audit:prerequisites' || command === 'check:prereq') {
    const config = loadHarnessConfig(process.cwd());
    const report = inspectPrerequisites(config);
    console.log(JSON.stringify(report, null, 2));
    process.exit(report.isComplete ? 0 : 3);
  }

  if (command === 'subagents:modules' || command === 'subagents:dispatch') {
    const dispatcher = new SubagentDispatcher(process.cwd());
    const filter = args.slice(1);
    const plan = dispatcher.generateModuleSwarmPlan(filter);
    console.log(JSON.stringify(plan, null, 2));
    process.exit(0);
  }

  if (command === 'fixtures:mock') {
    const configPath = path.resolve(process.cwd(), 'harness.config.json');
    if (!fs.existsSync(configPath)) {
      console.error(` Lỗi: Không tìm thấy harness.config.json trong ${process.cwd()}.`);
      process.exit(1);
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    config.fixtures = {
      ...(config.fixtures || {}),
      ...STANDARD_MOCK_FIXTURES
    };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    console.log(`\n======================================================`);
    console.log(` TỰ ĐỘNG KHỞI TẠO BỘ THAM SỐ ĐỘNG MẪU (FIXTURES)`);
    console.log(`======================================================`);
    console.log(JSON.stringify(config.fixtures, null, 2));
    console.log(`\n Đã cập nhật thành công vào harness.config.json.\n`);
    process.exit(0);
  }

  if (command === 'test:module') {
    const modId = args[1];
    const config = loadHarnessConfig(process.cwd());
    const partitioned = partitionRoutesByModule(config.browser?.routes || [], config);
    const modDef = partitioned[modId];

    if (!modId || !modDef) {
      console.error(`\n Lỗi: Module không hợp lệ hoặc chưa được cung cấp.`);
      console.error(`Các modules khả dụng cho dự án này: ${Object.keys(partitioned).join(', ')}`);
      console.error(`Ví dụ: agent-harness test:module ${Object.keys(partitioned)[0] || 'public'}\n`);
      process.exit(1);
    }

    const targetRoutes = modDef?.routes || [];

    // Kiểm tra điều kiện tiên quyết riêng cho module này (Anti-Superficiality Gate)
    if (!args.includes('--force')) {
      const modPrereq = inspectModulePrerequisites(config, modId, modDef);
      if (!modPrereq.isComplete) {
        console.warn(`\n======================================================`);
        console.warn(` ⛔ DỪNG TIẾN TRÌNH: MODULE [${modDef.name.toUpperCase()}] THIẾU ĐIỀU KIỆN`);
        console.warn(` (Nguyên tắc chống kiểm thử qua loa / Anti-Superficiality)`);
        console.warn(`======================================================`);
        for (const m of modPrereq.missing) {
          console.warn(` • [${m.type}] ${m.title}`);
          console.warn(`   -> ${m.description}`);
          console.warn(`   -> Khắc phục: ${m.actionRequired}\n`);
        }
        console.warn(`Thêm cờ '--force' nếu muốn ép chạy bỏ qua xác thực.\n`);
        process.exit(3);
      }
    }

    console.log(`\n======================================================`);
    console.log(` KIỂM THỬ MODULE: ${modDef.name.toUpperCase()} (Vai trò: ${modDef.role})`);
    console.log(` Số route trong module: ${targetRoutes.length}`);
    console.log(`======================================================\n`);

    config.browser.routes = targetRoutes;
    config.browser.enabled = true;

    const { overallPassed } = await executeHarness({
      cwd: process.cwd(),
      mode: 'flow',
      autoStart: args.includes('--auto-start'),
      noKill: args.includes('--no-kill'),
      configOverride: config
    });
    process.exit(overallPassed ? 0 : 1);
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

  let windowSessionId = null;
  const wsIdx = args.indexOf('--window-session');
  if (wsIdx !== -1 && args[wsIdx + 1]) {
    windowSessionId = args[wsIdx + 1];
  }

  const autoStart = args.includes('--auto-start');
  const noKill = args.includes('--no-kill');
  const isolateBranch = args.includes('--isolate-branch');
  const force = args.includes('--force');

  // Kiểm tra điều kiện tiên quyết (Anti-Superficiality Gate - Strict Halt)
  if ((mode === 'flow' || mode === 'all') && !force) {
    try {
      const currentConfig = loadHarnessConfig(process.cwd(), configPath);
      const prereq = inspectPrerequisites(currentConfig);
      if (!prereq.isComplete) {
        console.warn(`\n======================================================`);
        console.warn(` ⛔ DỪNG TIẾN TRÌNH: THIẾU ĐIỀU KIỆN TIÊN QUYẾT ĐỂ TEST FULL`);
        console.warn(` (Nguyên tắc chống kiểm thử qua loa / Anti-Superficiality Gate)`);
        console.warn(`======================================================`);
        for (const m of prereq.missing) {
          console.warn(` • [${m.type}] ${m.title}`);
          console.warn(`   -> ${m.description}`);
          console.warn(`   -> Khắc phục: ${m.actionRequired}\n`);
        }
        console.warn(`------------------------------------------------------`);
        console.warn(` CÁC LỰA CHỌN TIẾP TỤC HỢP LỆ:`);
        console.warn(` 1. Kiểm thử phân hệ công khai không cần auth:`);
        console.warn(`    $ agent-harness test:module public`);
        console.warn(` 2. Tự động khởi tạo bộ tham số động mẫu:`);
        console.warn(`    $ agent-harness fixtures:mock`);
        console.warn(` 3. Cung cấp tài khoản test trong harness.config.json.`);
        console.warn(` 4. Ép chạy bỏ qua xác thực: thêm cờ '--force'.\n`);
        process.exit(3);
      }
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }

  try {
    const { overallPassed, circuitBreakerTripped } = await executeHarness({
      cwd: process.cwd(),
      configPath,
      tier,
      mode,
      autoStart,
      noKill,
      windowSessionId,
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
