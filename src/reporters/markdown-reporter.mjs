import fs from 'node:fs';
import path from 'node:path';

/**
 * Formats results into a clean terminal report and writes HARNESS_REPORT.md
 */
export function generateMarkdownReport(allResults, config) {
  const { staticResults, realtimeResults, concurrencyResults, browserResults } = allResults;
  const outputDir = config.outputDir;

  const rows = [];
  rows.push(`| Tier | Module | Status | Summary |`);
  rows.push(`| :--- | :--- | :---: | :--- |`);

  rows.push(formatRow('Tier 0', 'Static & Contracts', staticResults));
  rows.push(formatRow('Tier 1', 'Realtime Socket Probe', realtimeResults));
  rows.push(formatRow('Tier 2', 'Concurrency & Idempotency', concurrencyResults));
  rows.push(formatRow('Tier 3', 'Browser & Route Health', browserResults));

  let reportOnlySection = '';
  const incidentPackPath = path.join(outputDir, 'INCIDENT_PACK.json');
  if (fs.existsSync(incidentPackPath)) {
    try {
      const pack = JSON.parse(fs.readFileSync(incidentPackPath, 'utf8'));
      if (pack.reportOnlyDossiers && pack.reportOnlyDossiers.length > 0) {
        reportOnlySection = `\n---\n\n## 🚨 Sự Cố Báo Cáo Chuyên Sâu (Report-Only Incidents - Không Tự Sửa)\n\nPhát hiện **${pack.reportOnlyDossiers.length}** lỗi thuộc phạm vi kiến trúc bảo mật RBAC hoặc Schema Database. Agent tuân thủ nguyên tắc không can thiệp DB:\n\n` +
          pack.reportOnlyDossiers.map((d, i) =>
            `### ${i + 1}. [${d.category}] ${d.categoryTitle}\n` +
            `- **Mục tiêu / Route**: \`${d.target}\`\n` +
            `- **Nguyên nhân gốc rễ**: ${d.rootCause}\n` +
            `- **Lý do không tự sửa**: ${d.nonFixReason}\n` +
            `- **Giải pháp đề xuất cho DBA/Dev**: ${d.remediationSuggestion}\n`
          ).join('\n');
      }
    } catch (e) {
      // ignore json parse error
    }
  }

  const md = `# Automated QA Harness Execution Report

- **Project**: \`${config.project}\`
- **Timestamp**: \`${new Date().toISOString()}\`
- **Base URL**: \`${config.baseUrl}\`

## Executive Summary

${rows.join('\n')}

---

## Detailed Results

### 1. Static & Contract Gates
${formatDetails(staticResults)}

### 2. Realtime Socket Scenarios
${formatDetails(realtimeResults)}

### 3. Concurrency & State Invariants
${formatDetails(concurrencyResults)}

### 4. Browser Route Health
${formatDetails(browserResults)}
${reportOnlySection}
`;

  const reportFile = path.join(outputDir, 'HARNESS_REPORT.md');
  fs.writeFileSync(reportFile, md, 'utf8');

  // Print summary to console
  console.log(`\n======================================================`);
  console.log(`             HARNESS EXECUTION SUMMARY                `);
  console.log(`======================================================`);
  console.log(`Project:  ${config.project}`);
  console.log(`Base URL: ${config.baseUrl}`);
  console.log(`------------------------------------------------------`);
  for (const r of rows.slice(2)) {
    console.log(r);
  }
  console.log(`======================================================\n`);

  return reportFile;
}

function formatRow(tier, name, result) {
  if (!result || result.skipped) {
    return `| ${tier} | ${name} |  SKIPPED | ${result?.reason || 'Disabled'} |`;
  }
  if (result.passed) {
    return `| ${tier} | ${name} |  PASSED | ${result.summary || 'All OK'} |`;
  }
  return `| ${tier} | ${name} |  FAILED | ${result.summary || 'Errors detected'} |`;
}

function formatDetails(result) {
  if (!result || result.skipped) return `*Skipped: ${result?.reason || 'Disabled in configuration'}*`;
  if (!result.results || result.results.length === 0) return `*No individual test cases recorded.*`;

  return result.results.map(r => {
    const icon = r.passed ? '' : '';
    const label = r.name || r.scenario || r.route || 'Item';
    const duration = r.durationMs ? `(${r.durationMs}ms)` : '';
    const err = r.error ? `\n  - Error: \`${r.error}\`` : '';
    return `- ${icon} **${label}** ${duration}${err}`;
  }).join('\n');
}
