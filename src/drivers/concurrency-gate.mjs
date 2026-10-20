/**
 * Universal Concurrency & Idempotency Gate Driver
 * Validates state transitions, prevents double-approvals, and tests race-condition invariants.
 */
export async function runConcurrencyGate(config) {
  if (!config.concurrency.enabled || config.concurrency.scenarios.length === 0) {
    return { skipped: true, reason: 'Concurrency testing is disabled or has no scenarios.' };
  }

  const results = [];
  console.log(`\n[Concurrency Gate] Starting execution of ${config.concurrency.scenarios.length} scenario(s)...`);

  for (const scenario of config.concurrency.scenarios) {
    const startedAt = Date.now();
    console.log(`  -> Running concurrency burst: "${scenario.name}" (${scenario.description || 'No description'})`);

    try {
      const outcome = await executeBurst(scenario, config.baseUrl);
      const durationMs = Date.now() - startedAt;
      results.push({
        scenario: scenario.name,
        passed: true,
        durationMs,
        details: outcome
      });
      console.log(`    PASS (${durationMs}ms): Status distribution: ${JSON.stringify(outcome.statusCounts)}`);
    } catch (err) {
      const durationMs = Date.now() - startedAt;
      results.push({
        scenario: scenario.name,
        passed: false,
        durationMs,
        error: err.message
      });
      console.error(`    FAIL (${durationMs}ms): ${err.message}`);
    }
  }

  const allPassed = results.every(r => r.passed);
  return {
    passed: allPassed,
    results,
    summary: `${results.filter(r => r.passed).length}/${results.length} scenarios passed`
  };
}

async function executeBurst(scenario, baseUrl) {
  const burstCount = scenario.concurrentBurst || 5;
  const url = scenario.url || `${baseUrl}${scenario.path || ''}`;
  const method = (scenario.method || 'POST').toUpperCase();
  const headers = {
    'Content-Type': 'application/json',
    ...(scenario.headers || {})
  };
  const body = scenario.body ? JSON.stringify(scenario.body) : undefined;

  // Prepare simultaneous request promises
  const promises = Array.from({ length: burstCount }, async (_, idx) => {
    const reqHeaders = { ...headers };
    // Optionally inject a client request id if configured
    if (scenario.injectRequestId) {
      reqHeaders['X-Client-Request-Id'] = `burst-${idx}-${Date.now()}`;
    }

    try {
      const res = await fetch(url, { method, headers: reqHeaders, body });
      const text = await res.text().catch(() => '');
      return { status: res.status, body: text.slice(0, 200) };
    } catch (fetchErr) {
      return { status: 0, error: fetchErr.message };
    }
  });

  // Fire all requests concurrently
  const responses = await Promise.all(promises);

  // Calculate status counts
  const statusCounts = {};
  for (const r of responses) {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  }

  // Verify invariants against scenario assertions
  const assert = scenario.assert || {};
  if (assert.expected200 !== undefined && (statusCounts[200] || 0) !== assert.expected200) {
    throw new Error(
      `Double-approval or race condition violation! Expected exactly ${assert.expected200} HTTP 200 response(s), but got ${statusCounts[200] || 0}. ` +
      `Distribution: ${JSON.stringify(statusCounts)}`
    );
  }

  if (assert.expectedConflictOrBad !== undefined) {
    const conflictOrBad = (statusCounts[409] || 0) + (statusCounts[400] || 0);
    if (conflictOrBad < assert.expectedConflictOrBad) {
      throw new Error(
        `Failed to reject duplicate requests! Expected at least ${assert.expectedConflictOrBad} HTTP 409/400 rejections, but got ${conflictOrBad}. ` +
        `Distribution: ${JSON.stringify(statusCounts)}`
      );
    }
  }

  return {
    totalBurst: burstCount,
    statusCounts,
    sampleResponses: responses.slice(0, 2)
  };
}
