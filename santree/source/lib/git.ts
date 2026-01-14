import { execSync, exec } from "child_process";
import { promisify } from "util";
import * as path from "path";
import * as fs from "fs";

const execAsync = promisify(exec);

export interface Worktree {
	path: string;
	branch: string;
	commit: string;
	isBare: boolean;
}

export function findRepoRoot(): string | null {
	try {
		return execSync("git rev-parse --show-toplevel", {
			encoding: "utf-8",
		}).trim();
	} catch {
		return null;
	}
}

export function findMainRepoRoot(): string | null {
	try {
		const gitCommonDir = execSync("git rev-parse --git-common-dir", {
			encoding: "utf-8",
		}).trim();
		return path.dirname(path.resolve(gitCommonDir));
	} catch {
		return null;
	}
}

export function isInWorktree(): boolean {
	try {
		const gitDir = execSync("git rev-parse --git-dir", {
			encoding: "utf-8",
		}).trim();
		const gitCommonDir = execSync("git rev-parse --git-common-dir", {
			encoding: "utf-8",
		}).trim();
		// If they differ, we're in a worktree
		return path.resolve(gitDir) !== path.resolve(gitCommonDir);
	} catch {
		return false;
	}
}

export function isWorktreePath(wtPath: string): boolean {
	try {
		const gitDir = execSync("git rev-parse --git-dir", {
			encoding: "utf-8",
			cwd: wtPath,
		}).trim();
		const gitCommonDir = execSync("git rev-parse --git-common-dir", {
			encoding: "utf-8",
			cwd: wtPath,
		}).trim();
		// If they differ, it's a worktree (not the main repo)
		return path.resolve(wtPath, gitDir) !== path.resolve(wtPath, gitCommonDir);
	} catch {
		return false;
	}
}

export function getCurrentBranch(): string | null {
	try {
		return execSync("git rev-parse --abbrev-ref HEAD", {
			encoding: "utf-8",
		}).trim();
	} catch {
		return null;
	}
}

export function getDefaultBranch(): string {
	try {
		const ref = execSync("git symbolic-ref refs/remotes/origin/HEAD", {
			encoding: "utf-8",
		}).trim();
		return ref.replace("refs/remotes/origin/", "");
	} catch {
		// Fall back to checking if main/master exists
		for (const branch of ["main", "master"]) {
			try {
				execSync(`git rev-parse --verify refs/heads/${branch}`, {
					stdio: "ignore",
				});
				return branch;
			} catch {
				continue;
			}
		}
		return "main";
	}
}

export function listWorktrees(): Worktree[] {
	try {
		const output = execSync("git worktree list --porcelain", {
			encoding: "utf-8",
		});

		const worktrees: Worktree[] = [];
		let current: Partial<Worktree> = {};

		for (const line of output.split("\n")) {
			if (line.startsWith("worktree ")) {
				current.path = line.replace("worktree ", "");
			} else if (line.startsWith("HEAD ")) {
				current.commit = line.replace("HEAD ", "").slice(0, 8);
			} else if (line.startsWith("branch ")) {
				current.branch = line.replace("branch refs/heads/", "");
			} else if (line === "bare") {
				current.isBare = true;
			} else if (line === "" && current.path) {
				worktrees.push(current as Worktree);
				current = {};
			}
		}

		if (current.path) {
			worktrees.push(current as Worktree);
		}

		return worktrees;
	} catch {
		return [];
	}
}

export function getSantreeDir(repoRoot: string): string {
	return path.join(repoRoot, ".santree");
}

export function getWorktreesDir(repoRoot: string): string {
	return path.join(getSantreeDir(repoRoot), "worktrees");
}

