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

### 2. CANONICAL ACCOUNTS & MULTI-DOMAIN CREDENTIALS CATALOG
Mọi tác vụ kiểm thử luồng người dùng BẮT BUỘC sử dụng đúng tài khoản phân quyền chuẩn theo từng Domain:

#### A. Hospitality Domain (VietSage / Hotel PMS):
| Role Code | Vai trò hiển thị | Email / Username | Mật khẩu | URL đăng nhập | URL bắt đầu |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GUEST` | Khách lưu trú | *Không cần login* | N/A | N/A | `/g/DEMO_QR_ROOM_101` |
| `HOTEL_FRONTDESK` | Nhân viên Lễ tân | `frontdesk@vietsage.vn` | `Admin@123` | `/dangnhap` | `/staff/front-desk` |
| `HOUSEKEEPING` | Nhân viên Buồng phòng | `housekeeping@vietsage.vn` | `Admin@123` | `/dangnhap` | `/hotels/HCA_HOMESTAY/rooms` |
| `TENANT_OWNER` | Chủ khách sạn | `thucvn@gmail.com` *(hoặc tenant@vietsage.vn)* | `Admin@123` | `/dangnhap` | `/owner/dashboard` & Channel Manager |
| `SUPER_ADMIN` | Quản trị nền tảng | `admin@vietsage.vn` | `Admin@123` | `/dangnhap` | `/admin/dashboard` |

#### B. E-Commerce Domain:
| Role Code | Vai trò hiển thị | Email / Username | Mật khẩu | URL đăng nhập | URL bắt đầu |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `SHOPPER` | Khách mua hàng | *Không cần login* | N/A | N/A | `/shop` hoặc `/products` |
| `CUSTOMER` | Khách hàng đăng nhập | `customer@shop.test` | `Admin@123` | `/dangnhap` | `/account/orders` |
| `MERCHANT` | Nhà bán hàng | `merchant@shop.test` | `Admin@123` | `/dangnhap` | `/vendor/orders` |
| `STORE_ADMIN` | Quản trị sàn | `admin@shop.test` | `Admin@123` | `/dangnhap` | `/admin/dashboard` |

#### C. B2B SaaS Domain:
| Role Code | Vai trò hiển thị | Email / Username | Mật khẩu | URL đăng nhập | URL bắt đầu |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `WORKSPACE_OWNER` | Chủ sở hữu tổ chức | `owner@saas.test` | `Admin@123` | `/dangnhap` | `/settings/billing` |
| `TEAM_MEMBER` | Thành viên nhóm | `member@saas.test` | `Admin@123` | `/dangnhap` | `/workspace` |

#### D. CRM / Appointment Domain:
| Role Code | Vai trò hiển thị | Email / Username | Mật khẩu | URL đăng nhập | URL bắt đầu |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `CLIENT` | Khách đặt lịch hẹn | *Không cần login* | N/A | N/A | `/booking` |
| `SALES_REP` | Nhân viên kinh doanh | `sales@crm.test` | `Admin@123` | `/dangnhap` | `/pipeline` |
| `SALES_MANAGER` | Quản lý vận hành | `manager@crm.test` | `Admin@123` | `/dangnhap` | `/calendar` |

#### E. Universal Generic Domain:
| Role Code | Vai trò hiển thị | Email / Username | Mật khẩu | URL đăng nhập | URL bắt đầu |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `USER` | Người dùng ứng dụng | `user@app.test` | `Admin@123` | `/dangnhap` | `/dashboard` |
| `ADMIN` | Quản trị viên hệ thống | `admin@app.test` | `Admin@123` | `/dangnhap` | `/admin` |

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

### 7. CLOSED-LOOP BUSINESS LIFECYCLE, REAL SUBMIT, PER-ROLE TAB ISOLATION & EXPERIENTIAL UX CRITIQUE PROTOCOL
Nghiêm cấm việc kiểm thử chỉ dừng lại ở điều hướng link tĩnh, login rồi thoát, hoặc mở modal xem qua rồi bấm "Hủy bỏ". Subagents BẮT BUỘC tuân thủ 4 nguyên tắc bất biến trước và trong mọi kịch bản:
- **Nguyên tắc A — Mỗi Role = 1 Tab Mới Cách Ly (`1 Role = 1 Dedicated Tab`)**: Mỗi vai trò (`GUEST`, `HOTEL_FRONTDESK`, `HOUSEKEEPING`, `TENANT_OWNER`, `SUPER_ADMIN`, v.v.) BẮT BUỘC bật 1 tab mới riêng biệt bằng `new_page(url, isolatedContext: "role-<ROLE>-<sessionId>")` và chuyển đổi bằng `select_page(pageId)`. CẤM dùng chung 1 tab cho nhiều role.
- **Nguyên tắc B — Thực Sự Submit & Kiểm Chứng Lưu Trữ (`Mandatory Real Submit`)**: Mọi Form/Modal/Drawer mở ra BẮT BUỘC phải điền dữ liệu và bấm nút Submit thật (`Lưu`, `Áp dụng cập nhật`, `Xác nhận tạo`, `Gửi yêu cầu`, `Tiếp nhận`, `Hoàn thành`). CẤM chỉ mở xem hoặc bấm Hủy bỏ. Phải xác nhận API `POST`/`PUT`/`PATCH` trả `200`/`201` và dữ liệu mới hiển thị trên giao diện.
- **Nguyên tắc C — Quan Sát UI Với Tư Cách Người Trải Nghiệm (`Experiential UX Critique`)**: Đánh giá từng màn hình như người dùng thật (form bắt nhập UUID thô thay vì dropdown, thiếu loading state khi submit, modal tràn khung che nút Lưu, chữ `< 12px`, tiêu đề thiếu `text-balance` gãy dòng cộc lốc, lộ mã enum/HTTP status code thô, nút trùng lặp).
- **Nguyên tắc D — Bắn Lỗi Về Hộp Tổng Hợp Để Fix (`Emit to INCIDENT_PACK.json`)**: Mọi lỗi chức năng hoặc điểm UI/UX bất hợp lý phát hiện được BẮT BUỘC ghi vào `harness-out/INCIDENT_PACK.json` (`category: "UX_EXPERIENTIAL_DEFECT"`, `canAutoFix: true`, kèm vị trí file/component và hướng sửa) để tổng hợp và điều phối `QA Branch Fixer` sửa triệt để.

Các chu trình nghiệp vụ bắt buộc thực thi:
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
4. **Chu Trình Tạo Mới Đặt Phòng Trực Tiếp (Frontdesk Walk-in Booking CRUD)**:
   - Lễ tân mở `/staff/front-desk` -> Click nút "Đặt phòng mới" / "Tạo đặt phòng" (Modal mở in-place).
   - Điền tên khách: "Trần Văn Hoàng (Test Walk-in Auto)", SĐT: "0987654321", CCCD: "001202008899".
   - Chọn hạng phòng, điền tiền cọc: "500000" -> Click "Lưu đặt phòng".
   - Assert: Modal đóng, SweetAlert2 báo thành công, đơn mới hiển thị trạng thái `CONFIRMED`.
5. **Chu Trình Gán Phòng & Nhận Phòng (Check-in & Room Assignment)**:
   - Lễ tân chuyển sang Tab "Khách đến" (Arrivals) -> Click đơn đặt phòng -> Drawer trượt ra tại chỗ.
   - Chọn phòng trống sạch (`AVAILABLE`) -> Click "Nhận phòng (Check-in)".
   - Assert: Booking chuyển thành `CHECKED_IN`, phòng chuyển sang `OCCUPIED`.
6. **Chu Trình Quản Lý Folio, Phụ Thu Dịch Vụ, Thanh Toán & Trả Phòng (Folio Billing & Check-out)**:
   - Click phòng đang có khách -> Chọn Tab "Hóa đơn / Folio" -> Click "Thêm phụ thu".
   - Điền "2 lon nước ngọt Mini Bar", giá "50000" -> Lưu -> Tổng tiền Folio tăng 50.000 VND.
   - Click "Thanh toán" -> Chọn "Tiền mặt" -> Bấm xác nhận thu tiền (công nợ về 0).
   - Click "Hoàn tất trả phòng (Check-out)" -> Phòng chuyển sang `DIRTY` / `PROCESSING`.
7. **Chu Trình Thiết Lập Phòng Mới & Quản Lý Trạng Thái Bảo Trì (Room Setup & Inventory CRUD)**:
   - Chủ khách sạn vào `/owner/hotels/.../rooms` -> Click "Thêm phòng mới" -> Điền số phòng "P.308", Tầng "3", chọn hạng phòng -> Lưu.
   - Assert: Modal đóng, phòng P.308 xuất hiện trên danh sách -> Click nút "Bảo trì" chuyển sang `MAINTENANCE` rồi hoàn trả hoạt động.
8. **Chu Trình Khai Báo Tạm Trú Công An BCA (KBTT Declaration Flow)**:
   - Mở `/owner/hotels/.../kbtt` -> Chọn checkbox khách lưu trú -> Click nút "Đồng bộ hồ sơ khai báo BCA".
   - Assert: Thông báo SweetAlert2 thành công và cột trạng thái cập nhật `ĐÃ KHAI BÁO`.
9. **Chu Trình Xử Lý Đơn Dịch Vụ Đối Tác (Marketplace Order Lifecycle)**:
   - Khách đặt món/tour từ Guest OS -> Nhân viên đối tác (`service@vietsage.vn` / `Admin@123`) mở `/service/orders` bấm "Tiếp nhận đơn" -> "Hoàn tất giao" -> Khách nhận trạng thái `COMPLETED`.

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
