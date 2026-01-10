import type { CheckResult, Handler, MacOSConfig, NpmConfig } from "../lib/types.js";
import { runCommand, commandExists, appendLog } from "../lib/shell.js";
import { isNpm } from "../lib/types.js";

export const npmHandler: Handler = {
	async check(config: MacOSConfig, name: string): Promise<CheckResult> {
		if (!isNpm(config)) {
			return { status: "error", message: "Invalid npm config" };
		}

		// Check if npm is installed
		if (!(await commandExists("npm"))) {
			return { status: "error", message: "npm is not installed" };
		}

		const npmConfig = config as NpmConfig;
		const packageName = npmConfig.npm;

		const result = await runCommand(`npm list -g --depth=0 ${packageName}`);

		if (result.success && result.stdout.includes(packageName)) {
			return { status: "installed", message: "Installed globally" };
		}

		return { status: "not_installed", message: "Not installed" };
	},

	async install(
		config: MacOSConfig,
		name: string,
		dryRun = false,
	): Promise<boolean> {
		if (!isNpm(config)) {
			return false;
		}

		const npmConfig = config as NpmConfig;
		const packageName = npmConfig.npm;
		const options = npmConfig.options?.join(" ") || "";

		const cmd = `npm install -g ${packageName} ${options}`.trim();

		if (dryRun) {
			await appendLog(`[DRY-RUN] Would run: ${cmd}`);
			return true;
		}

		await appendLog(`Installing ${name}: ${cmd}`);
		const result = await runCommand(cmd);

		if (!result.success) {
			await appendLog(`Failed to install ${name}: ${result.stderr}`);
			return false;
		}

		await appendLog(`Successfully installed ${name}`);
		return true;
	},

	async uninstall(
		config: MacOSConfig,
		name: string,
		dryRun = false,
	): Promise<boolean> {
		if (!isNpm(config)) {
			return false;
		}

		const npmConfig = config as NpmConfig;
		const packageName = npmConfig.npm;

		const cmd = `npm uninstall -g ${packageName}`;

		if (dryRun) {
			await appendLog(`[DRY-RUN] Would run: ${cmd}`);
			return true;
		}

		await appendLog(`Uninstalling ${name}: ${cmd}`);
		const result = await runCommand(cmd);

		if (!result.success) {
			await appendLog(`Failed to uninstall ${name}: ${result.stderr}`);
			return false;
		}

		await appendLog(`Successfully uninstalled ${name}`);
		return true;
	},
};