export async function createWorktree(
	branchName: string,
	baseBranch: string,
	repoRoot: string,
): Promise<{ success: boolean; path?: string; error?: string }> {
	const dirName = branchName.replace(/\//g, "__");
	const worktreesDir = getWorktreesDir(repoRoot);
	const worktreePath = path.join(worktreesDir, dirName);

	if (fs.existsSync(worktreePath)) {
		return {
			success: false,
			error: `Worktree already exists at ${worktreePath}`,
		};
	}

	// Ensure worktrees directory exists
	fs.mkdirSync(worktreesDir, { recursive: true });

	// Check if branch exists
	let branchExists = false;
	try {
		execSync(`git rev-parse --verify refs/heads/${branchName}`, {
			cwd: repoRoot,
			stdio: "ignore",
		});
		branchExists = true;
	} catch {
		branchExists = false;
	}

	try {
		if (branchExists) {
			await execAsync(`git worktree add "${worktreePath}" "${branchName}"`, {
				cwd: repoRoot,
			});
		} else {
			await execAsync(
				`git worktree add -b "${branchName}" "${worktreePath}" "${baseBranch}"`,
				{ cwd: repoRoot },
			);
		}

		// Save metadata
		const metadata = {
			branch_name: branchName,
			base_branch: baseBranch,
			created_at: new Date().toISOString(),
		};
		fs.writeFileSync(
			path.join(worktreePath, ".santree_metadata.json"),
			JSON.stringify(metadata, null, 2),
		);

		return { success: true, path: worktreePath };
	} catch (e) {
		return {
			success: false,
			error: e instanceof Error ? e.message : "Unknown error",
		};
	}
}

export async function removeWorktree(
	branchName: string,
	repoRoot: string,
	force = false,
): Promise<{ success: boolean; error?: string }> {
	// Find the worktree by branch name using git's worktree tracking
	const worktreePath = getWorktreePath(branchName);

	if (!worktreePath) {
		return { success: false, error: `Worktree not found: ${branchName}` };
	}

	try {
		const forceFlag = force ? "--force" : "";
		await execAsync(`git worktree remove ${forceFlag} "${worktreePath}"`, {
			cwd: repoRoot,
		});

		// Clean up any remaining files (untracked files, node_modules, etc.)
		// git worktree remove doesn't delete untracked files
		if (fs.existsSync(worktreePath)) {
			// Fix permissions first (node_modules often has restricted perms)
			try {
				execSync(`chmod -R u+w "${worktreePath}"`, { stdio: "ignore" });
			} catch {
				// Ignore chmod errors
			}
			fs.rmSync(worktreePath, { recursive: true, force: true });
		}

		// Also delete the branch
		const deleteFlag = force ? "-D" : "-d";
		try {
			await execAsync(`git branch ${deleteFlag} "${branchName}"`, {
				cwd: repoRoot,
			});
		} catch {
			// Branch deletion failed, but worktree was removed
		}

		return { success: true };
	} catch (e) {
		return {
			success: false,
			error: e instanceof Error ? e.message : "Unknown error",
		};
	}
}

export function extractTicketId(branch: string): string | null {
	const match = branch.match(/([a-zA-Z]+)-(\d+)/);
	if (match) {
		return `${match[1]!.toUpperCase()}-${match[2]}`;
	}
	return null;
}

export function getWorktreePath(branchName: string): string | null {
	const worktrees = listWorktrees();
	const wt = worktrees.find((w) => w.branch === branchName);
	return wt?.path ?? null;
}

export function getWorktreeMetadata(
	worktreePath: string,
): { branch_name?: string; base_branch?: string; created_at?: string } | null {
	const metadataPath = path.join(worktreePath, ".santree_metadata.json");
	if (!fs.existsSync(metadataPath)) {
		return null;
	}
	try {
		return JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
	} catch {
		return null;
	}
}

export function hasUncommittedChanges(): boolean {
	try {
		const output = execSync("git status --porcelain", { encoding: "utf-8" });
		return Boolean(output.trim());
	} catch {
		return false;
	}
}

export function hasStagedChanges(): boolean {
	try {
		execSync("git diff --cached --quiet", { stdio: "ignore" });
		return false;
	} catch {
		return true;
	}
}

export function hasUnstagedChanges(): boolean {
	try {
		// Check for modified files
		try {
			execSync("git diff --quiet", { stdio: "ignore" });
		} catch {
			return true;
		}
		// Check for untracked files
		const output = execSync("git ls-files --others --exclude-standard", {
			encoding: "utf-8",
		});
		return Boolean(output.trim());
	} catch {
		return false;
	}
}

export function getGitStatus(): string {
	try {
		return execSync("git status --short", { encoding: "utf-8" }).trim();
	} catch {
		return "";
	}
}

export function getStagedDiffStat(): string {
	try {
		return execSync("git diff --cached --stat", { encoding: "utf-8" }).trim();
	} catch {
		return "";
	}
}

export function getCommitsBehind(baseBranch: string): number {
	try {
		const output = execSync(`git rev-list --count HEAD..origin/${baseBranch}`, {
			encoding: "utf-8",
		});
		return parseInt(output.trim(), 10) || 0;
	} catch {
		return 0;
	}
}

export function getCommitsAhead(baseBranch: string): number {
	try {
		const output = execSync(`git rev-list --count ${baseBranch}..HEAD`, {
			encoding: "utf-8",
		});
		return parseInt(output.trim(), 10) || 0;
	} catch {
		return 0;
	}
}

export function remoteBranchExists(branchName: string): boolean {
	try {
		const output = execSync(`git ls-remote --heads origin ${branchName}`, {
			encoding: "utf-8",
		});
		return output.includes(branchName);
	} catch {
		return false;
	}
}

export function getUnpushedCommits(branchName: string): number {
	try {
		// Check if remote tracking branch exists
		try {
			execSync(`git rev-parse --verify origin/${branchName}`, {
				stdio: "ignore",
			});
		} catch {
			// No remote branch, count all local commits
			const output = execSync("git rev-list --count HEAD", {
				encoding: "utf-8",
			});
			return parseInt(output.trim(), 10) || 0;
		}

		// Count commits ahead of remote
		const output = execSync(`git rev-list --count origin/${branchName}..HEAD`, {
			encoding: "utf-8",
		});
		return parseInt(output.trim(), 10) || 0;
	} catch {
		return 0;
	}
}

export function pullLatest(
	baseBranch: string,
	repoRoot: string,
): { success: boolean; message: string } {
	try {
		// Fetch from origin
		execSync("git fetch origin", { cwd: repoRoot, stdio: "ignore" });

		// Update the base branch
		execSync(`git checkout ${baseBranch}`, { cwd: repoRoot, stdio: "ignore" });
		execSync(`git pull origin ${baseBranch}`, {
			cwd: repoRoot,
			stdio: "ignore",
		});

		return { success: true, message: "Fetched latest changes" };
	} catch (e) {
		return {
			success: false,
			message: e instanceof Error ? e.message : "Failed to pull latest",
		};
	}
}

export function hasInitScript(repoRoot: string): boolean {
	const initScript = path.join(getSantreeDir(repoRoot), "init.sh");
	return fs.existsSync(initScript);
}

export function getInitScriptPath(repoRoot: string): string {
	return path.join(getSantreeDir(repoRoot), "init.sh");
}

export function getLatestCommitMessage(): string | null {
	try {
		return execSync("git log -1 --format=%s", {
			encoding: "utf-8",
		}).trim();
	} catch {
		return null;
	}
}
