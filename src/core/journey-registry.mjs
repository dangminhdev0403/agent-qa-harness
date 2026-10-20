/**
 * Canonical Interactive Journey Registry
 * Defines end-to-end multi-role interactive user flows with concrete DOM actions
 * (Clicks, Typing, Modal Triggers, Tab Switching, State Assertions)
 */

export const UNIVERSAL_INTERACTIVE_JOURNEYS = [
  {
    id: "guest-room-service-flow",
    name: "Khách Đặt Dịch Vụ Tại Phòng (Guest Room Service Journey)",
    role: "GUEST",
    description: "Khách quét mã QR phòng, duyệt menu, điền form yêu cầu, bấm gửi và nhận mã đơn",
    startUrl: "/g/DEMO_QR_ROOM_101",
    steps: [
      {
        action: "navigate",
        url: "/g/DEMO_QR_ROOM_101",
        description: "Mở trang chào mừng khách quét mã QR phòng"
      },
      {
        action: "wait_for",
        selector: "main, [data-testid='guest-home'], a, button",
        description: "Chờ trang chủ khách hiển thị đầy đủ"
      },
      {
        action: "click",
        selector: "a[href*='services'], button:has-text('Dịch vụ'), a:has-text('Dịch vụ'), [data-testid='nav-services']",
        fallbackUrl: "/g/services",
        description: "Click chuyển sang trang danh mục Dịch vụ phòng"
      },
      {
        action: "click",
        selector: "button:has-text('Yêu cầu'), button:has-text('Đặt'), [data-testid='service-item'], .service-card",
        description: "Click chọn một món đồ dùng / dịch vụ buồng phòng"
      },
      {
        action: "fill",
        selector: "textarea, input[name='note'], input[name='description'], [data-testid='request-note']",
        value: "Yêu cầu 2 khăn tắm bổ sung (Kiểm thử tương tác tự động)",
        description: "Nhập ghi chú chi tiết vào ô form"
      },
      {
        action: "click",
        selector: "button[type='submit'], button:has-text('Gửi yêu cầu'), button:has-text('Xác nhận')",
        description: "Click bấm nút Gửi yêu cầu"
      },
      {
        action: "assert_feedback",
        description: "Kiểm tra xuất hiện toast thành công hoặc modal xác nhận đơn hàng"
      }
    ]
  },
  {
    id: "frontdesk-receptionist-approval-flow",
    name: "Lễ Tân Tiếp Nhận & Điều Phối Yêu Cầu (Frontdesk Handling Journey)",
    role: "HOTEL_FRONTDESK",
    description: "Lễ tân đăng nhập, duyệt các tab trạng thái, mở chi tiết yêu cầu, bấm tiếp nhận",
    startUrl: "/staff/front-desk",
    authRequired: true,
    steps: [
      {
        action: "navigate",
        url: "/staff/front-desk",
        fallbackUrl: "/hotels/HCA_HOMESTAY/requests",
        description: "Mở bảng điều phối Lễ tân / Yêu cầu phòng"
      },
      {
        action: "click_tabs",
        selector: "[role='tab'], .tab-btn, button[data-tab]",
        description: "Click chuyển đổi giữa các tab trạng thái (Tất cả, Đang xử lý, Chờ duyệt)"
      },
      {
        action: "click",
        selector: "[data-testid='request-card'], .request-item, tr[data-row-id]",
        description: "Click vào một yêu cầu trên bảng điều phối"
      },
      {
        action: "assert_drawer",
        selector: "[role='dialog'], [data-state='open'], .drawer-content",
        description: "Xác nhận Drawer chi tiết mở tại chỗ (Tab Isolation Standard)"
      },
      {
        action: "click",
        selector: "button:has-text('Tiếp nhận'), button:has-text('Hoàn thành'), button:has-text('Xử lý')",
        description: "Bấm nút Tiếp nhận hoặc Hoàn thành yêu cầu"
      }
    ]
  },
  {
    id: "owner-tape-chart-management-flow",
    name: "Chủ Khách Sạn Thao Tác Tape Chart & Quỹ Phòng (Owner Tape Chart Journey)",
    role: "TENANT_OWNER",
    description: "Chủ khách sạn đăng nhập, chuyển đổi bộ lọc phòng, mở drawer chi tiết phòng",
    startUrl: "/owner/dashboard",
    authRequired: true,
    steps: [
      {
        action: "navigate",
        url: "/owner/hotels/cmu9y158p0001j8v487zujvhn/channel-manager",
        fallbackUrl: "/owner/dashboard",
        description: "Mở màn hình Quản lý Quỹ phòng / Channel Manager"
      },
      {
        action: "click",
        selector: "button:has-text('Giá & Quỹ phòng'), a:has-text('Giá & Quỹ phòng'), [data-tab='RATES']",
        description: "Click tab Giá & Quỹ phòng (Kiểm tra cập nhật query param ?tab=RATES tại chỗ)"
      },
      {
        action: "click",
        selector: "button:has-text('Đơn đặt phòng OTA'), a:has-text('Đơn đặt phòng OTA'), [data-tab='BOOKINGS']",
        description: "Click tab Đơn đặt phòng OTA (Kiểm tra cập nhật query param ?tab=BOOKINGS tại chỗ)"
      },
      {
        action: "click",
        selector: "button:has-text('Lọc'), button:has-text('Bộ lọc'), [data-testid='filter-button']",
        description: "Click mở popover / drawer bộ lọc phòng"
      }
    ]
  }
];
