/**
 * Universal Role-Based Module Registry for ANY Project
 * Supports:
 * 1. Explicit project-defined modules via `config.modules` in `harness.config.json`
 * 2. Hospitality / Hotel PMS preset auto-detection
 * 3. Universal framework-agnostic route clustering (SaaS, E-commerce, ERP, Portals, CMS)
 */

/**
 * Standard Hospitality Preset (Used when hotel/hospitality domain routes are detected)
 */
export const HOSPITALITY_MODULES_PRESET = {
  public: {
    id: "public",
    name: "Public & Onboarding",
    role: "Khách vãng lai / Chưa đăng nhập",
    description: "Trang chủ, Giới thiệu, Bảng giá, Đổi 6 ngôn ngữ, Validation Form Đăng nhập & Đăng ký",
    requiresAuth: false,
    patterns: [
      "/", "/trangchu", "/about", "/contact", "/gia", "/giai-phap",
      "/commerce", "/preview", "/tich-hop", "/dangnhap", "/register",
      "/login", "/finance", "/finance/*", "/localmate", "/localmate/*", "/cccd-mobile"
    ]
  },
  guest_os: {
    id: "guest_os",
    name: "Guest In-Room OS",
    role: "Khách lưu trú tại phòng (In-house Guest)",
    description: "Quét mã QR phòng, Yêu cầu vật dụng/dọn phòng, Đặt món ẩm thực tại phòng, Nhắn tin lễ tân 2 chiều",
    requiresAuth: true,
    authType: "qr_or_guest_jwt",
    patterns: ["/g", "/g/*"]
  },
  frontdesk: {
    id: "frontdesk",
    name: "Front Desk & Housekeeping Ops",
    role: "Lễ tân khách sạn & Điều phối buồng phòng (HOTEL_FRONTDESK)",
    description: "Bàn lễ tân, Điều phối yêu cầu phòng tức thì, Tiếp nhận/Hoàn thành dịch vụ, Gán phòng Check-in/Check-out",
    requiresAuth: true,
    authRole: "HOTEL_FRONTDESK",
    patterns: ["/staff", "/staff/*", "*/front-desk*", "*/requests*", "*/messages*"]
  },
  owner: {
    id: "owner",
    name: "Hotel Owner & Management",
    role: "Chủ khách sạn & Quản lý vận hành (TENANT_OWNER)",
    description: "Bảng điều khiển khách sạn, Sơ đồ phòng Tape Chart kéo thả, Khai báo tạm trú BCA, Đồng bộ kênh OTA, Hóa đơn & Folio",
    requiresAuth: true,
    authRole: "TENANT_OWNER",
    patterns: [
      "/owner", "/owner/*", "*/rooms*", "*/kbtt*", "*/channel-manager*",
      "*/billing*", "*/biometric*", "*/dashboard*", "*/settings*", "*/partners*"
    ]
  },
  marketplace: {
    id: "marketplace",
    name: "Partner Marketplace",
    role: "Đối tác cung ứng dịch vụ & Ẩm thực (SERVICE_STAFF)",
    description: "Quản trị danh mục dịch vụ menu, Xử lý đơn hàng đối tác, Cấu hình cửa hàng và Quyết toán doanh thu",
    requiresAuth: true,
    authRole: "SERVICE_STAFF",
    patterns: ["/service", "/service/*", "*/marketplace*"]
  },
  admin: {
    id: "admin",
    name: "Platform Super Admin",
    role: "Quản trị viên nền tảng cấp cao (SUPER_ADMIN)",
    description: "Quản lý danh sách khách sạn toàn hệ thống, Quản trị người dùng, Cấu hình ma trận phân quyền và vai trò RBAC",
    requiresAuth: true,
    authRole: "SUPER_ADMIN",
    patterns: ["/admin", "/admin/*"]
  }
};

export const HARNESS_MODULES = HOSPITALITY_MODULES_PRESET;

/**
 * Checks if a route path matches a pattern string
 * E.g. "/admin/*" matches "/admin" or "/admin/users"
 *      "*rooms*" matches "/hotels/123/rooms"
 */
export function matchesPattern(pathStr, pattern) {
  if (typeof pattern === 'function') return pattern(pathStr);
  if (pattern === pathStr) return true;

  if (pattern.startsWith('*/') && pattern.endsWith('*')) {
    const sub = pattern.slice(2, -1);
    return pathStr.includes(sub);
  }

  if (pattern.endsWith('/*')) {
    const prefix = pattern.slice(0, -2);
    return pathStr === prefix || pathStr.startsWith(`${prefix}/`);
  }

  if (pattern.startsWith('*')) {
    const suffix = pattern.slice(1);
    return pathStr.endsWith(suffix);
  }

  return pathStr === pattern;
}

/**
 * Checks if the route set belongs to a hospitality/hotel management project
 */
function isHospitalityProject(routes = []) {
  const hospitalityKeywords = ['/g/', '/owner', '/hotels', '/staff', '/tape-chart', '/kbtt'];
  return routes.some(r => {
    const p = typeof r === 'string' ? r : (r.path || '');
    return hospitalityKeywords.some(kw => p.includes(kw));
  });
}

/**
 * Infers Universal Framework-Agnostic Modules for ANY Web Application
 * (E-commerce, SaaS, EdTech, FinTech, CRM, CMS)
 */
