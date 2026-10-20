# Sổ Tay Hành Động Độc Lập Cho AI Agents (Agent Autonomous Playbook)

> **Cẩm nang vận hành dành cho AI Agents (Antigravity, Codex, Orca, Claude) khi làm việc với `agent-qa-harness`.**  
> Bản hướng dẫn này quy định cách Agent tiếp nhận nhiệm vụ, tự khám phá hệ thống, viết test, và tự phục hồi lỗi mà không cần sự can thiệp thủ công từ con người.

---

## 1. Vòng Đời Vận Hành Chuẩn Của Agent (The Agent Lifecycle)

```
[ Nhận Yêu Cầu Task ]
         │
         ▼
[ BƯỚC 0: Khử Mơ Hồ Bằng Option (NẾU PROMPT MƠ HỒ) ]
• Nếu User ra lệnh chung chung ("test đi", "soát lỗi", "kiểm tra dự án"):
  -> BẮT BUỘC dùng tool ask_question hiển thị Modal chọn Mode:
     [1] Chế độ 1: Test Code & Độ Ổn Định (Types, Build, UI Rules, Sockets, Race condition)
     [2] Chế độ 2: Test Flow Luồng & Giao Diện Thực Tế bằng Chrome MCP
     [3] Chạy Toàn Diện cả 2 Chế Độ (Full Dual-Pass)
         │
         ▼
[ BƯỚC 1: Khám Phá Dự Án (Preflight) ]
• Dự án đã có harness.config.json chưa?
  -> CHƯA: Chạy `agent-harness discover` để tự động lập bản đồ kiểm thử.
  -> ĐÃ CÓ: Đọc file cấu hình để nắm các route, socket, mutation hiện hữu.
         │
         ▼
[ BƯỚC 2: Thực Thi Code Tính Năng ]
• Tuân thủ nghiêm ngặt Tech Stack (Zustand, Zod, In-place Tab, SwalVietSage).
• Giữ nguyên vẹn mã nguồn các file không thuộc phạm vi task.
         │
         ▼
[ BƯỚC 3: Đồng Bộ Kịch Bản Kiểm Thử (Living Spec Sync) ]
• Thêm hoặc nâng cấp kịch bản tương ứng vào harness:
  * Nếu thêm UI/Màn hình: `agent-harness add:flow "<tên>"`
  * Nếu thêm Realtime: `agent-harness add:socket "<tên>"`
  * Nếu thêm Duyệt đơn / Thanh toán: `agent-harness add:concurrency "<tên>"`
         │
         ▼
[ BƯỚC 4: Chạy Kiểm Thử Theo Đúng Chế Độ ]
• Nếu Mode 1: Chạy `agent-harness test:code`
• Nếu Mode 2: Chạy `agent-harness test:flow` hoặc kích hoạt Chrome DevTools MCP
• Nếu Mode All: Chạy `agent-harness run`
         │
   ┌─────┴─────┐
   ▼           ▼
[ PASS: 0 Lỗi ]   [ FAIL: Có Lỗi ]
   │                     │
   │                     ▼
   │          [ BƯỚC 5: Tự Phục Hồi (Self-Healing Loop) ]
   │          • Đọc `harness-out/INCIDENT_PACK.json`.
   │          • Định vị chính xác Gateway/Controller/Component bị lỗi.
   │          • Sửa mã nguồn & chạy lại probe mục tiêu: `agent-harness probe:<tier>`.
   │          • Quay lại Bước 4 cho đến khi đạt 100% PASS.
   ▼
[ Hoàn Tất & Xuất Báo Cáo Cho User ]
```

---

## 2. Quy Trình Chẩn Đoán & Khắc Phục Lỗi Tự Động Theo Từng Tầng

Khi lệnh `agent-harness run` trả về Exit Code `1`, Agent **TUYỆT ĐỐI KHÔNG** dừng lại để hỏi User. Agent mở file `harness-out/INCIDENT_PACK.json` và tra cứu danh mục chẩn đoán dưới đây:

### 🛡️ QUY TẮC CÔ LẬP NHÁNH & CHỐNG VÒNG LẶP VĨNH VIỄN (Multi-Agent Conflict Guard)

Khi có từ 2 Agents hoặc 2 task cùng chạy song song:
1. **Phát Hiện Dấu Hiệu Trùng Lặp**:
   - Nếu trong `INCIDENT_PACK.json` có trường `"circuitBreakerTripped": true`:
     - **BẮT BUỘC DỪNG NGAY LẬP TỨC!** Đã quá 3 lần thử tự động sửa code nhưng lỗi vẫn lặp lại.
     - Không cố chấp sửa tiếp để tránh tạo ra vòng lặp sửa code vĩnh viễn (Infinite Editing Ping-Pong) giữa 2 Agents.
     - Báo cáo rõ ràng: *"Đã thử sửa 3 lần nhưng không thành công do xung đột kiến trúc/logic. Cần User xem xét."*
2. **Tự Động Tách Nhánh Cô Lập (Branch Isolation)**:
   - Khi sửa lỗi, Agent chủ động chạy:
     ```bash
     git checkout -b harness-fix/<tính-năng>-<timestamp>
     ```
   - Chỉnh sửa trên nhánh cô lập này, chạy test xác nhận pass rồi mới tạo Pull Request hoặc merge về nhánh chính. Tuyệt đối không sửa thẳng lên nhánh `master`/`main` khi có nghi vấn agent khác đang sửa cùng file!

