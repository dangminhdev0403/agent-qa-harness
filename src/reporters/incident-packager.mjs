import fs from 'node:fs';
import path from 'node:path';
import { IsolationManager } from '../core/isolation-manager.mjs';

/**
 * Packages all execution results into standard machine-readable artifacts.
 * If tests failed, generates an autonomous reproduction incident pack for AI Agents
 * with built-in Anti-Infinite-Loop Circuit Breaker and Branch Isolation suggestions.
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
  const failures = collectDetailedFailures(allResults);
  const failureSignature = failures.map(f => `${f.tier}:${f.target}`).join('|') || 'generic-failure';

  const circuitCheck = isolationManager.checkCircuitBreaker(failureSignature, config.maxRemediationAttempts || 3);

  const incidentPack = {
    status: circuitCheck.tripped ? 'BLOCKED_CIRCUIT_BREAKER' : 'FAILED',
    project: config.project,
    timestamp: new Date().toISOString(),
    failedModules,
    attemptCount: circuitCheck.count,
    maxAllowedAttempts: config.maxRemediationAttempts || 3,
    circuitBreakerTripped: circuitCheck.tripped,
    failures,
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
          'Nếu phát hiện đang có Agent khác làm việc, hãy tách nhánh: git checkout -b harness-fix/... để cô lập thay đổi.',
          'Đọc kịch bản lỗi trong danh sách failures bên dưới, sửa đúng file chỉ định.',
          'Chạy lại kiểm thử mục tiêu để xác nhận khắc phục.'
        ]
  };

  const incidentPath = path.join(outputDir, 'INCIDENT_PACK.json');
  fs.writeFileSync(incidentPath, JSON.stringify(incidentPack, null, 2), 'utf8');

  if (circuitCheck.tripped) {
    console.error(`\n❌ ${circuitCheck.message}`);
  } else {
    console.log(`\n Incident detected! Generated incident packet (Lần ${circuitCheck.count}/3) tại: ${incidentPath}`);
  }

  return { overallPassed: false, summaryPath, circuitBreakerTripped: circuitCheck.tripped };
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
