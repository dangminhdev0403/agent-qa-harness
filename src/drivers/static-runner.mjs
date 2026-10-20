import { exec } from 'node:child_process';
import util from 'node:util';

const execAsync = util.promisify(exec);

/**
 * Universal Static & Contract Runner Driver
 * Executes repo-specific static checks (UI gate, contract assertions, typechecks)
 */
export async function runStaticGates(config) {
  if (!config.static.enabled || config.static.commands.length === 0) {
    return { skipped: true, reason: 'Static gate checks are disabled or no commands configured.' };
  }

  const results = [];
  console.log(`\n[Static Gate] Executing ${config.static.commands.length} gate check(s)...`);

  for (const item of config.static.commands) {
    const name = item.name || item.cmd;
    const cmd = item.cmd;
    const startedAt = Date.now();

    console.log(`  -> Running command: "${name}" (${cmd})`);

    try {
      const { stdout, stderr } = await execAsync(cmd, {
        cwd: config.rootDir,
        timeout: 45000
      });

      const durationMs = Date.now() - startedAt;
      results.push({
        name,
        cmd,
        passed: true,
        durationMs,
        stdout: stdout.trim().slice(0, 1000)
      });
      console.log(`    PASS (${durationMs}ms)`);
    } catch (err) {
      const durationMs = Date.now() - startedAt;
      results.push({
        name,
        cmd,
        passed: false,
        durationMs,
        error: err.message,
        stdout: err.stdout?.trim().slice(0, 1000),
        stderr: err.stderr?.trim().slice(0, 1000)
      });
      console.error(`    FAIL (${durationMs}ms): ${err.message}`);
    }
  }

  const allPassed = results.every(r => r.passed);
  return {
    passed: allPassed,
    results,
    summary: `${results.filter(r => r.passed).length}/${results.length} static checks passed`
  };
}
