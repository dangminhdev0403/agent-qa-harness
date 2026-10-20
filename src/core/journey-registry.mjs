/**
 * Canonical Interactive Journey Registry
 * Defines end-to-end multi-role interactive user flows with concrete DOM actions
 * (Clicks, Typing, Inline Cell Edits, Modal Triggers, Tab Switching, Drag-and-Drop, State Assertions)
 */

export const UNIVERSAL_INTERACTIVE_JOURNEYS = [
  {
    id: "guest-room-service-flow",
    name: "Khách Đặt Dịch Vụ Tại Phòng (Guest Room Service Journey)",
    role: "GUEST",
    category: "GUEST_OS",
    description: "Khách quét mã QR phòng, duyệt menu, điền form yêu cầu, bấm gửi và nhận mã đơn",
    startUrl: "/g/DEMO_QR_ROOM_101",
    steps: [
      {
        action: "navigate",
        url: "/g/DEMO_QR_ROOM_101",
        description: "Mở trang chào mừng khách quét mã QR phòng"
      },
      {
        action: "snapshot",
        description: "Gọi take_snapshot(pageId) lấy cây accessibility và uids phần tử"
      },
      {
        action: "click",
        selector: "a[href*='services'], button:has-text('Dịch vụ'), a:has-text('Dịch vụ'), [data-testid='nav-services']",
        fallbackUrl: "/g/services",
        description: "Click chuyển sang trang danh mục Dịch vụ buồng phòng"
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
        description: "Nhập ghi chú chi tiết vào ô form yêu cầu"
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
    category: "FRONTDESK_OPS",
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
        action: "snapshot",
        description: "Gọi take_snapshot(pageId) để phân tích danh sách thẻ yêu cầu"
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
        description: "Xác nhận Drawer chi tiết mở tại chỗ (Tab Isolation Standard: zero cross-page redirect)"
      },
      {
        action: "click",
        selector: "button:has-text('Tiếp nhận'), button:has-text('Hoàn thành'), button:has-text('Xử lý')",
        description: "Bấm nút Tiếp nhận hoặc Hoàn thành yêu cầu"
      }
    ]
  },
  {
    id: "owner-channel-manager-batch-flow",
    name: "Cập Nhật Bảng Giá Hàng Loạt (Channel Manager Batch Update Modal)",
    role: "TENANT_OWNER",
    category: "HOTEL_INVENTORY",
    description: "Mở modal cập nhật giá hàng loạt, chọn tất cả hạng phòng, nhập mức giá mới và hủy/lưu in-place",
    startUrl: "/owner/hotels/cmu9y158p0001j8v487zujvhn/channel-manager",
    authRequired: true,
    steps: [
      {
        action: "navigate",
        url: "/owner/hotels/cmu9y158p0001j8v487zujvhn/channel-manager",
        description: "Điều hướng đến màn hình Kho Phòng & Kênh Bán"
      },
      {
        action: "snapshot",
        description: "Gọi take_snapshot(pageId) lấy uid của nút 'Cập nhật hàng loạt'"
      },
      {
        action: "click",
        selector: "button:has-text('Cập nhật hàng loạt')",
        description: "Click nút 'Cập nhật hàng loạt' để kích hoạt Modal"
      },
      {
        action: "assert_modal",
        selector: "dialog[modal], [role='dialog']",
        description: "Xác nhận Modal 'Cập Nhật Bảng Giá Hàng Loạt' hiển thị tại chỗ"
      },
      {
        action: "click",
        selector: "button:has-text('Chọn tất cả hạng phòng hợp lệ')",
        description: "Chọn áp dụng đồng loạt cho tất cả hạng phòng"
      },
      {
        action: "fill",
        selector: "input[placeholder*='giá'], spinbutton",
        value: "2500000",
        description: "Nhập mức giá mới 2.500.000 VND / đêm"
      },
      {
        action: "click",
        selector: "button:has-text('Hủy bỏ')",
        description: "Click nút 'Hủy bỏ' để đóng Modal an toàn"
      },
      {
        action: "assert_closed",
        description: "Xác nhận Modal đóng lại, giao diện bảng lịch giữ nguyên vị trí cuộn và dữ liệu"
      }
    ]
  },
  {
    id: "owner-channel-manager-inline-cell-flow",
    name: "Chỉnh Sửa Trực Tiếp Ô Lịch & Trạng Thái Bán (Inline Cell Editing & Sell Status Toggle)",
    role: "TENANT_OWNER",
    category: "HOTEL_INVENTORY",
    description: "Click trực tiếp vào ô trạng thái đóng/mở bán để chuyển đổi tức thời và click ô giá để nhập giá mới",
    startUrl: "/owner/hotels/cmu9y158p0001j8v487zujvhn/channel-manager",
    authRequired: true,
    steps: [
      {
        action: "navigate",
        url: "/owner/hotels/cmu9y158p0001j8v487zujvhn/channel-manager",
        description: "Điều hướng đến màn hình Kho Phòng & Kênh Bán"
      },
      {
        action: "snapshot",
        description: "Gọi take_snapshot(pageId) lấy uid các nút cell trong bảng lịch ARI"
      },
      {
        action: "click",
        selector: "button[description*='Nhấp để đóng bán'], button:has-text('Đóng bán')",
        description: "Click chuyển đổi trạng thái bán từ 'Đang mở bán' sang 'Đang đóng bán'"
      },
      {
        action: "assert_cell_updated",
        description: "Xác nhận text trạng thái chuyển thành 'Đang đóng bán' mà không cần reload trang"
      },
      {
        action: "click",
        selector: "button[description*='Nhấp để mở bán'], button:has-text('Mở bán')",
        description: "Click đảo ngược lại trạng thái sang 'Đang mở bán'"
      },
      {
        action: "click",
        selector: "button[description*='Nhấp để sửa giá bán']",
        description: "Click vào ô giá đêm để kích hoạt inline input textbox"
      },
      {
        action: "assert_textbox",
        description: "Xác nhận xuất hiện textbox focusable để sửa giá tại chỗ"
      }
    ]
  },
  {
    id: "owner-tape-chart-drag-and-drop-flow",
    name: "Kéo Thả Đổi Phòng Trên Tape Chart / Sơ Đồ Phòng (@dnd-kit Drag-and-Drop)",
    role: "TENANT_OWNER",
    category: "TAPE_CHART",
    description: "Kéo thẻ đặt phòng từ phòng/ngày nguồn sang phòng/ngày đích sử dụng lệnh drag(pageId, from_uid, to_uid)",
    startUrl: "/owner/hotels/cmu9y158p0001j8v487zujvhn/channel-manager",
    authRequired: true,
    steps: [
      {
        action: "navigate",
        url: "/owner/hotels/cmu9y158p0001j8v487zujvhn/channel-manager",
        description: "Mở màn hình Tape Chart / Channel Manager"
      },
      {
        action: "snapshot",
        description: "Gọi take_snapshot(pageId) để tìm uid của block đặt phòng (from_uid) và ô trống đích (to_uid)"
      },
      {
        action: "drag",
        description: "Thực thi drag(pageId, from_uid, to_uid) qua Chrome DevTools MCP"
      },
      {
        action: "assert_dnd_reassigned",
        description: "Xác nhận thẻ đặt phòng được chuyển slot thành công, cập nhật state tại chỗ, 0 reload, 0 console error"
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
  return UNIVERSAL_INTERACTIVE_JOURNEYS.filter(j => j.role === role);
}

/**
 * Generate Chrome MCP instructions for subagents executing this journey
 */
export function generateChromeMCPInstructions(journey, pageId = 1) {
  if (!journey) return '';
  const lines = [
    `=== INTERACTIVE PROTOCOL CHO JOURNEY: "${journey.name}" ===`,
    `ROLE: ${journey.role} | START URL: ${journey.startUrl}`,
    `MỤC TIÊU: Thực hiện tương tác DOM thật (Snapshot -> UID -> Click/Fill/Drag -> Assert). NGHIÊM CẤM chỉ ping GET link.`,
    `CÁC BƯỚC THAO TÁC CỤ THỂ:`
  ];

  journey.steps.forEach((step, idx) => {
    lines.push(`  ${idx + 1}. [${step.action.toUpperCase()}]: ${step.description}`);
  });

  return lines.join('\n');
}
