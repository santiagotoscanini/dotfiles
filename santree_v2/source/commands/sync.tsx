import { useEffect, useState } from "react";
import { Text, Box } from "ink";
import Spinner from "ink-spinner";
import { z } from "zod";
import { execSync, spawn } from "child_process";
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

type Status =
	| "checking"
	| "fetching"
	| "syncing"
	| "done"
	| "up-to-date"
	| "error";

export default function Sync({ options }: Props) {
	const [status, setStatus] = useState<Status>("checking");
	const [message, setMessage] = useState("");
	const [branch, setBranch] = useState<string | null>(null);
	const [baseBranch, setBaseBranch] = useState<string | null>(null);
	const [commitsBehind, setCommitsBehind] = useState(0);
	const [usesRebase, setUsesRebase] = useState(false);

	useEffect(() => {
		async function run() {
			// Find repos
			const mainRepo = findMainRepoRoot();
			const currentRepo = findRepoRoot();

			if (!mainRepo || !currentRepo) {
				setStatus("error");
				setMessage("Not inside a git repository");
				return;
			}

			// Validate we're in a worktree (not the main repo)
			if (!isInWorktree()) {
				setStatus("error");
				setMessage("Not inside a worktree (you are in the main repository)");
				return;
			}

			// Get current branch
			const branchName = getCurrentBranch();
			if (!branchName) {
				setStatus("error");
				setMessage("Could not determine current branch");
				return;
			}
			setBranch(branchName);

			// Get base branch from metadata
			const metadata = getWorktreeMetadata(currentRepo);
			const base = metadata?.base_branch ?? getDefaultBranch();
			setBaseBranch(base);

			// Check for uncommitted changes
			if (hasUncommittedChanges()) {
				setStatus("error");
				setMessage(
					"You have uncommitted changes. Please commit or stash them before syncing.",
				);
				return;
			}

			setUsesRebase(options.rebase ?? false);
			setStatus("fetching");
			setMessage("Fetching from remote...");

			// Fetch latest from remote
			try {
				execSync("git fetch origin", { stdio: "ignore" });
			} catch {
				setStatus("error");
				setMessage("Failed to fetch from remote");
				return;
			}

			// Get commits behind
			const behind = getCommitsBehind(base);
			setCommitsBehind(behind);

			if (behind === 0) {
				setStatus("up-to-date");
				setMessage(`Already up to date with origin/${base}`);
				return;
			}

			setStatus("syncing");
			setMessage(
				options.rebase
					? `Rebasing onto origin/${base}...`
					: `Merging origin/${base}...`,
			);

			// Merge or rebase
			const cmd = options.rebase
				? ["git", "rebase", `origin/${base}`]
				: ["git", "merge", `origin/${base}`];

			const child = spawn(cmd[0]!, cmd.slice(1), {
				stdio: "inherit",
			});

			child.on("error", (err) => {
				setStatus("error");
				setMessage(
					`Failed to ${options.rebase ? "rebase" : "merge"}: ${err.message}`,
				);
			});

			child.on("close", (code) => {
				if (code === 0) {
					setStatus("done");
					setMessage(`Successfully synced with origin/${base}`);
				} else {
					setStatus("error");
					if (options.rebase) {
						setMessage(
							"Rebase failed - conflicts detected. Resolve conflicts and run: git rebase --continue",
						);
					} else {
						setMessage(
							"Merge failed - conflicts detected. Resolve conflicts and run: git commit",
						);
					}
				}
			});
		}

		run();
	}, [options.rebase]);

	const isLoading =
		status === "checking" || status === "fetching" || status === "syncing";

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

				{commitsBehind > 0 && !isLoading && (
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
					<Box>
						<Text color="cyan">
							<Spinner type="dots" />
						</Text>
						<Text> {message || "Checking..."}</Text>
					</Box>
				)}
				{status === "up-to-date" && (
					<Text color="green" bold>
						✓ {message}
					</Text>
				)}
				{status === "done" && (
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
