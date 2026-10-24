# AI Agent Autonomous Playbook (Compact Execution Spec)
> **Audience**: AI Coding Agents (Antigravity, Codex, Orca). Language: English (Machine-optimal imperative grammar, dense whitespace).

---

## 0. HƯỚNG ĐI CHIẾN LƯỢC: AUTO TEST - THAO TÁC NGƯỜI DÙNG THẬT - TÌM LỖI - GHI LỖI TOÀN DIỆN
Toàn bộ quy trình kiểm thử tự động của Harness được xây dựng trên 4 trụ cột cốt lõi:

### Trụ Cột 1: Tự Động Phân Tích & Thích Ứng Đa Dự Án (Zero-Config Multi-Domain Engine)
- Khi bật lệnh `agent-harness test:auto` (hoặc `agent-harness sync`), hệ thống tự động quét toàn bộ cây route và phân tích domain:
  * **Hospitality (PMS/Hotel OS)**: Sơ đồ phòng, Tape Chart, Buồng phòng, Khai báo BCA, Channel Manager.
  * **E-Commerce**: Duyệt danh mục, Thêm giỏ hàng, Mini-cart drawer, Checkout COD/Card, Nhà bán hàng xử lý đơn.
  * **B2B SaaS**: Không gian làm việc, Quản lý dự án, Mời thành viên & phân quyền RBAC, Nâng cấp gói thuê bao Pro.
  * **CRM / Booking Manager**: Phễu cơ hội Kanban kéo thả, Đặt lịch hẹn chuyên viên, Đổi lịch in-place.
  * **Universal Generic**: Bảng dữ liệu Headless, Modal/Drawer CRUD, Sửa ô inline auto-save, Xóa an toàn.
- Tự động nạp tài khoản kiểm thử và kịch bản nghiệp vụ tương ứng từ `CANONICAL_ACCOUNT_CATALOG` mà không bắt người dùng cấu hình thủ công.

### Trụ Cột 2: Thao Tác Sâu Như Người Dùng Thật (Authentic Human Interaction Protocol)
- **Tuyệt đối cấm kiểm thử qua loa**: Chấm dứt việc chỉ get link tĩnh hay đăng nhập rồi thoát!
- Mô phỏng hành vi người dùng thật qua 4 tầng:
  1. **Đăng nhập thật**: Điền credentials, lưu trữ JWT/session an toàn.
  2. **Form CRUD Thực Tế**: Điền dữ liệu ngữ cảnh hợp lý (Họ tên, SĐT, CCCD, Tiền cọc, Địa chỉ), bấm nút Lưu.
  3. **In-Place Tab Isolation**: Mở modal/drawer tại chỗ, không nhảy trang, bảo toàn thanh cuộn và bộ lọc.
  4. **Tương tác Phức tạp**: Lọc tab không reload, sửa inline cell tự lưu, kéo thả (@dnd-kit drag-and-drop), và kiểm tra WebSocket đồng bộ 2 cửa sổ realtime.

### Trụ Cột 3: Bộ Dò Lỗi Đa Tầng (Deep Bug Detector & Oracles)
Hệ thống tự động phát hiện và ghi nhận 6 loại khiếm khuyết phần mềm:
1. **Lỗi Runtime/Console**: Bắt mọi `console.error`, unhandled rejections, TypeError, React hydration mismatch.
2. **Lỗi Mạng/API**: Bắt request 4xx, 5xx, failed fetch/xhr, timeout.
3. **Lỗi Nút Chết (Unresponsive Clicks)**: Bấm nút nhưng DOM không phản hồi, không modal, không spinner, không API call.
4. **Lỗi Thiết Kế UI**: Cỡ chữ vi phạm sàn font < 12px, tiêu đề thiếu `text-balance` gãy dòng cộc lốc.
5. **Lỗi Database Schema**: Bắt lỗi Prisma P2022 thiếu cột, P2025 không tìm thấy record, vi phạm Foreign Key.
6. **Lỗi An Ninh RBAC**: Bắt lỗi 403 Forbidden chặn quyền.

