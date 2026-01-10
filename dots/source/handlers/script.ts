import type { CheckResult, Handler, MacOSConfig, ScriptConfig } from "../lib/types.js";
import { runCommand, appendLog, truncate, expandPath } from "../lib/shell.js";
import { isScript } from "../lib/types.js";

export const scriptHandler: Handler = {
	async check(config: MacOSConfig, name: string): Promise<CheckResult> {
		if (!isScript(config)) {
			return { status: "error", message: "Invalid script config" };
		}

		const scriptConfig = config as ScriptConfig;

		if (!scriptConfig.check) {
			return { status: "error", message: "No check command specified" };
		}

		const result = await runCommand(scriptConfig.check, {
			shell: scriptConfig.shell,
			env: scriptConfig.env as Record<string, string> | undefined,
			cwd: scriptConfig.working_dir ? expandPath(scriptConfig.working_dir) : undefined,
		});

		if (result.success) {
			return { status: "installed", message: "Check passed" };
		}

		return { status: "not_installed", message: "Check failed" };
	},

	async install(
		config: MacOSConfig,
		name: string,
		dryRun = false,
	): Promise<boolean> {
		if (!isScript(config)) {
			return false;
		}

		const scriptConfig = config as ScriptConfig;

		// Try multiple field names for the install command
		const installCmd =
			scriptConfig.install || scriptConfig.command || scriptConfig.run;

		if (!installCmd) {
			await appendLog(`No install command specified for ${name}`);
			return false;
		}

		if (dryRun) {
			const preview = truncate(installCmd, 60);
			await appendLog(`[DRY-RUN] Would run: ${preview}`);
			return true;
		}

		await appendLog(`Running install script for ${name}: ${truncate(installCmd, 80)}`);

		const result = await runCommand(installCmd, {
			shell: scriptConfig.shell,
			env: scriptConfig.env as Record<string, string> | undefined,
			cwd: scriptConfig.working_dir ? expandPath(scriptConfig.working_dir) : undefined,
		});

		if (!result.success) {
			await appendLog(`Failed to run script for ${name}: ${result.stderr}`);
			return false;
		}

		// Show first few lines of output
		if (result.stdout) {
			const lines = result.stdout.split("\n").slice(0, 5);
			for (const line of lines) {
				await appendLog(`  ${line}`);
			}
			if (result.stdout.split("\n").length > 5) {
				await appendLog("  ... (output truncated)");
			}
		}

		// Run post_install if specified
		if (scriptConfig.post_install) {
			await appendLog(`Running post_install for ${name}: ${truncate(scriptConfig.post_install, 60)}`);
			const postResult = await runCommand(scriptConfig.post_install, {
				shell: scriptConfig.shell,
				env: scriptConfig.env as Record<string, string> | undefined,
				cwd: scriptConfig.working_dir ? expandPath(scriptConfig.working_dir) : undefined,
			});
			if (!postResult.success) {
				await appendLog(`Post-install warning for ${name}: ${postResult.stderr}`);
				// Don't fail on post_install errors
			}
		}

		await appendLog(`Successfully ran script for ${name}`);
		return true;
	},

	async uninstall(
		_config: MacOSConfig,
		name: string,
		_dryRun = false,
	): Promise<boolean> {
		// Scripts cannot be uninstalled - just return true to not block other uninstalls
		await appendLog(`Script ${name} cannot be uninstalled (skipping)`);
		return true;
	},
};
