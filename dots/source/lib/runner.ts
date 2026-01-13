import type { CheckResult, ItemStatus, ProgressItem, ResolvedProfile } from "./types.js";
import { getPackage, getPreInstall, resolveProfile } from "./config.js";
import { getPackageHandler, getPreInstallHandler, symlinkHandler } from "../handlers/index.js";
import { appendLog, initLog, finalizeLog } from "./shell.js";

export type ProgressCallback = (item: ProgressItem) => void;

// Number of packages to install concurrently
const PARALLEL_BATCH_SIZE = 5;

/**
 * Check status of all items in a profile
 */
export async function checkProfile(
	profileName: string,
): Promise<ItemStatus[]> {
	const profile = resolveProfile(profileName);
	const results: ItemStatus[] = [];

	// Check pre-install tasks
	for (const taskName of profile.preInstall) {
		const task = getPreInstall(taskName);
		if (!task?.macos) {
			results.push({
				name: taskName,
				description: task?.description,
				status: "error",
				message: "No macos config",
				type: "pre-install",
			});
			continue;
		}

		const handler = getPreInstallHandler(task);
		if (!handler) {
			results.push({
				name: taskName,
				description: task?.description,
				status: "error",
				message: "No handler found",
				type: "pre-install",
			});
			continue;
		}

		const result = await handler.check(task.macos, taskName);
		results.push({
			name: taskName,
			description: task?.description,
			...result,
			type: "pre-install",
		});

		// Check symlink if present
		if (task.config) {
			const symlinkResult = await symlinkHandler.checkSymlink(task.config, taskName);
			results.push({
				name: `${taskName} (symlink)`,
				description: `→ ${task.config.destination}`,
				...symlinkResult,
				type: "symlink",
			});
		}
	}

	// Check packages
	for (const pkgName of profile.packages) {
		const pkg = getPackage(pkgName);
		if (!pkg?.macos) {
			results.push({
				name: pkgName,
				description: pkg?.description,
				status: "error",
				message: "No macos config",
				type: "package",
			});
			continue;
		}

		const handler = getPackageHandler(pkg.macos);
		if (!handler) {
			results.push({
				name: pkgName,
				description: pkg?.description,
				status: "error",
				message: "No handler found",
				type: "package",
			});
			continue;
		}

		const result = await handler.check(pkg.macos, pkgName);
		results.push({
			name: pkgName,
			description: pkg?.description,
			...result,
			type: "package",
		});

		// Check symlink if present
		if (pkg.config) {
			const symlinkResult = await symlinkHandler.checkSymlink(pkg.config, pkgName);
			results.push({
				name: `${pkgName} (symlink)`,
				description: `→ ${pkg.config.destination}`,
				...symlinkResult,
				type: "symlink",
			});
		}
	}

	return results;
}

/**
 * Install a profile
 */
export async function installProfile(
	profileName: string,
	dryRun = false,
	onProgress?: ProgressCallback,
): Promise<boolean> {
	const profile = resolveProfile(profileName);

	await initLog(`install --profile ${profileName}${dryRun ? " --dry-run" : ""}`);

	let success = true;

	// Run pre-install tasks first
	await appendLog("=== Pre-install tasks ===");
	for (const taskName of profile.preInstall) {
		onProgress?.({ name: taskName, state: "in_progress", message: "Checking..." });

		const task = getPreInstall(taskName);
		if (!task?.macos) {
			onProgress?.({ name: taskName, state: "error", message: "No config" });
			continue;
		}

		const handler = getPreInstallHandler(task);
		if (!handler) {
			onProgress?.({ name: taskName, state: "error", message: "No handler" });
			continue;
		}

		// Check if already installed
		const checkResult = await handler.check(task.macos, taskName);
		if (checkResult.status === "installed") {
			onProgress?.({ name: taskName, state: "done", message: "Already installed" });
		} else if (checkResult.status === "error") {
			onProgress?.({ name: taskName, state: "error", message: checkResult.message });
		} else {
			// Install
			onProgress?.({ name: taskName, state: "in_progress", message: "Installing..." });
			const result = await handler.install(task.macos, taskName, dryRun);
			if (result) {
				onProgress?.({ name: taskName, state: "done", message: dryRun ? "Would install" : "Installed" });
			} else {
				onProgress?.({ name: taskName, state: "error", message: "Failed" });
				success = false;
			}
		}

		// Always try to create symlinks
		if (task.config) {
			const symlinkCheck = await symlinkHandler.checkSymlink(task.config, taskName);
			if (symlinkCheck.status !== "installed") {
				await symlinkHandler.installSymlink(task.config, taskName, dryRun);
			}
		}
	}

	// Install packages in parallel batches
	await appendLog("=== Packages ===");
	const sortedPackages = [...profile.packages].sort();

	// Process packages in batches for parallel installation
	for (let i = 0; i < sortedPackages.length; i += PARALLEL_BATCH_SIZE) {
		const batch = sortedPackages.slice(i, i + PARALLEL_BATCH_SIZE);

		const batchResults = await Promise.all(
			batch.map(async (pkgName) => {
				onProgress?.({ name: pkgName, state: "in_progress", message: "Checking..." });

				const pkg = getPackage(pkgName);
				if (!pkg?.macos) {
					onProgress?.({ name: pkgName, state: "error", message: "No config" });
					return true; // Continue, not a failure
				}

				const handler = getPackageHandler(pkg.macos);
				if (!handler) {
					onProgress?.({ name: pkgName, state: "error", message: "No handler" });
					return true; // Continue, not a failure
				}

				// Check if already installed
				const checkResult = await handler.check(pkg.macos, pkgName);
				if (checkResult.status === "installed") {
					onProgress?.({ name: pkgName, state: "done", message: "Already installed" });
				} else if (checkResult.status === "error") {
					onProgress?.({ name: pkgName, state: "error", message: checkResult.message });
				} else {
					// Install
					onProgress?.({ name: pkgName, state: "in_progress", message: "Installing..." });
					const result = await handler.install(pkg.macos, pkgName, dryRun);
					if (result) {
						onProgress?.({ name: pkgName, state: "done", message: dryRun ? "Would install" : "Installed" });
					} else {
						onProgress?.({ name: pkgName, state: "error", message: "Failed" });
						return false; // This is a failure
					}
				}

				// Create symlinks
				if (pkg.config) {
					const symlinkCheck = await symlinkHandler.checkSymlink(pkg.config, pkgName);
					if (symlinkCheck.status !== "installed") {
						await symlinkHandler.installSymlink(pkg.config, pkgName, dryRun);
					}
				}

				return true;
			})
		);

		// Check if any package in the batch failed
		if (batchResults.some((result) => !result)) {
			success = false;
		}
	}

	await finalizeLog(success);
	return success;
}

