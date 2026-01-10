import type { CheckResult, DefaultsConfig, Handler, MacOSConfig } from "../lib/types.js";
import { runCommand, appendLog } from "../lib/shell.js";
import { isDefaults } from "../lib/types.js";

export const defaultsHandler: Handler = {
	async check(config: MacOSConfig, name: string): Promise<CheckResult> {
		if (!isDefaults(config)) {
			return { status: "error", message: "Invalid defaults config" };
		}

		const defaultsConfig = config as DefaultsConfig;
		const { domain, key, value } = defaultsConfig;

		const result = await runCommand(`defaults read "${domain}" "${key}"`);

		if (!result.success) {
			// Key doesn't exist
			return { status: "not_installed", message: "Not set" };
		}

		const currentValue = result.stdout.trim();
		const expectedValue = formatValueForComparison(value);

		if (currentValue === expectedValue) {
			return { status: "installed", message: `Set to ${currentValue}` };
		}

		return {
			status: "modified",
			message: `Current: ${currentValue}, expected: ${expectedValue}`,
		};
	},

	async install(
		config: MacOSConfig,
		name: string,
		dryRun = false,
	): Promise<boolean> {
		if (!isDefaults(config)) {
			return false;
		}

		const defaultsConfig = config as DefaultsConfig;
		const { domain, key, value, type } = defaultsConfig;

		const typeFlag = getTypeFlag(type, value);
		const formattedValue = formatValueForWrite(value, type);
		const cmd = `defaults write "${domain}" "${key}" ${typeFlag} ${formattedValue}`;

		if (dryRun) {
			await appendLog(`[DRY-RUN] Would run: ${cmd}`);
			return true;
		}

		await appendLog(`Setting ${name}: ${cmd}`);
		const result = await runCommand(cmd);

		if (!result.success) {
			await appendLog(`Failed to set ${name}: ${result.stderr}`);
			return false;
		}

		await appendLog(`Successfully set ${name}`);
		return true;
	},

	async uninstall(
		config: MacOSConfig,
		name: string,
		dryRun = false,
	): Promise<boolean> {
		if (!isDefaults(config)) {
			return false;
		}

		const defaultsConfig = config as DefaultsConfig;
		const { domain, key } = defaultsConfig;

		const cmd = `defaults delete "${domain}" "${key}"`;

		if (dryRun) {
			await appendLog(`[DRY-RUN] Would run: ${cmd}`);
			return true;
		}

		await appendLog(`Removing ${name}: ${cmd}`);
		const result = await runCommand(cmd);

		// Don't fail if key doesn't exist
		if (!result.success && !result.stderr.includes("does not exist")) {
			await appendLog(`Failed to remove ${name}: ${result.stderr}`);
			return false;
		}

		await appendLog(`Successfully removed ${name}`);
		return true;
	},
};

/**
 * Get the type flag for defaults write command
 */
function getTypeFlag(
	type: string | undefined,
	value: unknown,
): string {
	if (type) {
		switch (type) {
			case "bool":
				return "-bool";
			case "int":
				return "-int";
			case "float":
				return "-float";
			case "string":
				return "-string";
			case "dict":
				return "-dict";
			case "array":
				return "-array";
			default:
				return "-string";
		}
	}

	// Auto-detect type
	if (typeof value === "boolean") {
		return "-bool";
	}
	if (typeof value === "number") {
		return Number.isInteger(value) ? "-int" : "-float";
	}
	if (Array.isArray(value)) {
		return "-array";
	}
	if (typeof value === "object" && value !== null) {
		return "-dict";
	}
	return "-string";
}

/**
 * Format value for defaults write command
 */
function formatValueForWrite(value: unknown, type?: string): string {
	if (typeof value === "boolean") {
		return value ? "YES" : "NO";
	}
	if (typeof value === "number") {
		return String(value);
	}
	if (typeof value === "string") {
		return `"${value}"`;
	}
	if (Array.isArray(value)) {
		return value.map((v) => formatValueForWrite(v)).join(" ");
	}
	if (typeof value === "object" && value !== null) {
		// For dict, format as key-value pairs
		const pairs: string[] = [];
		for (const [k, v] of Object.entries(value)) {
			pairs.push(`"${k}" ${formatValueForWrite(v)}`);
		}
		return pairs.join(" ");
	}
	return `"${value}"`;
}

/**
 * Format value for comparison with defaults read output
 */
function formatValueForComparison(value: unknown): string {
	if (typeof value === "boolean") {
		return value ? "1" : "0";
	}
	if (typeof value === "number") {
		return String(value);
	}
	if (typeof value === "string") {
		return value;
	}
	return String(value);
}
