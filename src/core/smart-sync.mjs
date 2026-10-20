import fs from 'node:fs';
import path from 'node:path';
import { autoDiscoverProject } from './auto-discover.mjs';
import { syncDiscoveredToConfig } from './scenario-builder.mjs';
import { DEFAULT_CONFIG_NAMES } from './config-loader.mjs';

/**
 * Smart Sync Engine.
 * Automatically checks whether the target project has a harness config.
 * If missing OR out of date (new routes/endpoints added), automatically syncs them
 * without disturbing existing custom scenarios.
 */
export async function checkAndSyncProject(rootDir) {
  console.log(`\n======================================================`);
  console.log(` BẬT HARNESS: KIỂM TRA & ĐỒNG BỘ DỰ ÁN TỰ ĐỘNG`);
  console.log(` Thư mục dự án: ${rootDir}`);
  console.log(`======================================================\n`);

  let targetFile = null;
  for (const name of DEFAULT_CONFIG_NAMES) {
    const candidate = path.join(rootDir, name);
    if (fs.existsSync(candidate)) {
      targetFile = candidate;
      break;
    }
  }

  const isFirstTime = !targetFile;
  if (isFirstTime) {
    console.log(` [Phát hiện] Dự án chưa có harness.config.json.`);
    console.log(`  -> Đang tự động quét mã nguồn và khởi tạo bộ kịch bản ban đầu...`);
  } else {
    console.log(` [Phát hiện] Dự án đã có ${path.basename(targetFile)}.`);
    console.log(`  -> Đang kiểm tra xem có route hoặc endpoint mới nào chưa được đồng bộ không...`);
  }

  // Quét toàn bộ mã nguồn dự án
  const discovered = await autoDiscoverProject(rootDir);

  // Đồng bộ vào file config
  syncDiscoveredToConfig(rootDir, discovered);

  // Đọc lại config sau khi đồng bộ
  const configFile = targetFile || path.join(rootDir, 'harness.config.json');
  const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

  const stats = {
    isFirstTime,
    configFile,
    totalRoutes: config.browser?.routes?.length || 0,
    totalFlows: config.browser?.flows?.length || 0,
    totalSockets: config.realtime?.scenarios?.length || 0,
    totalConcurrency: config.concurrency?.scenarios?.length || 0
  };

  console.log(`------------------------------------------------------`);
  console.log(` TRẠNG THÁI SẴN SÀNG CỦA HARNESS:`);
  console.log(`  • Routes giao diện đã đồng bộ: ${stats.totalRoutes} trang`);
  console.log(`  • Kịch bản UI Flow người dùng : ${stats.totalFlows} flows`);
  console.log(`  • Cổng Realtime Socket      : ${stats.totalSockets} scenarios`);
  console.log(`  • Kịch bản Concurrency/Lock  : ${stats.totalConcurrency} scenarios`);
  console.log(`------------------------------------------------------\n`);

  return stats;
}
