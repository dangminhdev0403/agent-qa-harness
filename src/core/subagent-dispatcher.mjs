import fs from 'node:fs';
import path from 'node:path';
import { HARNESS_MODULES, partitionRoutesByModule } from './module-registry.mjs';
import { resolveDynamicRoute } from './prerequisite-inspector.mjs';
import { UNIVERSAL_INTERACTIVE_JOURNEYS, listJourneysForRole, generateChromeMCPInstructions } from './journey-registry.mjs';

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
   * Generates a parallel 2-worker subagent dispatch plan with full browser & workspace isolation
   */
  generateParallelPlan() {
    const config = this.getConfig() || {};
    const projectName = config.project || path.basename(this.cwd);
    const windowSessionId = this.generateWindowSessionId('ui');
    const initialUrl = config.baseUrl || "http://localhost:3000";

    const codeWorker = {
      TypeName: "self",
      Role: "QA Code Gatekeeper",
      Model: "flash",
      Workspace: "inherit",
      Prompt: `Execute Mode 1 QA Code and Stability verification for project "${projectName}". Run command \`agent-harness test:code --auto-start\`. Verify Tier 0 (static rules, build, types, UI constraints), Tier 1 (realtime socket connections), and Tier 2 (concurrency and race condition prevention). Return a concise summary of results and exit status. If tests fail, report the exact failing tier and exit.`
    };

    const flowWorker = {
      TypeName: "self",
      Role: "QA Flow Inspector",
      Model: "inherit",
      Workspace: "inherit",
      Prompt: `Execute Mode 2 QA Flow and Browser UI verification for project "${projectName}" on a DEDICATED ISOLATED CHROME WINDOW.

MANDATORY CHROME WINDOW ISOLATION PROTOCOL:
1. WINDOW CREATION: DO NOT hijack any existing tab or shared window. Call chrome-devtools-mcp tool \`new_page\` with url: "${initialUrl}" to launch a completely dedicated, isolated browser window. Record the returned page target ID.
2. TARGET BINDING: Ensure all subsequent chrome-devtools-mcp tool calls (\`select_page\`, \`navigate_page\`, \`click\`, \`fill\`, \`list_console_messages\`, \`list_network_requests\`, \`take_screenshot\`) are strictly targeted to this dedicated page.
3. VERIFICATION GATES:
   - Zero console errors (\`list_console_messages\` -> no errors/unhandled rejections/React hydration mismatches).
   - Zero network 4xx/5xx failures (\`list_network_requests\` -> all background API/XHR requests must succeed).
   - Verify In-Place Tab Isolation: Actions must execute in modals/drawers without disruptive cross-tab redirects.
   - Capture screenshots into harness-out/screenshots/${windowSessionId}/.
4. CLEAN TEARDOWN: When finished (whether PASS or FAIL), ALWAYS call \`close_page\` on your dedicated target ID to close your window and prevent orphaned tab leaks.
5. Command alternative: You may also run \`agent-harness test:flow\` to execute the automated flow scanner.

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
   * Generates a Multi-Persona Swarm Plan (Guest vs Receptionist vs Hotel Owner)
   * Each persona operates in a DEDICATED Chrome window with distinct credentials and role responsibilities.
   */
  generatePersonaSwarmPlan() {
    const config = this.getConfig() || {};
    const projectName = config.project || path.basename(this.cwd);
    const baseUrl = config.baseUrl || "http://localhost:3000";

    const guestSession = this.generateWindowSessionId('guest');
    const receptionistSession = this.generateWindowSessionId('receptionist');
    const ownerSession = this.generateWindowSessionId('owner');
    const fixtures = config.fixtures || {};
    const qrCode = fixtures.qrCode || 'DEMO_QR_ROOM_101';
    const hotelId = fixtures.hotelId || 'HCA_HOMESTAY';

    const receptionistAuth = config.personas?.frontdesk?.auth || config.personas?.frontdesk;
    const ownerAuth = config.personas?.owner?.auth || config.personas?.owner;

    const guestWorker = {
      TypeName: "self",
      Role: "QA Guest In-Room Journey",
      Model: "inherit",
      Workspace: "inherit",
      WindowSession: guestSession,
      Prompt: `Act as a Guest staying in room (Khách lưu trú phòng QR) testing end-to-end journey in "${projectName}".
OPERATE ON DEDICATED CHROME WINDOW:
1. Call \`new_page(url: "${baseUrl}/g/${qrCode}", isolatedContext: "${guestSession}")\` to spawn your dedicated Guest window.
2. INTERACTIVE UI ACTIONS:
   - Navigate to /g/services or /g/requests.
   - Click service card / button (e.g. "Gọi khăn tắm" or "Dọn phòng").
   - Fill note input with: "Khách phòng ${qrCode} yêu cầu 2 khăn tắm (Test lúc ${new Date().toLocaleTimeString()})".
   - Click Submit button.
3. VERIFICATION:
   - Assert confirmation toast / order code returned.
   - Assert 0 console errors, 0 network 4xx/5xx failures.
4. Capture screenshot to harness-out/screenshots/${guestSession}/guest-request-sent.png.
5. Call \`close_page\` when done. Report request ID to coordinator.`
    };

    const receptionistWorker = {
      TypeName: "self",
      Role: "QA Frontdesk Ops Journey",
      Model: "inherit",
      Workspace: "inherit",
      WindowSession: receptionistSession,
      Prompt: `Act as a Frontdesk Receptionist (Lễ tân khách sạn) testing end-to-end journey in "${projectName}".
AUTHENTICATION:
- Login at "${baseUrl}/dangnhap" if prompted.
- Credentials: Username="${receptionistAuth?.username || receptionistAuth?.email || 'frontdesk@vietsage.vn'}", Password="${receptionistAuth?.password || 'Admin@123'}".

OPERATE ON DEDICATED CHROME WINDOW:
1. Call \`new_page(url: "${baseUrl}/staff/front-desk", isolatedContext: "${receptionistSession}")\` (or /hotels/${hotelId}/requests).
2. REALTIME RECEIVE & APPROVAL INTERACTION:
   - Wait for the incoming room request created by Guest.
   - Locate the request card on the board.
   - Click "Tiếp nhận" or "Duyệt" button.
   - Verify status pill transitions cleanly (e.g. Chờ xử lý -> Đang xử lý) in-place without page reload.
3. VERIFICATION:
   - Assert 0 console errors, 0 network 4xx/5xx failures.
   - Verify in-place tab isolation (actions execute in drawer/modal, zero disruptive cross-tab redirects).
4. Capture screenshot to harness-out/screenshots/${receptionistSession}/receptionist-approved.png.
5. Call \`close_page\` when done. Report approval status.`
    };

    const ownerWorker = {
      TypeName: "self",
      Role: "QA Hotel Owner Audit Journey",
      Model: "inherit",
      Workspace: "inherit",
      WindowSession: ownerSession,
      Prompt: `Act as a Hotel Owner (Chủ khách sạn) testing management flows in "${projectName}".
AUTHENTICATION:
- Login at "${baseUrl}/dangnhap" if prompted.
- Credentials: Username="${ownerAuth?.username || ownerAuth?.email || 'thucvn@gmail.com'}", Password="${ownerAuth?.password || 'Admin@123'}".

OPERATE ON DEDICATED CHROME WINDOW:
1. Call \`new_page(url: "${baseUrl}/owner/dashboard", isolatedContext: "${ownerSession}")\` and save \`pageId\`.
2. DEEP DOM INTERACTION & CRUD OPERATIONS (STRICTLY FORBIDDEN TO JUST "GET LINKS"):
   a. Batch Price & Allocation Modal (In-Place Dialog):
      - Navigate to "${baseUrl}/owner/hotels/${hotelId}/channel-manager".
      - Call \`take_snapshot(pageId)\`, locate and click button "Cập nhật hàng loạt".
      - Verify modal dialog opens in-place without page navigation.
      - Click "Chọn tất cả hạng phòng hợp lệ".
      - Call \`fill(pageId, price_uid, "2500000")\` to input new price.
      - Click button "Hủy bỏ" or "Áp dụng cập nhật" to close modal in-place.
   b. Inline Cell Editing & Status Toggle (Zero-Disruptive Auto-Save):
      - Locate an inline cell (e.g. "Đóng bán Single Room, ngày ...").
      - Call \`click(pageId, toggle_uid)\` -> verify status flips to "Đang đóng bán" in-place.
      - Click again to restore "Đang mở bán".
      - Click an inline price cell (e.g. "2.100.000 ₫") -> assert focused textbox appears.
   c. Drag-and-Drop Floor Plan / Tape Chart (@dnd-kit):
      - In Room Grid / Tape Chart, locate draggable reservation block (\`from_uid\`) and destination slot (\`to_uid\`).
      - Call \`drag(pageId, from_uid, to_uid)\`.
      - Assert reservation shifts slot smoothly without page reload.
3. FIX VS NO-FIX BOUNDARIES:
   - Do NOT touch database or alter RBAC guards (report-only).
   - In-place fix allowed for notification copy, click handlers, or contract keys.
4. Capture screenshot to harness-out/screenshots/${ownerSession}/owner-audit.png.
5. Call \`close_page\` when done. Report management overview.`
    };

    return {
      projectName,
      strategy: "multi_persona_journey",
      personas: [guestWorker, receptionistWorker, ownerWorker]
    };
  }

  /**
   * Generates a Role-Based Module Swarm Plan
   * Partitions the system into 6 discrete modules, each tested by a dedicated Subagent in an isolated Chrome window.
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

      // Locate credentials from config personas or auto-discovered account.json
      const persona = config.personas?.[mod.id] || config.personas?.[modKey] || Object.values(config.personas || {}).find(p => p.role === mod.authRole);
      const username = persona ? (persona.username || persona.email || persona.auth?.username || persona.auth?.email || persona.user) : null;
      const password = persona ? (persona.password || persona.auth?.password || persona.pass) : null;

      const authInstruction = (username && password)
        ? `AUTHENTICATION CREDENTIALS (FROM ACCOUNT CONFIG):
- Username / Email: "${username}"
- Password: "${password}"
If redirected to login page (${loginPath}):
- Fill the username/email input with "${username}".
- Fill the password input with "${password}".
- Click the submit / login button and wait for redirect.`
        : (mod.requiresAuth ? `AUTHENTICATION: This module requires Role "${mod.role}". Authenticate with valid ${mod.role} credentials if prompted.` : 'AUTHENTICATION: No auth required for public testing.');

      const prompt = `Act as the dedicated QA Subagent for Module "${mod.name}" (Role: ${mod.role}) in project "${projectName}".

TESTING SCOPE (${mod.routes.length} routes in this module):
${sampleRoutes.map(r => `• ${baseUrl}${r}`).join('\n')}

${authInstruction}

OPERATIONAL PROTOCOL (MANDATORY CRUD & DRAG-AND-DROP INTERACTIVE TESTING):
1. WINDOW CREATION: Call chrome-devtools-mcp tool \`new_page(url: "${baseUrl}${sampleRoutes[0] || ''}", isolatedContext: "${sessionId}")\` and save returned \`pageId\`.
2. AUTHENTICATION & LOGIN GATE:
   - If redirected to login page (${loginPath}):
     ${username && password ? `- Locate username input uid via \`take_snapshot(pageId)\`, fill "${username}".\n     - Locate password input uid, fill "${password}".\n     - Click submit button uid and wait for navigation.` : `- Authenticate with valid ${mod.role} credentials if available.`}

3. DEEP DOM INTERACTION & CRUD OPERATIONS (STRICTLY FORBIDDEN TO JUST "GET LINKS"):
   On each tested screen, execute real user actions using Chrome MCP tools:
   a. Snapshot Discovery: Call \`take_snapshot(pageId)\` to inspect the a11y tree and obtain element \`uid\`s.
   b. CRUD Operations (Create / Update / Status Change):
      - [CREATE]: Locate and click primary action buttons ("Thêm", "Tạo mới", "Đặt dịch vụ", "Gửi yêu cầu").
        Verify Modal/Drawer opens in-place (verifying Tab Isolation Standard: zero disruptive redirects).
        Fill input fields via \`fill(pageId, uid, value)\`. Submit and verify new item appears.
      - [UPDATE]: Click edit/update buttons on cards or table rows. Modify field values and verify in-place save.
      - [TABS & FILTERING]: Click filter pills, category buttons, and tabs (\`[role="tab"]\`). Verify view filters without full page reload.
   c. DRAG-AND-DROP INTERACTIONS (Tape Chart / Room Grid / Sortable Lists):
      - Where draggable room cards or sortable list items exist (e.g. Tape Chart, room reallocations):
        Locate source element (\`from_uid\`) and destination drop zone (\`to_uid\`).
        Call \`drag(pageId, from_uid, to_uid)\` to execute the drag-and-drop interaction.
        Verify card/room relocates smoothly to the target slot without layout break or console error.

4. FIX VS NO-FIX BOUNDARY STANDARD:
   - 🔴 FORBIDDEN TO TOUCH (Report Only):
     * RBAC / Authorization gates: DO NOT remove \`@UseGuards()\`, bypass permission checks, or elevate roles just to make tests pass.
     * Database Schema & Tables: DO NOT alter database schemas, drop tables, or run destructive migrations during UI testing. Report any DB failures (500, Prisma errors) as "Lỗi Database (Chờ xử lý)".
   - 🟢 AUTHORIZED TO FIX (In-Place Remediation):
     * Error Notification Copy: Upgrade raw technical error strings (403 Forbidden, 500 Internal, TypeError) into polite, human-readable toasts/alerts (e.g. "Bạn không có quyền thực hiện thao tác này").
     * UI Layout & Interaction Bugs: Fix unresponsive click handlers, missing drawer state resets, z-index clipping, broken form validations, font floor violations (< 12px), or missing \`text-balance\`.
     * Contract Binding: Align form payload keys with backend DTOs, fix incorrect URL query parameters.

5. EVIDENCE & CLEAN TEARDOWN:
   - Capture checkpoint screenshot: \`take_screenshot(pageId, filePath: "harness-out/screenshots/${sessionId}/checkpoint.png")\`.
   - ALWAYS call \`close_page(pageId)\` when finished (PASS or FAIL).
   - Report concise execution summary (routes tested, CRUD/Drag actions performed, console/network status, blockers).`;

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
        CredentialsAvailable: !!persona,
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
