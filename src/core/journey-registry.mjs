/**
 * Canonical Interactive Journey Registry
 * Defines end-to-end multi-role interactive user flows with concrete DOM actions
 * (Clicks, Typing, Inline Cell Edits, Modal Triggers, Tab Switching, Drag-and-Drop, State Assertions)
 * and closed-loop cross-persona business lifecycles.
 */

/**
 * Standard Canonical Account Catalog across VietSage & Hospitality Systems
 */
export const DOMAIN_ACCOUNT_CATALOGS = {
  hospitality: {
    GUEST: {
      role: "GUEST",
      title: "Khách Lưu Trú Phòng QR (Guest OS)",
      authRequired: false,
      entryUrl: "/g/DEMO_QR_ROOM_101",
      description: "Khách quét mã QR tại phòng, không cần tài khoản, tự động liên kết phiên phòng"
    },
    FRONTDESK: {
      role: "HOTEL_FRONTDESK",
      title: "Nhân Viên Lễ Tân (Frontdesk Operations)",
      authRequired: true,
      loginUrl: "/dangnhap",
      defaultUsername: "frontdesk@vietsage.vn",
      defaultPassword: "Admin@123",
      dashboardUrl: "/staff/front-desk",
      description: "Tiếp nhận yêu cầu dịch vụ buồng phòng, check-in, check-out, điều phối sơ đồ phòng"
    },
    HOUSEKEEPING: {
      role: "HOUSEKEEPING",
      title: "Nhân Viên Buồng Phòng (Housekeeping Staff)",
      authRequired: true,
      loginUrl: "/dangnhap",
      defaultUsername: "housekeeping@vietsage.vn",
      defaultPassword: "Admin@123",
      dashboardUrl: "/hotels/HCA_HOMESTAY/rooms",
      description: "Quản lý vệ sinh phòng, dọn phòng, xác nhận phòng sạch sẵn sàng đón khách (Room Ready)"
    },
    OWNER: {
      role: "TENANT_OWNER",
      title: "Chủ Khách Sạn & Quản Trị Khách Sạn (Hotel Owner / General Manager)",
      authRequired: true,
      loginUrl: "/dangnhap",
      defaultUsername: "thucvn@gmail.com",
      fallbackUsername: "tenant@vietsage.vn",
      defaultPassword: "Admin@123",
      dashboardUrl: "/owner/dashboard",
      description: "Quản lý tồn kho phòng, biểu giá ARI, kênh bán OTA (Channel Manager), báo cáo tài chính"
    },
    SUPER_ADMIN: {
      role: "SUPER_ADMIN",
      title: "Quản Trị Viên Nền Tảng (Platform Super Admin)",
      authRequired: true,
      loginUrl: "/dangnhap",
      defaultUsername: "admin@vietsage.vn",
      defaultPassword: "Admin@123",
      dashboardUrl: "/admin/dashboard",
      description: "Quản lý toàn bộ khách sạn, người dùng, quyền hạn hệ thống, cấu hình nền tảng"
    },
    SERVICE_STAFF: {
      role: "SERVICE_STAFF",
      title: "Nhân Viên Đối Tác Cung Ứng Dịch Vụ (Marketplace Service Staff)",
      authRequired: true,
      loginUrl: "/dangnhap",
      defaultUsername: "service@vietsage.vn",
      defaultPassword: "Admin@123",
      dashboardUrl: "/service/orders",
      description: "Tiếp nhận và xử lý các đơn đặt tour du lịch, thuê xe, ẩm thực đối tác từ khách sạn"
    }
  },
  ecommerce: {
    SHOPPER: {
      role: "SHOPPER",
      title: "Khách Mua Hàng Vãng Lai (Guest Shopper)",
      authRequired: false,
      entryUrl: "/shop",
      description: "Khách hàng duyệt danh mục, thêm vào giỏ hàng và tiến hành thanh toán"
    },
    CUSTOMER: {
      role: "CUSTOMER",
      title: "Khách Hàng Đăng Nhập (Registered Customer)",
      authRequired: true,
      loginUrl: "/dangnhap",
      defaultUsername: "customer@shop.test",
      defaultPassword: "Admin@123",
      dashboardUrl: "/account/orders",
      description: "Quản lý đơn hàng cá nhân, sổ địa chỉ, theo dõi lịch trình giao nhận"
    },
    MERCHANT: {
      role: "MERCHANT",
      title: "Nhà Bán Hàng & Đối Tác (Merchant / Seller)",
      authRequired: true,
      loginUrl: "/dangnhap",
      defaultUsername: "merchant@shop.test",
      defaultPassword: "Admin@123",
      dashboardUrl: "/vendor/orders",
      description: "Tiếp nhận đơn hàng mới, cập nhật mã vận đơn, quản lý tồn kho sản phẩm"
    },
    STORE_ADMIN: {
      role: "STORE_ADMIN",
      title: "Quản Trị Sàn Thương Mại (Store Platform Admin)",
      authRequired: true,
      loginUrl: "/dangnhap",
      defaultUsername: "admin@shop.test",
      defaultPassword: "Admin@123",
      dashboardUrl: "/admin/dashboard",
      description: "Cấu hình cổng thanh toán, chương trình khuyến mãi, quản trị toàn sàn"
    }
  },
  saas: {
    WORKSPACE_OWNER: {
      role: "WORKSPACE_OWNER",
      title: "Chủ Sở Hữu Tổ Chức (SaaS Workspace Owner)",
      authRequired: true,
      loginUrl: "/dangnhap",
      defaultUsername: "owner@saas.test",
      defaultPassword: "Admin@123",
      dashboardUrl: "/settings/billing",
      description: "Quản lý thuê bao Pro, quyết toán hóa đơn, mời thành viên và phân quyền"
    },
    TEAM_MEMBER: {
      role: "MEMBER",
      title: "Thành Viên Không Gian Làm Việc (Team Member)",
      authRequired: true,
      loginUrl: "/dangnhap",
      defaultUsername: "member@saas.test",
      defaultPassword: "Admin@123",
      dashboardUrl: "/workspace",
      description: "Tạo dự án mới, cập nhật bảng công việc, chia sẻ tài liệu cộng tác"
    },
    SUPER_ADMIN: {
      role: "SUPER_ADMIN",
      title: "Quản Trị Viên Nền Tảng SaaS (Platform Super Admin)",
      authRequired: true,
      loginUrl: "/dangnhap",
      defaultUsername: "admin@saas.test",
      defaultPassword: "Admin@123",
      dashboardUrl: "/admin",
      description: "Giám sát tenant, phân bổ hạn ngạch tài nguyên, kiểm soát an ninh hệ thống"
    }
  },
  crm: {
    CLIENT: {
      role: "CLIENT",
      title: "Khách Hàng Đặt Lịch (Client Portal)",
      authRequired: false,
      entryUrl: "/booking",
      description: "Khách hàng tự chọn chuyên viên, khung giờ hẹn và đổi lịch trực tiếp"
    },
    SALES_REP: {
      role: "SALES_REP",
      title: "Nhân Viên Kinh Doanh (Sales Representative)",
      authRequired: true,
      loginUrl: "/dangnhap",
      defaultUsername: "sales@crm.test",
      defaultPassword: "Admin@123",
      dashboardUrl: "/pipeline",
      description: "Tiếp cận khách tiềm năng, quản lý cơ hội và kéo thả phễu bán hàng Kanban"
    },
    SALES_MANAGER: {
      role: "SALES_MANAGER",
      title: "Trưởng Phòng Kinh Doanh & Vận Hành (Sales Manager)",
      authRequired: true,
      loginUrl: "/dangnhap",
      defaultUsername: "manager@crm.test",
      defaultPassword: "Admin@123",
      dashboardUrl: "/calendar",
      description: "Điều phối lịch chuyên viên, phê duyệt hợp đồng, theo dõi báo cáo doanh thu"
    }
  },
  generic: {
    USER: {
      role: "USER",
      title: "Người Dùng Tiêu Chuẩn (Standard Member)",
      authRequired: true,
      loginUrl: "/dangnhap",
      defaultUsername: "user@app.test",
      defaultPassword: "Admin@123",
      dashboardUrl: "/dashboard",
      description: "Thực hiện các thao tác CRUD cơ bản, xem danh sách, cập nhật hồ sơ"
    },
    ADMIN: {
      role: "ADMIN",
      title: "Quản Trị Viên Ứng Dụng (System Administrator)",
      authRequired: true,
      loginUrl: "/dangnhap",
      defaultUsername: "admin@app.test",
      defaultPassword: "Admin@123",
      dashboardUrl: "/admin",
      description: "Toàn quyền quản trị danh mục, người dùng, cài đặt hệ thống"
    }
  }
};

/**
 * Standard Canonical Account Catalog across All Domains
 */
export const CANONICAL_ACCOUNT_CATALOG = {
  ...DOMAIN_ACCOUNT_CATALOGS.hospitality,
  ...DOMAIN_ACCOUNT_CATALOGS.ecommerce,
  ...DOMAIN_ACCOUNT_CATALOGS.saas,
  ...DOMAIN_ACCOUNT_CATALOGS.crm,
  ...DOMAIN_ACCOUNT_CATALOGS.generic
};

/**
 * Resolve project-specific account catalog based on domain and config
 */
export function resolveAccountCatalog(domain = 'hospitality', config = {}) {
  const domainCatalog = DOMAIN_ACCOUNT_CATALOGS[domain] || DOMAIN_ACCOUNT_CATALOGS.generic;
  const projectPersonas = config.personas || {};
  return {
    ...domainCatalog,
    ...projectPersonas
  };
}

