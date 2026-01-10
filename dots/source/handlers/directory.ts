import * as fs from "fs";
import type { CheckResult, DirectoryConfig, Handler, MacOSConfig } from "../lib/types.js";
import { expandPath, appendLog, backupFile } from "../lib/shell.js";
import { isDirectory } from "../lib/types.js";

export const directoryHandler: Handler = {
	async check(config: MacOSConfig, name: string): Promise<CheckResult> {
		if (!isDirectory(config)) {
			return { status: "error", message: "Invalid directory config" };
		}

		const dirConfig = config as DirectoryConfig;
		const paths = getPaths(dirConfig);

		if (paths.length === 0) {
			return { status: "error", message: "No paths specified" };
		}

		const missingPaths: string[] = [];
		const wrongPermsPaths: string[] = [];
		const mode = dirConfig.mode || dirConfig.permissions;

		for (const p of paths) {
			const expandedPath = expandPath(p);

			if (!fs.existsSync(expandedPath)) {
				missingPaths.push(p);
				continue;
			}

			const stats = fs.statSync(expandedPath);
			if (!stats.isDirectory()) {
				return {
					status: "modified",
					message: `${p} exists but is not a directory`,
				};
			}

			// Check permissions if specified (only for single path)
			if (mode && paths.length === 1) {
				const currentMode = (stats.mode & 0o777).toString(8);
				const expectedMode = mode.replace(/^0/, "");
				if (currentMode !== expectedMode) {
					wrongPermsPaths.push(p);
				}
			}
		}

		if (missingPaths.length > 0) {
			return {
				status: "not_installed",
				message: `Missing: ${missingPaths.join(", ")}`,
			};
		}

		if (wrongPermsPaths.length > 0) {
			return {
				status: "modified",
				message: `Wrong permissions: ${wrongPermsPaths.join(", ")}`,
			};
		}

		return { status: "installed", message: "All directories exist" };
	},

	async install(
		config: MacOSConfig,
		name: string,
		dryRun = false,
	): Promise<boolean> {
		if (!isDirectory(config)) {
			return false;
		}

		const dirConfig = config as DirectoryConfig;
		const paths = getPaths(dirConfig);
		const mode = dirConfig.mode || dirConfig.permissions;
		const parents = dirConfig.parents !== false; // Default to true

		if (paths.length === 0) {
			await appendLog(`No paths specified for ${name}`);
			return false;
		}

		for (const p of paths) {
			const expandedPath = expandPath(p);

			if (dryRun) {
				await appendLog(`[DRY-RUN] Would create directory: ${expandedPath}`);
				continue;
			}

			try {
				// Check if a file exists at this path
				if (fs.existsSync(expandedPath)) {
					const stats = fs.statSync(expandedPath);
					if (!stats.isDirectory()) {
						// Backup the file
						const backupPath = await backupFile(expandedPath);
						if (backupPath) {
							await appendLog(`Backed up file to: ${backupPath}`);
						}
					} else {
						// Directory already exists, just set permissions if needed
						if (mode) {
							const modeNum = parseInt(mode.replace(/^0/, ""), 8);
							fs.chmodSync(expandedPath, modeNum);
							await appendLog(`Set permissions on ${expandedPath}: ${mode}`);
						}
						continue;
					}
				}

				// Create directory
				fs.mkdirSync(expandedPath, {
					recursive: parents,
					mode: mode ? parseInt(mode.replace(/^0/, ""), 8) : 0o755,
				});
				await appendLog(`Created directory: ${expandedPath}`);
			} catch (error) {
				await appendLog(`Failed to create directory ${expandedPath}: ${error}`);
				return false;
			}
		}

		return true;
	},

	async uninstall(
		config: MacOSConfig,
		name: string,
		dryRun = false,
	): Promise<boolean> {
		if (!isDirectory(config)) {
			return false;
		}

		const dirConfig = config as DirectoryConfig;
		const paths = getPaths(dirConfig);

		// Process in reverse order (deepest first)
		const reversedPaths = [...paths].reverse();

		for (const p of reversedPaths) {
			const expandedPath = expandPath(p);

			if (!fs.existsSync(expandedPath)) {
				continue;
			}

			try {
				const entries = fs.readdirSync(expandedPath);
				if (entries.length > 0) {
					await appendLog(`Skipping non-empty directory: ${expandedPath}`);
					continue;
				}

				if (dryRun) {
					await appendLog(`[DRY-RUN] Would remove empty directory: ${expandedPath}`);
					continue;
				}

				fs.rmdirSync(expandedPath);
				await appendLog(`Removed empty directory: ${expandedPath}`);
			} catch (error) {
				await appendLog(`Failed to remove directory ${expandedPath}: ${error}`);
				// Don't fail - directories may contain user data
			}
		}

		return true;
	},
};

/**
 * Get paths from directory config
 */
function getPaths(config: DirectoryConfig): string[] {
	if (config.paths) {
		return Array.isArray(config.paths) ? config.paths : [config.paths];
	}
	if (config.path) {
		return [config.path];
	}
	return [];
}
