import fs from 'node:fs';
import path from 'node:path';

/**
 * Auto-discovers routes, socket gateways, and critical mutation endpoints
 * by scanning the target project's filesystem.
 */
export async function autoDiscoverProject(rootDir) {
  console.log(`\n[Auto-Discover] Đang tự động quét toàn bộ dự án tại: ${rootDir}...`);

  const discovered = {
    routes: [],
    socketGateways: [],
    mutationEndpoints: [],
    server: discoverServerConfig(rootDir)
  };

  scanDirectory(rootDir, rootDir, discovered);

  console.log(`   Đã tìm thấy ${discovered.routes.length} route giao diện.`);
  console.log(`   Đã tìm thấy ${discovered.socketGateways.length} cổng realtime socket/gateway.`);
  console.log(`   Đã tìm thấy ${discovered.mutationEndpoints.length} endpoint nghiệp vụ quan trọng.`);
  if (discovered.server) {
    console.log(`   Phát hiện máy chủ: ${discovered.server.baseUrl} (Lệnh start: "${discovered.server.startCommand}", Proxy: ${discovered.server.isPortless ? 'portless' : 'none'})\n`);
  }

  return discovered;
}

function scanDirectory(currentDir, rootDir, discovered, depth = 0) {
  if (depth > 6) return;

  const entries = fs.readdirSync(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);

    if (entry.isDirectory()) {
      // Bỏ qua các thư mục không liên quan
      if (['node_modules', '.git', '.next', 'dist', 'build', 'out', 'coverage', 'harness-out'].includes(entry.name)) {
        continue;
      }

      // Next.js App Router route discovery
      if (entry.name === 'app' || entry.name === 'pages' || entry.name === 'src') {
        scanRoutes(fullPath, rootDir, discovered);
      }

      scanDirectory(fullPath, rootDir, discovered, depth + 1);
    } else if (entry.isFile()) {
      // Phân tích file để tìm WebSocket gateway & mutation API
      if (/\.(ts|js|mjs|tsx|jsx)$/.test(entry.name) && !entry.name.includes('.spec.') && !entry.name.includes('.test.')) {
        analyzeSourceFile(fullPath, discovered);
      }
    }
  }
}

function scanRoutes(dir, rootDir, discovered) {
  try {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      const full = path.join(dir, file.name);
      if (file.isDirectory()) {
        if (!['components', '_components', 'hooks', 'libs', 'utils'].includes(file.name)) {
          scanRoutes(full, rootDir, discovered);
        }
      } else if (file.name === 'page.tsx' || file.name === 'page.jsx' || file.name === 'page.js') {
        let routePath = path.dirname(full).replace(/\\/g, '/');
        // Trích xuất path tương đối
        const appIndex = routePath.indexOf('/app');
        if (appIndex !== -1) {
          routePath = routePath.slice(appIndex + 4);
          // Loại bỏ route groups dạng (group)
          routePath = routePath.replace(/\/\(.*?\)/g, '');
          if (!routePath || routePath === '') routePath = '/';
          if (!discovered.routes.includes(routePath)) {
            discovered.routes.push(routePath);
          }
        }
      }
    }
  } catch {}
}

