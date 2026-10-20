import fs from 'node:fs';
import path from 'node:path';
import { IsolationManager } from '../core/isolation-manager.mjs';

/**
 * Packages all execution results into standard machine-readable artifacts.
 * If tests failed, generates an autonomous reproduction incident pack for AI Agents
 * with built-in Anti-Infinite-Loop Circuit Breaker and Branch Isolation suggestions.
 * 
 * Classifies failures into:
 * - AUTO_FIXABLE: CSS, font floor, text-balance, responsive, broken click handlers, DTO key mismatches.
 * - REPORT_ONLY: Database schema mismatches (Prisma P2022, ColumnNotFound), foreign key issues, RBAC policy guards.
 */
export function packageIncidentAndSummary(allResults, config) {
  const outputDir = config.outputDir;
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const isolationManager = new IsolationManager(config.rootDir, outputDir);
  const { staticResults, realtimeResults, concurrencyResults, browserResults } = allResults;

  const failedModules = [];
  if (staticResults && !staticResults.skipped && !staticResults.passed) failedModules.push('static');
  if (realtimeResults && !realtimeResults.skipped && !realtimeResults.passed) failedModules.push('realtime');
  if (concurrencyResults && !concurrencyResults.skipped && !concurrencyResults.passed) failedModules.push('concurrency');
  if (browserResults && !browserResults.skipped && !browserResults.passed) failedModules.push('browser');

  const overallPassed = failedModules.length === 0;

  const summary = {
    project: config.project,
    timestamp: new Date().toISOString(),
    overallPassed,
    failedModules,
    tiers: {
      tier0_static: staticResults,
      tier1_realtime: realtimeResults,
      tier2_concurrency: concurrencyResults,
      tier3_browser: browserResults
    }
  };

  // Write harness-summary.json
  const summaryPath = path.join(outputDir, 'harness-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');

  // If passed, reset the circuit breaker and release locks
  if (overallPassed) {
    isolationManager.resetRemediationState();
    isolationManager.releaseLock();

    const passPath = path.join(outputDir, 'PASSED.json');
    fs.writeFileSync(passPath, JSON.stringify({ status: 'PASSED', timestamp: new Date().toISOString() }, null, 2), 'utf8');
    console.log(`\n All gates passed with 0 errors! Summary saved at: ${summaryPath}`);
    return { overallPassed: true, summaryPath };
  }

  // If failed, collect detailed failures & evaluate Circuit Breaker
  const rawFailures = collectDetailedFailures(allResults);
  const classifiedFailures = rawFailures.map(f => classifyIncident(f));
  
  const autoFixable = classifiedFailures.filter(f => f.canAutoFix);
  const reportOnlyDossiers = classifiedFailures.filter(f => !f.canAutoFix);

  const failureSignature = classifiedFailures.map(f => `${f.tier}:${f.target}:${f.category}`).join('|') || 'generic-failure';
  const circuitCheck = isolationManager.checkCircuitBreaker(failureSignature, config.maxRemediationAttempts || 3);

  const incidentPack = {
    status: circuitCheck.tripped ? 'BLOCKED_CIRCUIT_BREAKER' : 'FAILED',
    project: config.project,
    timestamp: new Date().toISOString(),
    failedModules,
    attemptCount: circuitCheck.count,
    maxAllowedAttempts: config.maxRemediationAttempts || 3,
    circuitBreakerTripped: circuitCheck.tripped,
    failures: classifiedFailures,
    autoFixableCount: autoFixable.length,
    reportOnlyCount: reportOnlyDossiers.length,
    reportOnlyDossiers,
    branchIsolationRecommended: true,
    suggestedBranch: `harness-fix/${failedModules[0] || 'fix'}-${Date.now()}`,
    instructionsForAgent: circuitCheck.tripped
      ? [
          'DỪNG VÒNG LẶP SỬA CODE NGAY LẬP TỨC! Đã vượt quá số lần thử cho phép (3 lần).',
          'Không tiếp tục sửa đổi mù quáng để tránh làm hỏng mã nguồn hoặc xung đột với agent khác.',
          'Báo cáo rõ nguyên nhân bế tắc cho User để cùng xem xét kiến trúc/logic.'
        ]
      : [
          `Lần thử sửa đổi hiện tại: ${circuitCheck.count}/${config.maxRemediationAttempts || 3}.`,
          'PHÂN ĐỊNH RANH GIỚI: Tuyệt đối KHÔNG tự động sửa các lỗi thuộc nhóm reportOnlyDossiers (Lỗi Database, RBAC).',
          'Chỉ được phép sửa các lỗi thuộc nhóm autoFixable (UI copywriting, DTO binding, click handlers, styling).',
          'Lập Báo cáo Sự cố Chuyên sâu cho các lỗi Database/RBAC gửi cho Quản trị viên / DBA.'
        ]
  };

  const incidentPath = path.join(outputDir, 'INCIDENT_PACK.json');
  fs.writeFileSync(incidentPath, JSON.stringify(incidentPack, null, 2), 'utf8');

  // If report-only incidents exist, write dedicated NON_FIXABLE_INCIDENTS.md
  if (reportOnlyDossiers.length > 0) {
    const nonFixablePath = path.join(outputDir, 'NON_FIXABLE_INCIDENTS.md');
    fs.writeFileSync(nonFixablePath, generateNonFixableMarkdown(reportOnlyDossiers, config), 'utf8');
    console.log(`\n📋 Phát hiện ${reportOnlyDossiers.length} sự cố thuộc diện BÁO CÁO (Không được tự sửa). Chi tiết tại: ${nonFixablePath}`);
  }

  if (circuitCheck.tripped) {
    console.error(`\n❌ ${circuitCheck.message}`);
  } else {
    console.log(`\n Incident detected! Generated incident packet (Lần ${circuitCheck.count}/3) tại: ${incidentPath}`);
  }

  return { overallPassed: false, summaryPath, circuitBreakerTripped: circuitCheck.tripped, reportOnlyDossiers };
}