---

### 🔴 Sự cố Tier 0: Static & Contract Gate Thất Bại
- **Dấu hiệu**: Báo lỗi cỡ chữ `< 12px`, thiếu `text-balance` trên tiêu đề, hoặc Zod schema không khớp với payload.
- **Cách Agent tự sửa**:
  1. Thay thế các class micro-font (`text-[10px]`, `text-[11px]`) thành `text-xs` (12px).
  2. Bổ sung `text-balance` vào thẻ `h1`, `h2`, `h3`, `h4`.
  3. Cập nhật Zod schema trong `domain/schemas/` khớp với DTO backend và gọi `parseWithZod`.

---

### 🔴 Sự cố Tier 1: Realtime Socket Probe Timeout (Lỗi "Socket không ăn")
- **Dấu hiệu**: Báo `Socket timeout after 3000ms. Event '...' was never received`.
- **Nguyên nhân cốt lõi & Cách sửa**:
  1. **Lệch tên Room / Multi-Tenant Isolation**:
     - *Kiểm tra*: Client join vào room `hotel:123`, nhưng Backend Redis Pub/Sub lại emit vào room `hotel_123` hoặc thiếu tiền tố tenant.
     - *Cách sửa*: Đồng bộ lại chuỗi định danh room giữa Socket Gateway và Event Publisher.
  2. **Token Handshake Hết Hạn / Sai Quyền**:
     - *Kiểm tra*: Socket client gửi token thiếu role hoặc payload `auth: { token }` không được Gateway giải mã ở hàm `handleConnection`.
     - *Cách sửa*: Cập nhật Guard xác thực WebSocket để giải mã đúng định dạng token.
  3. **Lệch tên Event**:
     - *Kiểm tra*: Frontend lắng nghe `REQUEST_CREATED` nhưng backend emit `request_created`.

---

### 🔴 Sự cố Tier 2: Concurrency Gate Thất Bại (Duyệt Đúp / Race Condition)
- **Dấu hiệu**: Báo `Double-approval violation! Expected 1 HTTP 200, but got 2 (or more)`.
- **Nguyên nhân cốt lõi & Cách sửa**:
  1. **Thiếu Khóa Tranh Chấp (Mutex / Database Lock)**:
     - 2 request cùng đọc trạng thái `PENDING` và cùng cập nhật thành `APPROVED`.
     - *Cách sửa*: 
       - Áp dụng **Optimistic Locking** (kiểm tra `version` hoặc `WHERE status = 'PENDING'`).
       - Hoặc dùng **Pessimistic Locking** (`SELECT ... FOR UPDATE` trong transaction của Prisma / TypeORM).
       - Hoặc dùng Redis Distributed Lock (Redlock) tại Controller.

---

### 🔴 Sự cố Tier 3: Browser Scanner Báo Lỗi Giao Diện / Lỗi Ngầm
- **Dấu hiệu**: Báo lỗi `TypeError: Cannot read properties of undefined` hoặc API ngầm trả về `404` / `500`.
- **Cách Agent tự sửa**:
  1. **Lỗi React Hydration Mismatch**: Kiểm tra các đoạn code đọc `localStorage` hoặc `window` trong quá trình SSR ban đầu. Chuyển sang đọc trong `useEffect` hoặc sử dụng Zustand với `persist + safeStorage`.
  2. **Lỗi API ngầm 404/500**: Kiểm tra đường dẫn URL API trong repository / TanStack Query resource hook, đảm bảo tiền tố `/api/v1` không bị thừa hoặc thiếu dấu `/`.
  3. **Lỗi Vi Phạm Tab Isolation**: Nếu có nút bấm kích hoạt chuyển trang làm mất bộ lọc của tab, chuyển đổi hành động đó sang mở Drawer/Modal tại chỗ (*In-Place Action*).

---

## 3. Tương Tác Trực Tiếp Với Chrome DevTools MCP

Khi User yêu cầu: *"Hãy test giao diện này bằng chrome_mcp"*, Agent tuân thủ nghiêm ngặt chuỗi gọi công cụ:
1. `call_mcp_tool` $\rightarrow$ `chrome-devtools-mcp` $\rightarrow$ `navigate_page` (`url: "http://localhost:3000/..."`).
2. `call_mcp_tool` $\rightarrow$ `chrome-devtools-mcp` $\rightarrow$ `list_console_messages` (đảm bảo sạch lỗi trước khi thao tác).
3. `call_mcp_tool` $\rightarrow$ `chrome-devtools-mcp` $\rightarrow$ `fill` / `click` (thực hiện nghiệp vụ người dùng).
4. `call_mcp_tool` $\rightarrow$ `chrome-devtools-mcp` $\rightarrow$ `list_network_requests` (xác nhận mọi API ngầm đều trả về `200` / `201`).
5. `call_mcp_tool` $\rightarrow$ `chrome-devtools-mcp` $\rightarrow$ `take_screenshot` (lưu lại bằng chứng nghiệm thu).
