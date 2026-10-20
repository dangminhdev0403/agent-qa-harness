import { runChromeFlows } from './chrome-flow-runner.mjs';

if (!process.env.NODE_TLS_REJECT_UNAUTHORIZED) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

/**
 * Universal Chrome DevTools & Web Scanner Driver
 * Scans declared frontend routes and executes interactive user action flows.
 */
export async function runChromeScanner(config, options = {}) {
  const hasRoutes = config.browser.routes && config.browser.routes.length > 0;
  const hasFlows = config.browser.flows && config.browser.flows.length > 0;

  if (!config.browser.enabled || (!hasRoutes && !hasFlows)) {
    return { skipped: true, reason: 'Browser scanning is disabled or has no routes/flows configured.' };
  }

  const results = [];
  const baseUrl = config.baseUrl;

  // 1. Quét các route cơ bản
  if (hasRoutes) {
    console.log(`\n[Chrome Scanner] Quét ${config.browser.routes.length} route tĩnh & kiểm tra lỗi HTTP...`);
    for (const routeItem of config.browser.routes) {
      const routePath = typeof routeItem === 'string' ? routeItem : routeItem.path;
      const fullUrl = `${baseUrl}${routePath}`;
      const startedAt = Date.now();

      console.log(`  -> Thăm dò route: ${fullUrl}`);

      try {
        const res = await fetch(fullUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 AgentHarness/1.0',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        });

        const durationMs = Date.now() - startedAt;
        if (!res.ok) {
          throw new Error(`Route trả về HTTP status ${res.status} ${res.statusText}`);
        }

        const html = await res.text();
        const fatalPatterns = [
          'Application error: a client-side exception has occurred',
          'Internal Server Error',
          'SyntaxError:',
          'Unhandled Runtime Error'
        ];

        for (const pattern of fatalPatterns) {
          if (html.includes(pattern)) {
            throw new Error(`Phát hiện lỗi vỡ giao diện nghiêm trọng: "${pattern}"`);
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
  }

  // 2. Chạy các kịch bản tương tác flows (nếu có)
  let flowSummary = null;
  if (hasFlows) {
    flowSummary = await runChromeFlows(config, options);
    if (flowSummary.results) {
      for (const fr of flowSummary.results) {
        results.push({
          flow: fr.flow,
          passed: fr.passed,
          durationMs: fr.durationMs,
          error: fr.error
        });
      }
    }
  }

  const allPassed = results.every(r => r.passed);
  return {
    passed: allPassed,
    results,
    summary: `${results.filter(r => r.passed).length}/${results.length} bài kiểm tra trình duyệt đạt chuẩn`
  };
}