### Trụ Cột 4: Ghi Lỗi Có Cấu Trúc & Phân Định Ranh Giới (Incident Dossier & Fix Boundary)
- Tự động xuất hồ sơ sự cố vào `harness-out/INCIDENT_PACK.json` và `harness-out/SUMMARY_REPORT.md`.
- **Ranh giới Sửa vs Báo cáo (Fix vs No-Fix Boundary)**:
  * **Nhóm 1: Lỗi Database (REPORT_ONLY_DATABASE)** -> CẤM tự sửa schema / ALTER TABLE; lập hồ sơ gửi DBA kèm script SQL đề xuất.
  * **Nhóm 2: Lỗi Phân Quyền RBAC (REPORT_ONLY_RBAC)** -> CẤM gỡ `@UseGuards()`; báo cáo role thiếu cho lead; cho phép sửa UI Toast hiển thị thân thiện.
  * **Nhóm 3: Lỗi UI/Frontend (AUTO_FIXABLE_UI)** -> Cho phép Subagent tự động sửa chữa an toàn trên nhánh cô lập `Workspace: 'branch'`.

---

## 1. AGENT OPERATIONAL STATE MACHINE
```text
[Prompt Received]
  ├── Trigger matches ("Bật harness" | "test harness" | ambiguous test intent)?
  │     ├── 1. EXEC: `agent-harness sync` (Auto-discover routes/sockets/mutations/portless).
  │     ├── 2. PREFLIGHT PREREQUISITE AUDIT: `agent-harness audit:prerequisites`.
  │     │       └── Missing Auth Wall credentials or Dynamic Fixtures? -> HALT & PROMPT USER. Never run superficial tests.
  │     ├── 3. CALL: `ask_question` tool with 4 options (Dual-Pass, Mode 1 Code, Mode 2 Flow, Status).
  │     └── 4. SUBAGENT SWARM DISPATCH (Accelerated parallel execution):
  │              ├── Worker 1 (flash): `agent-harness test:code --auto-start`
  │              └── Worker 2 (inherit): `agent-harness test:flow` on dedicated Chrome window (`new_page`)
  ├── Feature Code Finished?
  │     ├── EXEC: `agent-harness add:<flow|socket|concurrency> "<name>"` (Deduplicates & upgrades in-place).
  │     └── EXEC: `agent-harness run` (Mandatory zero-excuse verification gate).
  └── Outcome Check:
        ├── EXIT 0 -> Write summary, conclude task.
        ├── EXIT 2 (CIRCUIT BREAKER) -> HALT immediately. Max 3 retries exceeded. Escalate to human.
        └── EXIT 1 (FAILURE) -> READ `harness-out/INCIDENT_PACK.json`, launch `qa-branch-fixer` (`Workspace: 'branch'`), patch root cause, re-probe.
```

---

## 2. DEDICATED CHROME WINDOW LIFECYCLE PROTOCOL (STRICT ANTI-COLLISION)
Subagents performing Mode 2 or interactive browser testing MUST adhere to dedicated window boundaries:
1. `new_page` (`url: "http://localhost:3000/..."`): MANDATORY. Never hijack active tabs. Spawn a dedicated Chrome window/tab and store returned `pageId`.
2. `select_page` (`pageId`): Bind active context to dedicated target before executing actions.
3. `list_console_messages`: Assert ZERO `error` level messages (unhandled rejections, type errors, React hydration errors).
4. `list_network_requests`: Assert ZERO `4xx` or `5xx` responses on all background fetches/XHR.
5. `fill` / `click`: Perform user journey actions declared in `harness.config.json` flows.
6. `wait_for` (`selector` or delay): Ensure DOM element is visible; verify Tab Isolation standard (In-place drawer/modal, zero cross-tab redirect).
7. `take_screenshot` (`filePath: "harness-out/screenshots/<sessionId>/..."`): Persist checkpoint image.
8. `close_page` (`pageId`): MANDATORY TEARDOWN. Close dedicated target upon test completion (PASS or FAIL) to prevent resource leakage.

