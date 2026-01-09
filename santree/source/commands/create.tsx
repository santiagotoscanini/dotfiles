import { useEffect, useState } from "react";
import { Text, Box } from "ink";
import Spinner from "ink-spinner";
import { z } from "zod";
import { spawn } from "child_process";
import * as fs from "fs";
import {
	createWorktree,
	findMainRepoRoot,
	getDefaultBranch,
	pullLatest,
	hasInitScript,
	getInitScriptPath,
	extractTicketId,
} from "../lib/git.js";
import { execSync } from "child_process";

export const options = z.object({
	base: z.string().optional().describe("Base branch to create from"),
	work: z.boolean().optional().describe("Launch Claude after creating"),
	plan: z.boolean().optional().describe("With --work, only plan"),
	"no-pull": z.boolean().optional().describe("Skip pulling latest changes"),
	tmux: z.boolean().optional().describe("Create a new tmux window"),
	name: z.string().optional().describe("Custom tmux window name"),
});

export const args = z.tuple([z.string().optional().describe("Branch name")]);

type Props = {
	options: z.infer<typeof options>;
	args: z.infer<typeof args>;
};

type Status =
	| "idle"
	| "pulling"
	| "creating"
	| "init-script"
	| "tmux"
	| "done"
	| "error";

function isInTmux(): boolean {
	return !!process.env.TMUX;
}

function createTmuxWindow(name: string, path: string, runCommand?: string): boolean {
	try {
		execSync(`tmux new-window -n "${name}" -c "${path}"`, { stdio: "ignore" });
		// If a command is provided, send it to the new window
		if (runCommand) {
			execSync(`tmux send-keys -t "${name}" "${runCommand}" Enter`, { stdio: "ignore" });
		}
		return true;
	} catch {
		return false;
	}
}

function getWindowName(branchName: string, customName?: string): string {
	if (customName) return customName;

	// Try to extract ticket ID (e.g., "TEAM-123")
	const ticketId = extractTicketId(branchName);
	if (ticketId) return ticketId;

	// Fallback to last part of branch name
	const parts = branchName.split("/");
	return parts[parts.length - 1] ?? branchName;
}

