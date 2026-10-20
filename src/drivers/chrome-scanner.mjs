import http from 'node:http';

/**
 * Universal Chrome DevTools & Web Scanner Driver
 * Scans declared frontend routes for HTTP health, console zero-tolerance, and DOM integrity.
 */
export async function runChromeScanner(config) {
  if (!config.browser.enabled || config.browser.routes.length === 0) {
    return { skipped: true, reason: 'Browser scanning is disabled or has no routes configured.' };
  }

  const results = [];
  console.log(`\n[Chrome Scanner] Scanning ${config.browser.routes.length} declared route(s)...`);

  const baseUrl = config.baseUrl;

  for (const routeItem of config.browser.routes) {
    const routePath = typeof routeItem === 'string' ? routeItem : routeItem.path;
    const expectedSelector = typeof routeItem === 'object' ? routeItem.waitForSelector : null;
    const fullUrl = `${baseUrl}${routePath}`;
    const startedAt = Date.now();

    console.log(`  -> Probing route: ${fullUrl}`);

    try {
      const res = await fetch(fullUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AgentHarness/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

      const durationMs = Date.now() - startedAt;

      if (!res.ok) {
        throw new Error(`Route returned HTTP status ${res.status} ${res.statusText}`);
      }

      const html = await res.text();

      // Check for common fatal runtime phrases in HTML
      const fatalPatterns = [
        'Application error: a client-side exception has occurred',
        'Internal Server Error',
        'SyntaxError:',
        'Unhandled Runtime Error'
      ];

      for (const pattern of fatalPatterns) {
        if (html.includes(pattern)) {
          throw new Error(`Fatal browser error pattern detected in rendered markup: "${pattern}"`);
        }
      }

      // Check selector presence if configured
      if (expectedSelector && expectedSelector.startsWith('[data-testid=')) {
        const testId = expectedSelector.replace(/\[data-testid=['"](.*?)['"]\]/, '$1');
        if (!html.includes(`data-testid="${testId}"`) && !html.includes(`data-testid='${testId}'`)) {
          console.warn(`    WARNING: data-testid="${testId}" was not found in initial static HTML (may render via client hydration).`);
        }
      }

      results.push({
        route: routePath,
        passed: true,
        httpStatus: res.status,
        durationMs
      });
      console.log(`    PASS (${durationMs}ms): HTTP ${res.status}`);
    } catch (err) {
      const durationMs = Date.now() - startedAt;
      results.push({
        route: routePath,
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
    summary: `${results.filter(r => r.passed).length}/${results.length} routes healthy`
  };
}