/**
 * Uninstall a profile
 */
export async function uninstallProfile(
	profileName: string,
	dryRun = false,
	onProgress?: ProgressCallback,
): Promise<boolean> {
	const profile = resolveProfile(profileName);

	await initLog(`uninstall --profile ${profileName}${dryRun ? " --dry-run" : ""}`);

	let success = true;

	// Uninstall packages in parallel batches (reverse alphabetical order)
	await appendLog("=== Uninstalling packages ===");
	const sortedPackages = [...profile.packages].sort().reverse();

	// Process packages in batches for parallel uninstallation
	for (let i = 0; i < sortedPackages.length; i += PARALLEL_BATCH_SIZE) {
		const batch = sortedPackages.slice(i, i + PARALLEL_BATCH_SIZE);

		const batchResults = await Promise.all(
			batch.map(async (pkgName) => {
				onProgress?.({ name: pkgName, state: "in_progress", message: "Checking..." });

				const pkg = getPackage(pkgName);
				if (!pkg?.macos) {
					onProgress?.({ name: pkgName, state: "done", message: "No config" });
					return true;
				}

				// Remove symlinks first
				if (pkg.config) {
					await symlinkHandler.uninstallSymlink(pkg.config, pkgName, dryRun);
				}

				const handler = getPackageHandler(pkg.macos);
				if (!handler) {
					onProgress?.({ name: pkgName, state: "done", message: "No handler" });
					return true;
				}

				// Check if installed
				const checkResult = await handler.check(pkg.macos, pkgName);
				if (checkResult.status === "not_installed") {
					onProgress?.({ name: pkgName, state: "done", message: "Not installed" });
					return true;
				}

				// Uninstall
				onProgress?.({ name: pkgName, state: "in_progress", message: "Uninstalling..." });
				const result = await handler.uninstall(pkg.macos, pkgName, dryRun);
				if (result) {
					onProgress?.({ name: pkgName, state: "done", message: dryRun ? "Would uninstall" : "Uninstalled" });
				} else {
					onProgress?.({ name: pkgName, state: "error", message: "Failed" });
					return false;
				}

				return true;
			})
		);

		// Check if any package in the batch failed
		if (batchResults.some((result) => !result)) {
			success = false;
		}
	}

	// Uninstall pre-install tasks (only defaults can be uninstalled)
	await appendLog("=== Removing pre-install settings ===");
	for (const taskName of profile.preInstall) {
		const task = getPreInstall(taskName);
		if (!task?.macos) continue;

		// Remove symlinks
		if (task.config) {
			await symlinkHandler.uninstallSymlink(task.config, taskName, dryRun);
		}

		// Only defaults can be uninstalled
		if (task.provider === "defaults") {
			onProgress?.({ name: taskName, state: "in_progress", message: "Removing..." });
			const handler = getPreInstallHandler(task);
			if (handler) {
				const result = await handler.uninstall(task.macos, taskName, dryRun);
				if (result) {
					onProgress?.({ name: taskName, state: "done", message: "Removed" });
				} else {
					onProgress?.({ name: taskName, state: "error", message: "Failed" });
				}
			}
		}
	}

	await finalizeLog(success);
	return success;
}

