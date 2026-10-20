import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';
import util from 'node:util';

const execAsync = util.promisify(exec);

const LOCK_FILE_NAME = '.harness.lock';
const STATE_FILE_NAME = '.remediation-state.json';
const MAX_DEFAULT_ATTEMPTS = 3;

/**
 * Multi-Agent Isolation & Anti-Infinite-Loop Manager.
 *
 * 1. Circuit Breaker: Prevents infinite edit-and-run loops between multiple agents/prompts (capped at 3 attempts).
 * 2. Concurrency Lock: Detects when another agent is actively modifying the codebase.
 * 3. Branch Isolator: Automatically branches off to 'harness-fix/<target>-<timestamp>' to isolate edits.
 */

export class IsolationManager {
  constructor(rootDir, outputDir) {
    this.rootDir = rootDir;
    this.outputDir = outputDir;
    this.lockPath = path.join(rootDir, LOCK_FILE_NAME);
    this.statePath = path.join(outputDir, STATE_FILE_NAME);
  }

  /**
   * Checks whether the remediation loop has exceeded max allowed attempts.
   * Prevents agents from endlessly modifying code back and forth.
   */
  checkCircuitBreaker(failureSignature, maxAttempts = MAX_DEFAULT_ATTEMPTS) {
    let state = this.loadState();
    const currentCount = (state.signatures?.[failureSignature] || 0) + 1;

    if (!state.signatures) state.signatures = {};
    state.signatures[failureSignature] = currentCount;
    state.lastUpdated = new Date().toISOString();
    this.saveState(state);

    if (currentCount > maxAttempts) {
      const msg = `[CIRCUIT BREAKER KÍCH HOẠT] Đã thử tự động sửa đổi ${currentCount - 1} lần nhưng lỗi vẫn lặp lại:\n` +
        `  -> Lỗi: "${failureSignature}"\n` +
        `  -> BẮT BUỘC DỪNG: Ngắt vòng lặp sửa code vĩnh viễn (Infinite Loop) để tránh xung đột giữa 2 agents.\n` +
        `  -> Yêu cầu: Cần kỹ sư hoặc người dùng can thiệp trực tiếp để xem xét logic.`;
      return { tripped: true, count: currentCount, message: msg };
    }

    return { tripped: false, count: currentCount, remaining: maxAttempts - currentCount + 1 };
  }

  /**
   * Resets the remediation state once tests pass completely.
   */
  resetRemediationState() {
    try {
      if (fs.existsSync(this.statePath)) {
        fs.unlinkSync(this.statePath);
      }
    } catch {}
  }

  /**
   * Acquires a concurrency lock to prevent 2 agents from editing simultaneously.
   */
  acquireLock(agentId = 'agent-unknown', targetFiles = []) {
    if (fs.existsSync(this.lockPath)) {
      try {
        const lockData = JSON.parse(fs.readFileSync(this.lockPath, 'utf8'));
        const ageMs = Date.now() - lockData.timestamp;

        // Nếu lock chưa quá 5 phút -> Đang có agent khác sửa đổi
        if (ageMs < 5 * 60 * 1000 && lockData.agentId !== agentId) {
          return {
            acquired: false,
            holder: lockData.agentId,
            ageSeconds: Math.floor(ageMs / 1000),
            message: `[XUNG ĐỘT AGENT] Agent '${lockData.agentId}' đang chỉnh sửa code (Lock ${Math.floor(ageMs / 1000)}s trước).`
          };
        }
      } catch {}
    }

    // Ghi lock mới
    const payload = {
      agentId,
      pid: process.pid,
      targetFiles,
      timestamp: Date.now(),
      createdAt: new Date().toISOString()
    };
    fs.writeFileSync(this.lockPath, JSON.stringify(payload, null, 2), 'utf8');
    return { acquired: true };
  }

  /**
   * Releases the concurrency lock.
   */
  releaseLock() {
    try {
      if (fs.existsSync(this.lockPath)) {
        fs.unlinkSync(this.lockPath);
      }
    } catch {}
  }

  /**
   * Automatically branches off to an isolated Git branch to avoid collisions on master/main.
   */
  async createIsolatedBranch(featureName = 'fix') {
    const timestamp = Date.now();
    const cleanFeature = featureName.toLowerCase().replace(/[^a-z0-9_-]/g, '-').slice(0, 20);
    const branchName = `harness-fix/${cleanFeature}-${timestamp}`;

    console.log(`\n[Branch Isolation] Phát hiện nguy cơ xung đột giữa các agents.`);
    console.log(`  -> Tự động tách nhánh cô lập: '${branchName}' để chỉnh sửa...`);

    try {
      // Kiểm tra xem git có sẵn sàng không
      const { stdout: currentBranch } = await execAsync('git branch --show-current', { cwd: this.rootDir });
      await execAsync(`git checkout -b "${branchName}"`, { cwd: this.rootDir });

      console.log(`  -> Đã chuyển từ '${currentBranch.trim()}' sang nhánh an toàn: '${branchName}'.`);
      console.log(`  -> Mã nguồn của task khác sẽ không bị ảnh hưởng!\n`);

      return {
        isolated: true,
        originalBranch: currentBranch.trim(),
        isolatedBranch: branchName
      };
    } catch (err) {
      console.warn(`  [CẢNH BÁO] Không thể tự động tách nhánh Git: ${err.message}`);
      return { isolated: false, error: err.message };
    }
  }

  loadState() {
    try {
      if (fs.existsSync(this.statePath)) {
        return JSON.parse(fs.readFileSync(this.statePath, 'utf8'));
      }
    } catch {}
    return { signatures: {} };
  }

  saveState(state) {
    try {
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
      }
      fs.writeFileSync(this.statePath, JSON.stringify(state, null, 2), 'utf8');
    } catch {}
  }
}
