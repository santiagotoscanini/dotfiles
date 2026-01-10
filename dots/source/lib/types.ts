import { z } from "zod";

// Status types for handlers
export type Status = "installed" | "not_installed" | "modified" | "error";

export interface CheckResult {
	status: Status;
	message: string;
}

// Handler interface
export interface Handler {
	check(config: MacOSConfig, name: string): Promise<CheckResult>;
	install(
		config: MacOSConfig,
		name: string,
		dryRun?: boolean,
	): Promise<boolean>;
	uninstall(
		config: MacOSConfig,
		name: string,
		dryRun?: boolean,
	): Promise<boolean>;
}

// Symlink configuration
export const SymlinkConfigSchema = z.object({
	source: z.string(),
	destination: z.string(),
});

export type SymlinkConfig = z.infer<typeof SymlinkConfigSchema>;

// Brew handler config
export const BrewConfigSchema = z.object({
	brew: z.string(),
	cask: z.boolean().optional(),
	tap: z.string().optional(),
	options: z.array(z.string()).optional(),
	post_install: z.string().optional(),
});

// MAS handler config
export const MasConfigSchema = z.object({
	mas: z.number(),
});

// NPM handler config
export const NpmConfigSchema = z.object({
	npm: z.string(),
	options: z.array(z.string()).optional(),
});

// Script handler config
export const ScriptConfigSchema = z.object({
	check: z.string().optional(),
	install: z.string().optional(),
	command: z.string().optional(),
	run: z.string().optional(),
	post_install: z.string().optional(),
	shell: z.string().optional(),
	env: z.record(z.string(), z.string()).optional(),
	working_dir: z.string().optional(),
});

// Directory handler config
export const DirectoryConfigSchema = z.object({
	paths: z.string().or(z.array(z.string())).optional(),
	path: z.string().optional(),
	permissions: z.string().optional(),
	mode: z.string().optional(),
	parents: z.boolean().optional(),
});

// Defaults handler config
export const DefaultsConfigSchema = z.object({
	domain: z.string(),
	key: z.string(),
	type: z.enum(["bool", "string", "int", "float", "dict", "array"]).optional(),
	value: z
		.boolean()
		.or(z.string())
		.or(z.number())
		.or(z.record(z.string(), z.unknown()))
		.or(z.array(z.unknown())),
});

// Union of all macos config types
export const MacOSConfigSchema = BrewConfigSchema.or(MasConfigSchema)
	.or(NpmConfigSchema)
	.or(ScriptConfigSchema.merge(DirectoryConfigSchema))
	.or(DefaultsConfigSchema);

export type MacOSConfig = z.infer<typeof MacOSConfigSchema>;
export type BrewConfig = z.infer<typeof BrewConfigSchema>;
export type MasConfig = z.infer<typeof MasConfigSchema>;
export type NpmConfig = z.infer<typeof NpmConfigSchema>;
export type ScriptConfig = z.infer<typeof ScriptConfigSchema>;
export type DirectoryConfig = z.infer<typeof DirectoryConfigSchema>;
export type DefaultsConfig = z.infer<typeof DefaultsConfigSchema>;

// Package definition
export const PackageSchema = z.object({
	description: z.string().optional(),
	macos: MacOSConfigSchema.optional(),
	config: SymlinkConfigSchema.optional(),
});

export type Package = z.infer<typeof PackageSchema>;

// Pre-install task definition
export const PreInstallSchema = z.object({
	description: z.string().optional(),
	provider: z.enum(["script", "directory", "defaults"]).optional(),
	macos: MacOSConfigSchema.optional(),
	config: SymlinkConfigSchema.optional(),
});

export type PreInstall = z.infer<typeof PreInstallSchema>;

// Profile definition
export const ProfileSchema = z.object({
	base: z.string().or(z.array(z.string())).optional(),
	packages: z.array(z.string()).optional(),
	"pre-install": z.array(z.string()).optional(),
});

export type Profile = z.infer<typeof ProfileSchema>;

// Full config file schema
export const ConfigFileSchema = z.object({
	packages: z.record(z.string(), PackageSchema).optional(),
	"pre-install": z.record(z.string(), PreInstallSchema).optional(),
	profiles: z.record(z.string(), ProfileSchema).optional(),
	version: z.string().optional(),
});

export type ConfigFile = z.infer<typeof ConfigFileSchema>;

// Resolved profile with all items
export interface ResolvedProfile {
	packages: string[];
	preInstall: string[];
}

// Item status for UI display
export interface ItemStatus {
	name: string;
	description?: string;
	status: Status;
	message: string;
	type: "package" | "pre-install" | "symlink";
}

// Progress state for install/uninstall
export type ProgressState = "pending" | "in_progress" | "done" | "error";

export interface ProgressItem {
	name: string;
	description?: string;
	state: ProgressState;
	message?: string;
}

// Handler type detection helpers
export function isBrew(config: MacOSConfig): config is BrewConfig {
	return "brew" in config;
}

export function isMas(config: MacOSConfig): config is MasConfig {
	return "mas" in config;
}

export function isNpm(config: MacOSConfig): config is NpmConfig {
	return "npm" in config;
}

export function isDefaults(config: MacOSConfig): config is DefaultsConfig {
	return "domain" in config && "key" in config;
}

export function isDirectory(config: MacOSConfig): config is DirectoryConfig {
	return "paths" in config || "path" in config;
}

export function isScript(config: MacOSConfig): config is ScriptConfig {
	return "check" in config || "install" in config || "command" in config;
}