export const UNIVERSAL_INTERACTIVE_JOURNEYS = [
  // =========================================================================
  // JOURNEY 1: CLOSED-LOOP GUEST REQUEST LIFECYCLE (KHÉP KÍN VÒNG LẶP YÊU CẦU)
  // Khách gọi yêu cầu -> Lễ tân nhận WebSocket -> Lễ tân duyệt -> Khách thấy cập nhật
  // =========================================================================
  {
    id: "guest-frontdesk-closed-loop-flow",
    name: "Chu Trình Khép Kín Yêu Cầu Dịch Vụ Buồng Phòng (Guest -> Frontdesk Realtime Closed-Loop)",
    type: "CROSS_ROLE_LIFECYCLE",
    category: "REALTIME_OPS",
    description: "Khách quét mã QR phòng gửi yêu cầu khăn tắm -> Lễ tân nhận WebSocket bấm 'Tiếp nhận' -> Màn hình khách tự động cập nhật trạng thái 'Đang xử lý' -> Lễ tân bấm 'Hoàn thành' -> Khách thấy 'Đã hoàn thành'",
    rolesInvolved: ["GUEST", "HOTEL_FRONTDESK"],
    stages: [
      {
        stageIndex: 1,
        actor: "GUEST",
        title: "Khách Gửi Yêu Cầu Tại Phòng",
        account: CANONICAL_ACCOUNT_CATALOG.GUEST,
        startUrl: "/g/DEMO_QR_ROOM_101",
        steps: [
          {
            action: "navigate",
            url: "/g/DEMO_QR_ROOM_101",
            guide: "Mở trang chủ khách lưu trú theo mã QR phòng 101"
          },
          {
            action: "snapshot",
            guide: "Gọi take_snapshot(pageId) để lấy UID các nút điều hướng"
          },
          {
            action: "click",
            targetName: "Nút hoặc Link 'Dịch vụ buồng phòng'",
            selector: "a[href*='services'], button:has-text('Dịch vụ'), [data-testid='nav-services']",
            guide: "Click vào menu 'Dịch vụ' trên thanh điều hướng hoặc màn hình chính"
          },
          {
            action: "click",
            targetName: "Món dịch vụ 'Khăn tắm bổ sung' hoặc dịch vụ đầu tiên",
            selector: "button:has-text('Yêu cầu'), button:has-text('Đặt'), [data-testid='service-item'], .service-card",
            guide: "Click nút 'Yêu cầu' trên thẻ dịch vụ khăn tắm hoặc tiện ích phòng"
          },
          {
            action: "fill",
            targetName: "Ô nhập ghi chú yêu cầu",
            selector: "textarea, input[name='note'], input[name='description'], [data-testid='request-note']",
            value: "Yêu cầu 2 khăn tắm bổ sung cho phòng 101 (Kiểm thử nghiệp vụ tự động)",
            guide: "Nhập nội dung yêu cầu cụ thể vào ô ghi chú"
          },
          {
            action: "click",
            targetName: "Nút 'Gửi yêu cầu'",
            selector: "button[type='submit'], button:has-text('Gửi yêu cầu'), button:has-text('Xác nhận')",
            guide: "Click nút 'Gửi yêu cầu' để phát lệnh tạo đơn qua API"
          },
          {
            action: "assert_state",
            guide: "Xác nhận hiển thị mã đơn (ví dụ REQ-...) và trạng thái ban đầu là 'Chờ tiếp nhận'. Giữ nguyên cửa sổ khách để đón nhận tín hiệu cập nhật."
          }
        ]
      },
      {
        stageIndex: 2,
        actor: "HOTEL_FRONTDESK",
        title: "Lễ Tân Nhận Tín Hiệu & Bấm Tiếp Nhận",
        account: CANONICAL_ACCOUNT_CATALOG.FRONTDESK,
        startUrl: "/staff/front-desk",
        authSteps: [
          {
            action: "navigate",
            url: "/dangnhap",
            guide: "Truy cập trang đăng nhập hệ thống"
          },
          {
            action: "fill",
            targetName: "Ô Email / Tên đăng nhập",
            selector: "input[type='email'], input[name='username'], input[name='email']",
            value: "frontdesk@vietsage.vn",
            guide: "Điền tài khoản Lễ tân: frontdesk@vietsage.vn"
          },
          {
            action: "fill",
            targetName: "Ô Mật khẩu",
            selector: "input[type='password'], input[name='password']",
            value: "Admin@123",
            guide: "Điền mật khẩu Lễ tân: Admin@123"
          },
          {
            action: "click",
            targetName: "Nút Đăng nhập",
            selector: "button[type='submit'], button:has-text('Đăng nhập')",
            guide: "Click nút Đăng nhập và đợi chuyển hướng"
          }
        ],
        steps: [
          {
            action: "navigate",
            url: "/staff/front-desk",
            guide: "Điều hướng đến Bảng điều phối Lễ tân (/staff/front-desk)"
          },
          {
            action: "listen_realtime",
            guide: "Lắng nghe sự kiện WebSocket realtime 'request:created' và âm thanh chuông thông báo"
          },
          {
            action: "snapshot",
            guide: "Gọi take_snapshot(pageId) trên bảng điều phối để xác định thẻ yêu cầu mới của phòng 101"
          },
          {
            action: "click",
            targetName: "Thẻ yêu cầu phòng 101",
            selector: "[data-testid='request-card'], .request-item:has-text('101'), tr:has-text('101')",
            guide: "Click vào thẻ yêu cầu vừa tạo -> Xác nhận Drawer chi tiết mở trượt tại chỗ (In-Place Tab Isolation)"
          },
          {
            action: "click",
            targetName: "Nút 'Tiếp nhận'",
            selector: "button:has-text('Tiếp nhận'), button:has-text('Duyệt')",
            guide: "Click nút 'Tiếp nhận' để cập nhật trạng thái đơn hàng sang ĐANG XỬ LÝ"
          },
          {
            action: "assert_state",
            guide: "Xác nhận badge trạng thái chuyển sang 'Đang xử lý' màu xanh/vàng không cần reload trang"
          }
        ]
      },
      {
        stageIndex: 3,
        actor: "GUEST",
        title: "Màn Hình Khách Nhận Cập Nhật 'Đang Xử Lý' Qua WebSocket",
        account: CANONICAL_ACCOUNT_CATALOG.GUEST,
        steps: [
          {
            action: "assert_realtime_sync",
            guide: "Tại cửa sổ Khách, kiểm tra giao diện tự động nhảy badge sang 'Đang xử lý (Lễ tân đã tiếp nhận)' qua WebSocket mà KHÔNG reload trang (Zero Page Reload)"
          }
        ]
      },
      {
        stageIndex: 4,
        actor: "HOTEL_FRONTDESK",
        title: "Lễ Tân Bấm 'Hoàn Thành' Yêu Cầu",
        account: CANONICAL_ACCOUNT_CATALOG.FRONTDESK,
        steps: [
          {
            action: "click",
            targetName: "Nút 'Hoàn thành'",
            selector: "button:has-text('Hoàn thành'), button:has-text('Đã giao')",
            guide: "Tại Drawer Lễ tân, click nút 'Hoàn thành' để đóng yêu cầu"
          },
          {
            action: "assert_state",
            guide: "Xác nhận yêu cầu chuyển sang tab 'Đã hoàn thành'"
          }
        ]
      },
      {
        stageIndex: 5,
        actor: "GUEST",
        title: "Màn Hình Khách Hiển Thị 'Đã Hoàn Thành'",
        account: CANONICAL_ACCOUNT_CATALOG.GUEST,
        steps: [
          {
            action: "assert_realtime_sync",
            guide: "Tại cửa sổ Khách, kiểm tra giao diện tự động hiển thị 'Đã hoàn thành' kèm form đánh giá sao hài lòng"
          }
        ]
      }
    ]
  },

  // =========================================================================
  // JOURNEY 2: FRONTDESK CHECK-IN & HOUSEKEEPING ROOM READY LIFECYCLE
  // Lễ tân check-in -> Trả phòng (chuyển bẩn/PROCESSING) -> Buồng phòng dọn -> Sẵn sàng
  // =========================================================================
  {
    id: "frontdesk-housekeeping-room-ready-flow",
    name: "Chu Trình Điều Phối Phòng & Vệ Sinh Buồng Phòng (Check-in -> Cleaning -> Room Ready)",
    type: "CROSS_ROLE_LIFECYCLE",
    category: "ROOM_OPERATIONS",
    description: "Lễ tân thực hiện nhận/trả phòng -> Phòng chuyển trạng thái chờ dọn (PROCESSING) -> Nhân viên buồng phòng nhận nhiệm vụ, hoàn tất vệ sinh và bấm 'Xác nhận phòng sẵn sàng' -> Phòng chuyển về AVAILABLE",
    rolesInvolved: ["HOTEL_FRONTDESK", "HOUSEKEEPING"],
    stages: [
      {
        stageIndex: 1,
        actor: "HOTEL_FRONTDESK",
        title: "Lễ Tân Trả Phòng (Chuyển Phòng Sang Chờ Dọn Dẹp)",
        account: CANONICAL_ACCOUNT_CATALOG.FRONTDESK,
        startUrl: "/staff/front-desk",
        steps: [
          {
            action: "navigate",
            url: "/staff/front-desk",
            guide: "Mở sơ đồ phòng và bảng điều phối lễ tân"
          },
          {
            action: "snapshot",
            guide: "Gọi take_snapshot(pageId) lấy danh sách phòng"
          },
          {
            action: "click",
            targetName: "Phòng đang có khách (Occupied Room)",
            selector: "[data-status='OCCUPIED'], .room-card-occupied",
            guide: "Click vào phòng đang có khách cần trả phòng"
          },
          {
            action: "click",
            targetName: "Nút 'Trả phòng' (Check-out)",
            selector: "button:has-text('Trả phòng'), button:has-text('Check-out')",
            guide: "Click xác nhận trả phòng -> Phòng chuyển trạng thái PROCESSING (Đang chờ dọn)"
          }
        ]
      },
      {
        stageIndex: 2,
        actor: "HOUSEKEEPING",
        title: "Buồng Phòng Nhận Nhiệm Vụ & Xác Nhận Phòng Sẵn Sàng (Room Ready)",
        account: CANONICAL_ACCOUNT_CATALOG.HOUSEKEEPING,
        startUrl: "/hotels/HCA_HOMESTAY/rooms",
        authSteps: [
          {
            action: "navigate",
            url: "/dangnhap",
            guide: "Truy cập trang đăng nhập"
          },
          {
            action: "fill",
            targetName: "Tài khoản Buồng phòng",
            selector: "input[type='email'], input[name='username']",
            value: "housekeeping@vietsage.vn",
            guide: "Điền tài khoản: housekeeping@vietsage.vn"
          },
          {
            action: "fill",
            targetName: "Mật khẩu",
            selector: "input[type='password'], input[name='password']",
            value: "Admin@123",
            guide: "Điền mật khẩu: Admin@123"
          },
          {
            action: "click",
            targetName: "Nút Đăng nhập",
            selector: "button[type='submit']",
            guide: "Click Đăng nhập và điều hướng sang giao diện Buồng phòng"
          }
        ],
        steps: [
          {
            action: "snapshot",
            guide: "Gọi take_snapshot(pageId) để tìm danh sách phòng cần dọn"
          },
          {
            action: "click",
            targetName: "Tab 'Cần dọn dẹp' hoặc Thẻ phòng trạng thái Chờ dọn",
            selector: "button:has-text('Cần dọn'), [data-status='PROCESSING'], .room-dirty",
            guide: "Click chọn phòng đang chờ vệ sinh"
          },
          {
            action: "click",
            targetName: "Nút 'Bắt đầu dọn'",
            selector: "button:has-text('Bắt đầu dọn'), button:has-text('Nhận phòng')",
            guide: "Click xác nhận bắt đầu tiến hành dọn dẹp"
          },
          {
            action: "click",
            targetName: "Nút 'Xác nhận phòng sẵn sàng (Room Ready)'",
            selector: "button:has-text('Phòng sẵn sàng'), button:has-text('Xác nhận hoàn tất')",
            guide: "Click nút xác nhận phòng sạch, đủ tiện ích, sẵn sàng đón khách mới"
          },
          {
            action: "assert_state",
            guide: "Xác nhận phòng chuyển sang màu xanh lá / trạng thái AVAILABLE (Sẵn sàng) trên toàn hệ thống"
          }
        ]
      }
    ]
  },

  // =========================================================================
  // JOURNEY 3: OWNER CHANNEL MANAGER BATCH PRICING & INLINE SELL STATUS
  // Chủ khách sạn cập nhật biểu giá & mở/đóng bán ARI trên Channel Manager
  // =========================================================================
  {
    id: "owner-channel-manager-batch-flow",
    name: "Cập Nhật Bảng Giá Hàng Loạt (Channel Manager Batch Update Modal)",
    type: "SINGLE_ROLE_INTERACTION",
    role: "TENANT_OWNER",
    category: "HOTEL_INVENTORY",
    account: CANONICAL_ACCOUNT_CATALOG.OWNER,
    description: "Mở modal cập nhật giá hàng loạt, chọn tất cả hạng phòng, nhập mức giá mới và hủy/lưu in-place",
    startUrl: "/owner/hotels/cmu9y158p0001j8v487zujvhn/channel-manager",
    authSteps: [
      {
        action: "navigate",
        url: "/dangnhap",
        guide: "Truy cập trang đăng nhập"
      },
      {
        action: "fill",
        targetName: "Tài khoản Chủ khách sạn",
        selector: "input[type='email'], input[name='username']",
        value: "thucvn@gmail.com",
        guide: "Điền tài khoản: thucvn@gmail.com (hoặc tenant@vietsage.vn)"
      },
      {
        action: "fill",
        targetName: "Mật khẩu",
        selector: "input[type='password'], input[name='password']",
        value: "Admin@123",
        guide: "Điền mật khẩu: Admin@123"
      },
      {
        action: "click",
        targetName: "Nút Đăng nhập",
        selector: "button[type='submit']",
        guide: "Click Đăng nhập"
      }
    ],
    steps: [
      {
        action: "navigate",
        url: "/owner/hotels/cmu9y158p0001j8v487zujvhn/channel-manager",
        guide: "Điều hướng đến màn hình Kho Phòng & Kênh Bán OTA"
      },
      {
        action: "snapshot",
        guide: "Gọi take_snapshot(pageId) lấy uid của nút 'Cập nhật hàng loạt'"
      },
      {
        action: "click",
        targetName: "Nút 'Cập nhật hàng loạt'",
        selector: "button:has-text('Cập nhật hàng loạt')",
        guide: "Click nút 'Cập nhật hàng loạt' để kích hoạt Modal tại chỗ"
      },
      {
        action: "assert_modal",
        targetName: "Modal Cập Nhật Hàng Loạt",
        selector: "dialog[modal], [role='dialog']",
        guide: "Xác nhận Modal 'Cập Nhật Bảng Giá Hàng Loạt' hiển thị tại chỗ (In-Place Tab Isolation)"
      },
      {
        action: "click",
        targetName: "Nút 'Chọn tất cả hạng phòng hợp lệ'",
        selector: "button:has-text('Chọn tất cả hạng phòng hợp lệ')",
        guide: "Chọn áp dụng đồng loạt cho toàn bộ các hạng phòng trong khách sạn"
      },
      {
        action: "fill",
        targetName: "Ô Mức giá mới (VND / đêm)",
        selector: "input[placeholder*='giá'], spinbutton",
        value: "2500000",
        guide: "Nhập mức giá mới 2.500.000 VND / đêm"
      },
      {
        action: "click",
        targetName: "Nút 'Hủy bỏ' (hoặc 'Áp dụng cập nhật')",
        selector: "button:has-text('Hủy bỏ')",
        guide: "Click nút 'Hủy bỏ' hoặc 'Áp dụng cập nhật' để đóng Modal an toàn"
      },
      {
        action: "assert_closed",
        guide: "Xác nhận Modal đóng lại, giao diện bảng lịch giữ nguyên vị trí cuộn và dữ liệu"
      }
    ]
  },

  // =========================================================================
  // JOURNEY 4: OWNER INLINE CELL EDITING & SELL STATUS AUTO-SAVE
  // Chỉnh sửa trực tiếp ô giá & chuyển đổi trạng thái đóng/mở bán tức thì
  // =========================================================================
  {
    id: "owner-channel-manager-inline-cell-flow",
    name: "Chỉnh Sửa Trực Tiếp Ô Lịch & Trạng Thái Bán (Inline Cell Editing & Sell Status Toggle)",
    type: "SINGLE_ROLE_INTERACTION",
    role: "TENANT_OWNER",
    category: "HOTEL_INVENTORY",
    account: CANONICAL_ACCOUNT_CATALOG.OWNER,
    description: "Click trực tiếp vào ô trạng thái đóng/mở bán để chuyển đổi tức thời và click ô giá để nhập giá mới",
    startUrl: "/owner/hotels/cmu9y158p0001j8v487zujvhn/channel-manager",
    steps: [
      {
        action: "navigate",
        url: "/owner/hotels/cmu9y158p0001j8v487zujvhn/channel-manager",
        guide: "Điều hướng đến màn hình Kho Phòng & Kênh Bán"
      },
      {
        action: "snapshot",
        guide: "Gọi take_snapshot(pageId) lấy uid các nút cell trong bảng lịch ARI"
      },
      {
        action: "click",
        targetName: "Nút trạng thái 'Đang mở bán'",
        selector: "button[description*='Nhấp để đóng bán'], button:has-text('Đóng bán')",
        guide: "Click chuyển đổi trạng thái bán từ 'Đang mở bán' sang 'Đang đóng bán'"
      },
      {
        action: "assert_cell_updated",
        guide: "Xác nhận text trạng thái chuyển thành 'Đang đóng bán' tức thời mà không cần reload trang"
      },
      {
        action: "click",
        targetName: "Nút trạng thái 'Đang đóng bán'",
        selector: "button[description*='Nhấp để mở bán'], button:has-text('Mở bán')",
        guide: "Click đảo ngược lại trạng thái sang 'Đang mở bán'"
      },
      {
        action: "click",
        targetName: "Ô giá đêm",
        selector: "button[description*='Nhấp để sửa giá bán']",
        guide: "Click vào ô giá đêm để kích hoạt inline input textbox"
      },
      {
        action: "assert_textbox",
        guide: "Xác nhận xuất hiện textbox focusable để sửa giá tại chỗ"
      }
    ]
  },

  // =========================================================================
  // JOURNEY 5: OWNER TAPE CHART DRAG-AND-DROP REALLOCATION (@dnd-kit)
  // =========================================================================
  {
    id: "owner-tape-chart-drag-and-drop-flow",
    name: "Kéo Thả Đổi Phòng Trên Tape Chart / Sơ Đồ Phòng (@dnd-kit Drag-and-Drop)",
    type: "SINGLE_ROLE_INTERACTION",
    role: "TENANT_OWNER",
    category: "TAPE_CHART",
    account: CANONICAL_ACCOUNT_CATALOG.OWNER,
    description: "Kéo thẻ đặt phòng từ phòng/ngày nguồn sang phòng/ngày đích sử dụng lệnh drag(pageId, from_uid, to_uid)",
    startUrl: "/owner/hotels/cmu9y158p0001j8v487zujvhn/channel-manager",
    steps: [
      {
        action: "navigate",
        url: "/owner/hotels/cmu9y158p0001j8v487zujvhn/channel-manager",
        guide: "Mở màn hình Tape Chart / Channel Manager"
      },
      {
        action: "snapshot",
        guide: "Gọi take_snapshot(pageId) để tìm uid của block đặt phòng (from_uid) và ô trống đích (to_uid)"
      },
      {
        action: "drag",
        targetName: "Khối đặt phòng kéo thả sang slot mới",
        guide: "Thực thi drag(pageId, from_uid, to_uid) qua Chrome DevTools MCP"
      },
      {
        action: "assert_dnd_reassigned",
        guide: "Xác nhận thẻ đặt phòng được chuyển slot thành công, cập nhật state tại chỗ, 0 reload, 0 console error"
      }
    ]
  },

  // =========================================================================
  // JOURNEY 6: WALK-IN / DIRECT RESERVATION CREATION (TẠO ĐẶT PHÒNG MỚI)
  // =========================================================================
  {
    id: "frontdesk-booking-walkin-flow",
    name: "Tạo Mới Đặt Phòng Trực Tiếp (Frontdesk Walk-in Booking & Reservation CRUD)",
    type: "SINGLE_ROLE_INTERACTION",
    role: "HOTEL_FRONTDESK",
    category: "RESERVATIONS",
    account: CANONICAL_ACCOUNT_CATALOG.FRONTDESK,
    description: "Lễ tân mở modal đặt phòng mới, nhập thông tin khách lưu trú, chọn khoảng ngày, chọn hạng phòng, điền số tiền cọc và lưu in-place -> Kiểm tra booking xuất hiện ngay trên danh sách và Tape Chart",
    startUrl: "/staff/front-desk",
    steps: [
      {
        action: "navigate",
        url: "/staff/front-desk",
        guide: "Truy cập giao diện bàn lễ tân điều phối đặt phòng"
      },
      {
        action: "snapshot",
        guide: "Gọi take_snapshot(pageId) tìm nút 'Đặt phòng mới' hoặc 'Tạo đặt phòng'"
      },
      {
        action: "click",
        targetName: "Nút 'Đặt phòng mới'",
        selector: "button:has-text('Đặt phòng mới'), button:has-text('Tạo đặt phòng'), [data-testid='btn-create-booking']",
        guide: "Click nút mở Modal Đặt phòng mới tại chỗ"
      },
      {
        action: "assert_modal",
        targetName: "Modal Tạo Đặt Phòng",
        selector: "dialog[modal], [role='dialog']",
        guide: "Xác nhận Modal 'Tạo Đặt Phòng' hiển thị in-place, không reload trang"
      },
      {
        action: "fill",
        targetName: "Ô Họ và tên khách",
        selector: "input[name*='name'], input[placeholder*='khách'], input[placeholder*='Họ và tên']",
        value: "Trần Văn Hoàng (Test Walk-in Auto)",
        guide: "Điền họ tên đầy đủ của khách lưu trú"
      },
      {
        action: "fill",
        targetName: "Ô Số điện thoại",
        selector: "input[name*='phone'], input[placeholder*='điện thoại'], input[type='tel']",
        value: "0987654321",
        guide: "Điền số điện thoại liên hệ"
      },
      {
        action: "fill",
        targetName: "Ô Số CCCD / Hộ chiếu",
        selector: "input[name*='idNumber'], input[placeholder*='CCCD'], input[placeholder*='hộ chiếu']",
        value: "001202008899",
        guide: "Điền số căn cước công dân"
      },
      {
        action: "click",
        targetName: "Hạng phòng lựa chọn",
        selector: "select[name*='roomType'], [data-testid='select-room-type'], button[role='combobox']",
        guide: "Chọn hạng phòng cần đặt (Deluxe King / Superior)"
      },
      {
        action: "fill",
        targetName: "Ô Tiền đặt cọc",
        selector: "input[name*='deposit'], input[placeholder*='cọc']",
        value: "500000",
        guide: "Nhập số tiền đặt cọc 500.000 VND"
      },
      {
        action: "click",
        targetName: "Nút 'Lưu đặt phòng'",
        selector: "button[type='submit'], button:has-text('Lưu đặt phòng'), button:has-text('Xác nhận tạo')",
        guide: "Click nút Lưu để hoàn tất tạo đặt phòng"
      },
      {
        action: "assert_state",
        guide: "Xác nhận modal đóng an toàn, hiển thị thông báo SweetAlert2 thành công, thẻ đặt phòng mới xuất hiện ở trạng thái CONFIRMED (Đã xác nhận)"
      }
    ]
  },

  // =========================================================================
  // JOURNEY 7: CHECK-IN & ROOM ASSIGNMENT (GÁN PHÒNG & NHẬN PHÒNG)
  // =========================================================================
  {
    id: "frontdesk-checkin-assignment-flow",
    name: "Quy Trình Gán Phòng & Nhận Phòng (Check-in & Room Assignment Lifecycle)",
    type: "SINGLE_ROLE_INTERACTION",
    role: "HOTEL_FRONTDESK",
    category: "RESERVATIONS",
    account: CANONICAL_ACCOUNT_CATALOG.FRONTDESK,
    description: "Lễ tân mở danh sách khách đến hôm nay (Arrivals), chọn đơn đặt phòng chờ nhận, chọn số phòng trống sẵn sàng (AVAILABLE) và bấm 'Xác nhận Check-in' -> Trạng thái phòng chuyển sang OCCUPIED",
    startUrl: "/staff/front-desk",
    steps: [
      {
        action: "navigate",
        url: "/staff/front-desk",
        guide: "Mở giao diện lễ tân"
      },
      {
        action: "click",
        targetName: "Tab 'Khách đến' (Arrivals)",
        selector: "button:has-text('Khách đến'), [data-tab='arrivals'], [role='tab']:has-text('Đến')",
        guide: "Chuyển sang Tab danh sách khách đến trong ngày"
      },
      {
        action: "snapshot",
        guide: "Gọi take_snapshot(pageId) xác định thẻ khách đến"
      },
      {
        action: "click",
        targetName: "Thẻ đơn đặt phòng khách đến",
        selector: "[data-testid='arrival-card'], tr:has-text('CONFIRMED'), .booking-arrival-item",
        guide: "Click vào đơn đặt phòng -> Drawer chi tiết trượt ra tại chỗ"
      },
      {
        action: "click",
        targetName: "Nút chọn phòng trống gán cho khách",
        selector: "select[name*='roomId'], button:has-text('Gán phòng'), [data-testid='btn-assign-room']",
        guide: "Chọn phòng sạch (AVAILABLE) phù hợp với hạng phòng đã đặt"
      },
      {
        action: "click",
        targetName: "Nút 'Nhận phòng (Check-in)'",
        selector: "button:has-text('Nhận phòng'), button:has-text('Check-in')",
        guide: "Bấm nút xác nhận Check-in khách vào phòng"
      },
      {
        action: "assert_state",
        guide: "Xác nhận trạng thái booking chuyển thành CHECKED_IN và trên sơ đồ phòng chuyển sang màu đỏ/tím OCCUPIED (Đang có khách)"
      }
    ]
  },

  // =========================================================================
  // JOURNEY 8: FOLIO BILLING, INCIDENTAL CHARGES & CHECK-OUT (PHỤ THU, THANH TOÁN & TRẢ PHÒNG)
  // =========================================================================
  {
    id: "frontdesk-billing-folio-checkout-flow",
    name: "Quản Lý Folio, Phụ Thu Dịch Vụ, Thanh Toán & Trả Phòng (Folio Billing & Check-out)",
    type: "SINGLE_ROLE_INTERACTION",
    role: "HOTEL_FRONTDESK",
    category: "BILLING_OPS",
    account: CANONICAL_ACCOUNT_CATALOG.FRONTDESK,
    description: "Lễ tân mở Folio của phòng đang lưu trú, thêm phụ thu dịch vụ mini bar, ghi nhận thanh toán đầy đủ công nợ và hoàn tất thủ tục trả phòng -> Phòng chuyển sang DIRTY/PROCESSING để buồng phòng dọn dẹp",
    startUrl: "/staff/front-desk",
    steps: [
      {
        action: "navigate",
        url: "/staff/front-desk",
        guide: "Mở giao diện điều phối lễ tân"
      },
      {
        action: "click",
        targetName: "Phòng đang có khách lưu trú",
        selector: "[data-status='OCCUPIED'], .room-card-occupied, tr:has-text('Đang ở')",
        guide: "Click vào phòng đang có khách -> Mở Drawer chi tiết phòng"
      },
      {
        action: "click",
        targetName: "Tab 'Hóa đơn & Chi phí' (Folio)",
        selector: "button:has-text('Hóa đơn'), button:has-text('Folio'), [data-tab='billing']",
        guide: "Chuyển sang xem bảng kê chi phí và hóa đơn phòng"
      },
      {
        action: "click",
        targetName: "Nút 'Thêm phụ thu / dịch vụ'",
        selector: "button:has-text('Thêm dịch vụ'), button:has-text('Thêm phụ thu'), [data-action='add-folio-item']",
        guide: "Click nút thêm khoản chi phí phát sinh"
      },
      {
        action: "fill",
        targetName: "Tên khoản chi phí phát sinh",
        selector: "input[placeholder*='dịch vụ'], input[name*='description']",
        value: "2 lon nước ngọt Mini Bar (P.101)",
        guide: "Nhập tên khoản phụ thu phát sinh"
      },
      {
        action: "fill",
        targetName: "Số tiền đơn giá",
        selector: "input[placeholder*='giá'], input[name*='amount']",
        value: "50000",
        guide: "Nhập số tiền 50.000 VND"
      },
      {
        action: "click",
        targetName: "Nút 'Xác nhận thêm chi phí'",
        selector: "button:has-text('Xác nhận thêm'), button:has-text('Thêm vào hóa đơn')",
        guide: "Lưu khoản phụ thu vào Folio phòng"
      },
      {
        action: "click",
        targetName: "Nút 'Thanh toán (Payment)'",
        selector: "button:has-text('Thanh toán'), button:has-text('Thu tiền'), [data-action='pay-folio']",
        guide: "Click mở Modal quyết toán thanh toán"
      },
      {
        action: "click",
        targetName: "Phương thức thanh toán Tiền mặt hoặc Chuyển khoản QR",
        selector: "button:has-text('Tiền mặt'), input[value='CASH'], button:has-text('Chuyển khoản')",
        guide: "Chọn phương thức thanh toán"
      },
      {
        action: "click",
        targetName: "Nút 'Xác nhận thu tiền'",
        selector: "button:has-text('Xác nhận thu tiền'), button:has-text('Hoàn tất thanh toán')",
        guide: "Ghi nhận khoản thanh toán, công nợ trở về 0"
      },
      {
        action: "click",
        targetName: "Nút 'Hoàn tất trả phòng (Check-out)'",
        selector: "button:has-text('Trả phòng'), button:has-text('Check-out')",
        guide: "Click hoàn tất trả phòng cho khách"
      },
      {
        action: "assert_state",
        guide: "Xác nhận phòng chuyển sang trạng thái DIRTY / PROCESSING (Chờ dọn dẹp) và hóa đơn chốt PAID"
      }
    ]
  },

  // =========================================================================
  // JOURNEY 9: ROOM INVENTORY CRUD & MAINTENANCE MANAGEMENT
  // =========================================================================
  {
    id: "owner-room-inventory-crud-flow",
    name: "Quản Lý Danh Mục Phòng & Thiết Lập Phòng Mới (Room Setup, Category & Inventory CRUD)",
    type: "SINGLE_ROLE_INTERACTION",
    role: "TENANT_OWNER",
    category: "HOTEL_SETUP",
    account: CANONICAL_ACCOUNT_CATALOG.OWNER,
    description: "Chủ khách sạn vào Quản lý phòng, mở modal 'Thêm phòng mới', điền số phòng, chọn tầng và hạng phòng, lưu dữ liệu in-place; sau đó chỉnh sửa trạng thái phòng sang 'Bảo trì' (MAINTENANCE) và hoàn trả 'Hoạt động'",
    startUrl: "/owner/hotels/cmu9y158p0001j8v487zujvhn/rooms",
    steps: [
      {
        action: "navigate",
        url: "/owner/hotels/cmu9y158p0001j8v487zujvhn/rooms",
        guide: "Mở giao diện Quản lý danh mục phòng khách sạn"
      },
      {
        action: "snapshot",
        guide: "Gọi take_snapshot(pageId) lấy danh sách phòng và tìm nút 'Thêm phòng'"
      },
      {
        action: "click",
        targetName: "Nút 'Thêm phòng mới'",
        selector: "button:has-text('Thêm phòng'), button:has-text('Tạo phòng'), [data-testid='btn-add-room']",
        guide: "Click nút mở Modal Thêm phòng mới tại chỗ"
      },
      {
        action: "assert_modal",
        targetName: "Modal Tạo Phòng",
        selector: "dialog[modal], [role='dialog']",
        guide: "Xác nhận modal hiển thị in-place"
      },
      {
        action: "fill",
        targetName: "Số hiệu phòng",
        selector: "input[name*='roomNumber'], input[placeholder*='số phòng'], input[placeholder*='Số phòng']",
        value: "P.308",
        guide: "Điền số phòng: P.308"
      },
      {
        action: "fill",
        targetName: "Tầng",
        selector: "input[name*='floor'], input[placeholder*='tầng'], input[placeholder*='Tầng']",
        value: "3",
        guide: "Điền tầng 3"
      },
      {
        action: "click",
        targetName: "Hạng phòng",
        selector: "select[name*='roomType'], [data-testid='room-type-select']",
        guide: "Chọn hạng phòng cho phòng mới"
      },
      {
        action: "click",
        targetName: "Nút 'Lưu phòng'",
        selector: "button[type='submit'], button:has-text('Lưu'), button:has-text('Xác nhận')",
        guide: "Bấm lưu phòng mới vào hệ thống"
      },
      {
        action: "assert_state",
        guide: "Xác nhận modal đóng, phòng P.308 xuất hiện trên danh sách phòng"
      },
      {
        action: "click",
        targetName: "Nút 'Bảo trì'",
        selector: "button:has-text('Bảo trì'), [data-action='maintenance']",
        guide: "Thử nghiệm chuyển đổi trạng thái phòng sang Bảo trì (MAINTENANCE)"
      },
      {
        action: "assert_state",
        guide: "Xác nhận badge phòng chuyển sang trạng thái MAINTENANCE màu cam"
      }
    ]
  },

  // =========================================================================
  // JOURNEY 10: GUEST POLICE DECLARATION / KBTT (KHAI BÁO TẠM TRÚ CÔNG AN)
  // =========================================================================
  {
    id: "frontdesk-guest-declaration-kbtt-flow",
    name: "Quy Trình Khai Báo Tạm Trú Công An BCA (KBTT Declaration Flow)",
    type: "SINGLE_ROLE_INTERACTION",
    role: "HOTEL_FRONTDESK",
    category: "COMPLIANCE_OPS",
    account: CANONICAL_ACCOUNT_CATALOG.FRONTDESK,
    description: "Lễ tân vào mục Khai báo tạm trú, chọn danh sách khách lưu trú trong ngày, rà soát dữ liệu CCCD/Hộ chiếu và bấm 'Gửi đồng bộ hồ sơ lưu trú' -> Trạng thái chuyển sang 'Đã khai báo'",
    startUrl: "/owner/hotels/cmu9y158p0001j8v487zujvhn/kbtt",
    steps: [
      {
        action: "navigate",
        url: "/owner/hotels/cmu9y158p0001j8v487zujvhn/kbtt",
        guide: "Mở màn hình Khai báo tạm trú BCA (KBTT)"
      },
      {
        action: "snapshot",
        guide: "Gọi take_snapshot(pageId) kiểm tra danh sách khách lưu trú cần khai báo"
      },
      {
        action: "click",
        targetName: "Checkbox chọn khách hàng khai báo",
        selector: "input[type='checkbox'], [role='checkbox']",
        guide: "Chọn các khách hàng lưu trú cần gửi khai báo"
      },
      {
        action: "click",
        targetName: "Nút 'Đồng bộ hồ sơ khai báo BCA'",
        selector: "button:has-text('Khai báo'), button:has-text('Đồng bộ KBTT'), button:has-text('Gửi khai báo')",
        guide: "Click nút gửi hồ sơ khai báo sang cổng thông tin BCA"
      },
      {
        action: "assert_state",
        guide: "Xác nhận xuất hiện thông báo SweetAlert2 thành công và cột trạng thái cập nhật 'ĐÃ KHAI BÁO'"
      }
    ]
  },

  // =========================================================================
  // JOURNEY 11: MARKETPLACE SERVICE & TOUR ORDER LIFECYCLE
  // =========================================================================
  {
    id: "marketplace-order-fulfillment-flow",
    name: "Chu Trình Xử Lý Đơn Hàng Dịch Vụ Đối Tác (Marketplace Order Lifecycle)",
    type: "CROSS_ROLE_LIFECYCLE",
    category: "MARKETPLACE_OPS",
    description: "Khách đặt món ẩm thực hoặc tour dịch vụ từ Guest OS -> Nhân viên đối tác tiếp nhận trên cổng Marketplace -> Chuyển sang 'Đang chuẩn bị' -> 'Hoàn tất giao'",
    rolesInvolved: ["GUEST", "SERVICE_STAFF"],
    stages: [
      {
        stageIndex: 1,
        actor: "GUEST",
        title: "Khách Đặt Món Ẩm Thực Hoặc Tour Du Lịch",
        account: CANONICAL_ACCOUNT_CATALOG.GUEST,
        startUrl: "/g/DEMO_QR_ROOM_101",
        steps: [
          {
            action: "navigate",
            url: "/g/DEMO_QR_ROOM_101",
            guide: "Khách mở giao diện phòng"
          },
          {
            action: "click",
            targetName: "Menu 'Ẩm thực / Dịch vụ đối tác'",
            selector: "a[href*='marketplace'], button:has-text('Ẩm thực'), button:has-text('Ăn uống')",
            guide: "Vào mục đặt món hoặc dịch vụ đối tác liên kết"
          },
          {
            action: "click",
            targetName: "Nút 'Thêm vào giỏ' hoặc 'Đặt ngay'",
            selector: "button:has-text('Thêm'), button:has-text('Đặt món'), [data-action='add-to-cart']",
            guide: "Chọn món hoặc tour cần đặt"
          },
          {
            action: "click",
            targetName: "Nút 'Xác nhận đặt hàng'",
            selector: "button:has-text('Xác nhận đặt'), button:has-text('Đặt hàng')",
            guide: "Bấm xác nhận gửi đơn"
          },
          {
            action: "assert_state",
            guide: "Xác nhận hiển thị đơn hàng đối tác với trạng thái 'Chờ xác nhận'"
          }
        ]
      },
      {
        stageIndex: 2,
        actor: "SERVICE_STAFF",
        title: "Nhân Viên Đối Tác Tiếp Nhận & Giao Hàng",
        account: CANONICAL_ACCOUNT_CATALOG.SERVICE_STAFF,
        startUrl: "/service/orders",
        steps: [
          {
            action: "navigate",
            url: "/service/orders",
            guide: "Đối tác mở trang quản lý đơn dịch vụ"
          },
          {
            action: "snapshot",
            guide: "Gọi take_snapshot(pageId) xác định đơn mới từ phòng 101"
          },
          {
            action: "click",
            targetName: "Nút 'Tiếp nhận đơn'",
            selector: "button:has-text('Tiếp nhận'), button:has-text('Xác nhận đơn')",
            guide: "Click tiếp nhận đơn dịch vụ"
          },
          {
            action: "click",
            targetName: "Nút 'Hoàn tất giao'",
            selector: "button:has-text('Hoàn tất'), button:has-text('Đã giao')",
            guide: "Click hoàn tất giao dịch vụ đến phòng khách"
          },
          {
            action: "assert_state",
            guide: "Xác nhận đơn hàng chuyển sang trạng thái COMPLETED"
          }
        ]
      }
    ]
  },

  // =========================================================================
  // JOURNEY 12: E-COMMERCE CART & CHECKOUT (BROWSE -> MINI-CART -> ORDER)
  // =========================================================================
  {
    id: "ecom-browse-cart-checkout-flow",
    name: "Chu Trình Mua Hàng E-Commerce (Browse -> Add to Cart -> In-Place MiniCart -> Checkout)",
    type: "SINGLE_ROLE_INTERACTION",
    role: "SHOPPER",
    category: "ECOMMERCE_OPS",
    account: CANONICAL_ACCOUNT_CATALOG.SHOPPER,
    description: "Khách hàng duyệt danh mục sản phẩm, lọc theo phân loại, thêm sản phẩm vào giỏ hàng tại chỗ, mở Mini-cart Drawer, điền thông tin giao hàng và đặt hàng thành công",
    startUrl: "/shop",
    steps: [
      {
        action: "navigate",
        url: "/shop",
        guide: "Mở trang cửa hàng hoặc danh mục sản phẩm (/shop hoặc /products)"
      },
      {
        action: "snapshot",
        guide: "Gọi take_snapshot(pageId) lấy danh sách thẻ sản phẩm và bộ lọc"
      },
      {
        action: "click",
        targetName: "Thẻ sản phẩm hoặc nút 'Thêm vào giỏ hàng'",
        selector: "button:has-text('Thêm vào giỏ'), [data-action='add-to-cart'], .product-card button",
        guide: "Click thêm sản phẩm đầu tiên vào giỏ hàng"
      },
      {
        action: "assert_drawer",
        targetName: "Mini-Cart Drawer Tại Chỗ",
        selector: "[role='dialog'], [data-state='open'], .mini-cart-drawer",
        guide: "Xác nhận Mini-Cart Drawer mở trượt tại chỗ (In-Place Tab Isolation: 0 reload) hiển thị 1 sản phẩm"
      },
      {
        action: "click",
        targetName: "Nút 'Tiến hành thanh toán'",
        selector: "button:has-text('Thanh toán'), a[href*='checkout'], button:has-text('Đặt hàng')",
        guide: "Click tiến hành chuyển sang bước điền thông tin đơn hàng"
      },
      {
        action: "fill",
        targetName: "Ô Họ và tên người nhận",
        selector: "input[name*='name'], input[placeholder*='tên'], input[name*='fullName']",
        value: "Nguyễn Văn Mua Hàng (Test Auto)",
        guide: "Điền họ tên người nhận hàng"
      },
      {
        action: "fill",
        targetName: "Ô Số điện thoại",
        selector: "input[name*='phone'], input[type='tel']",
        value: "0901234567",
        guide: "Điền số điện thoại nhận hàng"
      },
      {
        action: "fill",
        targetName: "Ô Địa chỉ giao hàng",
        selector: "input[name*='address'], textarea[name*='address']",
        value: "123 Đường Mẫu, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
        guide: "Điền địa chỉ giao nhận"
      },
      {
        action: "click",
        targetName: "Phương thức thanh toán COD",
        selector: "input[value='COD'], label:has-text('COD'), button:has-text('Khi nhận hàng')",
        guide: "Chọn phương thức thanh toán khi nhận hàng (COD)"
      },
      {
        action: "click",
        targetName: "Nút 'Xác nhận đặt hàng'",
        selector: "button[type='submit'], button:has-text('Xác nhận đặt hàng'), button:has-text('Hoàn tất')",
        guide: "Bấm hoàn tất đơn hàng"
      },
      {
        action: "assert_state",
        guide: "Xác nhận hiển thị trang/thông báo cảm ơn kèm mã đơn hàng ORD-... và giỏ hàng được làm rỗng"
      }
    ]
  },

  // =========================================================================
  // JOURNEY 13: E-COMMERCE MERCHANT FULFILLMENT (TIẾP NHẬN & XỬ LÝ ĐƠN HÀNG)
  // =========================================================================
  {
    id: "ecom-merchant-fulfillment-flow",
    name: "Chu Trình Xử Lý Đơn Hàng Nhà Bán (Merchant Order Acceptance & Shipment)",
    type: "SINGLE_ROLE_INTERACTION",
    role: "MERCHANT",
    category: "ECOMMERCE_OPS",
    account: CANONICAL_ACCOUNT_CATALOG.MERCHANT,
    description: "Nhà bán hàng vào cổng quản trị đơn hàng, tiếp nhận đơn mới, nhập mã vận đơn và chuyển trạng thái sang Đang vận chuyển",
    startUrl: "/vendor/orders",
    steps: [
      {
        action: "navigate",
        url: "/vendor/orders",
        guide: "Mở danh sách đơn hàng nhà bán"
      },
      {
        action: "snapshot",
        guide: "Gọi take_snapshot(pageId) lấy danh sách đơn chờ xử lý"
      },
      {
        action: "click",
        targetName: "Đơn hàng mới nhất",
        selector: "tr:has-text('PENDING'), [data-status='pending'], .order-row:first-child",
        guide: "Click vào đơn hàng -> Drawer chi tiết mở tại chỗ"
      },
      {
        action: "click",
        targetName: "Nút 'Tiếp nhận đơn hàng'",
        selector: "button:has-text('Tiếp nhận'), button:has-text('Xác nhận đơn')",
        guide: "Click tiếp nhận đơn hàng"
      },
      {
        action: "assert_state",
        guide: "Xác nhận badge đơn hàng chuyển sang 'ĐÃ TIẾP NHẬN' / 'CONFIRMED' mà không reload trang"
      }
    ]
  },

  // =========================================================================
  // JOURNEY 14: E-COMMERCE PRODUCT SETUP & INVENTORY (TẠO SẢN PHẨM & TỒN KHO)
  // =========================================================================
  {
    id: "ecom-product-crud-flow",
    name: "Quản Trị Danh Mục Sản Phẩm & Tồn Kho (Product Setup CRUD & Inline Stock Edit)",
    type: "SINGLE_ROLE_INTERACTION",
    role: "MERCHANT",
    category: "ECOMMERCE_OPS",
    account: CANONICAL_ACCOUNT_CATALOG.MERCHANT,
    description: "Nhà bán hàng mở modal thêm sản phẩm mới, điền tiêu đề, SKU, giá bán, số lượng tồn kho và lưu tại chỗ; sau đó sửa trực tiếp số lượng tồn kho trên bảng",
    startUrl: "/vendor/products",
    steps: [
      {
        action: "navigate",
        url: "/vendor/products",
        guide: "Mở màn hình Quản lý sản phẩm"
      },
      {
        action: "click",
        targetName: "Nút 'Thêm sản phẩm mới'",
        selector: "button:has-text('Thêm sản phẩm'), button:has-text('Tạo sản phẩm'), [data-action='create-product']",
        guide: "Click mở Modal Tạo sản phẩm in-place"
      },
      {
        action: "fill",
        targetName: "Tên sản phẩm",
        selector: "input[name*='title'], input[name*='name'], input[placeholder*='sản phẩm']",
        value: "Áo Thun Cotton Cao Cấp 100% (Test Auto)",
        guide: "Nhập tên sản phẩm"
      },
      {
        action: "fill",
        targetName: "Mã SKU",
        selector: "input[name*='sku'], input[placeholder*='SKU']",
        value: "TSHIRT-TEST-001",
        guide: "Nhập mã SKU định danh"
      },
      {
        action: "fill",
        targetName: "Giá bán (VND)",
        selector: "input[name*='price'], input[placeholder*='giá']",
        value: "250000",
        guide: "Nhập đơn giá bán 250.000 VND"
      },
      {
        action: "fill",
        targetName: "Số lượng tồn kho",
        selector: "input[name*='stock'], input[name*='quantity']",
        value: "100",
        guide: "Nhập số lượng tồn kho ban đầu"
      },
      {
        action: "click",
        targetName: "Nút 'Lưu sản phẩm'",
        selector: "button[type='submit'], button:has-text('Lưu')",
        guide: "Bấm lưu sản phẩm mới"
      },
      {
        action: "assert_state",
        guide: "Xác nhận modal đóng, sản phẩm mới xuất hiện trên bảng dữ liệu"
      }
    ]
  },

  // =========================================================================
  // JOURNEY 15: SAAS TEAM MEMBER INVITATION & RBAC (MỜI THÀNH VIÊN & PHÂN QUYỀN)
  // =========================================================================
  {
    id: "saas-team-invite-rbac-flow",
    name: "Chu Trình Mời Thành Viên & Phân Quyền Nhóm (Team Member Invitation & Role RBAC)",
    type: "SINGLE_ROLE_INTERACTION",
    role: "WORKSPACE_OWNER",
    category: "SAAS_OPS",
    account: CANONICAL_ACCOUNT_CATALOG.WORKSPACE_OWNER,
    description: "Chủ sở hữu tổ chức mở cài đặt nhóm, mở modal mời thành viên, nhập email đồng nghiệp, chọn vai trò và gửi lời mời tại chỗ",
    startUrl: "/settings/team",
    steps: [
      {
        action: "navigate",
        url: "/settings/team",
        guide: "Mở màn hình Quản lý thành viên & Phân quyền tổ chức"
      },
      {
        action: "click",
        targetName: "Nút 'Mời thành viên'",
        selector: "button:has-text('Mời thành viên'), button:has-text('Thêm thành viên'), [data-action='invite-member']",
        guide: "Click mở Modal Mời thành viên tại chỗ"
      },
      {
        action: "fill",
        targetName: "Email thành viên được mời",
        selector: "input[type='email'], input[name*='email']",
        value: "dongnghiep@saas.test",
        guide: "Điền email của thành viên mới"
      },
      {
        action: "click",
        targetName: "Lựa chọn vai trò (Role)",
        selector: "select[name*='role'], button[role='combobox']",
        guide: "Chọn vai trò MEMBER hoặc ADMIN"
      },
      {
        action: "click",
        targetName: "Nút 'Gửi lời mời'",
        selector: "button[type='submit'], button:has-text('Gửi lời mời'), button:has-text('Mời')",
        guide: "Bấm nút gửi lời mời tham gia workspace"
      },
      {
        action: "assert_state",
        guide: "Xác nhận modal đóng, thông báo SweetAlert2/Toast báo thành công, hàng mới xuất hiện trên bảng thành viên với trạng thái PENDING/INVITED"
      }
    ]
  },

  // =========================================================================
  // JOURNEY 16: SAAS SUBSCRIPTION UPGRADE (NÂNG CẤP GÓI DỊCH VỤ SAAS)
  // =========================================================================
  {
    id: "saas-subscription-upgrade-flow",
    name: "Chu Trình Nâng Cấp Gói Dịch Vụ SaaS (Subscription Upgrade & Billing In-Place)",
    type: "SINGLE_ROLE_INTERACTION",
    role: "WORKSPACE_OWNER",
    category: "SAAS_OPS",
    account: CANONICAL_ACCOUNT_CATALOG.WORKSPACE_OWNER,
    description: "Chủ workspace vào mục Thanh toán/Gói dịch vụ, bấm Nâng cấp gói Pro, chọn kỳ thanh toán năm/tháng và xác nhận nâng cấp tại chỗ",
    startUrl: "/settings/billing",
    steps: [
      {
        action: "navigate",
        url: "/settings/billing",
        guide: "Mở màn hình Quản lý gói thuê bao & Hóa đơn"
      },
      {
        action: "click",
        targetName: "Nút 'Nâng cấp lên gói PRO'",
        selector: "button:has-text('Nâng cấp'), button:has-text('Chọn gói PRO'), [data-plan='pro']",
        guide: "Click nút nâng cấp gói dịch vụ"
      },
      {
        action: "assert_modal",
        targetName: "Modal Xác Nhận Nâng Cấp Gói",
        selector: "dialog[modal], [role='dialog']",
        guide: "Xác nhận Modal thanh toán/nâng cấp mở tại chỗ (Zero redirect)"
      },
      {
        action: "click",
        targetName: "Nút 'Xác nhận thanh toán / Nâng cấp'",
        selector: "button:has-text('Xác nhận'), button:has-text('Thanh toán')",
        guide: "Bấm xác nhận nâng cấp gói"
      },
      {
        action: "assert_state",
        guide: "Xác nhận badge gói dịch vụ chuyển sang 'PRO_ACTIVE' / 'GÓI CHUYÊN NGHIỆP' tức thời"
      }
    ]
  },

  // =========================================================================
  // JOURNEY 17: SAAS WORKSPACE PROJECT CRUD (QUẢN LÝ DỰ ÁN WORKSPACE)
  // =========================================================================
  {
    id: "saas-workspace-project-crud-flow",
    name: "Quản Trị Dự Án Không Gian Làm Việc (Workspace Project CRUD & In-Place Edit)",
    type: "SINGLE_ROLE_INTERACTION",
    role: "MEMBER",
    category: "SAAS_OPS",
    account: CANONICAL_ACCOUNT_CATALOG.TEAM_MEMBER,
    description: "Thành viên tạo dự án mới qua modal, điền tên dự án, đổi tên tại chỗ và xóa dự án kèm hộp thoại xác nhận",
    startUrl: "/workspace",
    steps: [
      {
        action: "navigate",
        url: "/workspace",
        guide: "Mở không gian làm việc chính"
      },
      {
        action: "click",
        targetName: "Nút 'Tạo dự án mới'",
        selector: "button:has-text('Tạo dự án'), button:has-text('Dự án mới'), [data-action='create-project']",
        guide: "Click mở Modal tạo dự án"
      },
      {
        action: "fill",
        targetName: "Tên dự án",
        selector: "input[name*='name'], input[placeholder*='dự án']",
        value: "Dự Án Nâng Cấp Hệ Thống Q4 (Auto Test)",
        guide: "Điền tên dự án"
      },
      {
        action: "click",
        targetName: "Nút 'Lưu / Tạo'",
        selector: "button[type='submit'], button:has-text('Tạo')",
        guide: "Lưu dự án mới"
      },
      {
        action: "assert_state",
        guide: "Xác nhận thẻ dự án mới xuất hiện trên lưới làm việc"
      }
    ]
  },

  // =========================================================================
  // JOURNEY 18: CRM LEAD & PIPELINE KANBAN (KÉO THẢ PHỄU BÁN HÀNG @dnd-kit)
  // =========================================================================
  {
    id: "crm-lead-pipeline-stage-flow",
    name: "Quản Lý Cơ Hội Bán Hàng & Kéo Thả Pipeline Kanban (CRM Deal Pipeline @dnd-kit)",
    type: "SINGLE_ROLE_INTERACTION",
    role: "SALES_REP",
    category: "CRM_OPS",
    account: CANONICAL_ACCOUNT_CATALOG.SALES_REP,
    description: "Nhân viên kinh doanh tạo cơ hội bán hàng mới, điền giá trị hợp đồng, lưu tại chỗ và kéo thả thẻ Deal từ cột 'Tiếp cận ban đầu' sang cột 'Đàm phán'",
    startUrl: "/pipeline",
    steps: [
      {
        action: "navigate",
        url: "/pipeline",
        guide: "Mở bảng Kanban phễu bán hàng"
      },
      {
        action: "click",
        targetName: "Nút 'Thêm cơ hội mới (Deal)'",
        selector: "button:has-text('Thêm cơ hội'), button:has-text('Tạo Deal'), [data-action='add-deal']",
        guide: "Click mở modal tạo deal mới"
      },
      {
        action: "fill",
        targetName: "Tên cơ hội hợp đồng",
        selector: "input[name*='title'], input[name*='name'], input[placeholder*='cơ hội']",
        value: "Hợp đồng Cung Ứng Vật Tư 500M (Test Deal)",
        guide: "Điền tên cơ hội"
      },
      {
        action: "fill",
        targetName: "Giá trị hợp đồng (VND)",
        selector: "input[name*='amount'], input[name*='value'], input[placeholder*='giá trị']",
        value: "500000000",
        guide: "Nhập giá trị hợp đồng 500.000.000 VND"
      },
      {
        action: "click",
        targetName: "Nút 'Lưu Deal'",
        selector: "button[type='submit'], button:has-text('Lưu')",
        guide: "Lưu cơ hội vào cột Lead"
      },
      {
        action: "assert_state",
        guide: "Xác nhận thẻ deal xuất hiện trong cột đầu tiên của Kanban"
      },
      {
        action: "drag",
        targetName: "Kéo thẻ Deal sang cột tiếp theo",
        guide: "Gọi lệnh MCP drag(pageId, from_uid, to_uid) kéo thẻ sang cột Đàm phán (PROPOSAL)"
      },
      {
        action: "assert_state",
        guide: "Xác nhận thẻ Deal chuyển cột thành công, tổng tiền cột tự động tính lại mà không reload trang"
      }
    ]
  },

  // =========================================================================
  // JOURNEY 19: CRM APPOINTMENT BOOKING & RESCHEDULE (ĐẶT LỊCH HẸN & ĐỔI LỊCH)
  // =========================================================================
  {
    id: "crm-appointment-booking-flow",
    name: "Chu Trình Đặt Lịch Hẹn & Đổi Lịch In-Place (Service Appointment Booking & Reschedule)",
    type: "SINGLE_ROLE_INTERACTION",
    role: "CLIENT",
    category: "CRM_OPS",
    account: CANONICAL_ACCOUNT_CATALOG.CLIENT,
    description: "Khách hàng chọn dịch vụ tư vấn, chọn chuyên viên, chọn khung giờ trống trên lưới lịch, điền thông tin và xác nhận; sau đó thao tác đổi lịch hẹn tại chỗ",
    startUrl: "/booking",
    steps: [
      {
        action: "navigate",
        url: "/booking",
        guide: "Mở trang đặt lịch hẹn trực tuyến"
      },
      {
        action: "click",
        targetName: "Gói dịch vụ hoặc chuyên viên tư vấn",
        selector: "button:has-text('Tư vấn'), [data-service-id], .service-slot-card",
        guide: "Chọn dịch vụ cần đặt"
      },
      {
        action: "click",
        targetName: "Khung giờ hẹn trống (Time Slot)",
        selector: "button:has-text('14:00'), button:has-text('15:00'), .time-slot-available",
        guide: "Chọn khung giờ hẹn phù hợp"
      },
      {
        action: "fill",
        targetName: "Họ và tên khách hẹn",
        selector: "input[name*='name'], input[placeholder*='họ tên']",
        value: "Hoàng Minh (Test Lịch Hẹn)",
        guide: "Điền tên khách"
      },
      {
        action: "fill",
        targetName: "Số điện thoại",
        selector: "input[name*='phone'], input[type='tel']",
        value: "0918888888",
        guide: "Điền số điện thoại liên lạc"
      },
      {
        action: "click",
        targetName: "Nút 'Xác nhận đặt lịch'",
        selector: "button[type='submit'], button:has-text('Xác nhận đặt lịch')",
        guide: "Bấm xác nhận tạo cuộc hẹn"
      },
      {
        action: "assert_state",
        guide: "Xác nhận hiển thị mã lịch hẹn BK-... kèm thời gian đã chọn"
      }
    ]
  },

  // =========================================================================
  // JOURNEY 20: UNIVERSAL IN-PLACE DRAWER/MODAL CRUD (ÁP DỤNG CHO MỌI WEB APP)
  // =========================================================================
  {
    id: "universal-crud-drawer-flow",
    name: "Chu Trình Tạo Mới & Chỉnh Sửa Tại Chỗ (Universal In-Place Drawer / Modal CRUD)",
    type: "UNIVERSAL_INTERACTION",
    role: "USER",
    category: "UNIVERSAL_GENERIC",
    account: CANONICAL_ACCOUNT_CATALOG.USER,
    description: "Áp dụng cho mọi ứng dụng web: Mở bảng dữ liệu -> Bấm 'Thêm mới' -> Drawer/Modal mở tại chỗ (In-Place Isolation) -> Điền form -> Lưu -> Kiểm tra hàng mới xuất hiện ngay trên bảng mà không reload trang",
    startUrl: "/dashboard",
    steps: [
      {
        action: "navigate",
        url: "/dashboard",
        guide: "Mở bảng dữ liệu hoặc không gian làm việc chính"
      },
      {
        action: "snapshot",
        guide: "Gọi take_snapshot(pageId) lấy danh sách các nút hành động"
      },
      {
        action: "click",
        targetName: "Nút Thêm mới / Tạo mới / Create",
        selector: "button:has-text('Thêm'), button:has-text('Tạo mới'), button:has-text('Create'), button:has-text('New'), [data-action='create']",
        guide: "Click nút mở Drawer / Modal tạo mới tại chỗ"
      },
      {
        action: "assert_modal",
        targetName: "Modal / Drawer Tại Chỗ",
        selector: "dialog[modal], [role='dialog'], [data-state='open']",
        guide: "Xác nhận Modal/Drawer mở tại chỗ (In-Place Tab Isolation: không reload, không đổi trang)"
      },
      {
        action: "fill",
        targetName: "Ô tiêu đề hoặc trường dữ liệu đầu tiên",
        selector: "input[type='text']:not([readonly]), textarea",
        value: "Dữ liệu kiểm thử nghiệp vụ tự động (Universal Auto Test)",
        guide: "Nhập dữ liệu vào trường input"
      },
      {
        action: "click",
        targetName: "Nút Lưu / Xác nhận / Submit",
        selector: "button[type='submit'], button:has-text('Lưu'), button:has-text('Xác nhận'), button:has-text('Save')",
        guide: "Click lưu form"
      },
      {
        action: "assert_state",
        guide: "Xác nhận Modal/Drawer đóng an toàn, bảng dữ liệu cập nhật thêm bản ghi mới mà không gián đoạn vị trí cuộn hay bộ lọc"
      }
    ]
  },

  // =========================================================================
  // JOURNEY 21: UNIVERSAL TABLE FILTER, SEARCH & PAGINATION
  // =========================================================================
  {
    id: "universal-table-filter-pagination-flow",
    name: "Chu Trình Lọc, Tìm Kiếm Debounce & Phân Trang Headless (Table Filter & Pagination)",
    type: "UNIVERSAL_INTERACTION",
    role: "USER",
    category: "UNIVERSAL_GENERIC",
    account: CANONICAL_ACCOUNT_CATALOG.USER,
    description: "Nhập từ khóa tìm kiếm -> Assert kết quả lọc debounce -> Bấm tab trạng thái -> Bấm chuyển trang -> Kiểm tra đồng bộ state qua URL shallow query param không gián đoạn giao diện",
    startUrl: "/dashboard",
    steps: [
      {
        action: "navigate",
        url: "/dashboard",
        guide: "Mở bảng dữ liệu"
      },
      {
        action: "fill",
        targetName: "Ô tìm kiếm (Search Input)",
        selector: "input[type='search'], input[placeholder*='tìm'], input[placeholder*='Search']",
        value: "Test",
        guide: "Nhập từ khóa tìm kiếm"
      },
      {
        action: "click",
        targetName: "Tab lọc trạng thái (Filter Tab)",
        selector: "[role='tab']:not([aria-selected='true']), button[data-filter]",
        guide: "Click chuyển đổi tab lọc dữ liệu"
      },
      {
        action: "click",
        targetName: "Nút chuyển trang kế tiếp (Next Page)",
        selector: "button:has-text('Tiếp'), button:has-text('Next'), button[aria-label='Next page'], [data-action='next-page']",
        guide: "Click chuyển sang trang dữ liệu kế tiếp"
      },
      {
        action: "assert_state",
        guide: "Xác nhận bảng dữ liệu cập nhật mượt mà theo trang mới mà KHÔNG làm giật trang hay reload trình duyệt"
      }
    ]
  },

  // =========================================================================
  // JOURNEY 22: UNIVERSAL INLINE EDIT & AUTO-SAVE
  // =========================================================================
  {
    id: "universal-inline-edit-autosave-flow",
    name: "Chu Trình Sửa Trực Tiếp Trên Ô Dữ Liệu & Tự Động Lưu (Inline Cell Editing & Auto-Save)",
    type: "UNIVERSAL_INTERACTION",
    role: "USER",
    category: "UNIVERSAL_GENERIC",
    account: CANONICAL_ACCOUNT_CATALOG.USER,
    description: "Click vào ô dữ liệu trên bảng -> Chuyển thành input textbox focused -> Sửa nội dung -> Nhấn Enter hoặc click ra ngoài -> Assert auto-save cập nhật tại chỗ",
    startUrl: "/dashboard",
    steps: [
      {
        action: "navigate",
        url: "/dashboard",
        guide: "Mở bảng dữ liệu có hỗ trợ sửa inline"
      },
      {
        action: "click",
        targetName: "Ô dữ liệu có thể sửa trực tiếp hoặc toggle switch",
        selector: "[data-editable='true'], td[role='gridcell'] button, button[role='switch']",
        guide: "Click kích hoạt inline editor hoặc đảo trạng thái switch"
      },
      {
        action: "assert_state",
        guide: "Xác nhận trạng thái tự động lưu (Auto-saved) thành công, xuất hiện indicator hoặc toast báo đã lưu"
      }
    ]
  },

  // =========================================================================
  // JOURNEY 23: UNIVERSAL SAFE DELETE WITH CONFIRMATION DIALOG
  // =========================================================================
  {
    id: "universal-delete-confirmation-flow",
    name: "Chu Trình Xóa An Toàn Kèm Hộp Thoại Xác Nhận (Safe Delete with Confirmation Dialog)",
    type: "UNIVERSAL_INTERACTION",
    role: "USER",
    category: "UNIVERSAL_GENERIC",
    account: CANONICAL_ACCOUNT_CATALOG.USER,
    description: "Click nút 'Xóa' trên một hàng dữ liệu -> Hộp thoại xác nhận SweetAlert2 / Modal xuất hiện -> Click 'Xác nhận xóa' -> Assert hàng bị gỡ khỏi bảng và xuất hiện Toast thành công",
    startUrl: "/dashboard",
    steps: [
      {
        action: "navigate",
        url: "/dashboard",
        guide: "Mở bảng dữ liệu"
      },
      {
        action: "click",
        targetName: "Nút Xóa trên hàng dữ liệu",
        selector: "button:has-text('Xóa'), button:has-text('Delete'), [data-action='delete']",
        guide: "Click nút xóa bản ghi"
      },
      {
        action: "assert_modal",
        targetName: "Hộp thoại xác nhận SweetAlert2",
        selector: ".swal2-container, dialog[modal], [role='dialog']",
        guide: "Xác nhận hộp thoại hỏi xác nhận 'Bạn có chắc chắn muốn xóa?' xuất hiện"
      },
      {
        action: "click",
        targetName: "Nút 'Hủy bỏ' hoặc 'Xác nhận xóa'",
        selector: ".swal2-cancel, button:has-text('Hủy'), .swal2-confirm, button:has-text('Xác nhận')",
        guide: "Click nút hành động trong hộp thoại xác nhận"
      },
      {
        action: "assert_state",
        guide: "Xác nhận hộp thoại đóng lại an toàn, bảo toàn tính toàn vẹn của giao diện"
      }
    ]
  },

  // =========================================================================
  // JOURNEY 24: UNIVERSAL DRAG-AND-DROP REORDER (@dnd-kit)
  // =========================================================================
  {
    id: "universal-dnd-reorder-flow",
    name: "Chu Trình Kéo Thả Đổi Thứ Tự Danh Sách / Kanban (Drag-and-Drop Reorder @dnd-kit)",
    type: "UNIVERSAL_INTERACTION",
    role: "USER",
    category: "UNIVERSAL_GENERIC",
    account: CANONICAL_ACCOUNT_CATALOG.USER,
    description: "Kéo thả phần tử từ vị trí A sang vị trí B bằng lệnh drag(pageId, from_uid, to_uid) -> Assert thứ tự mới được cập nhật tại chỗ",
    startUrl: "/dashboard",
    steps: [
      {
        action: "navigate",
        url: "/dashboard",
        guide: "Mở giao diện có kéo thả danh mục hoặc Kanban"
      },
      {
        action: "snapshot",
        guide: "Gọi take_snapshot(pageId) tìm uid phần tử nguồn và vị trí đích"
      },
      {
        action: "drag",
        targetName: "Khối phần tử cần kéo thả",
        guide: "Thực thi drag(pageId, from_uid, to_uid) qua Chrome DevTools MCP"
      },
      {
        action: "assert_state",
        guide: "Xác nhận vị trí mới được cập nhật tại chỗ mà không reload trang"
      }
    ]
  }
];

