import type { CheckResult, Handler, MacOSConfig, MasConfig } from "../lib/types.js";
import { runCommand, commandExists, appendLog } from "../lib/shell.js";
import { isMas } from "../lib/types.js";

export const masHandler: Handler = {
	async check(config: MacOSConfig, name: string): Promise<CheckResult> {
		if (!isMas(config)) {
			return { status: "error", message: "Invalid mas config" };
		}

		// Check if mas is installed
		if (!(await commandExists("mas"))) {
			return { status: "error", message: "mas CLI is not installed" };
		}

		const masConfig = config as MasConfig;
		const appId = masConfig.mas;

		const result = await runCommand("mas list");
		if (!result.success) {
			return { status: "error", message: "Failed to list installed apps" };
		}

		// Check if app ID is in the list
		const appIdStr = String(appId);
		const lines = result.stdout.split("\n");
		const isInstalled = lines.some((line) => line.startsWith(appIdStr + " "));

		if (isInstalled) {
			return { status: "installed", message: "Installed from App Store" };
		}

		return { status: "not_installed", message: "Not installed" };
	},

	async install(
		config: MacOSConfig,
		name: string,
		dryRun = false,
	): Promise<boolean> {
		if (!isMas(config)) {
			return false;
		}

		const masConfig = config as MasConfig;
		const appId = masConfig.mas;

		if (dryRun) {
			await appendLog(`[DRY-RUN] Would install from App Store: ${appId}`);
			return true;
		}

		await appendLog(`Installing ${name} from App Store (ID: ${appId})`);

		// Try to install
		let result = await runCommand(`mas install ${appId}`);

		// If install fails with "purchase" error, try purchasing first
		if (!result.success && result.stderr.includes("purchase")) {
			await appendLog(`Attempting to purchase ${name} first...`);
			const purchaseResult = await runCommand(`mas purchase ${appId}`);

			if (!purchaseResult.success) {
				await appendLog(`Failed to purchase ${name}: ${purchaseResult.stderr}`);
				return false;
			}

			// Retry install after purchase
			result = await runCommand(`mas install ${appId}`);
		}

		if (!result.success) {
			await appendLog(`Failed to install ${name}: ${result.stderr}`);
			return false;
		}

		await appendLog(`Successfully installed ${name} from App Store`);
		return true;
	},

	async uninstall(
		config: MacOSConfig,
		name: string,
		dryRun = false,
	): Promise<boolean> {
		if (!isMas(config)) {
			return false;
		}

		const masConfig = config as MasConfig;
		const appId = masConfig.mas;

		if (dryRun) {
			await appendLog(`[DRY-RUN] Would uninstall from App Store: ${appId}`);
			return true;
		}

		await appendLog(`Uninstalling ${name} from App Store (ID: ${appId})`);

		const result = await runCommand(`mas uninstall ${appId}`);

		if (!result.success) {
			await appendLog(`Failed to uninstall ${name}: ${result.stderr}`);
			return false;
		}

		await appendLog(`Successfully uninstalled ${name} from App Store`);
		return true;
	},
};