export function inferUniversalModules(routes = [], personas = {}) {
  const modules = {
    public: {
      id: "public",
      name: "Public & Landing",
      role: "Khách vãng lai / Unauthenticated",
      description: "Trang chủ, Giới thiệu, Bảng giá, Tài liệu, Xác thực & Đăng nhập",
      requiresAuth: false,
      patterns: [
        "/", "/home", "/about", "/contact", "/pricing", "/faq", "/docs", "/docs/*",
        "/terms", "/privacy", "/login", "/register", "/signup", "/signin", "/auth/*",
        "/forgot-password", "/reset-password", "/blog", "/blog/*"
      ]
    },
    admin: {
      id: "admin",
      name: "System Administration",
      role: "Quản trị viên hệ thống (ADMIN)",
      description: "Quản trị nền tảng, Phân quyền, Giám sát hệ thống & Cấu hình máy chủ",
      requiresAuth: true,
      authRole: "ADMIN",
      patterns: ["/admin", "/admin/*", "/superadmin", "/superadmin/*", "/system", "/system/*", "/ops", "/ops/*"]
    },
    portal: {
      id: "portal",
      name: "User Workspace & Dashboard",
      role: "Người dùng đăng nhập (MEMBER / USER)",
      description: "Bảng điều khiển cá nhân, Cài đặt tài khoản, Đơn hàng, Hoá đơn & Không gian làm việc",
      requiresAuth: true,
      authRole: "USER",
      patterns: [
        "/dashboard", "/dashboard/*", "/app", "/app/*", "/account", "/account/*",
        "/profile", "/profile/*", "/settings", "/settings/*", "/orders", "/orders/*",
        "/billing", "/billing/*", "/workspace", "/workspace/*"
      ]
    },
    partner: {
      id: "partner",
      name: "Partner & Vendor Portal",
      role: "Đối tác / Nhà cung cấp (PARTNER / VENDOR)",
      description: "Quản trị gian hàng, Danh mục sản phẩm đối tác, Quyết toán doanh thu",
      requiresAuth: true,
      authRole: "VENDOR",
      patterns: [
        "/vendor", "/vendor/*", "/merchant", "/merchant/*", "/partner", "/partner/*",
        "/seller", "/seller/*", "/service", "/service/*"
      ]
    }
  };

  // If project declares custom personas, ensure a module exists for each persona
  if (personas && typeof personas === 'object') {
    for (const [key, p] of Object.entries(personas)) {
      if (!modules[key]) {
        modules[key] = {
          id: key,
          name: p.name || `Persona: ${key.toUpperCase()}`,
          role: p.role || key.toUpperCase(),
          description: p.description || `Module dành riêng cho vai trò ${key}`,
          requiresAuth: p.requiresAuth ?? true,
          authRole: p.role || key.toUpperCase(),
          patterns: [`/${key}`, `/${key}/*`]
        };
      }
    }
  }

  return modules;
}

/**
 * Normalizes user-defined modules from `harness.config.json`
 */
export function normalizeUserModules(userModules = {}) {
  const normalized = {};
  for (const [key, mod] of Object.entries(userModules)) {
    normalized[key] = {
      id: key,
      name: mod.name || key,
      role: mod.role || "USER",
      description: mod.description || `Module ${mod.name || key}`,
      requiresAuth: mod.requiresAuth ?? true,
      authRole: mod.authRole || mod.role,
      authType: mod.authType,
      patterns: Array.isArray(mod.routes) ? mod.routes : (mod.patterns || [`/${key}`, `/${key}/*`])
    };
  }
  return normalized;
}

/**
 * Gets active module definitions for the target project
 */
export function getProjectModules(config = {}) {
  // 1. Explicit user modules in harness.config.json
  if (config.modules && Object.keys(config.modules).length > 0) {
    return normalizeUserModules(config.modules);
  }

  // 2. Hospitality preset if hotel routes detected
  const routes = config.browser?.routes || [];
  if (isHospitalityProject(routes)) {
    return HOSPITALITY_MODULES_PRESET;
  }

  // 3. Framework-agnostic universal clustering
  return inferUniversalModules(routes, config.personas);
}

/**
 * Universal Route Partitioning for ANY Web Project
 * Dynamically assigns routes into their designated modules.
 */
export function partitionRoutesByModule(routes = [], config = {}) {
  const activeModules = getProjectModules(config);
  const partitioned = {};

  for (const modKey of Object.keys(activeModules)) {
    partitioned[modKey] = {
      ...activeModules[modKey],
      routes: []
    };
  }

  for (const r of routes) {
    const pathStr = typeof r === 'string' ? r : (r.path || '');
    let matched = false;

    for (const modKey of Object.keys(activeModules)) {
      const patterns = activeModules[modKey].patterns || [];
      const isMatch = patterns.some(p => matchesPattern(pathStr, p));
      if (isMatch) {
        partitioned[modKey].routes.push(pathStr);
        matched = true;
        break;
      }
    }

    // Heuristic fallback for unassigned routes
    if (!matched) {
      if (pathStr.startsWith('/admin')) {
        if (partitioned.admin) partitioned.admin.routes.push(pathStr);
      } else if (pathStr.startsWith('/owner') || pathStr.startsWith('/hotels') || pathStr.startsWith('/dashboard') || pathStr.startsWith('/app')) {
        const fallbackTarget = partitioned.owner || partitioned.portal || partitioned.public;
        if (fallbackTarget) fallbackTarget.routes.push(pathStr);
      } else {
        if (partitioned.public) {
          partitioned.public.routes.push(pathStr);
        } else {
          const firstKey = Object.keys(partitioned)[0];
          if (firstKey) partitioned[firstKey].routes.push(pathStr);
        }
      }
    }
  }

  return partitioned;
}

