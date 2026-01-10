import * as fs from "fs";
import * as path from "path";
import type { CheckResult, Handler, MacOSConfig, SymlinkConfig } from "../lib/types.js";
import {
	expandPath,
	getDotfilesDir,
	backupFile,
	ensureDir,
	isSymlinkTo,
	appendLog,
} from "../lib/shell.js";

export interface SymlinkHandler extends Handler {
	checkSymlink(config: SymlinkConfig, name: string): Promise<CheckResult>;
	installSymlink(
		config: SymlinkConfig,
		name: string,
		dryRun?: boolean,
	): Promise<boolean>;
	uninstallSymlink(
		config: SymlinkConfig,
		name: string,
		dryRun?: boolean,
	): Promise<boolean>;
}

export const symlinkHandler: SymlinkHandler = {
	// These are placeholders - symlinks are handled via config.source/destination
	async check(_config: MacOSConfig, _name: string): Promise<CheckResult> {
		return { status: "error", message: "Use checkSymlink for symlink operations" };
	},

	async install(
		_config: MacOSConfig,
		_name: string,
		_dryRun = false,
	): Promise<boolean> {
		return false;
	},

	async uninstall(
		_config: MacOSConfig,
		_name: string,
		_dryRun = false,
	): Promise<boolean> {
		return false;
	},

	async checkSymlink(config: SymlinkConfig, name: string): Promise<CheckResult> {
		const dotfilesDir = getDotfilesDir();
		const sourcePath = path.join(dotfilesDir, config.source);
		const destPath = expandPath(config.destination);

		// Check if source exists
		if (!fs.existsSync(sourcePath)) {
			return {
				status: "error",
				message: `Source not found: ${config.source}`,
			};
		}

		// Check if destination exists
		if (!fs.existsSync(destPath)) {
			return {
				status: "not_installed",
				message: `Symlink missing: ${config.destination}`,
			};
		}

		// Check if it's a symlink pointing to the right place
		try {
			const stats = fs.lstatSync(destPath);
			if (!stats.isSymbolicLink()) {
				return {
					status: "modified",
					message: `Not a symlink: ${config.destination}`,
				};
			}

			if (isSymlinkTo(destPath, sourcePath)) {
				return { status: "installed", message: "Symlink correct" };
			}

			const currentTarget = fs.readlinkSync(destPath);
			return {
				status: "modified",
				message: `Points to: ${currentTarget}`,
			};
		} catch (error) {
			return {
				status: "error",
				message: `Error checking symlink: ${error}`,
			};
		}
	},

	async installSymlink(
		config: SymlinkConfig,
		name: string,
		dryRun = false,
	): Promise<boolean> {
		const dotfilesDir = getDotfilesDir();
		const sourcePath = path.join(dotfilesDir, config.source);
		const destPath = expandPath(config.destination);

		// Check if source exists
		if (!fs.existsSync(sourcePath)) {
			await appendLog(`Symlink source not found for ${name}: ${sourcePath}`);
			return false;
		}

		if (dryRun) {
			await appendLog(`[DRY-RUN] Would create symlink: ${destPath} -> ${sourcePath}`);
			return true;
		}

		try {
			// Create parent directories if needed
			await ensureDir(path.dirname(destPath));

			// Handle existing file/symlink at destination
			if (fs.existsSync(destPath) || fs.lstatSync(destPath).isSymbolicLink()) {
				const stats = fs.lstatSync(destPath);

				if (stats.isSymbolicLink()) {
					// Remove existing symlink
					fs.unlinkSync(destPath);
					await appendLog(`Removed existing symlink: ${destPath}`);
				} else {
					// Backup existing file/directory
					const backupPath = await backupFile(destPath);
					if (backupPath) {
						await appendLog(`Backed up existing file to: ${backupPath}`);
					}
				}
			}

			// Create symlink
			fs.symlinkSync(sourcePath, destPath);
			await appendLog(`Created symlink: ${destPath} -> ${sourcePath}`);
			return true;
		} catch (error) {
			// Handle case where lstatSync fails because path doesn't exist
			try {
				await ensureDir(path.dirname(destPath));
				fs.symlinkSync(sourcePath, destPath);
				await appendLog(`Created symlink: ${destPath} -> ${sourcePath}`);
				return true;
			} catch (innerError) {
				await appendLog(`Failed to create symlink for ${name}: ${innerError}`);
				return false;
			}
		}
	},

	async uninstallSymlink(
		config: SymlinkConfig,
		name: string,
		dryRun = false,
	): Promise<boolean> {
		const dotfilesDir = getDotfilesDir();
		const sourcePath = path.join(dotfilesDir, config.source);
		const destPath = expandPath(config.destination);

		if (!fs.existsSync(destPath)) {
			// Already removed
			return true;
		}

		try {
			const stats = fs.lstatSync(destPath);

			if (!stats.isSymbolicLink()) {
				await appendLog(`Not removing ${destPath}: not a symlink`);
				return true;
			}

			// Only remove if it points to our dotfiles
			if (!isSymlinkTo(destPath, sourcePath)) {
				await appendLog(`Not removing ${destPath}: points elsewhere`);
				return true;
			}

			if (dryRun) {
				await appendLog(`[DRY-RUN] Would remove symlink: ${destPath}`);
				return true;
			}

			fs.unlinkSync(destPath);
			await appendLog(`Removed symlink: ${destPath}`);
			return true;
		} catch (error) {
			await appendLog(`Failed to remove symlink for ${name}: ${error}`);
			return false;
		}
	},
};