/**
 * Mapping between module IDs and their core business journeys
 */
export const MODULE_JOURNEY_MAP = {
  // Hospitality Domain
  guest_os: [
    "guest-frontdesk-closed-loop-flow",
    "marketplace-order-fulfillment-flow"
  ],
  frontdesk: [
    "frontdesk-booking-walkin-flow",
    "frontdesk-checkin-assignment-flow",
    "guest-frontdesk-closed-loop-flow",
    "frontdesk-billing-folio-checkout-flow",
    "frontdesk-housekeeping-room-ready-flow",
    "frontdesk-guest-declaration-kbtt-flow"
  ],
  housekeeping: [
    "frontdesk-housekeeping-room-ready-flow"
  ],
  owner: [
    "owner-channel-manager-batch-flow",
    "owner-channel-manager-inline-cell-flow",
    "owner-tape-chart-drag-and-drop-flow",
    "owner-room-inventory-crud-flow",
    "frontdesk-guest-declaration-kbtt-flow"
  ],
  marketplace: [
    "marketplace-order-fulfillment-flow"
  ],
  admin: [
    "owner-room-inventory-crud-flow",
    "saas-team-invite-rbac-flow",
    "universal-crud-drawer-flow"
  ],

  // E-Commerce Domain
  storefront: [
    "ecom-browse-cart-checkout-flow",
    "universal-table-filter-pagination-flow"
  ],
  customer: [
    "ecom-browse-cart-checkout-flow",
    "universal-crud-drawer-flow"
  ],
  vendor: [
    "ecom-merchant-fulfillment-flow",
    "ecom-product-crud-flow",
    "universal-inline-edit-autosave-flow"
  ],

  // SaaS Domain
  marketing: [
    "saas-subscription-upgrade-flow",
    "universal-table-filter-pagination-flow"
  ],
  workspace: [
    "saas-workspace-project-crud-flow",
    "universal-crud-drawer-flow",
    "universal-dnd-reorder-flow"
  ],
  team_billing: [
    "saas-team-invite-rbac-flow",
    "saas-subscription-upgrade-flow",
    "universal-crud-drawer-flow"
  ],

  // CRM Domain
  portal: [
    "crm-appointment-booking-flow"
  ],
  sales: [
    "crm-lead-pipeline-stage-flow",
    "universal-table-filter-pagination-flow"
  ],
  calendar: [
    "crm-appointment-booking-flow",
    "universal-dnd-reorder-flow"
  ],

  // Universal Generic Fallbacks
  public: [
    "universal-table-filter-pagination-flow"
  ],
  partner: [
    "universal-crud-drawer-flow",
    "universal-inline-edit-autosave-flow"
  ]
};

