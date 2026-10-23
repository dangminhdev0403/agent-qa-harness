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
  }
];

/**
 * Mapping between module IDs and their core business journeys
 */
export const MODULE_JOURNEY_MAP = {
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
    "owner-room-inventory-crud-flow"
  ]
};

/**
 * Filter journeys relevant to a specific module ID
 */
export function listJourneysForModule(moduleId) {
  const journeyIds = MODULE_JOURNEY_MAP[moduleId] || [];
  return UNIVERSAL_INTERACTIVE_JOURNEYS.filter(j => journeyIds.includes(j.id));
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
