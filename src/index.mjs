import { loadHarnessConfig } from './core/config-loader.mjs';
import { runStaticGates } from './drivers/static-runner.mjs';
import { runSocketProbe } from './drivers/socket-probe.mjs';
import { runConcurrencyGate } from './drivers/concurrency-gate.mjs';
import { runChromeScanner } from './drivers/chrome-scanner.mjs';
import { packageIncidentAndSummary } from './reporters/incident-packager.mjs';
import { generateMarkdownReport } from './reporters/markdown-reporter.mjs';

/**
 * Runs the complete 4-tier autonomous harness pipeline.
 * @param {object} options
 * @param {string} [options.cwd]
 * @param {string} [options.configPath]
 * @param {string} [options.tier]
 * @returns {Promise<{ overallPassed: boolean, summaryPath: string, reportFile: string }>}
 */
export async function executeHarness(options = {}) {
  const cwd = options.cwd || process.cwd();
  const config = loadHarnessConfig(cwd, options.configPath);

  console.log(`\n======================================================`);
  console.log(` AUTONOMOUS AGENT QA HARNESS: ${config.project.toUpperCase()}`);
  console.log(` Working Directory: ${config.rootDir}`);
  console.log(`======================================================`);

  let staticResults = { skipped: true, reason: 'Filtered by tier selector' };
  let realtimeResults = { skipped: true, reason: 'Filtered by tier selector' };
  let concurrencyResults = { skipped: true, reason: 'Filtered by tier selector' };
  let browserResults = { skipped: true, reason: 'Filtered by tier selector' };

  const targetTier = options.tier ? String(options.tier).toLowerCase() : null;

  if (!targetTier || targetTier === '0' || targetTier === 'static') {
    staticResults = await runStaticGates(config);
  }

  if (!targetTier || targetTier === '1' || targetTier === 'realtime' || targetTier === 'socket') {
    realtimeResults = await runSocketProbe(config);
  }

  if (!targetTier || targetTier === '2' || targetTier === 'concurrency') {
    concurrencyResults = await runConcurrencyGate(config);
  }

  if (!targetTier || targetTier === '3' || targetTier === 'browser' || targetTier === 'chrome') {
    browserResults = await runChromeScanner(config);
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
