/**
 * Prerequisite Inspector (Anti-Superficiality Gate)
 *
 * Ensures tests NEVER run superficially against only public/unprotected routes
 * when deep features require authentication, database fixtures, or dynamic route mappings.
 *
 * If any prerequisite is missing, halts and requires asking the user before proceeding.
 */
export function inspectPrerequisites(config) {
  const missing = [];

  const routes = config.browser?.routes || [];
  const protectedRoutes = routes.filter(r => {
    const pathStr = typeof r === 'string' ? r : (r.path || '');
    return (
      pathStr.startsWith('/owner') ||
      pathStr.startsWith('/hotels') ||
      pathStr.startsWith('/admin') ||
      pathStr.startsWith('/staff') ||
      pathStr.startsWith('/service') ||
      pathStr.startsWith('/finance')
    );
  });

  const dynamicRoutes = routes.filter(r => {
    const pathStr = typeof r === 'string' ? r : (r.path || '');
    return pathStr.includes('[') && pathStr.includes(']');
  });

  // 1. Kiểm tra tài khoản xác thực (Auth Wall)
  const hasCredentials =
    (config.authProvider?.enabled && config.authProvider?.credentials?.username) ||
    (config.personas && Object.keys(config.personas).some(k => config.personas[k].auth));

  if (protectedRoutes.length > 0 && !hasCredentials) {
    missing.push({
      type: 'AUTH_CREDENTIALS',
      title: 'Thiếu Tài Khoản Test (Bị chặn bởi Auth Guard)',
      description: `Dự án có ${protectedRoutes.length} route nội bộ yêu cầu phiên đăng nhập (/owner, /hotels, /admin, /staff), nhưng chưa cấu hình tài khoản test trong harness.config.json.`,
      impact: 'Nếu chạy ngay, trình duyệt sẽ bị redirect toàn bộ về /dangnhap và không thể kiểm thử nghiệp vụ thực tế.',
      actionRequired: 'Cần tài khoản test (Chủ khách sạn / Lễ tân / Admin) hoặc cho phép tạo seed tài khoản test cục bộ.'
    });
  }

  // 2. Kiểm tra tham số động URL (Dynamic Route Fixtures)
  const fixtures = config.fixtures || {};
  const missingFixtures = [];
  for (const dr of dynamicRoutes) {
    const pathStr = typeof dr === 'string' ? dr : (dr.path || '');
    const matches = pathStr.match(/\[([a-zA-Z0-9_]+)\]/g);
    if (matches) {
      for (const m of matches) {
        const param = m.replace(/[\[\]]/g, '');
        if (!fixtures[param] && !missingFixtures.includes(param)) {
          missingFixtures.push(param);
        }
      }
    }
  }

  if (missingFixtures.length > 0) {
    missing.push({
      type: 'DYNAMIC_FIXTURES',
      title: 'Thiếu Bản Đồ Tham Số Động URL (Dynamic Fixtures)',
      description: `Phát hiện ${dynamicRoutes.length} route chứa tham số động (${missingFixtures.map(f => `[${f}]`).join(', ')}), nhưng chưa có giá trị mẫu trong config.fixtures.`,
      impact: 'Nếu không thay thế, trình duyệt sẽ gửi request chứa chuỗi thô [param] và nhận mã lỗi 404.',
      actionRequired: `Cần khai báo ID mẫu trong harness.config.json: fixtures: { ${missingFixtures.map(f => `"${f}": "..."`).join(', ')} }.`
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
 * Resolves a route URL by substituting dynamic fixture parameters (e.g. [hotelId] -> HCA_HOMESTAY)
 */
export function resolveDynamicRoute(routePath, fixtures = {}) {
  let resolved = routePath;
  const matches = routePath.match(/\[([a-zA-Z0-9_]+)\]/g);
  if (matches) {
    for (const m of matches) {
      const param = m.replace(/[\[\]]/g, '');
      const value = fixtures[param] || `mock-${param}`;
      resolved = resolved.replace(m, value);
    }
  }
  return resolved;
}
