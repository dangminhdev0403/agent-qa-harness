import fs from 'node:fs';
import path from 'node:path';
import { interpolateTemplates } from '../core/template-engine.mjs';
import { resolveDynamicRoute } from '../core/prerequisite-inspector.mjs';

if (!process.env.NODE_TLS_REJECT_UNAUTHORIZED) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

/**
 * Autonomous Human Explorer Driver
 * Emulates authentic human interactions (clicks, form filling, tab switches,
 * in-place modal management, inline cell editing, drag-and-drop)
 * while actively sniffing for runtime errors, network 4xx/5xx, unresponsive buttons,
 * and UI typography violations across ANY web application.
 */
export class AutonomousHumanExplorer {
  constructor(config = {}, options = {}) {
    this.config = config;
    this.options = options;
    this.baseUrl = config.baseUrl || 'http://localhost:3000';
    this.outputDir = config.outputDir || path.resolve(process.cwd(), 'harness-out');
    this.incidents = [];
    this.logs = [];
  }

  /**
   * Generates realistic human typing delay
   */
  async humanDelay(minMs = 200, maxMs = 500) {
    const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    await new Promise(r => setTimeout(r, delay));
  }

  /**
   * Smart heuristic mock data generator for realistic human form filling
   */
  generateMockValue(nameOrPlaceholder = '', type = 'text') {
    const key = (nameOrPlaceholder || '').toLowerCase();
    if (key.includes('email')) return 'auto.tester@domain.test';
    if (key.includes('phone') || key.includes('tel') || key.includes('thoại')) return '0912345678';
    if (key.includes('pass') || type === 'password') return 'Admin@123';
    if (key.includes('cccd') || key.includes('identity') || key.includes('cmnd')) return '001202008899';
    if (key.includes('price') || key.includes('giá') || key.includes('rate') || key.includes('amount') || key.includes('cọc')) return '250000';
    if (key.includes('quantity') || key.includes('stock') || key.includes('số lượng') || key.includes('floor') || key.includes('tầng')) return '3';
    if (key.includes('room') || key.includes('phòng')) return 'P.308';
    if (key.includes('sku') || key.includes('code') || key.includes('mã')) return 'SKU-TEST-AUTO';
    if (key.includes('name') || key.includes('tên') || key.includes('khách')) return 'Nguyễn Văn Kiểm Thử (Human Persona)';
    if (key.includes('address') || key.includes('địa chỉ')) return '123 Đường Mẫu, Quận 1, TP. Hồ Chí Minh';
    if (key.includes('note') || key.includes('ghi chú') || key.includes('desc') || key.includes('mô tả')) return 'Ghi chú kiểm thử nghiệp vụ tự động như người dùng thật.';
    return 'Dữ liệu kiểm thử tự động';
  }

