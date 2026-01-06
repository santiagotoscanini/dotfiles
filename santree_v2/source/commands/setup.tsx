import { spawnSync } from "child_process";
import * as path from "path";
import * as fs from "fs";
import { findMainRepoRoot, getSantreeDir, isInWorktree } from "../lib/git.js";

// This command uses synchronous execution to avoid Ink re-render conflicts
// with stdio: "inherit"
export default function Setup() {
	// Find main repo root
	const mainRepo = findMainRepoRoot();
	if (!mainRepo) {
		console.error("✗ Not inside a git repository");
		process.exit(1);
	}

	// Get init script path
	const santreeDir = getSantreeDir(mainRepo);
	const initScript = path.join(santreeDir, "init.sh");

	// Check if init script exists
	if (!fs.existsSync(initScript)) {
		console.error(`✗ No init script found at ${initScript}`);
		process.exit(1);
	}

	// Check if executable
	try {
		fs.accessSync(initScript, fs.constants.X_OK);
	} catch {
		console.error(`✗ Init script is not executable: ${initScript}`);
		console.error(`  Run: chmod +x ${initScript}`);
		process.exit(1);
	}

	// Check we're in a worktree (not the main repo)
	const cwd = process.cwd();
	if (!isInWorktree()) {
		console.error("✗ Not inside a worktree (you are in the main repository)");
		process.exit(1);
	}

	// Print header
	console.log("\n⚙️  Setup\n");
	console.log(`  worktree: ${cwd}`);
	console.log(`  script:   ${initScript}\n`);
	console.log("Running init script...\n");

	// Run init script synchronously
	const result = spawnSync(initScript, [], {
		cwd,
		stdio: "inherit",
		env: {
			...process.env,
			SANTREE_WORKTREE_PATH: cwd,
			SANTREE_REPO_ROOT: mainRepo,
		},
	});

	if (result.error) {
		console.error(`\n✗ Failed to run init script: ${result.error.message}`);
		process.exit(1);
	}

	if (result.status === 0) {
		console.log("\n✓ Init script completed successfully");
	} else {
		console.error(`\n✗ Init script failed (exit code ${result.status})`);
		process.exit(result.status ?? 1);
	}

	return null;
}
