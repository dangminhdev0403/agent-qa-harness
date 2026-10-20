/**
 * Preflight Health & Port Waiter.
 * Verifies that the target application server is alive and accepting connections
 * before initiating test execution, eliminating mysterious connection refusal errors.
 */
export async function waitForServerReady(baseUrl, options = {}) {
  const maxRetries = options.retries || 3;
  const delayMs = options.delayMs || 1000;
  const healthEndpoint = options.healthEndpoint || '';
  const probeUrl = `${baseUrl.replace(/\/$/, '')}${healthEndpoint}`;

  console.log(`[Preflight Waiter] Kiểm tra kết nối tới máy chủ: ${probeUrl}...`);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(probeUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'User-Agent': 'AgentHarness/1.0 PreflightWaiter' }
      });

      clearTimeout(timer);

      // Server phản hồi bất kỳ HTTP status nào (kể cả 404/401/200) nghĩa là port đã mở và server đang chạy
      if (res.status > 0) {
        console.log(`  Máy chủ đã sẵn sàng (HTTP ${res.status}). Bắt đầu thực thi các Tier.\n`);
        return true;
      }
    } catch (err) {
      if (attempt < maxRetries) {
        console.log(`   (Lần ${attempt}/${maxRetries}) Chưa kết nối được. Thử lại sau ${delayMs}ms...`);
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
  }

  throw new Error(
    `[MÁY CHỦ CHƯA SẴN SÀNG] Không thể kết nối tới ${baseUrl}.\n` +
    `Nguyên nhân: Server dự án chưa được khởi động (Port chưa mở).\n` +
    `Cách xử lý: Vui lòng khởi động server (ví dụ: 'pnpm dev' hoặc 'npm run dev') trước khi chạy kiểm thử.`
  );
}
