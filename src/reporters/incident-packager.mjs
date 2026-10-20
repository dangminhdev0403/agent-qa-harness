import fs from 'node:fs';
import path from 'node:path';

/**
 * Packages all execution results into standard machine-readable artifacts.
 * If tests failed, generates an autonomous reproduction incident pack for AI Agents.
 */
export function packageIncidentAndSummary(allResults, config) {
  const outputDir = config.outputDir;
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

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

  // If failed, generate INCIDENT_PACK.json for autonomous AI remediation
  if (!overallPassed) {
    const incidentPack = {
      status: 'FAILED',
      project: config.project,
      timestamp: new Date().toISOString(),
      failedModules,
      failures: collectDetailedFailures(allResults),
      instructionsForAgent: [
        'Read this INCIDENT_PACK.json to identify the failing tier and scenario.',
        'Locate the affected file or gateway indicated in the failure details.',
        'Apply the targeted fix without modifying unrelated code or package.json.',
        'Re-run: agent-harness run to verify the fix.'
      ]
    };

    const incidentPath = path.join(outputDir, 'INCIDENT_PACK.json');
    fs.writeFileSync(incidentPath, JSON.stringify(incidentPack, null, 2), 'utf8');
    console.log(`\n Incident detected! Generated incident packet for Agent at: ${incidentPath}`);
  } else {
    const passPath = path.join(outputDir, 'PASSED.json');
    fs.writeFileSync(passPath, JSON.stringify({ status: 'PASSED', timestamp: new Date().toISOString() }, null, 2), 'utf8');
    console.log(`\n All gates passed with 0 errors! Summary saved at: ${summaryPath}`);
  }

  return { overallPassed, summaryPath };
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
      failures.push({ tier: 'browser', target: r.route, error: r.error });
    }
  }

  return failures;
}