/**
 * Get check results in parallel for faster status display
 */
export async function checkProfileParallel(
	profileName: string,
): Promise<ItemStatus[]> {
	const profile = resolveProfile(profileName);
	const promises: Promise<ItemStatus[]>[] = [];

	// Check pre-install tasks in parallel
	for (const taskName of profile.preInstall) {
		promises.push(checkSingleItem(taskName, "pre-install"));
	}

	// Check packages in parallel
	for (const pkgName of profile.packages) {
		promises.push(checkSingleItem(pkgName, "package"));
	}

	const results = await Promise.all(promises);
	return results.flat();
}

/**
 * Install a single package by name
 */
export async function installPackage(
	pkgName: string,
	dryRun = false,
	onProgress?: ProgressCallback,
): Promise<boolean> {
	await initLog(`install-package ${pkgName}${dryRun ? " --dry-run" : ""}`);

	onProgress?.({ name: pkgName, state: "in_progress", message: "Checking..." });

	const pkg = getPackage(pkgName);
	if (!pkg?.macos) {
		onProgress?.({ name: pkgName, state: "error", message: "No config" });
		await finalizeLog(false);
		return false;
	}

	const handler = getPackageHandler(pkg.macos);
	if (!handler) {
		onProgress?.({ name: pkgName, state: "error", message: "No handler" });
		await finalizeLog(false);
		return false;
	}

	// Check if already installed
	const checkResult = await handler.check(pkg.macos, pkgName);
	if (checkResult.status === "installed") {
		onProgress?.({ name: pkgName, state: "done", message: "Already installed" });
		await finalizeLog(true);
		return true;
	} else if (checkResult.status === "error") {
		onProgress?.({ name: pkgName, state: "error", message: checkResult.message });
		await finalizeLog(false);
		return false;
	}

	// Install
	onProgress?.({ name: pkgName, state: "in_progress", message: "Installing..." });
	const result = await handler.install(pkg.macos, pkgName, dryRun);
	if (result) {
		onProgress?.({ name: pkgName, state: "done", message: dryRun ? "Would install" : "Installed" });
	} else {
		onProgress?.({ name: pkgName, state: "error", message: "Failed" });
		await finalizeLog(false);
		return false;
	}

	// Create symlinks if configured
	if (pkg.config) {
		const symlinkCheck = await symlinkHandler.checkSymlink(pkg.config, pkgName);
		if (symlinkCheck.status !== "installed") {
			await symlinkHandler.installSymlink(pkg.config, pkgName, dryRun);
		}
	}

	await finalizeLog(true);
	return true;
}

async function checkSingleItem(
	name: string,
	type: "package" | "pre-install",
): Promise<ItemStatus[]> {
	const results: ItemStatus[] = [];

	if (type === "package") {
		const pkg = getPackage(name);
		if (!pkg?.macos) {
			results.push({
				name,
				description: pkg?.description,
				status: "error",
				message: "No macos config",
				type: "package",
			});
			return results;
		}

		const handler = getPackageHandler(pkg.macos);
		if (!handler) {
			results.push({
				name,
				description: pkg?.description,
				status: "error",
				message: "No handler found",
				type: "package",
			});
			return results;
		}

		const result = await handler.check(pkg.macos, name);
		results.push({
			name,
			description: pkg?.description,
			...result,
			type: "package",
		});

		if (pkg.config) {
			const symlinkResult = await symlinkHandler.checkSymlink(pkg.config, name);
			results.push({
				name: `${name} (symlink)`,
				description: `→ ${pkg.config.destination}`,
				...symlinkResult,
				type: "symlink",
			});
		}
	} else {
		const task = getPreInstall(name);
		if (!task?.macos) {
			results.push({
				name,
				description: task?.description,
				status: "error",
				message: "No macos config",
				type: "pre-install",
			});
			return results;
		}

		const handler = getPreInstallHandler(task);
		if (!handler) {
			results.push({
				name,
				description: task?.description,
				status: "error",
				message: "No handler found",
				type: "pre-install",
			});
			return results;
		}

		const result = await handler.check(task.macos, name);
		results.push({
			name,
			description: task?.description,
			...result,
			type: "pre-install",
		});

		if (task.config) {
			const symlinkResult = await symlinkHandler.checkSymlink(task.config, name);
			results.push({
				name: `${name} (symlink)`,
				description: `→ ${task.config.destination}`,
				...symlinkResult,
				type: "symlink",
			});
		}
	}

	return results;
}
