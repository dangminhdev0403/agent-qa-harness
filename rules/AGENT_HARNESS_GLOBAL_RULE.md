<!-- AGENT_HARNESS_PROTOCOL_V2: COMPACT MACHINE SPECIFICATION -->
## Mandatory Autonomous QA & Living Harness Protocol (Agent Spec)
All AI agents (Antigravity, Codex, Orca) MUST strictly execute this deterministic state machine:

### 1. TRIGGER HANDLING ("Bật harness" | "kích hoạt harness" | "test harness" | Ambiguous QA request)
1. **Preflight Sync**: Execute `agent-harness sync`. Auto-scans routes, socket gateways, mutations, creates/upgrades `harness.config.json`.
2. **Disambiguation Gate**: Invoke `ask_question` tool with 4 options:
   - `(Recommended) Full Dual-Pass Swarm Verification (Code Stability + Dedicated Chrome Flow)`
   - `Mode 1: Code & System Stability Gate (tsc, build, static rules, sockets, concurrency)`
   - `Mode 2: Chrome DevTools MCP & Browser Flows on Dedicated Window (0-console, 0-net-4xx/5xx, screenshots)`
   - `Inspect Synced Map & Current Status Only`
3. **Subagent Swarm Dispatch (Speed Acceleration)**:
   - Worker 1 (`QA Code Gatekeeper`, model: flash): `agent-harness test:code --auto-start`.
   - Worker 2 (`QA Flow Inspector`, model: inherit): Spawn dedicated window via `new_page(url)`, bind with `select_page`, verify flows, teardown with `close_page`. NEVER hijack open tabs.
   - Multi-Persona Closed-Loop Verification: Execute `agent-harness subagents:personas` to spawn Guest, Receptionist, Housekeeping, and Owner subagents on independent Chrome windows.

