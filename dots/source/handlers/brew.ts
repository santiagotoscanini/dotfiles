import type { BrewConfig, CheckResult, Handler, MacOSConfig } from "../lib/types.js";
import { runCommand, commandExists, appendLog } from "../lib/shell.js";
import { isBrew } from "../lib/types.js";

export const brewHandler: Handler = {
	async check(config: MacOSConfig, name: string): Promise<CheckResult> {
		if (!isBrew(config)) {
			return { status: "error", message: "Invalid brew config" };
		}

		// Check if brew is installed
		if (!(await commandExists("brew"))) {
			return { status: "error", message: "Homebrew is not installed" };
		}

		const brewConfig = config as BrewConfig;
		const isCask = brewConfig.cask === true;
		const packageName = brewConfig.brew;

		const listFlag = isCask ? "--cask" : "--formula";
		const result = await runCommand(`brew list ${listFlag} ${packageName}`);

		if (result.success) {
			return { status: "installed", message: "Installed" };
		}

		return { status: "not_installed", message: "Not installed" };
	},

	async install(
		config: MacOSConfig,
		name: string,
		dryRun = false,
	): Promise<boolean> {
		if (!isBrew(config)) {
			return false;
		}

		const brewConfig = config as BrewConfig;
		const isCask = brewConfig.cask === true;
		const packageName = brewConfig.brew;

		// Build install command
		const caskFlag = isCask ? "--cask" : "";
		const options = brewConfig.options?.join(" ") || "";
		const installCmd = `brew install ${caskFlag} ${packageName} ${options}`.trim();

		if (dryRun) {
			await appendLog(`[DRY-RUN] Would run: ${installCmd}`);
			return true;
		}

		// Add tap if specified
		if (brewConfig.tap) {
			await appendLog(`Adding tap: ${brewConfig.tap}`);
			const tapResult = await runCommand(`brew tap ${brewConfig.tap}`);
			if (!tapResult.success) {
				await appendLog(`Failed to add tap: ${tapResult.stderr}`);
				return false;
			}
		}

		// Install package
		await appendLog(`Installing ${name}: ${installCmd}`);
		const result = await runCommand(installCmd);

		if (!result.success) {
			await appendLog(`Failed to install ${name}: ${result.stderr}`);
			return false;
		}

		// Run post_install if specified
		if (brewConfig.post_install) {
			await appendLog(`Running post_install for ${name}: ${brewConfig.post_install}`);
			const postResult = await runCommand(brewConfig.post_install);
			if (!postResult.success) {
				await appendLog(`Post-install warning for ${name}: ${postResult.stderr}`);
				// Don't fail on post_install errors
			}
		}

		await appendLog(`Successfully installed ${name}`);
		return true;
	},

	async uninstall(
		config: MacOSConfig,
		name: string,
		dryRun = false,
	): Promise<boolean> {
		if (!isBrew(config)) {
			return false;
		}

		const brewConfig = config as BrewConfig;
		const isCask = brewConfig.cask === true;
		const packageName = brewConfig.brew;

		const caskFlag = isCask ? "--cask" : "";
		const uninstallCmd = `brew uninstall ${caskFlag} ${packageName}`.trim();

		if (dryRun) {
			await appendLog(`[DRY-RUN] Would run: ${uninstallCmd}`);
			return true;
		}

		await appendLog(`Uninstalling ${name}: ${uninstallCmd}`);
		const result = await runCommand(uninstallCmd);

		if (!result.success) {
			await appendLog(`Failed to uninstall ${name}: ${result.stderr}`);
			return false;
		}

		await appendLog(`Successfully uninstalled ${name}`);
		return true;
	},
};

/**
 * Get all installed brew formulas (top-level only)
 */
export async function getInstalledFormulas(): Promise<string[]> {
	const result = await runCommand("brew leaves");
	if (!result.success) {
		return [];
	}
	return result.stdout.split("\n").filter(Boolean);
}

/**
 * Get all installed brew casks
 */
export async function getInstalledCasks(): Promise<string[]> {
	const result = await runCommand("brew list --cask");
	if (!result.success) {
		return [];
	}
	return result.stdout.split("\n").filter(Boolean);
}
