import fs from 'node:fs';
import path from 'node:path';
import { HARNESS_MODULES, partitionRoutesByModule, detectProjectDomain } from './module-registry.mjs';
import { resolveDynamicRoute } from './prerequisite-inspector.mjs';
import {
  CANONICAL_ACCOUNT_CATALOG,
  UNIVERSAL_INTERACTIVE_JOURNEYS,
  listJourneysForRole,
  listJourneysForModule,
  listJourneysForDomain,
  generateStepByStepGuide,
  resolveAccountCatalog
} from './journey-registry.mjs';

/**
 * Subagent Dispatcher - Prepares optimized swarm subagent execution plans
 * to parallelize code testing, browser flow testing, and branch-isolated auto-remediation.
 *
 * CRITICAL ISOLATION RULES:
 * 1. WORKSPACE ISOLATION: Fixer subagents MUST run with Workspace: 'branch' to avoid git collisions.
 * 2. BROWSER ISOLATION: Flow subagents MUST spawn and operate on their own DEDICATED Chrome window/tab
 *    using `new_page`, bind operations with `select_page`, and clean up with `close_page`.
 *    NEVER share active pages or allow cross-agent tab interference.
 */
export class SubagentDispatcher {
  constructor(cwd) {
    this.cwd = cwd;
    this.configPath = path.join(cwd, 'harness.config.json');
    this.incidentPath = path.join(cwd, 'harness-out', 'INCIDENT_PACK.json');
  }