### 2. CANONICAL ACCOUNTS & ROLE CREDENTIALS CATALOG
Mọi tác vụ kiểm thử luồng người dùng BẮT BUỘC sử dụng đúng tài khoản phân quyền chuẩn:
| Role Code | Vai trò hiển thị | Email / Username | Mật khẩu | URL đăng nhập | URL bắt đầu |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GUEST` | Khách lưu trú | *Không cần login* | N/A | N/A | `/g/DEMO_QR_ROOM_101` |
| `HOTEL_FRONTDESK` | Nhân viên Lễ tân | `frontdesk@vietsage.vn` | `Admin@123` | `/dangnhap` | `/staff/front-desk` |
| `HOUSEKEEPING` | Nhân viên Buồng phòng | `housekeeping@vietsage.vn` | `Admin@123` | `/dangnhap` | `/hotels/HCA_HOMESTAY/rooms` |
| `TENANT_OWNER` | Chủ khách sạn | `thucvn@gmail.com` *(hoặc tenant@vietsage.vn)* | `Admin@123` | `/dangnhap` | `/owner/dashboard` & Channel Manager |
| `SUPER_ADMIN` | Quản trị nền tảng | `admin@vietsage.vn` | `Admin@123` | `/dangnhap` | `/admin/dashboard` |

### 3. FEATURE DEVELOPMENT SYNC (Living Harness Spec)
Never finalize code without syncing the harness spec. Before task completion:
- New UI Screen/Route: `agent-harness add:flow "<feature-name>"`
- New Socket Event: `agent-harness add:socket "<feature-name>"`
- New Mutation/Approval: `agent-harness add:concurrency "<feature-name>"`
(The engine deduplicates by semantic signature and performs in-place upgrades).

### 4. SELF-HEALING & CIRCUIT BREAKER PROTOCOL
- **Exit Code 0 (PASS)**: Task verified. Finalize report.
- **Exit Code 2 (CIRCUIT_BREAKER_TRIPPED)**: STOP IMMEDIATELY. Max 3 remediation retries exceeded. DO NOT attempt further automated edits. Report blocker directly to user to prevent multi-agent infinite ping-pong.
- **Exit Code 1 (FAIL)**:
  1. Read `harness-out/INCIDENT_PACK.json` to extract failure tier, target, and payload.
  2. Launch isolated subagent: `invoke_subagent` (`Role: "QA Branch Fixer"`, `Workspace: "branch"`).
  3. Apply scoped fix strictly to failing gateway/controller/component.
  4. Re-run targeted probe: `agent-harness probe:<tier>` until green before merging.

### 5. PREREQUISITE INSPECTION & ANTI-SUPERFICIALITY GATE
STRICT INVARIANT: Agents are FORBIDDEN from executing shallow/superficial partial tests (e.g. testing only unauthenticated landing pages when requested to test full project features) and falsely declaring full verification.
1. **Preflight Audit**: Before executing Mode 2 or full runs, execute `agent-harness audit:prerequisites`.
2. **Missing Prerequisite Check**: If routes require authentication (/owner, /hotels, /admin, /staff) but credentials/personas are missing, or dynamic parameters ([hotelId], [qrCode]) lack fixture substitutions:
   - DO NOT silently fall back to testing only public pages.
   - HALT AND ASK: Explicitly prompt user (via `ask_question` or inquiry) to provide credentials/fixtures or authorize automated test fixture seeding.
3. **Execution Gate**: Only proceed to full suite execution once all necessary prerequisites are satisfied or user explicitly grants `--force` bypass.

### 6. UNIVERSAL ROLE-BASED MODULE PARTITIONING (FOR ANY PROJECT)
Routes in ANY repository are partitioned into discrete modules (via `config.modules` in `harness.config.json` or automatic heuristic clustering):
- `public`: Landing, Docs, Pricing, Login, Register (unauthenticated).
- `portal` / `user`: User Workspace, Account, Orders, Settings (requires `USER` auth).
- `admin`: Backoffice, Platform Admin, System Logs (requires `ADMIN` auth).
- `partner`: Merchant, Vendor, Service Provider (requires `VENDOR` auth).
- Custom Domain Modules (e.g. VietSage Hotel PMS: `guest_os`, `frontdesk`, `owner`, `marketplace`).

### 7. CLOSED-LOOP BUSINESS LIFECYCLE & DEEP INTERACTION PROTOCOL
Nghiêm cấm việc kiểm thử chỉ dừng lại ở điều hướng link tĩnh hoặc login rồi thoát. Subagents BẮT BUỘC thực thi tương tác DOM thật và chu trình khép kín đa vai trò:
1. **Chu Trình Khép Kín Yêu Cầu Dịch Vụ Buồng Phòng (Guest -> Frontdesk Realtime Closed-Loop)**:
   - **Bước 1 (Khách gửi)**: Truy cập `/g/DEMO_QR_ROOM_101` -> Click menu "Dịch vụ" -> Click nút "Yêu cầu" trên thẻ dịch vụ 'Khăn tắm' -> Fill ghi chú: "Yêu cầu 2 khăn tắm bổ sung" -> Click "Gửi yêu cầu" -> Hệ thống sinh mã `REQ-...` với trạng thái "Chờ tiếp nhận". **Cửa sổ khách giữ nguyên không đóng**.
   - **Bước 2 (Lễ tân nhận & duyệt)**: Đăng nhập `frontdesk@vietsage.vn` / `Admin@123` tại `/dangnhap` -> Mở `/staff/front-desk` -> Nhận thông báo WebSocket realtime -> Click thẻ yêu cầu phòng 101 -> Drawer mở trượt tại chỗ -> Click nút "Tiếp nhận" -> Badge đổi sang "Đang xử lý".
   - **Bước 3 (Khách thấy realtime)**: Màn hình khách (Cửa sổ 1) **tự động chuyển trạng thái** sang "Đang xử lý (Lễ tân đã tiếp nhận)" qua WebSocket mà **KHÔNG cần reload trang**.
   - **Bước 4 (Lễ tân hoàn thành)**: Tại Drawer, Lễ tân click nút "Hoàn thành" -> Đơn chuyển tab "Đã hoàn thành".
   - **Bước 5 (Khách thấy hoàn thành)**: Cửa sổ khách tự động chuyển trạng thái "Đã hoàn thành" kèm form đánh giá sao.
2. **Chu Trình Check-in -> Vệ Sinh Buồng Phòng (Frontdesk -> Housekeeping Room Ready)**:
   - Lễ tân check-in / check-out phòng -> Phòng chuyển trạng thái `PROCESSING` (Chờ dọn).
   - Nhân viên buồng phòng đăng nhập `housekeeping@vietsage.vn` / `Admin@123` -> Mở sơ đồ buồng phòng -> Click phòng chờ dọn -> Bấm "Bắt đầu dọn" -> Bấm "Xác nhận phòng sẵn sàng (Room Ready)" -> Phòng chuyển sang `AVAILABLE` (Sẵn sàng đón khách mới).
3. **Chu Trình Quản Lý Quỹ Phòng & Giá Kênh Bán OTA (Owner ARI Channel Manager)**:
   - Chủ khách sạn đăng nhập `thucvn@gmail.com` / `Admin@123` -> Vào `/owner/hotels/.../channel-manager`.
   - Click "Cập nhật hàng loạt" modal -> Chọn tất cả hạng phòng -> Nhập mức giá mới -> Áp dụng cập nhật.
   - Click trực tiếp ô trạng thái: Đổi từ "Đang mở bán" sang "Đang đóng bán" (Auto-save tức thời).
   - Kéo thả khối đặt phòng trên Tape Chart bằng lệnh `drag(pageId, from_uid, to_uid)` (@dnd-kit).
   - Lễ tân mở Tape Chart xác nhận dữ liệu giá & tồn kho đồng bộ tức thì.

### 8. FIX VS NO-FIX BOUNDARY STANDARD (RBAC & DATABASE INVARIANTS)
Remediation must strictly respect architectural boundaries:
- 🔴 **STRICTLY FORBIDDEN TO TOUCH (Report Only)**:
  1. RBAC & Authorization: NEVER remove `@UseGuards()`, bypass role/permission checks, or alter auth guards just to pass a test.
  2. Database Schema & Data: NEVER run destructive DB migrations, reset tables, or corrupt database state during UI tests. Report all DB errors (500, Prisma query failure) as "Lỗi Database (Chờ xử lý)".
- 🟢 **AUTHORIZED & ENCOURAGED TO FIX**:
  1. Error Notification Copy: Upgrade raw error codes (403 Forbidden, 500 Internal, TypeError) into clean, polite, human-readable toasts/alerts (e.g. "Bạn không có quyền thực hiện thao tác này").
  2. UI/UX Bugs: Broken button clicks, missing drawer state reset, z-index clipping, broken validations, typography floor violations (< 12px), missing `text-balance`.
  3. API/DTO Binding: Align frontend form payload keys with backend schema, fix query param names.

### 9. MANDATORY REPORT-ONLY INCIDENT PROTOCOL (BÁO CÁO NGUYÊN NHÂN LỖI KHÔNG ĐƯỢC TỰ SỬA)
Khi phát hiện lỗi KHÔNG THỂ hoặc KHÔNG ĐƯỢC PHÉP tự ý sửa (do nguyên tắc bảo vệ DB, chính sách RBAC bảo mật, hoặc phụ thuộc bên thứ 3):
1. **Tuyệt đối không bỏ qua hoặc im lặng**: Subagent và Coordinator BẮT BUỘC phải tạo báo cáo phân tích chuyên sâu.
2. **Cấu trúc Báo cáo Sự cố Bắt buộc**:
   - **Vị trí & Endpoint**: Route URL giao diện và API backend tương ứng (kèm HTTP status code: 403, 404, 500).
   - **Nguyên nhân gốc rễ (Root Cause)**: Chỉ ra chính xác lỗi kỹ thuật (ví dụ: thiếu cột DB do chưa chạy migration, lỗi Prisma P2022, thiếu quyền RBAC cụ thể).
   - **Lý do không tự động sửa (Reason Held)**: Nêu rõ nguyên tắc kỹ thuật ràng buộc (ví dụ: *Quy tắc Zero-DB-Tampering cấm test harness tự động chạy migration làm thay đổi schema database*).
   - **Đề xuất xử lý cho Developer / DBA**: Cung cấp lệnh hoặc giải pháp cụ thể để quản trị viên / lập trình viên thực thi an toàn (ví dụ: lệnh migration SQL, gán quyền hợp lệ).