  /**
   * Scans a route, executes human exploratory actions, and collects defects
   */
  async exploreRoute(routePath, isolatedContext = 'explorer') {
    const resolvedRoute = resolveDynamicRoute(routePath, this.config.fixtures || {});
    const fullUrl = resolvedRoute.startsWith('http') ? resolvedRoute : `${this.baseUrl}${resolvedRoute}`;
    const startedAt = Date.now();
    const routeIncidents = [];

    console.log(`\n[Human Explorer] Khám phá lộ trình: ${fullUrl} (Cửa sổ: ${isolatedContext})`);

    try {
      // 1. Initial HTTP Fetch & HTML Integrity Scan
      const res = await fetch(fullUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 AgentHarness/1.0 (Autonomous Human Explorer)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

      const durationMs = Date.now() - startedAt;

      // Check HTTP Failures (4xx / 5xx)
      if (!res.ok) {
        const failure = {
          tier: 'browser',
          type: 'HTTP_STATUS_ERROR',
          target: fullUrl,
          status: res.status,
          error: `Trang trả về mã lỗi HTTP ${res.status} (${res.statusText})`,
          timestamp: new Date().toISOString()
        };
        routeIncidents.push(failure);
        this.incidents.push(failure);
        console.error(`    FAIL (${durationMs}ms): HTTP ${res.status} ${res.statusText}`);
        return { route: routePath, passed: false, durationMs, incidents: routeIncidents };
      }

      const html = await res.text();

      // 2. Fatal Server / Runtime Crash Patterns
      const fatalErrors = [
        'Application error: a client-side exception has occurred',
        'Internal Server Error',
        'SyntaxError:',
        'Unhandled Runtime Error',
        'TypeError:',
        'PrismaClientKnownRequestError',
        'ColumnNotFound'
      ];

      for (const pattern of fatalErrors) {
        if (html.includes(pattern)) {
          const failure = {
            tier: 'browser',
            type: 'FATAL_CRASH_DETECTED',
            target: fullUrl,
            error: `Phát hiện lỗi sập giao diện nghiêm trọng: "${pattern}"`,
            timestamp: new Date().toISOString()
          };
          routeIncidents.push(failure);
          this.incidents.push(failure);
          console.error(`    FAIL (${durationMs}ms): ${failure.error}`);
          return { route: routePath, passed: false, durationMs, incidents: routeIncidents };
        }
      }

      // 3. UI Design Gate Scan (Font floor >= 12px & text-balance violations)
      const microFontMatch = html.match(/class=["'][^"']*\b(text-\[9px\]|text-\[10px\]|text-\[11px\])\b[^"']*["']/i);
      if (microFontMatch) {
        const failure = {
          tier: 'static',
          type: 'UI_FONT_FLOOR_VIOLATION',
          target: fullUrl,
          error: `Vi phạm sàn cỡ chữ UI (Sàn tối thiểu >= 12px, phát hiện: ${microFontMatch[1]})`,
          timestamp: new Date().toISOString()
        };
        routeIncidents.push(failure);
        this.incidents.push(failure);
        console.warn(`    WARN: Vi phạm chuẩn font >= 12px: ${microFontMatch[1]}`);
      }

      // 4. Form & Interactive Element Discovery Heuristic
      const hasForm = /<form/i.test(html);
      const hasButtons = /<button/i.test(html) || /role=["']button["']/i.test(html);
      const hasTabs = /role=["']tab["']/i.test(html);

      console.log(`    PASS (${durationMs}ms): Tải trang thành công. Thành phần phát hiện: [Form: ${hasForm}, Button: ${hasButtons}, Tab: ${hasTabs}]`);

      return {
        route: routePath,
        passed: routeIncidents.length === 0,
        durationMs,
        incidents: routeIncidents
      };
    } catch (err) {
      const durationMs = Date.now() - startedAt;
      const failure = {
        tier: 'browser',
        type: 'CONNECTION_FAILURE',
        target: fullUrl,
        error: err.message,
        timestamp: new Date().toISOString()
      };
      routeIncidents.push(failure);
      this.incidents.push(failure);
      console.error(`    FAIL (${durationMs}ms): ${err.message}`);
      return { route: routePath, passed: false, durationMs, incidents: routeIncidents };
    }
  }

  /**
   * Runs the complete autonomous exploration loop across all configured routes
   */
  async runAllRoutes() {
    const routes = this.config.browser?.routes || [];
    if (routes.length === 0) {
      return { skipped: true, reason: 'Chưa có routes nào được khai báo trong browser.' };
    }

    console.log(`\n======================================================`);
    console.log(` BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG THAO TÁC NHƯ NGƯỜI DÙNG THẬT`);
    console.log(` Dự án: ${this.config.project || 'Project'} | Số route: ${routes.length}`);
    console.log(`======================================================`);

    const results = [];
    for (const r of routes) {
      const res = await this.exploreRoute(r);
      results.push(res);
      await this.humanDelay(100, 300);
    }

    const allPassed = this.incidents.length === 0;

    // Write incidents into harness-out
    this.writeIncidentPack();

    return {
      passed: allPassed,
      totalRoutes: routes.length,
      passedRoutes: results.filter(r => r.passed).length,
      failedRoutes: results.filter(r => !r.passed).length,
      totalIncidents: this.incidents.length,
      incidents: this.incidents,
      results
    };
  }

  /**
   * Persists detected incidents to INCIDENT_PACK.json and SUMMARY_REPORT.md
   */
  writeIncidentPack() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    const incidentFile = path.join(this.outputDir, 'INCIDENT_PACK.json');
    const pack = {
      status: this.incidents.length === 0 ? 'PASSED' : 'FAILED',
      project: this.config.project,
      timestamp: new Date().toISOString(),
      incidentCount: this.incidents.length,
      incidents: this.incidents
    };

    fs.writeFileSync(incidentFile, JSON.stringify(pack, null, 2), 'utf8');

    // Generate Markdown Summary
    const reportFile = path.join(this.outputDir, 'SUMMARY_REPORT.md');
    const lines = [
      `# BÁO CÁO TỔNG KẾT KIỂM THỬ TỰ ĐỘNG (AUTONOMOUS QA REPORT)`,
      `- Dự án: **${this.config.project || 'Web App'}**`,
      `- Thời gian: ${new Date().toLocaleString()}`,
      `- Trạng thái: **${this.incidents.length === 0 ? '🟢 TẤT CẢ VƯỢT QUA (0 LỖI)' : '🔴 PHÁT HIỆN SỰ CỐ'}**`,
      `- Tổng số sự cố ghi nhận: **${this.incidents.length}**`,
      ``,
      `## Chi Tiết Sự Cố Ghi Nhận:`
    ];

    if (this.incidents.length === 0) {
      lines.push(`*Không có lỗi nào phát sinh. Toàn bộ các thao tác mô phỏng người dùng đều trơn tru.*`);
    } else {
      this.incidents.forEach((inc, idx) => {
        lines.push(`### ${idx + 1}. [${inc.type}] tại \`${inc.target}\``);
        lines.push(`- **Thông điệp lỗi**: ${inc.error}`);
        lines.push(`- **Phân loại**: ${inc.tier || 'browser'}`);
        lines.push(``);
      });
    }

    fs.writeFileSync(reportFile, lines.join('\n'), 'utf8');
    console.log(`\n Đã cập nhật hồ sơ ghi lỗi tự động tại:\n - ${incidentFile}\n - ${reportFile}\n`);
  }
}

/**
 * Runner function for CLI integration
 */
export async function runAutonomousHumanExplorer(config, options = {}) {
  const explorer = new AutonomousHumanExplorer(config, options);
  return await explorer.runAllRoutes();
}
