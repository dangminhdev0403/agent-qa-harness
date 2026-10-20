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
    mutationEndpoints: []
  };

  scanDirectory(rootDir, rootDir, discovered);

  console.log(`   Đã tìm thấy ${discovered.routes.length} route giao diện.`);
  console.log(`   Đã tìm thấy ${discovered.socketGateways.length} cổng realtime socket/gateway.`);
  console.log(`   Đã tìm thấy ${discovered.mutationEndpoints.length} endpoint nghiệp vụ quan trọng.\n`);

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