/**
 * Filter journeys relevant to a specific module ID with universal fallback
 */
export function listJourneysForModule(moduleId, domain = 'generic') {
  const journeyIds = MODULE_JOURNEY_MAP[moduleId] || [];
  let journeys = UNIVERSAL_INTERACTIVE_JOURNEYS.filter(j => journeyIds.includes(j.id));
  
  // If no journeys specifically mapped, provide universal generic journeys!
  if (journeys.length === 0) {
    journeys = UNIVERSAL_INTERACTIVE_JOURNEYS.filter(j => j.category === 'UNIVERSAL_GENERIC');
  }
  return journeys;
}

/**
 * Filter journeys relevant to a specific domain (hospitality, ecommerce, saas, crm, generic)
 */
export function listJourneysForDomain(domain = 'hospitality') {
  const domainKey = domain.toUpperCase();
  return UNIVERSAL_INTERACTIVE_JOURNEYS.filter(j => {
    if (domainKey === 'HOSPITALITY') return j.category && (j.category.includes('OPS') || j.category === 'TAPE_CHART' || j.category === 'RESERVATIONS' || j.category === 'ROOM_OPERATIONS' || j.category === 'HOTEL_INVENTORY' || j.category === 'HOTEL_SETUP' || j.category === 'COMPLIANCE_OPS' || j.category === 'BILLING_OPS');
    if (domainKey === 'ECOMMERCE') return j.category === 'ECOMMERCE_OPS' || j.category === 'UNIVERSAL_GENERIC';
    if (domainKey === 'SAAS') return j.category === 'SAAS_OPS' || j.category === 'UNIVERSAL_GENERIC';
    if (domainKey === 'CRM') return j.category === 'CRM_OPS' || j.category === 'UNIVERSAL_GENERIC';
    return j.category === 'UNIVERSAL_GENERIC';
  });
}

