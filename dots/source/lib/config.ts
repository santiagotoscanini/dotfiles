import * as fs from "fs";
import * as path from "path";
import type {
	ConfigFile,
	Package,
	PreInstall,
	Profile,
	ResolvedProfile,
} from "./types.js";

// Path to the packages.json file (source file for persistence)
const DOTFILES_DIR = process.env.DOTFILES_DIR || path.join(import.meta.dirname, "..");
const CONFIG_PATH = path.join(DOTFILES_DIR, "dots", "source", "packages.json");

let cachedConfig: ConfigFile | null = null;

/**
 * Load the configuration file
 */
export function loadConfig(): ConfigFile {
	if (cachedConfig) {
		return cachedConfig;
	}

	if (!fs.existsSync(CONFIG_PATH)) {
		throw new Error(`Config file not found: ${CONFIG_PATH}`);
	}

	const content = fs.readFileSync(CONFIG_PATH, "utf-8");
	cachedConfig = JSON.parse(content) as ConfigFile;
	return cachedConfig;
}

/**
 * Get config file path
 */
export function getConfigPath(): string {
	return CONFIG_PATH;
}

/**
 * Save configuration to file
 */
export function saveConfig(config: ConfigFile): void {
	fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n");
	cachedConfig = config;
}

/**
 * Clear cached config (useful after modifications)
 */
export function clearConfigCache(): void {
	cachedConfig = null;
}

/**
 * Get a package by name
 */
export function getPackage(name: string): Package | undefined {
	const config = loadConfig();
	const packages = config.packages as Record<string, Package> | undefined;
	return packages?.[name];
}

/**
 * Get a pre-install task by name
 */
export function getPreInstall(name: string): PreInstall | undefined {
	const config = loadConfig();
	const preInstall = config["pre-install"] as Record<string, PreInstall> | undefined;
	return preInstall?.[name];
}

/**
 * Get a profile by name
 */
export function getProfile(name: string): Profile | undefined {
	const config = loadConfig();
	const profiles = config.profiles as Record<string, Profile> | undefined;
	return profiles?.[name];
}

/**
 * Get all profile names
 */
export function getProfileNames(): string[] {
	const config = loadConfig();
	return Object.keys(config.profiles || {});
}

/**
 * Get all package names
 */
export function getPackageNames(): string[] {
	const config = loadConfig();
	return Object.keys(config.packages || {});
}

/**
 * Get all pre-install task names
 */
export function getPreInstallNames(): string[] {
	const config = loadConfig();
	return Object.keys(config["pre-install"] || {});
}

/**
 * Resolve a profile with inheritance
 * Returns all packages and pre-install tasks including from base profiles
 */
export function resolveProfile(profileName: string): ResolvedProfile {
	const config = loadConfig();
	const profiles = config.profiles as Record<string, Profile> | undefined;
	const profile = profiles?.[profileName];

	if (!profile) {
		const available = getProfileNames().join(", ");
		throw new Error(
			`Profile '${profileName}' not found. Available profiles: ${available}`,
		);
	}

	const visited = new Set<string>();
	const packages: string[] = [];
	const preInstall: string[] = [];

	function resolveRecursive(name: string): void {
		// Prevent circular references
		if (visited.has(name)) {
			return;
		}
		visited.add(name);

		const p = profiles?.[name];
		if (!p) {
			return;
		}

		// Resolve base profiles first
		if (p.base) {
			const bases = Array.isArray(p.base) ? p.base : [p.base];
			for (const baseName of bases) {
				// Remove optional @ prefix
				const cleanBase = baseName.replace(/^@/, "");
				resolveRecursive(cleanBase);
			}
		}

		// Add current profile's items (avoiding duplicates)
		if (p.packages) {
			for (const pkg of p.packages) {
				if (!packages.includes(pkg)) {
					packages.push(pkg);
				}
			}
		}

		if (p["pre-install"]) {
			for (const task of p["pre-install"]) {
				if (!preInstall.includes(task)) {
					preInstall.push(task);
				}
			}
		}
	}

	resolveRecursive(profileName);

	return { packages, preInstall };
}

/**
 * Get all packages tracked in any profile
 */
export function getTrackedPackages(): Set<string> {
	const config = loadConfig();
	const tracked = new Set<string>();

	for (const profileName of Object.keys(config.profiles || {})) {
		const resolved = resolveProfile(profileName);
		for (const pkg of resolved.packages) {
			tracked.add(pkg);
		}
	}

	return tracked;
}

/**
 * Add a package to the config
 */
export function addPackage(name: string, pkg: Package): void {
	const config = loadConfig();
	config.packages = config.packages || {};
	config.packages[name] = pkg;
	saveConfig(config);
}

/**
 * Remove a package from the config
 */
export function removePackage(name: string): boolean {
	const config = loadConfig();
	const packages = config.packages as Record<string, Package> | undefined;
	if (!packages?.[name]) {
		return false;
	}

	delete packages[name];
	config.packages = packages;

	// Also remove from all profiles
	const profiles = config.profiles as Record<string, Profile> | undefined;
	if (profiles) {
		for (const profile of Object.values(profiles)) {
			if (profile.packages) {
				profile.packages = profile.packages.filter((p: string) => p !== name);
			}
		}
	}

	saveConfig(config);
	return true;
}

/**
 * Add a package to a profile
 */
export function addPackageToProfile(
	packageName: string,
	profileName: string,
): boolean {
	const config = loadConfig();
	const profiles = config.profiles as Record<string, Profile> | undefined;
	const profile = profiles?.[profileName];

	if (!profile) {
		return false;
	}

	profile.packages = profile.packages || [];
	if (!profile.packages.includes(packageName)) {
		profile.packages.push(packageName);
		saveConfig(config);
	}

	return true;
}

/**
 * Remove a package from a profile
 */
export function removePackageFromProfile(
	packageName: string,
	profileName: string,
): boolean {
	const config = loadConfig();
	const profiles = config.profiles as Record<string, Profile> | undefined;
	const profile = profiles?.[profileName];

	if (!profile?.packages) {
		return false;
	}

	const index = profile.packages.indexOf(packageName);
	if (index === -1) {
		return false;
	}

	profile.packages.splice(index, 1);
	saveConfig(config);
	return true;
}
