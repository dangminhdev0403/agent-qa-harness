import fs from 'node:fs';
import path from 'node:path';
import { HARNESS_MODULES, partitionRoutesByModule } from './module-registry.mjs';
import { resolveDynamicRoute } from './prerequisite-inspector.mjs';
import {
  CANONICAL_ACCOUNT_CATALOG,
  UNIVERSAL_INTERACTIVE_JOURNEYS,
  listJourneysForRole,
  generateStepByStepGuide
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
Window Session Tag: ${windowSessionId}`
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
   - Gọi \`close_page(pageId)\`. Báo cáo kết quả luồng khách cho coordinator.`
    };

    // 2. Worker Lễ Tân Khách Sạn (Frontdesk Receptionist)
    const receptionistWorker = {
      TypeName: "self",
      Role: "QA Frontdesk Ops Persona",
      Model: "inherit",
      Workspace: "inherit",
      WindowSession: receptionistSession,
      AccountInfo: CANONICAL_ACCOUNT_CATALOG.FRONTDESK,
      Prompt: `Act as a Frontdesk Receptionist (Lễ tân khách sạn) testing closed-loop request handling in "${projectName}".

TÀI KHOẢN & ĐĂNG NHẬP:
- URL Đăng nhập: "${baseUrl}/dangnhap"
- Email / Tên đăng nhập: "frontdesk@vietsage.vn"
- Mật khẩu: "Admin@123"
- Cửa sổ cách ly: "${receptionistSession}"

CÁC BƯỚC THAO TÁC CỤ THỂ (CLICK VÀO ĐÂU, DUYỆT CÁI GÌ):
1. KHỞI TẠO CỬA SỔ & ĐĂNG NHẬP:
   - Gọi \`new_page(url: "${baseUrl}/dangnhap", isolatedContext: "${receptionistSession}")\` -> lưu \`pageId\`.
   - Gọi \`take_snapshot(pageId)\`, điền ô email "frontdesk@vietsage.vn", điền ô mật khẩu "Admin@123".
   - Click nút "Đăng nhập" và đợi chuyển hướng.
2. VÀO BẢNG ĐIỀU PHỐI LỄ TÂN:
   - Điều hướng hoặc mở URL: "${baseUrl}/staff/front-desk" (hoặc /hotels/${hotelId}/requests).
   - Lắng nghe sự kiện WebSocket realtime khi Khách vừa tạo yêu cầu.
3. TIẾP NHẬN YÊU CẦU PHÒNG:
   - Gọi \`take_snapshot(pageId)\`, xác định thẻ yêu cầu mới của phòng ${qrCode}.
   - Click vào thẻ yêu cầu -> Xác nhận Drawer chi tiết trượt ra tại chỗ (In-Place Tab Isolation: không reload).
   - Click nút "Tiếp nhận" (hoặc "Duyệt") -> Xác nhận badge trạng thái chuyển sang "Đang xử lý".
4. HOÀN TẤT YÊU CẦU:
   - Đợi 2 giây, click nút "Hoàn thành" (hoặc "Đã xử lý") -> Xác nhận đơn đóng thành công.
5. CHECK-IN / CHECK-OUT PHÒNG:
   - Tại sơ đồ phòng, click một phòng đang có khách -> Bấm "Trả phòng" để chuyển trạng thái sang PROCESSING (Chờ buồng phòng dọn).
6. KẾT THÚC & DỌN DẸP:
   - Chụp ảnh màn hình lưu vào: harness-out/screenshots/${receptionistSession}/receptionist-approved.png.
   - Gọi \`close_page(pageId)\`. Báo cáo kết quả duyệt yêu cầu cho coordinator.`
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
   - Gọi \`close_page(pageId)\`. Báo cáo trạng thái phòng sạch cho coordinator.`
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
   - Click nút "Hủy bỏ" hoặc "Áp dụng cập nhật" để đóng modal an toàn.
3. THAO TÁC TOGGLE Ô TRẠNG THÁI BÁN TRỰC TIẾP (INLINE CELL):
   - Locate nút "Đang mở bán" trên bảng lịch.
   - Click -> trạng thái lập tức chuyển thành "Đang đóng bán" và tự động lưu.
   - Click lại để hoàn trả "Đang mở bán".
   - Click ô giá bán -> xác nhận xuất hiện input textbox focused -> tự động lưu.
4. KÉO THẢ TAPE CHART (@dnd-kit):
   - Xác định thẻ đặt phòng nguồn (\`from_uid\`) và ô phòng đích (\`to_uid\`).
   - Gọi \`drag(pageId, from_uid, to_uid)\` để kéo thả chuyển phòng.
5. KẾT THÚC & DỌN DẸP:
   - Chụp ảnh màn hình lưu vào: harness-out/screenshots/${ownerSession}/owner-audit.png.
   - Gọi \`close_page(pageId)\`. Báo cáo kết quả quản lý quỹ phòng cho coordinator.`
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
   - Luôn luôn gọi \`close_page(pageId)\` khi hoàn tất.`;

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
4. FOR AUTO-FIXABLE ISSUES (UI, Styling, Typography >= 12px, Click Handlers, DTO Keys):
   - Inspect ONLY the directly failing component, service, or contract file. Touch ZERO unrelated files.
   - Apply the minimal atomic fix strictly adhering to project conventions.
   - Verify your fix locally using \`agent-harness probe:${failingTier}\`.
5. CIRCUIT BREAKER: Max 3 remediation attempts allowed. If you cannot solve within 3 tries, HALT immediately (exit code 2).
6. If your fix involves browser verification, strictly use \`new_page\` to spawn a dedicated window and call \`close_page\` when done.
7. Once verified green, report back your git commit/diff and verification status.`
    };
  }
}