/**
 * Get a specific journey by unique ID
 */
export function getJourneyById(id) {
  return UNIVERSAL_INTERACTIVE_JOURNEYS.find(j => j.id === id);
}

/**
 * Filter journeys matching a specific role
 */
export function listJourneysForRole(role) {
  return UNIVERSAL_INTERACTIVE_JOURNEYS.filter(j => j.role === role || j.rolesInvolved?.includes(role));
}

/**
 * Filter closed-loop lifecycle journeys
 */
export function listLifecycleJourneys() {
  return UNIVERSAL_INTERACTIVE_JOURNEYS.filter(j => j.type === "CROSS_ROLE_LIFECYCLE");
}

/**
 * Generate human-readable step-by-step guidance for an interactive journey
 */
export function generateStepByStepGuide(journey) {
  if (!journey) return '';
  const lines = [
    `# HƯỚNG DẪN CHI TIẾT NGHIỆP VỤ: ${journey.name}`,
    `- Phân loại: ${journey.type} (${journey.category})`,
    `- Mô tả: ${journey.description}`,
    ``
  ];

  if (journey.stages) {
    journey.stages.forEach(stage => {
      lines.push(`## Giai đoạn ${stage.stageIndex}: [${stage.actor}] ${stage.title}`);
      if (stage.account) {
        lines.push(`- Tài khoản: **${stage.account.title}**`);
        if (stage.account.authRequired) {
          lines.push(`  * Email/User: \`${stage.account.defaultUsername}\``);
          lines.push(`  * Password: \`${stage.account.defaultPassword}\``);
          lines.push(`  * URL Đăng nhập: \`${stage.account.loginUrl}\``);
        } else {
          lines.push(`  * Không cần đăng nhập. URL khởi đầu: \`${stage.startUrl}\``);
        }
      }
      lines.push(`### Các bước thực hiện:`);
      stage.steps.forEach((s, idx) => {
        lines.push(`  ${idx + 1}. **[${s.action.toUpperCase()}]**: ${s.guide}`);
        if (s.targetName) lines.push(`     - Mục tiêu click/fill: \`${s.targetName}\``);
        if (s.selector) lines.push(`     - Bộ chọn gợi ý: \`${s.selector}\``);
        if (s.value) lines.push(`     - Dữ liệu nhập: \`${s.value}\``);
      });
      lines.push(``);
    });
  } else if (journey.steps) {
    if (journey.account) {
      lines.push(`## Thông Tin Tài Khoản: **${journey.account.title}**`);
      if (journey.account.authRequired) {
        lines.push(`- Email/User: \`${journey.account.defaultUsername}\``);
        lines.push(`- Password: \`${journey.account.defaultPassword}\``);
        lines.push(`- URL Đăng nhập: \`${journey.account.loginUrl}\``);
      }
      lines.push(``);
    }
    lines.push(`## Các bước thực hiện:`);
    journey.steps.forEach((s, idx) => {
      lines.push(`  ${idx + 1}. **[${s.action.toUpperCase()}]**: ${s.guide || s.description}`);
      if (s.targetName) lines.push(`     - Mục tiêu: \`${s.targetName}\``);
      if (s.selector) lines.push(`     - Bộ chọn gợi ý: \`${s.selector}\``);
      if (s.value) lines.push(`     - Dữ liệu nhập: \`${s.value}\``);
    });
  }

  return lines.join('\n');
}
