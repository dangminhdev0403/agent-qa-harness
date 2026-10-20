import fs from 'node:fs';
import path from 'node:path';
import { HARNESS_MODULES, partitionRoutesByModule } from './module-registry.mjs';
import { resolveDynamicRoute } from './prerequisite-inspector.mjs';

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

    const guestWorker = {
      TypeName: "self",
      Role: "QA Guest Persona",
      Model: "inherit",
      Workspace: "inherit",
      WindowSession: guestSession,
      Prompt: `Act as a Walk-in Guest (Khách vãng lai / Khách thuê phòng) testing "${projectName}".
OPERATE ON DEDICATED CHROME WINDOW:
1. Call \`new_page(url: "${baseUrl}/guest")\` to spawn your dedicated Guest window.
2. Select a service / room request (e.g. Request extra towel, room cleaning, or food order).
3. Fill required fields with dynamic payload and click Submit.
4. Verify instant UI feedback (status moves to "Pending / Chờ xử lý"), 0 console errors, 0 network 4xx/5xx.
5. Capture screenshot to harness-out/screenshots/${guestSession}/guest-submitted.png.
6. Call \`close_page\` when done. Report result and emitted event payload.`
    };

    const receptionistWorker = {
      TypeName: "self",
      Role: "QA Receptionist Persona",
      Model: "inherit",
      Workspace: "inherit",
      WindowSession: receptionistSession,
      Prompt: `Act as a Hotel Receptionist (Lễ tân khách sạn / Hotel Ops) testing "${projectName}".
OPERATE ON DEDICATED CHROME WINDOW:
1. Call \`new_page(url: "${baseUrl}/owner/operations")\` to spawn your dedicated Receptionist window.
2. Listen for the realtime incoming request from Guest (WebSocket room assertion).
3. Verify incoming notification toast / audio trigger / badge update without page reload.
4. Click "Approve / Tiếp nhận" on the guest's request.
5. Verify status changes to "Approved / Đã tiếp nhận", 0 console errors, 0 network 4xx/5xx.
6. Capture screenshot to harness-out/screenshots/${receptionistSession}/receptionist-approved.png.
7. Call \`close_page\` when done. Report confirmation status.`
    };

    const ownerWorker = {
      TypeName: "self",
      Role: "QA Hotel Owner Persona",
      Model: "inherit",
      Workspace: "inherit",
      WindowSession: ownerSession,
      Prompt: `Act as a Hotel Owner (Chủ khách sạn / Admin) testing "${projectName}".
OPERATE ON DEDICATED CHROME WINDOW:
1. Call \`new_page(url: "${baseUrl}/owner/dashboard")\` to spawn your dedicated Owner window.
2. Inspect room inventory, tape chart allocations, and revenue metrics.
3. Verify in-place tab isolation (drawer/modal opens cleanly, zero cross-tab redirects).
4. Verify 0 console errors, 0 network 4xx/5xx.
5. Capture screenshot to harness-out/screenshots/${ownerSession}/owner-audit.png.
6. Call \`close_page\` when done. Report high-level management health.`
    };

    return {
      projectName,
      strategy: "multi_persona_swarm",
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

      return {
        TypeName: "self",
        Role: `QA ${mod.name} Inspector`,
        ModuleId: mod.id,
        RoleDescription: mod.role,
        Model: "inherit",
        Workspace: "inherit",
        WindowSession: sessionId,
        RequiresAuth: mod.requiresAuth,
        TargetRoutesCount: mod.routes.length,
        Routes: resolvedRoutes,
        Prompt: `Act as the dedicated QA Subagent for Module "${mod.name}" (Role: ${mod.role}) in project "${projectName}".

TESTING SCOPE (${mod.routes.length} routes in this module):
${sampleRoutes.map(r => `• ${baseUrl}${r}`).join('\n')}

OPERATIONAL PROTOCOL (DEDICATED CHROME WINDOW):
1. WINDOW CREATION: Call chrome-devtools-mcp tool \`new_page(url: "${baseUrl}${sampleRoutes[0] || ''}", isolatedContext: "${sessionId}")\`.
2. AUTHENTICATION: ${mod.requiresAuth ? `This module requires Role "${mod.role}". If redirected to authentication (${loginPath}), authenticate with valid ${mod.role} credentials before proceeding.` : 'No auth required. Test public UI elements and form validations directly.'}
3. VERIFICATION GATES:
   - Navigate each module route.
   - Assert 0 console errors (\`list_console_messages\`).
   - Assert 0 network 4xx/5xx failures (\`list_network_requests\`).
   - Verify in-place tab isolation (drawer/modal actions, zero cross-tab redirects).
   - Capture checkpoint screenshots to harness-out/screenshots/${sessionId}/.
4. CLEAN TEARDOWN: ALWAYS call \`close_page\` when finished (PASS or FAIL). Report concise execution summary.`
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
3. Inspect ONLY the directly failing file (controller, gateway, component, or schema). Touch ZERO unrelated files.
4. Apply the minimal atomic fix strictly adhering to project conventions.
5. Verify your fix locally using \`agent-harness probe:${failingTier}\`.
6. CIRCUIT BREAKER: Max 3 remediation attempts allowed. If you cannot solve within 3 tries, HALT immediately (exit code 2).
7. If your fix involves browser verification, strictly use \`new_page\` to spawn a dedicated window and call \`close_page\` when done.
8. Once verified green, report back your git commit/diff and verification status.`
    };
  }
}