export default function Create({ options, args }: Props) {
	const [branchName] = args;
	const [status, setStatus] = useState<Status>("idle");
	const [message, setMessage] = useState("");
	const [worktreePath, setWorktreePath] = useState("");
	const [baseBranch, setBaseBranch] = useState<string | null>(null);
	const [tmuxWindowName, setTmuxWindowName] = useState<string | null>(null);

	function finalize(path: string, branch: string) {
		// Handle tmux window creation
		if (options.tmux) {
			if (!isInTmux()) {
				setMessage("Worktree created, but not in tmux session");
				setStatus("done");
				console.log(`SANTREE_CD:${path}`);
				return;
			}

			setStatus("tmux");
			setMessage("Creating tmux window...");

			const windowName = getWindowName(branch, options.name);
			setTmuxWindowName(windowName);

			// Build command to run in new window (if --work is set)
			let runCommand: string | undefined;
			if (options.work) {
				runCommand = options.plan ? "st work --plan" : "st work";
			}

			if (!createTmuxWindow(windowName, path, runCommand)) {
				setMessage("Worktree created, but failed to create tmux window");
				setStatus("done");
				console.log(`SANTREE_CD:${path}`);
				return;
			}

			setStatus("done");
			const workInfo = options.work ? (options.plan ? " + Claude (plan)" : " + Claude") : "";
			setMessage(`Worktree and tmux window created!${workInfo}`);
			// Don't output SANTREE_CD when tmux window is created - user is already in new window
			return;
		}

		setStatus("done");
		setMessage("Worktree created successfully!");
		console.log(`SANTREE_CD:${path}`);

		if (options.work) {
			const mode = options.plan ? "plan" : "implement";
			console.log(`SANTREE_WORK:${mode}`);
		}
	}

	useEffect(() => {
		async function run() {
			// Small delay to allow spinner to render
			await new Promise((r) => setTimeout(r, 100));

			if (!branchName) {
				setStatus("error");
				setMessage("Branch name is required");
				return;
			}

			const branch = branchName; // Capture for closures

			const mainRepo = findMainRepoRoot();
			if (!mainRepo) {
				setStatus("error");
				setMessage("Not inside a git repository");
				return;
			}

			const base = options.base ?? getDefaultBranch();
			setBaseBranch(base);

			// Pull latest unless --no-pull
			if (!options["no-pull"]) {
				setStatus("pulling");
				setMessage(`Fetching latest changes for ${base}...`);

				const pullResult = pullLatest(base, mainRepo);
				if (!pullResult.success) {
					// Just warn, continue anyway
					setMessage(`Warning: ${pullResult.message}`);
				}
			}

			setStatus("creating");
			setMessage(`Creating worktree from ${base}...`);

			const result = await createWorktree(branch, base, mainRepo);

			if (result.success && result.path) {
				setWorktreePath(result.path);

				// Run init script if it exists
				if (hasInitScript(mainRepo)) {
					setStatus("init-script");
					setMessage("Running init script...");

					const initScript = getInitScriptPath(mainRepo);

					// Check if executable
					try {
						fs.accessSync(initScript, fs.constants.X_OK);
					} catch {
						setMessage("Warning: Init script exists but is not executable");
						finalize(result.path!, branch);
						return;
					}

					const child = spawn(initScript, [], {
						cwd: result.path,
						stdio: "pipe",
						env: {
							...process.env,
							SANTREE_WORKTREE_PATH: result.path,
							SANTREE_REPO_ROOT: mainRepo,
						},
					});

					// Capture output but don't display (to avoid conflicting with Ink)
					child.stdout?.on("data", () => {});
					child.stderr?.on("data", () => {});

					child.on("error", (err) => {
						setMessage(`Warning: Init script failed: ${err.message}`);
					});

					child.on("close", (code) => {
						if (code !== 0) {
							setMessage(`Warning: Init script exited with code ${code}`);
						}
						finalize(result.path!, branch);
					});
				} else {
					finalize(result.path!, branch);
				}
			} else {
				setStatus("error");
				setMessage(result.error ?? "Unknown error");
			}
		}

		run();
	}, [
		branchName,
		options.base,
		options.work,
		options.plan,
		options["no-pull"],
		options.tmux,
		options.name,
	]);

	const isLoading =
		status === "pulling" || status === "creating" || status === "init-script" || status === "tmux";

	return (
		<Box flexDirection="column" padding={1} width="100%">
			<Box marginBottom={1}>
				<Text bold color="cyan">
					🌱 Create Worktree
				</Text>
			</Box>

		{branchName && (
				<Box
					flexDirection="column"
					borderStyle="round"
					borderColor={
						status === "error" ? "red" : status === "done" ? "green" : "blue"
					}
					paddingX={1}
					width="100%"
				>
					<Box gap={1}>
						<Text dimColor>branch:</Text>
						<Text color="cyan" bold>
							{branchName}
						</Text>
					</Box>

					{baseBranch && (
						<Box gap={1}>
							<Text dimColor>base:</Text>
							<Text color="blue">{baseBranch}</Text>
						</Box>
					)}

					{options["no-pull"] && (
						<Box gap={1}>
							<Text dimColor>skip pull:</Text>
							<Text color="yellow">yes</Text>
						</Box>
					)}

					{options.work && (
						<Box gap={1}>
							<Text dimColor>after:</Text>
							<Text backgroundColor="magenta" color="white">
								{options.plan ? " plan " : " work "}
							</Text>
						</Box>
					)}

					{options.tmux && (
						<Box gap={1}>
							<Text dimColor>tmux:</Text>
							<Text backgroundColor="green" color="white">
								{` ${options.name || "auto"} `}
							</Text>
						</Box>
					)}
				</Box>
			)}

			<Box marginTop={1}>
				{isLoading && (
					<Box>
						<Text color="cyan">
							<Spinner type="dots" />
						</Text>
						<Text> {message}</Text>
					</Box>
				)}
				{status === "done" && (
					<Box flexDirection="column">
						<Text color="green" bold>
							✓ {message}
						</Text>
						<Text dimColor> {worktreePath}</Text>
						{tmuxWindowName && (
							<Text dimColor> tmux window: {tmuxWindowName}</Text>
						)}
					</Box>
				)}
				{status === "error" && (
					<Text color="red" bold>
						✗ {message}
					</Text>
				)}
			</Box>
		</Box>
	);
}
