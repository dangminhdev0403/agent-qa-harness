import fs from 'node:fs';
import path from 'node:path';

export const DEFAULT_CONFIG_NAMES = [
  'harness.config.json',
  '.harness.json',
  'harness.json'
];

/**
 * Searches for and loads the harness configuration file.
 * @param {string} cwd - The directory to search in (defaults to process.cwd()).
 * @param {string|null} customPath - Optional path specified via CLI.
 * @returns {object} Parsed configuration object.
 */
export function loadHarnessConfig(cwd = process.cwd(), customPath = null) {
  let targetFile = null;

  if (customPath) {
    targetFile = path.isAbsolute(customPath) ? customPath : path.resolve(cwd, customPath);
    if (!fs.existsSync(targetFile)) {
      throw new Error(`[HarnessConfig] Config file not found at specified path: ${targetFile}`);
    }
  } else {
    for (const name of DEFAULT_CONFIG_NAMES) {
      const candidate = path.resolve(cwd, name);
      if (fs.existsSync(candidate)) {
        targetFile = candidate;
        break;
      }
    }
  }

  if (!targetFile) {
    throw new Error(
      `[HarnessConfig] Không tìm thấy file cấu hình trong ${cwd}. ` +
      `Hãy chạy 'agent-harness discover' hoặc 'agent-harness init'.`
    );
  }

  const raw = fs.readFileSync(targetFile, 'utf8');
  let config;
  try {
    config = JSON.parse(raw);
  } catch (err) {
    throw new Error(`[HarnessConfig] Malformed JSON in ${targetFile}: ${err.message}`);
  }

  return sanitizeConfig(config, path.dirname(targetFile));
}

function sanitizeConfig(config, rootDir) {
  return {
    project: config.project || path.basename(rootDir),
    rootDir,
    baseUrl: (config.baseUrl || 'http://localhost:3000').replace(/\/$/, ''),
    timeoutMs: config.timeoutMs || 30000,
    server: {
      autoStart: config.server?.autoStart ?? false,
      startCommand: config.server?.startCommand || null,
      timeoutMs: config.server?.timeoutMs || 25000,
      keepAlive: config.server?.keepAlive ?? false
    },
    preflight: {
      enabled: config.preflight?.enabled ?? true,
      retries: config.preflight?.retries || 3,
      delayMs: config.preflight?.delayMs || 1000,
      healthEndpoint: config.preflight?.healthEndpoint || ''
    },
    authProvider: {
      enabled: config.authProvider?.enabled ?? false,
      endpoint: config.authProvider?.endpoint || '/api/v1/auth/login',
      method: config.authProvider?.method || 'POST',
      credentials: config.authProvider?.credentials || {},
      tokenPath: config.authProvider?.tokenPath || 'accessToken'
    },
    static: {
      enabled: config.static?.enabled ?? true,
      commands: config.static?.commands || [
        ...(config.static?.uiGateCommand ? [{ name: 'UI Gate', cmd: config.static.uiGateCommand }] : []),
        ...(config.static?.contractCheckCommand ? [{ name: 'Contract Check', cmd: config.static.contractCheckCommand }] : []),
        ...(config.static?.typeCheckCommand ? [{ name: 'Type Check', cmd: config.static.typeCheckCommand }] : [])
      ]
    },
    realtime: {
      enabled: config.realtime?.enabled ?? false,
      provider: config.realtime?.provider || 'socket.io', // 'socket.io' | 'ws'
      scenarios: config.realtime?.scenarios || []
    },
    concurrency: {
      enabled: config.concurrency?.enabled ?? false,
      scenarios: config.concurrency?.scenarios || []
    },
    browser: {
      enabled: config.browser?.enabled ?? false,
      zeroConsoleErrors: config.browser?.zeroConsoleErrors ?? true,
      zeroNetworkErrors: config.browser?.zeroNetworkErrors ?? true,
      routes: config.browser?.routes || [],
      flows: config.browser?.flows || [],
      captureScreenshots: config.browser?.captureScreenshots ?? true,
      viewport: config.browser?.viewport || { width: 1440, height: 900 }
    },
    outputDir: path.resolve(rootDir, config.outputDir || 'harness-out')
  };
}
