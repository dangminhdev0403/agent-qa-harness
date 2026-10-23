/**
 * Canonical Interactive Journey Registry
 * Defines end-to-end multi-role interactive user flows with concrete DOM actions
 * (Clicks, Typing, Inline Cell Edits, Modal Triggers, Tab Switching, Drag-and-Drop, State Assertions)
 * and closed-loop cross-persona business lifecycles.
 */

/**
 * Standard Canonical Account Catalog across VietSage & Hospitality Systems
 */
export const CANONICAL_ACCOUNT_CATALOG = {
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
  }
};

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
  }
];

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
