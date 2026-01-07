import { useEffect, useState } from "react";
import { Text, Box } from "ink";
import Spinner from "ink-spinner";
import { spawn } from "child_process";
import { z } from "zod";
import {
	findMainRepoRoot,
	findRepoRoot,
	getCurrentBranch,
	getDefaultBranch,
	getWorktreeMetadata,
	hasUncommittedChanges,
	getCommitsBehind,
	isInWorktree,
} from "../lib/git.js";

export const options = z.object({
	rebase: z.boolean().optional().describe("Use rebase instead of merge"),
});

type Props = {
	options: z.infer<typeof options>;
};

function runCommand(
	cmd: string,
	args: string[],
): Promise<{ code: number; output: string }> {
	return new Promise((resolve) => {
		const child = spawn(cmd, args, { stdio: "pipe" });
		let output = "";

		child.stdout?.on("data", (data) => {
			output += data.toString();
		});

		child.stderr?.on("data", (data) => {
			output += data.toString();
		});

		child.on("close", (code) => {
			resolve({ code: code ?? 1, output });
		});

		child.on("error", (err) => {
			resolve({ code: 1, output: err.message });
		});
	});
}

type Status = "init" | "fetching" | "syncing" | "done" | "up-to-date" | "error";

export default function Sync({ options }: Props) {
	const [status, setStatus] = useState<Status>("init");
	const [message, setMessage] = useState("");
	const [branch, setBranch] = useState<string | null>(null);
	const [baseBranch, setBaseBranch] = useState<string | null>(null);
	const [commitsBehind, setCommitsBehind] = useState(0);

	const usesRebase = options.rebase ?? false;

	useEffect(() => {
		async function run() {
			// Small delay to allow initial render with spinner
			await new Promise((r) => setTimeout(r, 100));

			// Find repos
			const mainRepo = findMainRepoRoot();
			const currentRepo = findRepoRoot();

			if (!mainRepo || !currentRepo) {
				setStatus("error");
				setMessage("Not inside a git repository");
				return;
			}

			if (!isInWorktree()) {
				setStatus("error");
				setMessage("Not inside a worktree (you are in the main repository)");
				return;
			}

			const branchName = getCurrentBranch();
			if (!branchName) {
				setStatus("error");
				setMessage("Could not determine current branch");
				return;
			}
			setBranch(branchName);

			const metadata = getWorktreeMetadata(currentRepo);
			const base = metadata?.base_branch ?? getDefaultBranch();
			setBaseBranch(base);

			if (hasUncommittedChanges()) {
				setStatus("error");
				setMessage(
					"You have uncommitted changes. Please commit or stash them before syncing.",
				);
				return;
			}

			// Fetch
			setStatus("fetching");
			const fetchResult = await runCommand("git", ["fetch", "origin"]);
			if (fetchResult.code !== 0) {
				setStatus("error");
				setMessage("Failed to fetch from remote");
				return;
			}

			// Check behind
			const behind = getCommitsBehind(base);
			setCommitsBehind(behind);

			if (behind === 0) {
				setStatus("up-to-date");
				setMessage(`Already up to date with origin/${base}`);
				return;
			}

			// Sync
			setStatus("syncing");
			const cmd = usesRebase ? "rebase" : "merge";
			const syncResult = await runCommand("git", [cmd, `origin/${base}`]);

			if (syncResult.code === 0) {
				setStatus("done");
				setMessage(`Successfully synced with origin/${base}`);
			} else {
				setStatus("error");
				setMessage(
					usesRebase
						? "Rebase failed - resolve conflicts and run: git rebase --continue"
						: "Merge failed - resolve conflicts and run: git commit",
				);
			}
		}

		run();
	}, [usesRebase]);

	const isLoading =
		status === "init" || status === "fetching" || status === "syncing";

	return (
		<Box flexDirection="column" padding={1} width="100%">
			<Box marginBottom={1}>
				<Text bold color="cyan">
					🔄 Sync
				</Text>
			</Box>

			<Box
				flexDirection="column"
				borderStyle="round"
				borderColor={
					status === "error"
						? "red"
						: status === "done" || status === "up-to-date"
							? "green"
							: "blue"
				}
				paddingX={1}
				width="100%"
			>
				{branch && (
					<Box gap={1}>
						<Text dimColor>branch:</Text>
						<Text color="cyan" bold>
							{branch}
						</Text>
					</Box>
				)}
				{baseBranch && (
					<Box gap={1}>
						<Text dimColor>base:</Text>
						<Text color="blue">{baseBranch}</Text>
					</Box>
				)}
				{commitsBehind > 0 && (
					<Box gap={1}>
						<Text dimColor>behind:</Text>
						<Text color="yellow" bold>
							↓{commitsBehind}
						</Text>
					</Box>
				)}
				<Box gap={1}>
					<Text dimColor>mode:</Text>
					<Text backgroundColor={usesRebase ? "blue" : "magenta"} color="white">
						{usesRebase ? " rebase " : " merge "}
					</Text>
				</Box>
			</Box>

			<Box marginTop={1}>
				{isLoading && (
					<Box gap={1}>
						<Text color="cyan">
							<Spinner type="dots" />
						</Text>
						<Text>
							{status === "init" && "Starting..."}
							{status === "fetching" && "Fetching from remote..."}
							{status === "syncing" &&
								(usesRebase ? "Rebasing..." : "Merging...")}
						</Text>
					</Box>
				)}
				{(status === "done" || status === "up-to-date") && (
					<Text color="green" bold>
						✓ {message}
					</Text>
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
