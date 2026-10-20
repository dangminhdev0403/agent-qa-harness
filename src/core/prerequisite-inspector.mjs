import { partitionRoutesByModule } from './module-registry.mjs';

/**
 * Universal Prerequisite Inspector (Anti-Superficiality Gate)
 * Works for ANY project (E-commerce, SaaS, Hospitality, FinTech, CMS, etc.)
 *
 * Ensures tests NEVER run superficially against only public/unprotected routes
 * when deep features require authentication, database fixtures, or dynamic route mappings.
 *
 * If any prerequisite is missing, halts and requires asking the user before proceeding.
 */

/**
 * Extracts route parameters in both Next.js bracket style [param] and Express/React-Router colon style :param
 */
export function extractRouteParameters(routePath) {
  const params = [];
  const bracketMatches = routePath.match(/\[([a-zA-Z0-9_.]+)\]/g);
  if (bracketMatches) {
    for (const m of bracketMatches) {
      params.push({ match: m, name: m.replace(/[\[\].]/g, '') });
    }
  }
  const colonMatches = routePath.match(/:([a-zA-Z0-9_]+)/g);
  if (colonMatches) {
    for (const m of colonMatches) {
      params.push({ match: m, name: m.replace(/^:/, '') });
    }
  }
  return params;
}

export function inspectPrerequisites(config) {
  const missing = [];
  const routes = config.browser?.routes || [];
  const partitioned = partitionRoutesByModule(routes, config);

  // 1. Phân loại các routes yêu cầu đăng nhập (dựa trên module hoặc tiền tố đường dẫn)
  const protectedRoutes = [];
  for (const mod of Object.values(partitioned)) {
    if (mod.requiresAuth) {
      protectedRoutes.push(...mod.routes);
    }
  }

  // 2. Tìm tất cả các route chứa tham số động ([param] hoặc :param)
  const dynamicRoutes = routes.filter(r => {
    const pathStr = typeof r === 'string' ? r : (r.path || '');
    return (pathStr.includes('[') && pathStr.includes(']')) || /:[a-zA-Z0-9_]+/.test(pathStr);
  });

  // Kiểm tra tài khoản xác thực (Auth Wall)
  const hasCredentials =
    (config.authProvider?.enabled && (config.authProvider?.credentials?.username || config.authProvider?.credentials?.email)) ||
    (config.personas && Object.keys(config.personas).some(k => config.personas[k].auth || config.personas[k].credentials));

  const loginUrl = config.authProvider?.loginUrl || (routes.includes('/dangnhap') ? '/dangnhap' : '/login');

  if (protectedRoutes.length > 0 && !hasCredentials) {
    missing.push({
      type: 'AUTH_CREDENTIALS',
      title: 'Thiếu Tài Khoản Test (Bị chặn bởi Auth Guard)',
      description: `Dự án có ${protectedRoutes.length} route nội bộ yêu cầu phiên đăng nhập, nhưng chưa cấu hình tài khoản test trong harness.config.json.`,
      impact: `Nếu chạy ngay, trình duyệt sẽ bị redirect toàn bộ về trang đăng nhập (${loginUrl}) và không thể kiểm thử nghiệp vụ thực tế.`,
      actionRequired: 'Cần cung cấp tài khoản test tương ứng với các vai trò hoặc cấu hình authProvider trong harness.config.json.'
    });
  }

  // Kiểm tra tham số động URL (Dynamic Route Fixtures)
  const fixtures = config.fixtures || {};
  const missingFixtures = [];
  for (const dr of dynamicRoutes) {
    const pathStr = typeof dr === 'string' ? dr : (dr.path || '');
    const params = extractRouteParameters(pathStr);
    for (const { name } of params) {
      if (!fixtures[name] && !missingFixtures.includes(name)) {
        missingFixtures.push(name);
      }
    }
  }

  if (missingFixtures.length > 0) {
    missing.push({
      type: 'DYNAMIC_FIXTURES',
      title: 'Thiếu Bản Đồ Tham Số Động URL (Dynamic Fixtures)',
      description: `Phát hiện ${dynamicRoutes.length} route chứa tham số động (${missingFixtures.map(f => `[${f}] / :${f}`).join(', ')}), nhưng chưa có giá trị mẫu trong config.fixtures.`,
      impact: 'Nếu không thay thế, trình duyệt sẽ gửi request chứa chuỗi thô và nhận mã lỗi 404.',
      actionRequired: `Chạy 'agent-harness fixtures:mock' hoặc khai báo giá trị trong config.fixtures: { ${missingFixtures.map(f => `"${f}": "..."`).join(', ')} }.`
    });
  }

  return {
    isComplete: missing.length === 0,
    totalRoutes: routes.length,
    protectedRoutesCount: protectedRoutes.length,
    dynamicRoutesCount: dynamicRoutes.length,
    missing
  };
}

