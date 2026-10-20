#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { executeHarness } from '../src/index.mjs';

const args = process.argv.slice(2);
const command = args[0] || 'run';

function printHelp() {
  console.log(`
Agent QA Harness - Universal Testing Engine for AI Agents & Archon

Usage:
  agent-harness [command] [options]

Commands:
  run                  Run the configured testing harness (default)
  init                 Create a starter harness.config.json in the current directory
  probe:socket         Execute only Tier 1 (Realtime Socket Probe)
  probe:concurrency    Execute only Tier 2 (Concurrency & Idempotency Gate)
  probe:browser        Execute only Tier 3 (Chrome & Route Health)

Options:
  --config <path>      Path to custom harness.config.json
  --tier <0|1|2|3>     Execute a single specific tier
  --help, -h           Show this help message
`);
}

async function handleInit() {
  const target = path.resolve(process.cwd(), 'harness.config.json');
  if (fs.existsSync(target)) {
    console.error(` Error: harness.config.json already exists in ${process.cwd()}`);
    process.exit(1);
  }

  const samplePath = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '../templates/harness.config.sample.json');
  if (fs.existsSync(samplePath)) {
    fs.copyFileSync(samplePath, target);
  } else {
    const fallback = {
      project: path.basename(process.cwd()),
      baseUrl: "http://localhost:3000",
      static: { enabled: true, commands: [] },
      realtime: { enabled: false, scenarios: [] },
      concurrency: { enabled: false, scenarios: [] },
      browser: { enabled: false, routes: [] }
    };
    fs.writeFileSync(target, JSON.stringify(fallback, null, 2), 'utf8');
  }

  console.log(` Initialized harness.config.json successfully at: ${target}`);
}

async function main() {
  if (args.includes('--help') || args.includes('-h') || command === 'help') {
    printHelp();
    process.exit(0);
  }

  if (command === 'init') {
    await handleInit();
    process.exit(0);
  }

  let configPath = null;
  const configIdx = args.indexOf('--config');
  if (configIdx !== -1 && args[configIdx + 1]) {
    configPath = args[configIdx + 1];
  }

  let tier = null;
  const tierIdx = args.indexOf('--tier');
  if (tierIdx !== -1 && args[tierIdx + 1]) {
    tier = args[tierIdx + 1];
  } else if (command === 'probe:socket') {
    tier = '1';
  } else if (command === 'probe:concurrency') {
    tier = '2';
  } else if (command === 'probe:browser') {
    tier = '3';
  }

  try {
    const { overallPassed } = await executeHarness({
      cwd: process.cwd(),
      configPath,
      tier
    });

    process.exit(overallPassed ? 0 : 1);
  } catch (err) {
    console.error(`\n[FATAL] Harness execution failed: ${err.message}`);
    process.exit(1);
  }
}

main();
