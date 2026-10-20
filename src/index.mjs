import { loadHarnessConfig } from './core/config-loader.mjs';
import { runStaticGates } from './drivers/static-runner.mjs';
import { runSocketProbe } from './drivers/socket-probe.mjs';
import { runConcurrencyGate } from './drivers/concurrency-gate.mjs';
import { runChromeScanner } from './drivers/chrome-scanner.mjs';
import { packageIncidentAndSummary } from './reporters/incident-packager.mjs';
import { generateMarkdownReport } from './reporters/markdown-reporter.mjs';

/**
 * Runs the autonomous harness pipeline under 2 distinct modes:
 * - 'code': Test code stability (typecheck, build, static gates, socket & concurrency)
 * - 'flow': Test interactive browser flows & Chrome DevTools UI
 * - 'all': Full dual-pass execution
 *
 * @param {object} options
 * @param {string} [options.cwd]
 * @param {string} [options.configPath]
 * @param {string} [options.tier]
 * @param {'code'|'flow'|'all'} [options.mode]
 * @returns {Promise<{ overallPassed: boolean, summaryPath: string, reportFile: string }>}
 */
export async function executeHarness(options = {}) {
  const cwd = options.cwd || process.cwd();
  const config = loadHarnessConfig(cwd, options.configPath);
  const mode = options.mode || 'all';

  console.log(`\n======================================================`);
  console.log(` AUTONOMOUS AGENT QA HARNESS: ${config.project.toUpperCase()}`);
  console.log(` Mode: ${mode.toUpperCase()} | Working Directory: ${config.rootDir}`);
  console.log(`======================================================`);

  let staticResults = { skipped: true, reason: 'Không nằm trong chế độ được chọn' };
  let realtimeResults = { skipped: true, reason: 'Không nằm trong chế độ được chọn' };
  let concurrencyResults = { skipped: true, reason: 'Không nằm trong chế độ được chọn' };
  let browserResults = { skipped: true, reason: 'Không nằm trong chế độ được chọn' };

  const targetTier = options.tier ? String(options.tier).toLowerCase() : null;

  // CHẾ ĐỘ 1: TEST CODE & ỔN ĐỊNH HỆ THỐNG (Static, Types, Sockets, Concurrency)
  if (mode === 'code' || mode === 'all') {
    if (!targetTier || targetTier === '0' || targetTier === 'static') {
      staticResults = await runStaticGates(config);
    }

    if (!targetTier || targetTier === '1' || targetTier === 'realtime' || targetTier === 'socket') {
      realtimeResults = await runSocketProbe(config);
    }

    if (!targetTier || targetTier === '2' || targetTier === 'concurrency') {
      concurrencyResults = await runConcurrencyGate(config);
    }
  }

  // CHẾ ĐỘ 2: TEST FLOW LUỒNG & GIAO DIỆN TRÌNH DUYỆT (Chrome DevTools / Browser Flows)
  if (mode === 'flow' || mode === 'all') {
    if (!targetTier || targetTier === '3' || targetTier === 'browser' || targetTier === 'chrome' || targetTier === 'flow') {
      browserResults = await runChromeScanner(config);
    }
  }

  const allResults = { staticResults, realtimeResults, concurrencyResults, browserResults };

  const { overallPassed, summaryPath } = packageIncidentAndSummary(allResults, config);
  const reportFile = generateMarkdownReport(allResults, config);

  return { overallPassed, summaryPath, reportFile };
}

export {
  loadHarnessConfig,
  runStaticGates,
  runSocketProbe,
  runConcurrencyGate,
  runChromeScanner,
  packageIncidentAndSummary,
  generateMarkdownReport
};
