/**
 * Canonical Module Registry for Role-Based QA Testing
 * Partitions the 87 routes into 6 distinct, autonomous domain modules.
 */
export const HARNESS_MODULES = {
  public: {
    id: "public",
    name: "Public & Onboarding",
    role: "Khách vãng lai / Chưa đăng nhập",
    description: "Trang chủ, Giới thiệu, Bảng giá, Đổi 6 ngôn ngữ, Validation Form Đăng nhập & Đăng ký",
    requiresAuth: false,
    routeMatcher: (path) => (
      path === '/' ||
      path === '/trangchu' ||
      path === '/about' ||
      path === '/contact' ||
      path === '/gia' ||
      path === '/giai-phap' ||
      path === '/commerce' ||
      path === '/preview' ||
      path === '/tich-hop' ||
      path === '/dangnhap' ||
      path === '/register'
    )
  },
  guest_os: {
    id: "guest_os",
    name: "Guest In-Room OS",
    role: "Khách lưu trú tại phòng (In-house Guest)",
    description: "Quét mã QR phòng, Yêu cầu vật dụng/dọn phòng, Đặt món ẩm thực tại phòng, Nhắn tin lễ tân 2 chiều",
    requiresAuth: true,
    authType: "qr_or_guest_jwt",
    routeMatcher: (path) => path.startsWith('/g/') || path === '/g'
  },
  frontdesk: {
    id: "frontdesk",
    name: "Front Desk & Housekeeping Ops",
    role: "Lễ tân khách sạn & Điều phối buồng phòng (HOTEL_FRONTDESK)",
    description: "Bàn lễ tân, Điều phối yêu cầu phòng tức thì, Tiếp nhận/Hoàn thành dịch vụ, Gán phòng Check-in/Check-out",
    requiresAuth: true,
    authRole: "HOTEL_FRONTDESK",
    routeMatcher: (path) => (
      path.startsWith('/staff') ||
      path.includes('/front-desk') ||
      (path.includes('/hotels/') && path.includes('/requests')) ||
      (path.includes('/hotels/') && path.includes('/messages'))
    )
  },
  owner: {
    id: "owner",
    name: "Hotel Owner & Management",
    role: "Chủ khách sạn & Quản lý vận hành (TENANT_OWNER)",
    description: "Bảng điều khiển khách sạn, Sơ đồ phòng Tape Chart kéo thả, Khai báo tạm trú BCA, Đồng bộ kênh OTA, Hóa đơn & Folio",
    requiresAuth: true,
    authRole: "TENANT_OWNER",
    routeMatcher: (path) => (
      path.startsWith('/owner') ||
      (path.includes('/hotels/') && (
        path.includes('/rooms') ||
        path.includes('/kbtt') ||
        path.includes('/channel-manager') ||
        path.includes('/billing') ||
        path.includes('/biometric') ||
        path.includes('/dashboard') ||
        path.includes('/settings') ||
        path.includes('/partners')
      ))
    )
  },
  marketplace: {
    id: "marketplace",
    name: "Partner Marketplace",
    role: "Đối tác cung ứng dịch vụ & Ẩm thực (SERVICE_STAFF)",
    description: "Quản trị danh mục dịch vụ menu, Xử lý đơn hàng đối tác, Cấu hình cửa hàng và Quyết toán doanh thu",
    requiresAuth: true,
    authRole: "SERVICE_STAFF",
    routeMatcher: (path) => path.startsWith('/service') || path.includes('/marketplace')
  },
  admin: {
    id: "admin",
    name: "Platform Super Admin",
    role: "Quản trị viên nền tảng cấp cao (SUPER_ADMIN)",
    description: "Quản lý danh sách khách sạn toàn hệ thống, Quản trị người dùng, Cấu hình ma trận phân quyền và vai trò RBAC",
    requiresAuth: true,
    authRole: "SUPER_ADMIN",
    routeMatcher: (path) => path.startsWith('/admin')
  }
};

/**
 * Categorizes an array of routes into the 6 canonical modules.
 */
export function partitionRoutesByModule(routes = []) {
  const partitioned = {};
  for (const modKey of Object.keys(HARNESS_MODULES)) {
    partitioned[modKey] = {
      ...HARNESS_MODULES[modKey],
      routes: []
    };
  }

  for (const r of routes) {
    const pathStr = typeof r === 'string' ? r : (r.path || '');
    let matched = false;
    for (const modKey of Object.keys(HARNESS_MODULES)) {
      if (HARNESS_MODULES[modKey].routeMatcher(pathStr)) {
        partitioned[modKey].routes.push(pathStr);
        matched = true;
        break;
      }
    }
    // Fallback nếu không khớp mẫu đặc biệt
    if (!matched) {
      if (pathStr.startsWith('/owner') || pathStr.startsWith('/hotels')) {
        partitioned.owner.routes.push(pathStr);
      } else {
        partitioned.public.routes.push(pathStr);
      }
    }
  }

  return partitioned;
}
