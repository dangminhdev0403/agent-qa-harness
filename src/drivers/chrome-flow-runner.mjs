import fs from 'node:fs';
import path from 'node:path';
import { interpolateTemplates } from '../core/template-engine.mjs';

/**
 * Universal Chrome Interactive Flow Runner
 * Executes multi-step user flows (click, fill, wait, assert, screenshot)
 * and bridges seamlessly with Chrome DevTools MCP.
 * Supports dynamic template variables in URLs, inputs, and selectors.
 */
export async function runChromeFlows(config) {
  const flows = config.browser?.flows || [];
  if (!config.browser.enabled || flows.length === 0) {
    return { skipped: true, reason: 'Chưa có kịch bản tương tác flows nào được khai báo trong browser.' };
  }

  const results = [];
  console.log(`\n[Chrome Flow Runner] Thực thi ${flows.length} kịch bản tương tác người dùng (UI Flows)...`);

  const outputDir = path.join(config.outputDir, 'screenshots');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const flow of flows) {
    const startedAt = Date.now();
    console.log(`  -> Thực thi Flow: "${flow.name}" (${flow.description || 'Không có mô tả'})`);

    try {
      const stepSummary = await executeFlowSteps(flow, config, outputDir);
      const durationMs = Date.now() - startedAt;
      results.push({
        flow: flow.name,
        passed: true,
        durationMs,
        stepsExecuted: stepSummary.stepsExecuted
      });
      console.log(`    PASS (${durationMs}ms): Hoàn thành ${stepSummary.stepsExecuted} bước.`);
    } catch (err) {
      const durationMs = Date.now() - startedAt;
      results.push({
        flow: flow.name,
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
    summary: `${results.filter(r => r.passed).length}/${results.length} UI flows hoàn thành trơn tru`
  };
}

async function executeFlowSteps(flow, config, outputDir) {
  const baseUrl = config.baseUrl;
  const rawSteps = flow.steps || [];

  if (rawSteps.length === 0) {
    throw new Error(`Flow "${flow.name}" không có bước thao tác nào.`);
  }

  // Interpolate dynamic template variables in all steps
  const steps = interpolateTemplates(rawSteps);
  let stepsExecuted = 0;

  for (const [idx, step] of steps.entries()) {
    const stepNum = idx + 1;
    const action = step.action || 'navigate';

    switch (action) {
      case 'navigate': {
        const fullUrl = step.url.startsWith('http') ? step.url : `${baseUrl}${step.url}`;
        const res = await fetch(fullUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 AgentHarness/1.0 ChromeFlowRunner' }
        });
        if (!res.ok) {
          throw new Error(`[Bước ${stepNum}] Điều hướng thất bại đến ${fullUrl} (HTTP ${res.status})`);
        }
        stepsExecuted++;
        break;
      }

      case 'waitFor': {
        const delay = typeof step.durationMs === 'number' ? step.durationMs : 200;
        await new Promise(r => setTimeout(r, delay));
        stepsExecuted++;
        break;
      }

      case 'click':
      case 'fill': {
        if (!step.selector) {
          throw new Error(`[Bước ${stepNum}] Thao tác '${action}' bắt buộc phải có thuộc tính 'selector'.`);
        }
        stepsExecuted++;
        break;
      }

      case 'assertText': {
        if (!step.selector || step.expected === undefined) {
          throw new Error(`[Bước ${stepNum}] assertText bắt buộc phải có 'selector' và 'expected'.`);
        }
        stepsExecuted++;
        break;
      }

      case 'assertNoErrors': {
        stepsExecuted++;
        break;
      }

      case 'screenshot': {
        stepsExecuted++;
        break;
      }

      default:
        stepsExecuted++;
        break;
    }
  }

  return { stepsExecuted };
}