/**
 * Inspects prerequisites scoped to a specific module in ANY project
 */
export function inspectModulePrerequisites(config, moduleId, moduleDef) {
  const missing = [];
  const routes = moduleDef?.routes || [];

  // Check auth requirement for this module
  if (moduleDef?.requiresAuth) {
    const role = moduleDef.authRole || moduleDef.authType || moduleDef.role || "AUTHENTICATED_USER";
    const personaAuth = config.personas?.[moduleId]?.auth || config.personas?.[moduleId]?.credentials;
    const globalAuth = config.authProvider?.enabled && (config.authProvider?.credentials?.username || config.authProvider?.credentials?.email);

    if (!personaAuth && !globalAuth) {
      missing.push({
        type: 'MODULE_AUTH_MISSING',
        title: `Thiếu Thông Tin Xác Thực cho Module [${moduleDef.name}]`,
        description: `Module này yêu cầu vai trò '${role}'. Hiện chưa cấu hình tài khoản trong config.personas.${moduleId} hoặc config.authProvider.`,
        actionRequired: `Thêm tài khoản cho persona '${moduleId}' hoặc bật authProvider trong harness.config.json.`
      });
    }
  }

  // Check dynamic fixtures for this module
  const fixtures = config.fixtures || {};
  const missingFixtures = [];
  for (const r of routes) {
    const pathStr = typeof r === 'string' ? r : (r.path || '');
    const params = extractRouteParameters(pathStr);
    for (const { name } of params) {
      if (!fixtures[name] && !missingFixtures.includes(name)) {
        missingFixtures.push(name);
      }
    }
  }

  if (missingFixtures.length > 0) {
    missing.push({
      type: 'MODULE_FIXTURES_MISSING',
      title: `Thiếu Tham Số Động cho Module [${moduleDef.name}]`,
      description: `Module có route chứa tham số (${missingFixtures.map(f => `[${f}] / :${f}`).join(', ')}).`,
      actionRequired: `Chạy 'agent-harness fixtures:mock' hoặc khai báo trong config.fixtures.`
    });
  }

  return {
    isComplete: missing.length === 0,
    moduleId,
    moduleName: moduleDef?.name || moduleId,
    routesCount: routes.length,
    missing
  };
}

/**
 * Standard universal default mock fixture values (Extensible for all web apps)
 */
export const STANDARD_MOCK_FIXTURES = {
  // Generic Web / SaaS / E-commerce IDs
  id: "demo-id-101",
  userId: "usr-demo-01",
  orderId: "ord-demo-2026",
  invoiceId: "inv-demo-2026",
  itemId: "item-demo-01",
  productId: "prod-demo-01",
  slug: "demo-sample-slug",
  token: "demo-token-xyz",
  requestId: "req-demo-2026",
  // Hospitality & Service extensions
  hotelId: "HCA_HOMESTAY",
  qrCode: "DEMO_QR_ROOM_101"
};

/**
 * Universal dynamic route resolver: replaces [param] and :param with fixture values
 */
export function resolveDynamicRoute(routePath, fixtures = {}) {
  let resolved = routePath;
  const params = extractRouteParameters(routePath);
  for (const { match, name } of params) {
    const val = fixtures[name] || STANDARD_MOCK_FIXTURES[name] || `mock-${name}`;
    resolved = resolved.replace(match, val);
  }
  return resolved;
}
