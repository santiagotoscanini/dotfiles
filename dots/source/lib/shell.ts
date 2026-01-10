import { exec, execSync, spawn } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const execAsync = promisify(exec);

export interface ExecResult {
	success: boolean;
	stdout: string;
	stderr: string;
	code: number;
}

/**
 * Execute a command asynchronously and return the result
 */
export async function runCommand(
	command: string,
	options: {
		shell?: string;
		env?: Record<string, string>;
		cwd?: string;
		timeout?: number;
	} = {},
): Promise<ExecResult> {
	const shell = options.shell || "/bin/bash";
	const env = { ...process.env, ...options.env };

	try {
		const { stdout, stderr } = await execAsync(command, {
			shell,
			env,
			cwd: options.cwd,
			timeout: options.timeout,
			maxBuffer: 10 * 1024 * 1024, // 10MB buffer
		});

		return {
			success: true,
			stdout: stdout.trim(),
			stderr: stderr.trim(),
			code: 0,
		};
	} catch (error) {
		const e = error as {
			code?: number;
			stdout?: string;
			stderr?: string;
			message?: string;
		};
		return {
			success: false,
			stdout: e.stdout?.trim() || "",
			stderr: e.stderr?.trim() || e.message || "Unknown error",
			code: typeof e.code === "number" ? e.code : 1,
		};
	}
}

/**
 * Execute a command synchronously and return the result
 */
export function runCommandSync(
	command: string,
	options: {
		shell?: string;
		env?: Record<string, string>;
		cwd?: string;
	} = {},
): ExecResult {
	const shell = options.shell || "/bin/bash";
	const env = { ...process.env, ...options.env };

	try {
		const stdout = execSync(command, {
			shell,
			env,
			cwd: options.cwd,
			encoding: "utf-8",
			maxBuffer: 10 * 1024 * 1024,
		});

		return {
			success: true,
			stdout: stdout.trim(),
			stderr: "",
			code: 0,
		};
	} catch (error) {
		const e = error as {
			status?: number;
			stdout?: Buffer | string;
			stderr?: Buffer | string;
			message?: string;
		};
		return {
			success: false,
			stdout: e.stdout?.toString().trim() || "",
			stderr: e.stderr?.toString().trim() || e.message || "Unknown error",
			code: e.status || 1,
		};
	}
}

/**
 * Check if a command exists in PATH
 */
export async function commandExists(command: string): Promise<boolean> {
	const result = await runCommand(`command -v ${command}`);
	return result.success;
}

/**
 * Check if a command exists synchronously
 */
export function commandExistsSync(command: string): boolean {
	const result = runCommandSync(`command -v ${command}`);
	return result.success;
}

/**
 * Expand environment variables and ~ in a path
 */
export function expandPath(p: string): string {
	// Expand ~ to home directory
	if (p.startsWith("~")) {
		p = path.join(os.homedir(), p.slice(1));
	}

	// Expand environment variables ($VAR or ${VAR})
	p = p.replace(/\$\{?(\w+)\}?/g, (_, name) => {
		// Special handling for XDG_CONFIG_HOME
		if (name === "XDG_CONFIG_HOME") {
			return process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config");
		}
		return process.env[name] || "";
	});

	return path.resolve(p);
}

/**
 * Get the dotfiles directory path
 */
export function getDotfilesDir(): string {
	return (
		process.env.DOTFILES_DIR ||
		path.dirname(path.dirname(path.dirname(import.meta.dirname)))
	);
}

/**
 * Create a backup of a file with incrementing suffix
 */
export async function backupFile(filePath: string): Promise<string | null> {
	if (!fs.existsSync(filePath)) {
		return null;
	}

	let backupNum = 1;
	let backupPath: string;

	do {
		backupPath = `${filePath}.backup${backupNum}`;
		backupNum++;
	} while (fs.existsSync(backupPath));

	try {
		await fs.promises.rename(filePath, backupPath);
		return backupPath;
	} catch {
		return null;
	}
}

/**
 * Create parent directories for a path if they don't exist
 */
export async function ensureDir(dir: string): Promise<void> {
	await fs.promises.mkdir(dir, { recursive: true });
}

/**
 * Check if a path is a symlink pointing to a target
 */
export function isSymlinkTo(linkPath: string, targetPath: string): boolean {
	try {
		const stats = fs.lstatSync(linkPath);
		if (!stats.isSymbolicLink()) {
			return false;
		}

		const linkTarget = fs.readlinkSync(linkPath);
		const resolvedTarget = path.isAbsolute(linkTarget)
			? linkTarget
			: path.resolve(path.dirname(linkPath), linkTarget);

		return path.resolve(resolvedTarget) === path.resolve(targetPath);
	} catch {
		return false;
	}
}

/**
 * Run a command with real-time output streaming
 */
export function spawnCommand(
	command: string,
	args: string[],
	options: {
		cwd?: string;
		env?: Record<string, string>;
	} = {},
): Promise<ExecResult> {
	return new Promise((resolve) => {
		const child = spawn(command, args, {
			cwd: options.cwd,
			env: { ...process.env, ...options.env },
			stdio: "pipe",
		});

		let stdout = "";
		let stderr = "";

		child.stdout?.on("data", (data) => {
			stdout += data.toString();
		});

		child.stderr?.on("data", (data) => {
			stderr += data.toString();
		});

		child.on("close", (code) => {
			resolve({
				success: code === 0,
				stdout: stdout.trim(),
				stderr: stderr.trim(),
				code: code ?? 1,
			});
		});

		child.on("error", (err) => {
			resolve({
				success: false,
				stdout: "",
				stderr: err.message,
				code: 1,
			});
		});
	});
}

/**
 * Truncate a string to a maximum length
 */
export function truncate(str: string, maxLength: number): string {
	if (str.length <= maxLength) {
		return str;
	}
	return str.slice(0, maxLength - 3) + "...";
}

/**
 * Get current log file path
 */
export function getLogPath(): string {
	return path.join(getDotfilesDir(), ".dots-install.log");
}

/**
 * Append to log file
 */
export async function appendLog(message: string): Promise<void> {
	const logPath = getLogPath();
	const timestamp = new Date().toISOString();
	await fs.promises.appendFile(logPath, `[${timestamp}] ${message}\n`);
}

/**
 * Initialize log file with header
 */
export async function initLog(command: string): Promise<void> {
	const logPath = getLogPath();
	const timestamp = new Date().toISOString();
	const header = `
============================================================
Dots manager started at ${timestamp}
Command: dots ${command}
============================================================
`;
	await fs.promises.appendFile(logPath, header);
}

/**
 * Finalize log file with footer
 */
export async function finalizeLog(success: boolean): Promise<void> {
	const timestamp = new Date().toISOString();
	const status = success ? "SUCCESS" : "FAILED";
	const footer = `
Dots manager finished at ${timestamp} - ${status}
============================================================
`;
	await appendLog(footer);
}