function analyzeSourceFile(filePath, discovered) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // 1. Tìm NestJS WebSocket Gateway hoặc Socket.io
    if (content.includes('@WebSocketGateway') || content.includes('io.of(') || content.includes('@SubscribeMessage')) {
      const gatewayMatch = content.match(/@WebSocketGateway\(([^)]*)\)/);
      const namespace = gatewayMatch ? gatewayMatch[1].replace(/['"{} ]/g, '').replace('namespace:', '') : '/';
      const eventMatches = [...content.matchAll(/@SubscribeMessage\(['"](.*?)['"]\)/g)];

      for (const m of eventMatches) {
        discovered.socketGateways.push({
          endpoint: namespace.startsWith('/') ? namespace : `/${namespace}`,
          event: m[1],
          sourceFile: path.basename(filePath)
        });
      }
    }

    // 2. Tìm các mutation nhạy cảm cần chống duyệt đúp / concurrency (approve, checkout, pay, refund)
    const mutationRegex = /@(Post|Put|Patch)\(['"](.*?(approve|confirm|checkout|pay|refund|cancel).*?)['"]\)/gi;
    let match;
    while ((match = mutationRegex.exec(content)) !== null) {
      discovered.mutationEndpoints.push({
        method: match[1].toUpperCase(),
        path: match[2].startsWith('/') ? match[2] : `/${match[2]}`,
        sourceFile: path.basename(filePath)
      });
    }
  } catch {}
}


/**
 * Inspects package.json files across root and submodules to detect
 * the exact start/dev scripts, portless domains, and ports.
 */
export function discoverServerConfig(rootDir) {
  const runner = fs.existsSync(path.join(rootDir, 'pnpm-lock.yaml')) ? 'pnpm' :
                 fs.existsSync(path.join(rootDir, 'yarn.lock')) ? 'yarn' : 'npm';

  const serverConfig = {
    baseUrl: "http://localhost:3000",
    startCommand: `${runner} run start`,
    devCommand: `${runner} run dev`,
    port: 3000,
    isPortless: false,
    appName: null
  };

  const packageJsonCandidates = [];
  const rootPkg = path.join(rootDir, 'package.json');
  if (fs.existsSync(rootPkg)) {
    packageJsonCandidates.push({ file: rootPkg, relDir: '.' });
  }

  const subDirs = ['frontends', 'services', 'apps', 'packages'];
  for (const sub of subDirs) {
    const fullSub = path.join(rootDir, sub);
    if (fs.existsSync(fullSub) && fs.statSync(fullSub).isDirectory()) {
      try {
        const items = fs.readdirSync(fullSub, { withFileTypes: true });
        for (const item of items) {
          if (item.isDirectory()) {
            const pkg = path.join(fullSub, item.name, 'package.json');
            if (fs.existsSync(pkg)) {
              packageJsonCandidates.push({ file: pkg, relDir: path.join(sub, item.name).replace(/\\/g, '/') });
            }
          }
        }
      } catch {}
    }
  }

  // Ưu tiên package.json của frontend hoặc web
  let targetPkg = packageJsonCandidates.find(p => p.relDir.includes('front') || p.relDir.includes('web') || p.relDir.includes('client'));
  if (!targetPkg && packageJsonCandidates.length > 0) {
    targetPkg = packageJsonCandidates.find(p => p.relDir !== '.') || packageJsonCandidates[0];
  }

  if (targetPkg) {
    try {
      const data = JSON.parse(fs.readFileSync(targetPkg.file, 'utf8'));
      const scripts = data.scripts || {};
      const startScript = scripts.start || '';
      const devScript = scripts.dev || '';
      const combined = `${startScript} ${devScript}`;

      // 1. Kiểm tra portless (ví dụ: portless vietsage --app-port 3000)
      const portlessMatch = combined.match(/portless\s+([a-zA-Z0-9_.-]+)/i);
      const portMatch = combined.match(/--app-port\s+(\d+)/i) || combined.match(/-p\s+(\d+)/i) || combined.match(/PORT=(\d+)/i);
      const port = portMatch ? parseInt(portMatch[1], 10) : 3000;

      if (portlessMatch) {
        const appName = portlessMatch[1];
        serverConfig.baseUrl = `https://${appName}.localhost`;
        serverConfig.isPortless = true;
        serverConfig.appName = appName;
        serverConfig.port = port;
      } else {
        serverConfig.baseUrl = `http://localhost:${port}`;
        serverConfig.port = port;
      }

      if (targetPkg.relDir === '.') {
        serverConfig.startCommand = scripts.start ? `${runner} run start` : `${runner} start`;
        serverConfig.devCommand = scripts.dev ? `${runner} run dev` : `${runner} dev`;
      } else {
        serverConfig.startCommand = scripts.start ? `${runner} --dir ${targetPkg.relDir} start` : `${runner} --dir ${targetPkg.relDir} run start`;
        serverConfig.devCommand = scripts.dev ? `${runner} --dir ${targetPkg.relDir} dev` : `${runner} --dir ${targetPkg.relDir} run dev`;
      }
    } catch {}
  }

  return serverConfig;
}
