import { spawn, exec } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import util from 'node:util';
import { waitForServerReady } from './preflight-waiter.mjs';

const execAsync = util.promisify(exec);

/**
 * Server Lifecycle Manager.
 * If the application is not running, automatically starts the production/staging server using 'START'.
 *
 * CRITICAL RULE:
 * Strictly runs 'npm run start' / 'pnpm start'. NEVER runs 'dev'!
 * Running 'dev' triggers file watchers and HMR that corrupt active editing sessions during test runs.
 */
export async function ensureServerRunning(config, options = {}) {
  const baseUrl = config.baseUrl;
  const isAutoStart = options.autoStart ?? config.server?.autoStart ?? false;

  // 1. Kiểm tra nhanh xem server đã chạy sẵn chưa
  const isAlive = await probeServerFast(baseUrl);
  if (isAlive) {
    console.log(`[Server Manager] Máy chủ đã chạy sẵn tại: ${baseUrl}.\n`);
    return null;
  }

  // 2. Nếu server chưa chạy nhưng không bật cờ autoStart -> Cảnh báo và yêu cầu bật start
  if (!isAutoStart) {
    throw new Error(
      `[MÁY CHỦ CHƯA CHẠY] Không thể kết nối tới ${baseUrl}.\n` +
      `LƯU Ý QUAN TRỌNG: Hãy chạy lệnh START (ví dụ: 'pnpm start' hoặc 'npm run start').\n` +
      `KHÔNG chạy 'dev' để tránh hot-reload/file watcher xung đột trong lúc bạn đang sửa code!\n` +
      `Hoặc thêm cờ '--auto-start' để Harness tự động chạy server start ngầm: 'agent-harness run --auto-start'`
    );
  }

  // 3. Khởi động server ngầm với lệnh START
  let startCommand = config.server?.startCommand || resolveDefaultStartCommand(config.rootDir);

  // BẢO VỆ TUYỆT ĐỐI: Ngăn chặn hoàn toàn việc chạy dev
  if (/\bdev\b/i.test(startCommand)) {
    console.warn(`[CẢNH BÁO BẢO VỆ] Phát hiện lệnh chứa 'dev' (${startCommand}).`);
    console.warn(`  -> Bắt buộc chuyển đổi sang lệnh 'start' để tránh xung đột hot-reload khi đang sửa code.`);
    startCommand = startCommand.replace(/\bdev\b/gi, 'start');
  }

  console.log(`\n[Server Manager] Máy chủ chưa bật. Tự động khởi động bằng lệnh START: "${startCommand}"...`);
  console.log(`  -> Thư mục thực thi: ${config.rootDir}`);
  console.log(`  -> Nguyên tắc an toàn: CHỈ CHẠY START, KHÔNG CHẠY DEV.\n`);

  const child = spawn(startCommand, {
    cwd: config.rootDir,
    shell: true,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'production', PORT: '3000' }
  });

  child.stdout?.on('data', (data) => {
    // Có thể bỏ qua hoặc in debug nếu cần
  });

  child.stderr?.on('data', (data) => {
    // Log lỗi nếu có
  });

  child.on('error', (err) => {
    console.error(`[Server Manager LỖI] Không thể spawn tiến trình server: ${err.message}`);
  });

  // Chờ server mở port và phản hồi
  const timeoutMs = config.server?.timeoutMs || 25000;
  try {
    await waitForServerReady(baseUrl, {
      retries: Math.ceil(timeoutMs / 1500),
      delayMs: 1500,
      healthEndpoint: config.preflight?.healthEndpoint || ''
    });
  } catch (err) {
    await killProcess(child.pid);
    throw new Error(
      `[KHỞI ĐỘNG THẤT BẠI] Đã chạy lệnh '${startCommand}' nhưng máy chủ không mở port sau ${timeoutMs / 1000}s.\n` +
      `Hãy đảm bảo bạn đã build dự án trước (ví dụ: 'pnpm build' hoặc 'npm run build').`
    );
  }

  return {
    pid: child.pid,
    command: startCommand,
    cleanup: async () => {
      if (options.noKill || config.server?.keepAlive) {
        console.log(`[Server Manager] Giữ nguyên server đang chạy (PID: ${child.pid}).`);
        return;
      }
      console.log(`\n[Server Manager] Tự động đóng server start sau khi kiểm thử xong (PID: ${child.pid})...`);
      await killProcess(child.pid);
      console.log(`  -> Đã giải phóng cổng ${baseUrl}.\n`);
    }
  };
}

async function probeServerFast(baseUrl) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1000);
    const res = await fetch(baseUrl, { signal: controller.signal });
    clearTimeout(timer);
    return res.status > 0;
  } catch {
    return false;
  }
}

function resolveDefaultStartCommand(rootDir) {
  if (fs.existsSync(path.join(rootDir, 'pnpm-lock.yaml'))) return 'pnpm start';
  if (fs.existsSync(path.join(rootDir, 'yarn.lock'))) return 'yarn start';
  return 'npm run start';
}

async function killProcess(pid) {
  if (!pid) return;
  try {
    if (process.platform === 'win32') {
      await execAsync(`taskkill /pid ${pid} /T /F`).catch(() => {});
    } else {
      process.kill(-pid, 'SIGTERM');
    }
  } catch {}
}
