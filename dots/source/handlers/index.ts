import type { Handler, MacOSConfig, PreInstall } from "../lib/types.js";
import { isBrew, isMas, isNpm, isDefaults, isDirectory, isScript } from "../lib/types.js";
import { brewHandler } from "./brew.js";
import { symlinkHandler } from "./symlink.js";
import { defaultsHandler } from "./defaults.js";
import { scriptHandler } from "./script.js";
import { directoryHandler } from "./directory.js";
import { masHandler } from "./mas.js";
import { npmHandler } from "./npm.js";

export { brewHandler, getInstalledFormulas, getInstalledCasks } from "./brew.js";
export { symlinkHandler } from "./symlink.js";
export { defaultsHandler } from "./defaults.js";
export { scriptHandler } from "./script.js";
export { directoryHandler } from "./directory.js";
export { masHandler } from "./mas.js";
export { npmHandler } from "./npm.js";

/**
 * Get the appropriate handler for a package config
 */
export function getPackageHandler(config: MacOSConfig): Handler | null {
	if (isBrew(config)) {
		return brewHandler;
	}
	if (isMas(config)) {
		return masHandler;
	}
	if (isNpm(config)) {
		return npmHandler;
	}
	return null;
}

/**
 * Get the appropriate handler for a pre-install task
 */
export function getPreInstallHandler(preInstall: PreInstall): Handler | null {
	const { provider, macos } = preInstall;

	// Use explicit provider if specified
	if (provider) {
		switch (provider) {
			case "directory":
				return directoryHandler;
			case "defaults":
				return defaultsHandler;
			case "script":
				return scriptHandler;
		}
	}

	// Auto-detect based on config fields
	if (macos) {
		if (isDefaults(macos)) {
			return defaultsHandler;
		}
		if (isDirectory(macos)) {
			return directoryHandler;
		}
		if (isScript(macos)) {
			return scriptHandler;
		}
	}

	// Default to script handler
	return scriptHandler;
}

/**
 * Get handler name for display
 */
export function getHandlerName(config: MacOSConfig): string {
	if (isBrew(config)) {
		return config.cask ? "brew cask" : "brew";
	}
	if (isMas(config)) {
		return "mas";
	}
	if (isNpm(config)) {
		return "npm";
	}
	if (isDefaults(config)) {
		return "defaults";
	}
	if (isDirectory(config)) {
		return "directory";
	}
	if (isScript(config)) {
		return "script";
	}
	return "unknown";
}