---

## 3. CANONICAL ACCOUNT CATALOG & MULTI-PERSONA SWARM

### 3.1 Canonical Accounts Directory
| Role | Title | Login URL | Default Username | Default Password | Primary Workspace / Route |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GUEST` | Khách Lưu Trú | Không cần login | N/A | N/A | `/g/DEMO_QR_ROOM_101` |
| `HOTEL_FRONTDESK` | Nhân Viên Lễ Tân | `/dangnhap` | `frontdesk@vietsage.vn` | `Admin@123` | `/staff/front-desk` |
| `HOUSEKEEPING` | Nhân Viên Buồng Phòng | `/dangnhap` | `housekeeping@vietsage.vn` | `Admin@123` | `/hotels/HCA_HOMESTAY/rooms` |
| `TENANT_OWNER` | Chủ Khách Sạn | `/dangnhap` | `thucvn@gmail.com` (hoặc `tenant@vietsage.vn`) | `Admin@123` | `/owner/dashboard` & Channel Manager |
| `SUPER_ADMIN` | Quản Trị Nền Tảng | `/dangnhap` | `admin@vietsage.vn` | `Admin@123` | `/admin/dashboard` |

### 3.2 Closed-Loop Multi-Persona Swarm Architecture
To test true end-to-end business lifecycle scenarios, spawn concurrent persona subagents via `agent-harness subagents:personas`:
1. `QA Guest Persona`: Dedicated window (`new_page` -> `/g/DEMO_QR_ROOM_101`). Tạo yêu cầu dịch vụ buồng phòng, gửi đơn, ghi nhận mã đơn và **GIỮ NGUYÊN CỬA SỔ** để đón nhận tín hiệu duyệt.
2. `QA Receptionist Persona`: Dedicated window (`new_page` -> `/staff/front-desk`). Đăng nhập `frontdesk@vietsage.vn`, nhận WebSocket realtime 'request:created', click mở Drawer tại chỗ, bấm "Tiếp nhận" -> chuyển trạng thái "Đang xử lý" -> bấm "Hoàn thành".
3. `QA Housekeeping Persona`: Dedicated window (`new_page` -> `/hotels/HCA_HOMESTAY/rooms`). Đăng nhập `housekeeping@vietsage.vn`, nhận diện phòng `PROCESSING` (Chờ dọn), bấm "Bắt đầu dọn" -> bấm "Xác nhận phòng sẵn sàng (Room Ready)" -> phòng chuyển sang `AVAILABLE`.
4. `QA Hotel Owner Persona`: Dedicated window (`new_page` -> `/owner/dashboard`). Đăng nhập `thucvn@gmail.com`, vào Channel Manager, cập nhật giá hàng loạt trong modal in-place, toggle đóng/mở bán ô lịch và kéo thả Tape Chart (@dnd-kit).

All personas operate on independent Chrome windows concurrently without session leakage.

---

## 4. DEEP BUSINESS TESTS, CRUD & CLOSED-LOOP REALTIME PROTOCOL

### 4.1 Chu Trình Khép Kín Yêu Cầu Dịch Vụ (Guest -> Frontdesk Realtime Closed-Loop)
1. **Bước 1 (Khách đặt)**:
   - Truy cập: `/g/DEMO_QR_ROOM_101`.
   - Click: Link/button `"Dịch vụ"` (`[data-testid='nav-services']`).
   - Click: Thẻ dịch vụ `"Khăn tắm bổ sung"` hoặc món đầu tiên (`[data-testid='service-item']`).
   - Fill: Ô ghi chú (`textarea` / `[data-testid='request-note']`) với nội dung: `"Yêu cầu 2 khăn tắm bổ sung cho phòng 101"`.
   - Click: Nút `"Gửi yêu cầu"` (`button[type='submit']`).
   - Assert: Hiển thị mã đơn `REQ-...` ở trạng thái `"Chờ tiếp nhận"`. Giữ nguyên cửa sổ khách.
2. **Bước 2 (Lễ tân tiếp nhận)**:
   - Đăng nhập: `frontdesk@vietsage.vn` / `Admin@123` tại `/dangnhap`.
   - Mở bảng điều phối: `/staff/front-desk`.
   - Lắng nghe: Sự kiện WebSocket realtime và âm thanh thông báo đơn mới.
   - Click: Thẻ yêu cầu của phòng 101 trên bảng Kanban -> Drawer chi tiết trượt ra tại chỗ (In-Place Tab Isolation).
   - Click: Nút `"Tiếp nhận"` (`button:has-text('Tiếp nhận')`).
   - Assert: Badge trạng thái chuyển thành `"Đang xử lý"`.
3. **Bước 3 (Khách thấy realtime)**:
   - Tại cửa sổ Khách: Kiểm tra giao diện tự động cập nhật badge sang `"Đang xử lý (Lễ tân đã tiếp nhận)"` qua WebSocket mà **KHÔNG cần reload trang** (Zero Page Reload).
4. **Bước 4 (Lễ tân hoàn thành)**:
   - Tại Drawer Lễ tân: Click nút `"Hoàn thành"` (`button:has-text('Hoàn thành')`).
   - Assert: Đơn chuyển sang tab `"Đã hoàn thành"`.
5. **Bước 5 (Khách thấy hoàn thành)**:
   - Tại cửa sổ Khách: Kiểm tra giao diện tự động hiển thị `"Đã hoàn thành"` kèm form đánh giá sao.

### 4.2 Chu Trình Điều Phối Phòng & Vệ Sinh (Frontdesk Check-in -> Housekeeping Room Ready)
1. **Lễ tân (`frontdesk@vietsage.vn`)**:
   - Mở sơ đồ phòng tại `/staff/front-desk`.
   - Click phòng có khách -> Bấm `"Trả phòng (Check-out)"`.
   - Assert: Phòng chuyển trạng thái `PROCESSING` (Chờ dọn dẹp).
2. **Buồng phòng (`housekeeping@vietsage.vn`)**:
   - Đăng nhập: `housekeeping@vietsage.vn` / `Admin@123` tại `/dangnhap`.
   - Mở sơ đồ buồng phòng tại `/hotels/HCA_HOMESTAY/rooms`.
   - Click phòng có trạng thái `PROCESSING`.
   - Click nút `"Bắt đầu dọn"` -> Click nút `"Xác nhận phòng sẵn sàng (Room Ready)"`.
   - Assert: Trạng thái phòng chuyển sang `AVAILABLE` (Xanh lá / Sẵn sàng đón khách mới) trên toàn hệ thống.

### 4.3 Chu Trình Đồng Bộ Quỹ Phòng & Giá Bán (Owner Channel Manager -> Frontdesk Tape Chart)
1. **Chủ khách sạn (`thucvn@gmail.com` / `tenant@vietsage.vn`)**:
   - Đăng nhập tại `/dangnhap` -> Điều hướng đến `/owner/hotels/.../channel-manager`.
   - Click nút `"Cập nhật hàng loạt"` -> Modal mở tại chỗ -> Click `"Chọn tất cả hạng phòng hợp lệ"` -> Fill ô giá `"2500000"` -> Click `"Áp dụng cập nhật"`.
   - Click trực tiếp ô trạng thái bán: Đổi từ `"Đang mở bán"` sang `"Đang đóng bán"` (Auto-save tức thời).
   - Kéo thả khối đặt phòng trên Tape Chart bằng lệnh `drag(pageId, from_uid, to_uid)` (@dnd-kit).
2. **Lễ tân (`frontdesk@vietsage.vn`)**:
   - Mở Tape Chart hoặc Sơ đồ phòng -> Xác nhận biểu giá mới và trạng thái đóng/mở phòng hiển thị đồng bộ tức thời.

### 4.4 Chu Trình Tạo Mới Đặt Phòng Trực Tiếp (Frontdesk Walk-in Booking CRUD)
1. **Lễ tân (`frontdesk@vietsage.vn`)**:
   - Mở `/staff/front-desk` -> Click nút `"Đặt phòng mới"` / `"Tạo đặt phòng"`.
   - Assert: Modal Tạo Đặt Phòng mở tại chỗ (In-Place Tab Isolation: 0 reload).
   - Fill ô họ tên: `"Trần Văn Hoàng (Test Walk-in Auto)"`.
   - Fill ô số điện thoại: `"0987654321"`, CCCD: `"001202008899"`.
   - Chọn hạng phòng có sẵn, điền tiền cọc: `"500000"`.
   - Click nút `"Lưu đặt phòng"` / `"Xác nhận tạo"`.
   - Assert: Modal đóng an toàn, hiển thị thông báo SweetAlert2 thành công, thẻ đặt phòng mới xuất hiện ở trạng thái `CONFIRMED` trên danh sách và Tape Chart.

### 4.5 Chu Trình Gán Phòng & Nhận Phòng (Check-in & Room Assignment)
1. **Lễ tân (`frontdesk@vietsage.vn`)**:
   - Mở `/staff/front-desk` -> Chuyển sang Tab `"Khách đến"` (Arrivals).
   - Click thẻ đơn đặt phòng cần check-in -> Drawer chi tiết trượt ra tại chỗ.
   - Chọn phòng trống sạch (`AVAILABLE`) phù hợp hạng phòng đã đặt.
   - Click nút `"Nhận phòng (Check-in)"`.
   - Assert: Trạng thái booking chuyển sang `CHECKED_IN`, phòng chuyển sang màu đỏ/tím `OCCUPIED` trên sơ đồ phòng.

### 4.6 Chu Trình Quản Lý Folio, Phụ Thu Dịch Vụ, Thanh Toán & Trả Phòng (Folio Billing & Check-out)
1. **Lễ tân (`frontdesk@vietsage.vn`)**:
   - Click vào phòng đang lưu trú (`OCCUPIED`) trên sơ đồ phòng.
   - Chọn Tab `"Hóa đơn & Chi phí (Folio)"` -> Click `"Thêm phụ thu / dịch vụ"`.
   - Fill tên khoản phụ thu: `"2 lon nước ngọt Mini Bar"`, đơn giá: `"50000"` -> Click `"Xác nhận thêm"`.
   - Assert: Tổng tiền Folio tự động cập nhật tăng thêm 50.000 VND.
   - Click nút `"Thanh toán (Payment)"` -> Chọn phương thức `"Tiền mặt"` -> Click `"Xác nhận thu tiền"`.
   - Assert: Công nợ còn lại trở về 0 VND, trạng thái Folio chuyển sang `PAID`.
   - Click nút `"Hoàn tất trả phòng (Check-out)"`.
   - Assert: Phòng chuyển sang trạng thái `DIRTY` / `PROCESSING` (Chờ buồng phòng dọn dẹp).

### 4.7 Chu Trình Thiết Lập Phòng Mới & Quản Lý Trạng Thái Bảo Trì (Room Setup & Inventory CRUD)
1. **Chủ khách sạn (`thucvn@gmail.com`)**:
   - Mở `/owner/hotels/.../rooms` -> Click nút `"Thêm phòng mới"`.
   - Assert: Modal Tạo phòng mở tại chỗ.
   - Fill số phòng: `"P.308"`, tầng: `"3"`, chọn hạng phòng -> Click `"Lưu"`.
   - Assert: Modal đóng, phòng P.308 xuất hiện trên danh sách phòng.
   - Click nút `"Bảo trì"` -> Assert: Badge phòng chuyển sang `MAINTENANCE`. Click lại để hoàn trả `AVAILABLE`.

### 4.8 Chu Trình Khai Báo Tạm Trú Công An BCA (KBTT Declaration Flow)
1. **Lễ tân (`frontdesk@vietsage.vn`) / Chủ khách sạn**:
   - Mở `/owner/hotels/.../kbtt`.
   - Click chọn khách lưu trú qua checkbox -> Click nút `"Đồng bộ hồ sơ khai báo BCA"`.
   - Assert: Xuất hiện thông báo SweetAlert2 thành công và cột trạng thái cập nhật `ĐÃ KHAI BÁO`.

### 4.9 Chu Trình Xử Lý Đơn Dịch Vụ & Tour Đối Tác (Marketplace Order Lifecycle)
1. **Khách lưu trú (`GUEST`)**: Quét QR phòng -> Vào menu Ẩm thực / Tour -> Chọn món -> Bấm `"Xác nhận đặt hàng"`.
2. **Nhân viên đối tác (`service@vietsage.vn` / `Admin@123`)**: Mở `/service/orders` -> Thấy đơn mới -> Bấm `"Tiếp nhận đơn"` -> Bấm `"Hoàn tất giao"`.
3. **Khách lưu trú**: Thấy đơn hàng chuyển trạng thái `COMPLETED` tức thời qua WebSocket.

---

## 5. FIX VS NO-FIX BOUNDARY PROTOCOL (RBAC & DATABASE INVARIANTS)
When failures occur during UI flow testing, agents MUST observe strict remediation boundaries:

### 🔴 Strictly Forbidden to Touch / Bypass (Report Only):
1. **RBAC & Authorization Gates**: NEVER remove `@UseGuards()`, bypass permission checks, or elevate roles just to force a test to pass. RBAC protection is deliberate security policy.
2. **Database Schema & Raw Data**: NEVER run schema migrations, reset tables, or tamper with database records during UI testing. Every database error (500 Internal, Prisma query failure, FK constraint) MUST be logged into `harness-out/INCIDENT_PACK.json` and reported as **"Lỗi Database (Chờ xử lý)"**.

### 🟢 Authorized & Encouraged to Remediate (In-Place Fixes):
1. **Error Notification Copywriting & UX**: Upgrade raw technical error codes (`403 Forbidden`, `500 Internal`, `TypeError`) into clear, human-readable toasts/alerts (e.g. *"Bạn không có quyền thực hiện thao tác này"* instead of unhandled exceptions or white-screen crashes).
2. **Frontend UI/UX Bugs**: Unresponsive buttons (`onClick` swallowed), missing drawer state reset, z-index clipping, broken form validations, font floor violations (< 12px), missing `text-balance`.
3. **Frontend-Backend Contract Binding**: Align form payload keys with backend DTOs, fix incorrect URL query parameters, add missing loading/error states.

---

## 6. MANDATORY REPORT-ONLY INCIDENT PROTOCOL (ROOT CAUSE ESCALATION)
Whenever an issue is encountered that CANNOT or MUST NOT be fixed in-place (due to DB invariants, missing migrations, RBAC security policy, or 3rd-party dependencies):
- **NEVER FAIL SILENTLY**: Agents are strictly forbidden from ignoring, suppressing, or bypassing the failure.
- **MANDATORY INCIDENT DOSSIER**: Emit an explicit root-cause report containing:
  1. **Route & Endpoint**: The exact frontend URL and backend endpoint path with HTTP status code.
  2. **Root Cause Diagnosis**: The exact technical failure (e.g. Prisma P2022 column missing, pending migration, RBAC guard mismatch).
  3. **Non-Fix Rationale**: Explanation of the architectural invariant preventing automated fix (e.g. *Zero-DB-Tampering standard forbids automated schema migration*).
  4. **Remediation Plan for Human Lead / DBA**: Exact SQL or CLI commands required to resolve the issue safely.