  getConfig() {
    if (fs.existsSync(this.configPath)) {
      try {
        return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  getIncidentPack() {
    if (fs.existsSync(this.incidentPath)) {
      try {
        return JSON.parse(fs.readFileSync(this.incidentPath, 'utf8'));
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  /**
   * Generates a unique window session identifier for Chrome isolation
   */
  generateWindowSessionId(prefix = 'flow') {
    const timestamp = Date.now();
    const entropy = Math.random().toString(36).substring(2, 7);
    return `harness-${prefix}-${timestamp}-${entropy}`;
  }

  /**
   * Generates the 4 ironclad execution laws for every subagent:
   * 1. 1 Role = 1 Dedicated Isolated Tab (Never reuse tabs across roles)
   * 2. Real Form Submission & Mutation Persistence (Never click-and-stop or cancel)
   * 3. Experiential UX/UI Critique as a Real Human User
   * 4. Emit All UX & Functional Defects into harness-out/INCIDENT_PACK.json for Batch Fixing
   */
  getMandatoryExecutionLaws(roleName, sessionId) {
    return `
================================================================================
🚨 4 QUY TẮC THỰC THI BẮT BUỘC (MANDATORY REAL-SUBMIT, TAB ISOLATION & UX AUDIT):
================================================================================
1. MỖI ROLE = 1 TAB MỚI CÁCH LY HOÀN TOÀN (STRICT PER-ROLE TAB ISOLATION):
   - Vai trò "${roleName}" BẮT BUỘC chạy trên Tab độc lập riêng biệt: \`new_page(url, isolatedContext: "${sessionId}")\`.
   - Trước mỗi thao tác, luôn gọi \`select_page(pageId)\` của đúng Tab vai trò này.
   - TUYỆT ĐỐI CẤM dùng chung 1 tab cho nhiều role, cấm đăng xuất/đăng nhập đè lên tab của role khác để bảo toàn phiên JWT/Cookie và kiểm chứng WebSocket đồng thời giữa các role.

2. THỰC SỰ SUBMIT & KIỂM CHỨNG LƯU DỮ LIỆU (NO CLICK-AND-STOP / NO CANCEL):
   - TUYỆT ĐỐI CẤM chỉ mở Modal/Drawer/Form ra xem, chụp ảnh rồi bấm "Hủy bỏ" hoặc dừng lại!
   - BẮT BUỘC điền đầy đủ dữ liệu hợp lệ vào tất cả các trường và bấm nút Submit chính (\`button[type="submit"]\`, \`Lưu\`, \`Áp dụng cập nhật\`, \`Xác nhận tạo\`, \`Gửi yêu cầu\`, \`Tiếp nhận\`, \`Hoàn thành\`).
   - Sau khi bấm Submit, BẮT BUỘC:
     a) Gọi \`list_network_requests(pageId)\` xác nhận có request \`POST\`/\`PUT\`/\`PATCH\`/\`DELETE\` thực sự gửi đi và trả về HTTP 200/201.
     b) Gọi \`take_snapshot(pageId)\` xác nhận dữ liệu vừa submit đã thực sự xuất hiện/cập nhật trên bảng, danh sách hoặc lưới lịch (State Persistence).

3. QUAN SÁT & ĐÁNH GIÁ UI/UX VỚI TƯ CÁCH NGƯỜI TRẢI NGHIỆM THẬT (EXPERIENTIAL UX CRITIQUE):
   - Trên từng màn hình và từng thao tác, hãy đặt mình vào vị trí người dùng thật để soi xét các điểm bất hợp lý:
     * [Trải nghiệm Form]: Có bắt người dùng tự gõ mã UUID/ID thô thay vì hiển thị Dropdown \`<select>\` tên dễ hiểu không? Placeholder có bị để chữ rác của dev (\`"VD: Test"\`, \`"01 /"\`) không?
     * [Phản hồi Tương tác]: Khi bấm Submit có hiệu ứng loading/spinner hoặc disable nút để chống bấm đúp không? Hay bấm xong giao diện đứng im không rõ đã lưu hay chưa?
     * [Bố cục & Hiển thị]: Modal/Drawer mở ra có bị tràn màn hình, che mất nút Lưu, lệch hàng, chồng chéo chữ, hoặc có 2 nút hành động trùng lặp gây bối rối không?
     * [Chuẩn Typography & Ngôn ngữ]: Có chữ nào quá bé (\`< 12px\`), tiêu đề bị rớt 1 chữ lẻ loi xuống dòng (thiếu \`text-balance\`), badge bị gãy dòng (thiếu \`whitespace-nowrap\`), hoặc lộ mã enum kỹ thuật (\`SUPER_ADMIN\`, \`HOTEL_FRONTDESK\`), mã lỗi HTTP thô (\`404 Not Found\`, \`500 Internal\`) ra màn hình không?

4. BẮN TOÀN BỘ LỖI & ĐIỂM BẤT HỢP LÝ VỀ HỘP TỔNG HỢP ĐỂ FIX (\`INCIDENT_PACK.json\`):
   - Bất kỳ lỗi submit thất bại, nút bấm không ăn, API lỗi, HOẶC bất kỳ điểm UI/UX nào không hợp lý phát hiện ở Mục 3 BẮT BUỘC phải được ghi bổ sung vào file \`harness-out/INCIDENT_PACK.json\` (mảng \`failures\` / \`incidents\`) theo cấu trúc:
     \`{ "tier": "browser", "category": "UX_EXPERIENTIAL_DEFECT", "canAutoFix": true, "role": "${roleName}", "target": "<URL hoặc Tên Component>", "error": "<Mô tả chi tiết điểm bất hợp lý dưới góc nhìn người dùng>", "remediationSuggestion": "<Hướng dẫn sửa file/component cụ thể để Fixer Agent xử lý>" }\`
================================================================================`;
  }

  /**
   * Generates Dual-Pass Parallel Swarm Plan
   */
  generateDualPassPlan() {
    const config = this.getConfig() || {};
    const projectName = config.project || path.basename(this.cwd);
    const windowSessionId = this.generateWindowSessionId('dualpass');

    const codeWorker = {
      TypeName: "self",
      Role: "QA Code Gatekeeper",
      Model: "flash",
      Workspace: "inherit",
      Prompt: `Execute fast static, socket, and concurrency verification gates for project "${projectName}".
RUN COMMAND IN SEQUENCE:
1. \`agent-harness test:code --auto-start\`
2. Verify:
   - Tier 0 (static rules, font floor >= 12px, text-balance) passes with 0 errors.
   - Tier 1 (realtime socket probe) confirms event dispatch within 3000ms.
   - Tier 2 (concurrency gate) passes with strict idempotency (0 double bookings / duplicate mutations).
3. Report concise results summary to coordinator.`
    };

    const flowWorker = {
      TypeName: "self",
      Role: "QA Flow Inspector",
      Model: "inherit",
      Workspace: "inherit",
      WindowSession: windowSessionId,
      Prompt: `Execute autonomous Chrome interactive browser flows for project "${projectName}".
MANDATORY CHROME ISOLATION PROTOCOL:
1. Spawn dedicated Chrome target: \`new_page(url: "${config.baseUrl || 'http://localhost:3000'}")\` and capture \`pageId\`.
2. Bind active operations: \`select_page(pageId)\`.
3. Run browser flows:
   - Execute all declared user journeys in harness.config.json.
   - Assert ZERO console error level messages (\`list_console_messages\`).
   - Assert ZERO network 4xx/5xx responses (\`list_network_requests\`).
   - Verify In-Place Tab Isolation (drawers/modals open in-place, zero cross-tab redirect).
4. Save checkpoint screenshot to harness-out/screenshots/${windowSessionId}/flow-checkpoint.png.
5. CLEAN TEARDOWN: Always call \`close_page(pageId)\` upon completion (PASS or FAIL).
Window Session Tag: ${windowSessionId}
${this.getMandatoryExecutionLaws("QA Flow Inspector", windowSessionId)}`
    };

    return {
      projectName,
      strategy: "parallel_swarm",
      windowSessionId,
      workers: [codeWorker, flowWorker]
    };
  }

  /**
   * Generates a Multi-Persona Swarm Plan with Full Closed-Loop Business Coordination
   * (Guest In-Room -> Receptionist Approval -> Housekeeping Clean -> Hotel Owner ARI)
   */
  generatePersonaSwarmPlan() {
    const config = this.getConfig() || {};
    const projectName = config.project || path.basename(this.cwd);
    const baseUrl = config.baseUrl || "http://localhost:3000";
    const routes = config.browser?.routes || [];
    const domain = detectProjectDomain(routes, config);

    // =========================================================================
    // DOMAIN 1: E-COMMERCE SWARM PLAN (Shopper + Merchant)
    // =========================================================================
    if (domain === 'ecommerce') {
      const shopperSession = this.generateWindowSessionId('shopper');
      const merchantSession = this.generateWindowSessionId('merchant');

      const shopperWorker = {
        TypeName: "self",
        Role: "QA Shopper Persona",
        Model: "inherit",
        Workspace: "inherit",
        WindowSession: shopperSession,
        AccountInfo: CANONICAL_ACCOUNT_CATALOG.SHOPPER,
        Prompt: `Act as a Guest Shopper (Khách mua hàng) testing E-Commerce storefront and checkout in "${projectName}".

TÀI KHOẢN & TRUY CẬP:
- Không cần đăng nhập trước. URL bắt đầu: "${baseUrl}/shop" (hoặc /products)
- Cửa sổ cách ly: "${shopperSession}"

CÁC BƯỚC THAO TÁC CỤ THỂ (MÔ PHỎNG NGƯỜI DÙNG THẬT):
1. Mở trang: \`new_page(url: "${baseUrl}/shop", isolatedContext: "${shopperSession}")\` -> lưu \`pageId\`.
2. Duyệt sản phẩm và click vào sản phẩm đầu tiên hoặc bấm "Thêm vào giỏ".
3. Xác nhận Mini-Cart Drawer mở trượt tại chỗ (In-Place Tab Isolation: không reload).
4. Bấm "Tiến hành thanh toán" -> Điền form (Tên: Nguyễn Văn Mua, SĐT: 0901234567, Địa chỉ: 123 Đường Mẫu, Q1).
5. Chọn hình thức COD -> Bấm "Xác nhận đặt hàng" -> Assert hiển thị mã đơn ORD-...
6. Chụp ảnh lưu: harness-out/screenshots/${shopperSession}/shopper-checkout.png -> \`close_page(pageId)\`.`
      };

      const merchantWorker = {
        TypeName: "self",
        Role: "QA Merchant Persona",
        Model: "inherit",
        Workspace: "inherit",
        WindowSession: merchantSession,
        AccountInfo: CANONICAL_ACCOUNT_CATALOG.MERCHANT,
        Prompt: `Act as a Merchant / Seller (Nhà bán hàng) testing order fulfillment in "${projectName}".

TÀI KHOẢN & ĐĂNG NHẬP:
- URL Đăng nhập: "${baseUrl}/dangnhap"
- Email: "merchant@shop.test" | Mật khẩu: "Admin@123"
- Cửa sổ cách ly: "${merchantSession}"

CÁC BƯỚC THAO TÁC CỤ THỂ:
1. Mở và đăng nhập: \`new_page(url: "${baseUrl}/dangnhap", isolatedContext: "${merchantSession}")\` -> điền email/pass -> đăng nhập.
2. Mở "${baseUrl}/vendor/orders" -> Xem đơn hàng mới nhất vừa đặt.
3. Click đơn hàng -> Drawer chi tiết trượt ra tại chỗ -> Bấm "Tiếp nhận đơn hàng" -> Badge đổi sang CONFIRMED.
4. Mở "${baseUrl}/vendor/products" -> Click "Thêm sản phẩm mới" -> Điền form -> Lưu tại chỗ.
5. Sửa tồn kho inline trên bảng dữ liệu -> Assert auto-save thành công.
6. Chụp ảnh: harness-out/screenshots/${merchantSession}/merchant-ops.png -> \`close_page(pageId)\`.`
      };

      return {
        projectName,
        domain: 'ecommerce',
        strategy: "multi_persona_journey",
        personas: [shopperWorker, merchantWorker]
      };
    }

    // =========================================================================
    // DOMAIN 2: B2B SAAS SWARM PLAN (Workspace Owner + Team Member)
    // =========================================================================
    if (domain === 'saas') {
      const ownerSession = this.generateWindowSessionId('saas-owner');
      const memberSession = this.generateWindowSessionId('saas-member');

      const ownerWorker = {
        TypeName: "self",
        Role: "QA SaaS Workspace Owner Persona",
        Model: "inherit",
        Workspace: "inherit",
        WindowSession: ownerSession,
        AccountInfo: CANONICAL_ACCOUNT_CATALOG.WORKSPACE_OWNER,
        Prompt: `Act as a SaaS Workspace Owner testing team management & subscription upgrade in "${projectName}".

TÀI KHOẢN & ĐĂNG NHẬP:
- URL Đăng nhập: "${baseUrl}/dangnhap"
- Email: "owner@saas.test" | Mật khẩu: "Admin@123"
- Cửa sổ cách ly: "${ownerSession}"

CÁC BƯỚC THAO TÁC CỤ THỂ:
1. Mở và đăng nhập: \`new_page(url: "${baseUrl}/dangnhap", isolatedContext: "${ownerSession}")\` -> đăng nhập.
2. Mở "${baseUrl}/settings/team" -> Click "Mời thành viên" -> Modal mở tại chỗ -> Điền "colleague@saas.test", chọn role MEMBER -> Gửi lời mời -> Assert hàng mới INVITED.
3. Mở "${baseUrl}/settings/billing" -> Click "Nâng cấp lên gói PRO" -> Modal mở in-place -> Xác nhận nâng cấp -> Assert badge PRO_ACTIVE.
4. Chụp ảnh: harness-out/screenshots/${ownerSession}/saas-owner.png -> \`close_page(pageId)\`.`
      };

      const memberWorker = {
        TypeName: "self",
        Role: "QA SaaS Member Persona",
        Model: "inherit",
        Workspace: "inherit",
        WindowSession: memberSession,
        AccountInfo: CANONICAL_ACCOUNT_CATALOG.TEAM_MEMBER,
        Prompt: `Act as a SaaS Team Member testing workspace project management in "${projectName}".

TÀI KHOẢN & ĐĂNG NHẬP:
- URL Đăng nhập: "${baseUrl}/dangnhap"
- Email: "member@saas.test" | Mật khẩu: "Admin@123"
- Cửa sổ cách ly: "${memberSession}"

CÁC BƯỚC THAO TÁC CỤ THỂ:
1. Mở và đăng nhập: \`new_page(url: "${baseUrl}/dangnhap", isolatedContext: "${memberSession}")\` -> đăng nhập.
2. Mở "${baseUrl}/workspace" -> Bấm "Tạo dự án mới" -> Điền tên "Dự án Nâng cấp Q4" -> Lưu in-place.
3. Kéo thả thẻ công việc trên bảng Kanban (@dnd-kit) -> Assert thẻ đổi cột tại chỗ.
4. Chụp ảnh: harness-out/screenshots/${memberSession}/saas-member.png -> \`close_page(pageId)\`.`
      };

      return {
        projectName,
        domain: 'saas',
        strategy: "multi_persona_journey",
        personas: [ownerWorker, memberWorker]
      };
    }

    // =========================================================================
    // DOMAIN 3: CRM / APPOINTMENT SWARM PLAN (Client + Sales Rep)
    // =========================================================================
    if (domain === 'crm') {
      const clientSession = this.generateWindowSessionId('crm-client');
      const salesSession = this.generateWindowSessionId('crm-sales');

      const clientWorker = {
        TypeName: "self",
        Role: "QA CRM Client Persona",
        Model: "inherit",
        Workspace: "inherit",
        WindowSession: clientSession,
        AccountInfo: CANONICAL_ACCOUNT_CATALOG.CLIENT,
        Prompt: `Act as a Client booking an appointment in "${projectName}".

TRUY CẬP:
- URL bắt đầu: "${baseUrl}/booking" | Cửa sổ: "${clientSession}"
CÁC BƯỚC:
1. Mở: \`new_page(url: "${baseUrl}/booking", isolatedContext: "${clientSession}")\`.
2. Chọn dịch vụ tư vấn -> Chọn khung giờ trống trên lịch -> Điền tên "Hoàng Minh", SĐT "0918888888" -> Xác nhận đặt lịch.
3. Assert mã lịch hẹn xuất hiện -> Bấm "Đổi lịch hẹn" -> Chọn giờ mới -> Assert cập nhật in-place.
4. Chụp ảnh: harness-out/screenshots/${clientSession}/booking.png -> \`close_page(pageId)\`.`
      };

      const salesWorker = {
        TypeName: "self",
        Role: "QA CRM Sales Rep Persona",
        Model: "inherit",
        Workspace: "inherit",
        WindowSession: salesSession,
        AccountInfo: CANONICAL_ACCOUNT_CATALOG.SALES_REP,
        Prompt: `Act as a Sales Rep managing pipeline & deals in "${projectName}".

ĐĂNG NHẬP:
- Email: "sales@crm.test" | Pass: "Admin@123" | Cửa sổ: "${salesSession}"
CÁC BƯỚC:
1. Đăng nhập tại "${baseUrl}/dangnhap".
2. Mở "${baseUrl}/pipeline" -> Bấm "Thêm cơ hội mới (Deal)" -> Điền tên deal, giá trị 500M -> Lưu.
3. Kéo thả thẻ Deal từ cột Lead sang Proposal bằng \`drag(pageId, from_uid, to_uid)\`.
4. Assert deal đổi cột và tổng tiền tính lại tại chỗ.
5. Chụp ảnh: harness-out/screenshots/${salesSession}/pipeline.png -> \`close_page(pageId)\`.`
      };

      return {
        projectName,
        domain: 'crm',
        strategy: "multi_persona_journey",
        personas: [clientWorker, salesWorker]
      };
    }

    // =========================================================================
    // DOMAIN 4: GENERIC WEB APP SWARM PLAN (Public Visitor + Authenticated Member)
    // =========================================================================
    if (domain === 'generic') {
      const publicSession = this.generateWindowSessionId('generic-public');
      const userSession = this.generateWindowSessionId('generic-user');

      const publicWorker = {
        TypeName: "self",
        Role: "QA Public Visitor Persona",
        Model: "inherit",
        Workspace: "inherit",
        WindowSession: publicSession,
        AccountInfo: null,
        Prompt: `Act as a Public Visitor browsing public routes in "${projectName}".
1. Mở trang chủ \`new_page(url: "${baseUrl}", isolatedContext: "${publicSession}")\`.
2. Thử nghiệm tìm kiếm và điều hướng các trang công khai.
3. Assert 0 lỗi console, 0 network 4xx/5xx, font floor >= 12px, text-balance trên tiêu đề.
4. Chụp ảnh: harness-out/screenshots/${publicSession}/public.png -> \`close_page(pageId)\`.`
      };

      const userWorker = {
        TypeName: "self",
        Role: "QA Authenticated Member Persona",
        Model: "inherit",
        Workspace: "inherit",
        WindowSession: userSession,
        AccountInfo: CANONICAL_ACCOUNT_CATALOG.USER,
        Prompt: `Act as an Authenticated Member testing universal CRUD & interactive tables in "${projectName}".
1. Đăng nhập tại "${baseUrl}/dangnhap" bằng "user@app.test" / "Admin@123".
2. Mở dashboard chính -> Thực hiện Universal In-Place Drawer/Modal CRUD (Bấm Thêm -> Form điền -> Lưu -> Assert dữ liệu mới).
3. Thử nghiệm Tab filter, debounce search, và phân trang không làm reload trang.
4. Sửa dữ liệu inline hoặc toggle switch -> Assert auto-save.
5. Chụp ảnh: harness-out/screenshots/${userSession}/user-crud.png -> \`close_page(pageId)\`.`
      };

      return {
        projectName,
        domain: 'generic',
        strategy: "multi_persona_journey",
        personas: [publicWorker, userWorker]
      };
    }

    // =========================================================================
    // DOMAIN 5: DEFAULT HOSPITALITY SWARM PLAN (VietSage & Hotel PMS)
    // =========================================================================

    const guestSession = this.generateWindowSessionId('guest');
    const receptionistSession = this.generateWindowSessionId('receptionist');
    const housekeepingSession = this.generateWindowSessionId('housekeeping');
    const ownerSession = this.generateWindowSessionId('owner');
    const fixtures = config.fixtures || {};
    const qrCode = fixtures.qrCode || 'DEMO_QR_ROOM_101';
    const hotelId = fixtures.hotelId || 'HCA_HOMESTAY';

    // 1. Worker Khách Lưu Trú (Guest In-Room)
    const guestWorker = {
      TypeName: "self",
      Role: "QA Guest In-Room Persona",
      Model: "inherit",
      Workspace: "inherit",
      WindowSession: guestSession,
      AccountInfo: CANONICAL_ACCOUNT_CATALOG.GUEST,
      Prompt: `Act as a Guest staying in room (Khách lưu trú quét mã QR phòng) testing end-to-end journey in "${projectName}".

TÀI KHOẢN & TRUY CẬP:
- Không cần đăng nhập tài khoản.
- URL bắt đầu: "${baseUrl}/g/${qrCode}"
- Cửa sổ cách ly: "${guestSession}"

CÁC BƯỚC THAO TÁC CỤ THỂ (CLICK VÀO ĐÂU, ĐIỀN CÁI GÌ):
1. KHỞI TẠO CỬA SỔ: Gọi \`new_page(url: "${baseUrl}/g/${qrCode}", isolatedContext: "${guestSession}")\` -> lưu \`pageId\`.
2. CHỌN DỊCH VỤ:
   - Gọi \`take_snapshot(pageId)\` tìm các nút điều hướng.
   - Click menu "Dịch vụ buồng phòng" (link hoặc button có text 'Dịch vụ').
   - Click nút "Yêu cầu" hoặc "Đặt" trên thẻ dịch vụ 'Khăn tắm bổ sung' (hoặc dịch vụ đầu tiên).
3. ĐIỀN FORM YÊU CẦU:
   - Gọi \`fill(pageId, uid_ghichu, "Yêu cầu 2 khăn tắm bổ sung cho phòng ${qrCode} (Test tự động lúc ${new Date().toLocaleTimeString()})")\`.
   - Click nút "Gửi yêu cầu" (button[type='submit'] hoặc text 'Gửi yêu cầu').
4. XÁC NHẬN TRẠNG THÁI BAN ĐẦU:
   - Kiểm tra xuất hiện mã đơn (REQ-...) và trạng thái ban đầu là "Chờ tiếp nhận".
   - GIỮ NGUYÊN CỬA SỔ NÀY (chưa đóng) để đón nhận tín hiệu WebSocket realtime từ Lễ tân!
5. ĐÓN NHẬN REALTIME TỪ LỄ TÂN:
   - Khi Lễ tân bấm "Tiếp nhận" ở cửa sổ bên kia: Kiểm tra màn hình khách tự động cập nhật sang "Đang xử lý (Lễ tân đã tiếp nhận)" mà KHÔNG reload trang (Zero Page Reload).
   - Khi Lễ tân bấm "Hoàn thành": Kiểm tra giao diện khách cập nhật sang "Đã hoàn thành".
6. KẾT THÚC & DỌN DẸP:
   - Chụp ảnh màn hình lưu vào: harness-out/screenshots/${guestSession}/guest-closed-loop.png.
   - Gọi \`close_page(pageId)\`. Báo cáo kết quả luồng khách cho coordinator.
${this.getMandatoryExecutionLaws("GUEST", guestSession)}`
    };

    // 2. Worker Lễ Tân Khách Sạn (Frontdesk Receptionist)
    const receptionistWorker = {
      TypeName: "self",
      Role: "QA Frontdesk Ops Persona",
      Model: "inherit",
      Workspace: "inherit",
      WindowSession: receptionistSession,
      AccountInfo: CANONICAL_ACCOUNT_CATALOG.FRONTDESK,
      Prompt: `Act as a Frontdesk Receptionist (Lễ tân khách sạn) testing full-spectrum frontdesk operations in "${projectName}".

TÀI KHOẢN & ĐĂNG NHẬP:
- URL Đăng nhập: "${baseUrl}/dangnhap"
- Email / Tên đăng nhập: "frontdesk@vietsage.vn"
- Mật khẩu: "Admin@123"
- Cửa sổ cách ly: "${receptionistSession}"

CÁC BƯỚC THAO TÁC CỤ THỂ (CLICK VÀO ĐÂU, ĐIỀN CÁI GÌ, DUYỆT CÁI GÌ):
1. KHỞI TẠO CỬA SỔ & ĐĂNG NHẬP:
   - Gọi \`new_page(url: "${baseUrl}/dangnhap", isolatedContext: "${receptionistSession}")\` -> lưu \`pageId\`.
   - Điền email "frontdesk@vietsage.vn", mật khẩu "Admin@123", click "Đăng nhập".
2. TẠO MỚI ĐẶT PHÒNG TRỰC TIẾP (WALK-IN BOOKING CRUD):
   - Mở "${baseUrl}/staff/front-desk".
   - Click nút "Đặt phòng mới" / "Tạo đặt phòng" -> Xác nhận Modal mở tại chỗ (In-Place Tab Isolation).
   - Điền họ tên khách: "Trần Văn Hoàng (Test Walk-in)".
   - Điền số điện thoại: "0987654321", CCCD: "001202008899".
   - Chọn hạng phòng có sẵn, điền tiền cọc: "500000".
   - Click "Lưu đặt phòng" -> Xác nhận modal đóng, thông báo thành công và đơn mới ở trạng thái CONFIRMED.
3. TIẾP NHẬN YÊU CẦU DỊCH VỤ PHÒNG REALTIME (WEBSOCKET):
   - Chuyển sang Tab Yêu cầu phòng (Requests) -> Nhận sự kiện WebSocket từ Khách.
   - Click thẻ yêu cầu phòng ${qrCode} -> Drawer trượt tại chỗ.
   - Click nút "Tiếp nhận" -> Badge chuyển "Đang xử lý".
   - Đợi 2 giây, click "Hoàn thành" -> Đơn hoàn tất thành công.
4. GÁN PHÒNG & CHECK-IN KHÁCH ĐẾN (ARRIVALS):
   - Chuyển sang Tab "Khách đến" (Arrivals).
   - Click đơn đặt phòng chờ nhận -> Chọn phòng trống sạch (AVAILABLE) -> Click "Nhận phòng (Check-in)".
   - Xác nhận trạng thái chuyển sang CHECKED_IN và phòng đổi sang OCCUPIED.
5. THÊM PHỤ THU, THANH TOÁN FOLIO & TRẢ PHÒNG (CHECK-OUT):
   - Click phòng đang có khách -> Chọn Tab "Hóa đơn / Folio".
   - Click "Thêm phụ thu" -> Điền "2 lon nước ngọt Mini Bar", giá "50000" -> Lưu.
   - Click "Thanh toán" -> Chọn "Tiền mặt" -> Bấm xác nhận thu tiền (công nợ về 0).
   - Click "Hoàn tất trả phòng (Check-out)" -> Phòng chuyển sang PROCESSING (Chờ dọn dẹp).
6. KẾT THÚC & DỌN DẸP:
   - Chụp ảnh màn hình lưu vào: harness-out/screenshots/${receptionistSession}/receptionist-full-ops.png.
   - Gọi \`close_page(pageId)\`. Báo cáo kết quả vận hành lễ tân cho coordinator.
${this.getMandatoryExecutionLaws("HOTEL_FRONTDESK", receptionistSession)}`
    };

    // 3. Worker Buồng Phòng (Housekeeping Staff)
    const housekeepingWorker = {
      TypeName: "self",
      Role: "QA Housekeeping Ops Persona",
      Model: "inherit",
      Workspace: "inherit",
      WindowSession: housekeepingSession,
      AccountInfo: CANONICAL_ACCOUNT_CATALOG.HOUSEKEEPING,
      Prompt: `Act as a Housekeeping Staff (Nhân viên buồng phòng) testing room cleaning workflow in "${projectName}".

TÀI KHOẢN & ĐĂNG NHẬP:
- URL Đăng nhập: "${baseUrl}/dangnhap"
- Email / Tên đăng nhập: "housekeeping@vietsage.vn"
- Mật khẩu: "Admin@123"
- Cửa sổ cách ly: "${housekeepingSession}"

CÁC BƯỚC THAO TÁC CỤ THỂ (CLICK VÀO ĐÂU, XÁC NHẬN CÁI GÌ):
1. KHỞI TẠO CỬA SỔ & ĐĂNG NHẬP:
   - Gọi \`new_page(url: "${baseUrl}/dangnhap", isolatedContext: "${housekeepingSession}")\` -> lưu \`pageId\`.
   - Điền email "housekeeping@vietsage.vn", mật khẩu "Admin@123", click "Đăng nhập".
2. VÀO MÀN HÌNH SƠ ĐỒ BUỒNG PHÒNG:
   - Điều hướng đến: "${baseUrl}/hotels/${hotelId}/rooms" (hoặc giao diện buồng phòng).
   - Gọi \`take_snapshot(pageId)\`, tìm các phòng có trạng thái 'PROCESSING' (Đang chờ dọn dẹp).
3. TIẾN HÀNH DỌN PHÒNG & XÁC NHẬN SẴN SÀNG:
   - Click chọn phòng cần dọn.
   - Click nút "Bắt đầu dọn" (nếu có).
   - Click nút "Xác nhận phòng sẵn sàng (Room Ready)".
   - Xác nhận phòng chuyển sang màu xanh / trạng thái 'AVAILABLE' (Sẵn sàng đón khách mới).
4. KẾT THÚC & DỌN DẸP:
   - Chụp ảnh màn hình lưu vào: harness-out/screenshots/${housekeepingSession}/room-ready.png.
   - Gọi \`close_page(pageId)\`. Báo cáo trạng thái phòng sạch cho coordinator.
${this.getMandatoryExecutionLaws("HOUSEKEEPING", housekeepingSession)}`
    };

    // 4. Worker Chủ Khách Sạn (Hotel Owner / Channel Manager)
    const ownerWorker = {
      TypeName: "self",
      Role: "QA Hotel Owner Audit Journey",
      Model: "inherit",
      Workspace: "inherit",
      WindowSession: ownerSession,
      AccountInfo: CANONICAL_ACCOUNT_CATALOG.OWNER,
      Prompt: `Act as a Hotel Owner (Chủ khách sạn) testing inventory & ARI channel manager flows in "${projectName}".

TÀI KHOẢN & ĐĂNG NHẬP:
- URL Đăng nhập: "${baseUrl}/dangnhap"
- Email / Tên đăng nhập: "thucvn@gmail.com" (hoặc "tenant@vietsage.vn")
- Mật khẩu: "Admin@123"
- Cửa sổ cách ly: "${ownerSession}"

CÁC BƯỚC THAO TÁC CỤ THỂ (CLICK VÀO ĐÂU, CẬP NHẬT CÁI GÌ):
1. KHỞI TẠO CỬA SỔ & ĐĂNG NHẬP:
   - Gọi \`new_page(url: "${baseUrl}/dangnhap", isolatedContext: "${ownerSession}")\` -> lưu \`pageId\`.
   - Điền email "thucvn@gmail.com" (hoặc "tenant@vietsage.vn"), mật khẩu "Admin@123", click "Đăng nhập".
2. THAO TÁC MODAL CẬP NHẬT HÀNG LOẠT:
   - Điều hướng đến "${baseUrl}/owner/hotels/${hotelId}/channel-manager".
   - Gọi \`take_snapshot(pageId)\`, tìm và click nút "Cập nhật hàng loạt".
   - Xác nhận Modal mở tại chỗ (In-Place Tab Isolation: không reload).
   - Click nút "Chọn tất cả hạng phòng hợp lệ".
   - Điền ô giá: \`fill(pageId, price_uid, "2500000")\`.
   - BẮT BUỘC click nút "Áp dụng cập nhật" (TUYỆT ĐỐI CẤM bấm "Hủy bỏ") -> Kiểm tra \`list_network_requests\` xác nhận request POST/PUT trả về 200/201 và các ô giá trên bảng lịch thực sự cập nhật thành 2.500.000 VND.
3. THAO TÁC TOGGLE Ô TRẠNG THÁI BÁN TRỰC TIẾP (INLINE CELL):
   - Locate nút "Đang mở bán" trên bảng lịch.
   - Click -> trạng thái lập tức chuyển thành "Đang đóng bán" và tự động lưu.
   - Click lại để hoàn trả "Đang mở bán".
   - Click ô giá bán -> xác nhận xuất hiện input textbox focused -> tự động lưu.
4. KÉO THẢ TAPE CHART (@dnd-kit):
   - Xác định thẻ đặt phòng nguồn (\`from_uid\`) và ô phòng đích (\`to_uid\`).
   - Gọi \`drag(pageId, from_uid, to_uid)\` để kéo thả chuyển phòng.
5. THIẾT LẬP PHÒNG MỚI (ROOM SETUP CRUD):
   - Mở "${baseUrl}/owner/hotels/${hotelId}/rooms".
   - Gọi \`take_snapshot(pageId)\`, click nút "Thêm phòng mới" -> Xác nhận modal mở tại chỗ.
   - Điền số phòng "P.308", Tầng "3", chọn hạng phòng -> Bấm "Lưu".
   - Xác nhận modal đóng, phòng P.308 xuất hiện trên bảng danh sách.
   - Click nút "Bảo trì" để chuyển trạng thái sang MAINTENANCE, sau đó hoàn trả hoạt động.
6. KẾT THÚC & DỌN DẸP:
   - Chụp ảnh màn hình lưu vào: harness-out/screenshots/${ownerSession}/owner-audit.png.
   - Gọi \`close_page(pageId)\`. Báo cáo kết quả quản lý quỹ phòng cho coordinator.
${this.getMandatoryExecutionLaws("TENANT_OWNER", ownerSession)}`
    };

    return {
      projectName,
      strategy: "multi_persona_journey",
      personas: [guestWorker, receptionistWorker, housekeepingWorker, ownerWorker]
    };
  }

  /**
   * Generates a Role-Based Module Swarm Plan
   */
  generateModuleSwarmPlan(moduleFilter = []) {
    const config = this.getConfig() || {};
    const projectName = config.project || path.basename(this.cwd);
    const baseUrl = config.baseUrl || "http://localhost:3000";
    const fixtures = config.fixtures || {};
    const partitioned = partitionRoutesByModule(config.browser?.routes || [], config);

    const targetModuleKeys = (moduleFilter && moduleFilter.length > 0)
      ? moduleFilter.filter(k => partitioned[k])
      : Object.keys(partitioned);

    const loginPath = config.authProvider?.loginUrl || (config.browser?.routes?.includes('/dangnhap') ? '/dangnhap' : '/login');

    const workers = targetModuleKeys.map(modKey => {
      const mod = partitioned[modKey];
      const sessionId = this.generateWindowSessionId(`mod-${mod.id}`);
      const resolvedRoutes = mod.routes.map(r => resolveDynamicRoute(r, fixtures));
      const sampleRoutes = resolvedRoutes.slice(0, 10);

      // Match persona credentials from catalog or config
      const catalogEntry = Object.values(CANONICAL_ACCOUNT_CATALOG).find(c => c.role === mod.authRole);
      const persona = config.personas?.[mod.id] || config.personas?.[modKey] || catalogEntry;
      const username = persona?.defaultUsername || persona?.username || persona?.email || persona?.auth?.username || null;
      const password = persona?.defaultPassword || persona?.password || persona?.auth?.password || null;

      // Extract module-specific business journeys
      const domain = detectProjectDomain(config.browser?.routes || [], config);
      const moduleJourneys = listJourneysForModule(mod.id, domain);
      const journeyGuides = moduleJourneys.map(j => generateStepByStepGuide(j)).join('\n\n');

      const authInstruction = (username && password)
        ? `TÀI KHOẢN ĐĂNG NHẬP CHỈ ĐỊNH:
- Email / Tên đăng nhập: "${username}"
- Mật khẩu: "${password}"
- Đường dẫn đăng nhập: "${loginPath}"
Nếu bị chuyển hướng đến trang đăng nhập:
1. Gọi take_snapshot lấy uid ô email -> điền "${username}".
2. Lấy uid ô mật khẩu -> điền "${password}".
3. Click nút "Đăng nhập" và đợi chuyển hướng.`
        : (mod.requiresAuth ? `YÊU CẦU XÁC THỰC: Module này yêu cầu vai trò "${mod.role}". Đăng nhập bằng tài khoản có quyền tương ứng.` : 'KHÔNG CẦN ĐĂNG NHẬP (Public Module).');

      const prompt = `Act as the dedicated QA Subagent for Module "${mod.name}" (Role: ${mod.role}) in project "${projectName}".

PHẠM VI ĐƯỜNG DẪN KIỂM THỬ (${mod.routes.length} routes):
${sampleRoutes.map(r => `• ${baseUrl}${r}`).join('\n')}

${authInstruction}

HƯỚNG DẪN THAO TÁC TƯƠNG TÁC THẬT (MANDATORY CRUD & DRAG-AND-DROP):
1. KHỞI TẠO CỬA SỔ RIÊNG: Gọi \`new_page(url: "${baseUrl}${sampleRoutes[0] || ''}", isolatedContext: "${sessionId}")\` và lưu \`pageId\`.
2. ĐĂNG NHẬP NẾU CẦN: Thực hiện đăng nhập theo chỉ định tài khoản phía trên.
3. THAO TÁC TƯƠNG TÁC CHUYÊN SÂU:
   a. Lấy cây DOM: Gọi \`take_snapshot(pageId)\` để xác định UIDs.
   b. Thao tác Tạo mới (Create) & Modal: Click các nút "Thêm", "Tạo mới", "Cập nhật hàng loạt" -> Xác nhận modal/drawer mở tại chỗ -> Điền dữ liệu qua \`fill(pageId, uid, value)\` -> Lưu in-place.
   c. Thao tác Tab & Lọc: Click các tab trạng thái [role="tab"] để xác nhận dữ liệu lọc tại chỗ không tải lại trang.
   d. Thao tác Sửa trực tiếp (Inline Cell): Click các ô trạng thái đóng/mở bán hoặc ô sửa giá trên bảng dữ liệu.
   e. Thao tác Kéo thả (@dnd-kit): Nếu có bảng lịch / Tape Chart, gọi \`drag(pageId, from_uid, to_uid)\`.
4. BÁO CÁO SỰ CỐ KHÔNG ĐƯỢC TỰ SỬA:
   - Nếu gặp lỗi Database (Prisma 500, ColumnNotFound, P2022) hoặc lỗi quyền RBAC (403 Forbidden):
   - TUYỆT ĐỐI KHÔNG tự ý sửa database hoặc gỡ @UseGuards().
   - Báo cáo rõ nguyên nhân gốc rễ và đề xuất lệnh cho DBA.
5. CHỤP ẢNH & ĐÓNG CỬA SỔ:
   - Lưu ảnh chụp: harness-out/screenshots/${sessionId}/checkpoint.png.
   - Luôn luôn gọi \`close_page(pageId)\` khi hoàn tất.
${this.getMandatoryExecutionLaws(mod.role || mod.id, sessionId)}${journeyGuides ? `\n\n=======================================================\nCÁC KỊCH BẢN NGHIỆP VỤ BẮT BUỘC THỰC THI CHO MODULE NÀY:\n=======================================================\n${journeyGuides}` : ''}`;

      const roleTitle = `QA ${mod.name} Inspector`;

      return {
        TypeName: "self",
        Role: roleTitle,
        ModuleId: mod.id,
        RoleDescription: mod.role,
        Model: "inherit",
        Workspace: "inherit",
        WindowSession: sessionId,
        RequiresAuth: mod.requiresAuth,
        CredentialsAvailable: !!(username && password),
        TargetRoutesCount: mod.routes.length,
        Routes: resolvedRoutes,
        invokeArgs: {
          TypeName: "self",
          Role: roleTitle,
          Model: "inherit",
          Prompt: prompt
        },
        Prompt: prompt
      };
    });

    return {
      projectName,
      strategy: "role_module_swarm",
      totalModules: workers.length,
      modules: workers
    };
  }

  /**
   * Generates an isolated branch fixer subagent specification
   */
  generateFixerWorker(incident = null) {
    const pack = incident || this.getIncidentPack();
    const config = this.getConfig() || {};
    const projectName = config.project || path.basename(this.cwd);

    let incidentDetails = "General test failure detected.";
    let failingTier = "unknown";
    if (pack && pack.incidents && pack.incidents.length > 0) {
      const first = pack.incidents[0];
      failingTier = first.tier;
      incidentDetails = `Tier ${first.tier} (${first.name}): ${first.error || 'Failed assertion'}\nTarget: ${first.target || 'N/A'}`;
    }

    return {
      TypeName: "self",
      Role: "QA Branch Fixer",
      Model: "inherit",
      Workspace: "branch",
      Prompt: `You are an isolated self-healing subagent operating in a dedicated branch workspace for project "${projectName}".
A test failure occurred:
${incidentDetails}

INSTRUCTIONS:
1. WORKSPACE ISOLATION: You are running in an isolated branch workspace ('branch'). Your edits will NOT collide with master or concurrent agents.
2. Read harness-out/INCIDENT_PACK.json for full incident reproduction details.
3. CHECK NON-FIXABLE BOUNDARIES FIRST:
   If the incident is classified as 'REPORT_ONLY_DATABASE' (missing migration, column not found, Prisma P2022) or 'REPORT_ONLY_RBAC' (security permission guard):
   - DO NOT attempt to run database migrations, ALTER TABLE, or strip @UseGuards() / permissions!
   - Mark the incident as REPORT_ONLY, emit the structured root-cause dossier, and halt immediately.
4. FOR AUTO-FIXABLE ISSUES (UI, Experiential UX Defects, Unsubmitted Flows, Styling, Typography >= 12px, Click Handlers, DTO Keys):
   - Read ALL auto-fixable incidents aggregated in \`harness-out/INCIDENT_PACK.json\` (including \`UX_EXPERIENTIAL_DEFECT\` and \`UNSUBMITTED_FLOW_VIOLATION\`).
   - Inspect ONLY the directly failing component, service, or contract files. Touch ZERO unrelated files.
   - Apply the minimal atomic fix strictly adhering to project conventions (replace raw UUID inputs with <select> dropdowns, add submit loading/disabled states, enforce text-xs >= 12px floor, add text-balance on headings, wire missing form onSubmit handlers).
   - Verify your fix locally using \`agent-harness probe:${failingTier}\`.
5. CIRCUIT BREAKER: Max 3 remediation attempts allowed. If you cannot solve within 3 tries, HALT immediately (exit code 2).
6. If your fix involves browser verification, strictly use \`new_page\` to spawn a dedicated window and call \`close_page\` when done.
7. Once verified green, report back your git commit/diff and verification status.`
    };
  }
}