/**
 * Classifies an incident as AUTO_FIXABLE vs REPORT_ONLY
 */
export function classifyIncident(failure) {
  const errText = `${failure.error || ''} ${failure.stderr || ''} ${failure.target || ''}`.toLowerCase();

  // 1. Database Schema Mismatch & Prisma Error Classification
  if (
    errText.includes('prismaclientknownrequesterror') ||
    errText.includes('columnnotfound') ||
    errText.includes('p2022') ||
    errText.includes('p2003') ||
    errText.includes('p2002') ||
    errText.includes('does not exist in the current database') ||
    errText.includes('column') && errText.includes('does not exist') ||
    errText.includes('relation') && errText.includes('does not exist') ||
    errText.includes('table') && errText.includes('does not exist') ||
    errText.includes('yêu cầu cơ sở dữ liệu thất bại')
  ) {
    // Extract column or table if possible
    let missingEntity = 'Database Schema / Table';
    const colMatch = errText.match(/column [`"']?([^`"']+)`? does not exist/i);
    if (colMatch) {
      missingEntity = `Cột '${colMatch[1]}' chưa tồn tại trong Database`;
    }

    return {
      ...failure,
      canAutoFix: false,
      category: 'REPORT_ONLY_DATABASE',
      categoryTitle: 'Lỗi Cơ Sở Dữ Liệu / Thiếu Migration (Database Schema Mismatch)',
      rootCause: missingEntity,
      nonFixReason: 'Nguyên tắc Bất Biến Zero-DB-Tampering: Test Agent chỉ kiểm thử UI, TUYỆT ĐỐI CẤM tự ý chạy migration, sửa schema hoặc thay đổi bảng dữ liệu để tránh làm sai lệch dữ liệu sản xuất.',
      remediationSuggestion: 'Yêu cầu Developer hoặc DBA chạy lệnh: `pnpm prisma migrate deploy` hoặc bổ sung cột thiếu bằng câu lệnh SQL `ALTER TABLE ...`.'
    };
  }

  // 2. RBAC & Security Permission Guards
  if (
    errText.includes('403 forbidden') ||
    errText.includes('forbiddenexception') ||
    errText.includes('không có quyền truy cập') ||
    errText.includes('requirepermission') ||
    errText.includes('requireactiverole') ||
    errText.includes('bạn không thể quản lý khách sạn ngoài tenant')
  ) {
    return {
      ...failure,
      canAutoFix: false,
      category: 'REPORT_ONLY_RBAC',
      categoryTitle: 'Chính Sách Phân Quyền Bảo Mật (RBAC Guard Mismatch)',
      rootCause: 'Tài khoản hiện tại thiếu quyền hạn (permission) hoặc vai trò (role) được quy định bởi RBAC policy.',
      nonFixReason: 'Chính sách RBAC là chủ đích thiết kế bảo mật của hệ thống; nghiêm cấm gỡ bỏ guard @UseGuards() hoặc nâng quyền trái phép chỉ để qua mặt kiểm thử.',
      remediationSuggestion: 'Gán vai trò hoặc quyền hạn phù hợp cho tài khoản trong hệ thống quản trị, hoặc đăng nhập bằng tài khoản có quyền (xem account.json).'
    };
  }

  // 3. Default: Auto-fixable in-place by coding agent
  return {
    ...failure,
    canAutoFix: true,
    category: 'AUTO_FIXABLE',
    categoryTitle: 'Lỗi Giao Diện / Contract Frontend-Backend (Có Thể Tự Động Sửa)',
    rootCause: failure.error || 'Lỗi kiểm thử không phân loại',
    nonFixReason: null,
    remediationSuggestion: 'Coding Agent có thể tự động sửa mã nguồn giao diện, căn chỉnh font chữ >= 12px, sửa handler click, hoặc đồng bộ payload DTO.'
  };
}

function collectDetailedFailures(allResults) {
  const failures = [];

  if (allResults.staticResults?.results) {
    for (const r of allResults.staticResults.results.filter(x => !x.passed)) {
      failures.push({ tier: 'static', target: r.name, error: r.error, stderr: r.stderr });
    }
  }

  if (allResults.realtimeResults?.results) {
    for (const r of allResults.realtimeResults.results.filter(x => !x.passed)) {
      failures.push({ tier: 'realtime', target: r.scenario, error: r.error });
    }
  }

  if (allResults.concurrencyResults?.results) {
    for (const r of allResults.concurrencyResults.results.filter(x => !x.passed)) {
      failures.push({ tier: 'concurrency', target: r.scenario, error: r.error });
    }
  }

  if (allResults.browserResults?.results) {
    for (const r of allResults.browserResults.results.filter(x => !x.passed)) {
      failures.push({ tier: 'browser', target: r.route || r.flow, error: r.error });
    }
  }

  return failures;
}

function generateNonFixableMarkdown(dossiers, config) {
  const lines = [
    `# Báo Cáo Sự Cố Không Được Tự Sửa (Report-Only Incident Dossier)`,
    ``,
    `- **Dự án**: \`${config.project}\``,
    `- **Thời gian ghi nhận**: \`${new Date().toISOString()}\``,
    `- **Số lượng sự cố**: \`${dossiers.length}\``,
    ``,
    `> **Lưu ý quan trọng**: Các sự cố dưới đây thuộc nhóm **Bảo Mật RBAC** hoặc **Cơ Sở Dữ Liệu Schema**. Theo nguyên tắc an toàn kiến trúc, Test Agent **BẮT BUỘC BÁO CÁO**, nghiêm cấm tự ý can thiệp hoặc sửa đổi mã nguồn DB/RBAC.`,
    ``,
    `---`,
    ``
  ];

  dossiers.forEach((d, idx) => {
    lines.push(`### ${idx + 1}. [${d.category}] ${d.categoryTitle}`);
    lines.push(`- **Vị trí / Mục tiêu**: \`${d.target}\` (Tier: \`${d.tier}\`)`);
    lines.push(`- **Lỗi kỹ thuật**: \`${d.error}\``);
    lines.push(`- **Nguyên nhân gốc rễ**: ${d.rootCause}`);
    lines.push(`- **Lý do không tự động sửa**: ${d.nonFixReason}`);
    lines.push(`- **Hướng xử lý đề xuất cho DBA / Developer**: ${d.remediationSuggestion}`);
    lines.push(``);
  });

  return lines.join('\n');
}
