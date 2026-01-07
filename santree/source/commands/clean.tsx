import { useEffect, useState } from "react";
import { Text, Box, useInput, useApp } from "ink";
import Spinner from "ink-spinner";
import { z } from "zod";
import {
	findMainRepoRoot,
	listWorktrees,
	removeWorktree,
	isWorktreePath,
} from "../lib/git.js";
import { getPRInfoAsync } from "../lib/github.js";

export const options = z.object({
	"dry-run": z.boolean().optional().describe("Show what would be removed"),
	force: z.boolean().optional().describe("Skip confirmation"),
});

type Props = {
	options: z.infer<typeof options>;
};

interface StaleWorktree {
	branch: string;
	path: string;
	prNum: string;
	prState: "MERGED" | "CLOSED";
}

type Status =
	| "checking"
	| "confirming"
	| "removing"
	| "done"
	| "none-found"
	| "cancelled"
	| "error";

export default function Clean({ options }: Props) {
	const { exit } = useApp();
	const [status, setStatus] = useState<Status>("checking");
	const [message, setMessage] = useState(
		"Checking worktrees for merged/closed PRs...",
	);
	const [staleWorktrees, setStaleWorktrees] = useState<StaleWorktree[]>([]);
	const [failed, setFailed] = useState(0);
	const [repoRoot, setRepoRoot] = useState<string | null>(null);

	// Handle confirmation input
	useInput((input) => {
		if (status !== "confirming") return;

		if (input === "y" || input === "Y") {
			removeStaleWorktrees();
		} else if (input === "n" || input === "N" || input === "\x03") {
			setStatus("cancelled");
			setMessage("Cancelled");
			setTimeout(() => exit(), 100);
		}
	});

	async function removeStaleWorktrees() {
		if (!repoRoot) return;

		setStatus("removing");
		let removedCount = 0;
		let failedCount = 0;

		for (const wt of staleWorktrees) {
			const result = await removeWorktree(wt.branch, repoRoot, true);
			if (result.success) {
				removedCount++;
			} else {
				failedCount++;
			}
		}

		setFailed(failedCount);
		setStatus("done");
		setMessage(
			failedCount > 0
				? `Removed ${removedCount} worktree(s), ${failedCount} failed`
				: `Removed ${removedCount} worktree(s)`,
		);
		setTimeout(() => exit(), 100);
	}

	useEffect(() => {
		async function run() {
			// Small delay to allow spinner to render
			await new Promise((r) => setTimeout(r, 100));

			// Find main repo root
			const mainRepo = findMainRepoRoot();
			if (!mainRepo) {
				setStatus("error");
				setMessage("Not inside a git repository");
				return;
			}
			setRepoRoot(mainRepo);

			const worktrees = listWorktrees();

			// Filter to only worktrees (not main repo) with branches
			const candidates = worktrees.filter(
				(wt) => isWorktreePath(wt.path) && wt.branch,
			);

			// Fetch PR info for all worktrees in parallel
			const prInfoResults = await Promise.all(
				candidates.map((wt) => getPRInfoAsync(wt.branch!)),
			);

			// Find worktrees with merged/closed PRs
			const stale: StaleWorktree[] = [];
			for (let i = 0; i < candidates.length; i++) {
				const wt = candidates[i]!;
				const prInfo = prInfoResults[i];
				if (
					prInfo &&
					(prInfo.state === "MERGED" || prInfo.state === "CLOSED")
				) {
					stale.push({
						branch: wt.branch!,
						path: wt.path,
						prNum: prInfo.number,
						prState: prInfo.state,
					});
				}
			}

			setStaleWorktrees(stale);

			if (stale.length === 0) {
				setStatus("none-found");
				setMessage(
					"No stale worktrees found. All worktrees have open PRs or no PRs.",
				);
				setTimeout(() => exit(), 100);
				return;
			}

			// Dry run - just show what would be removed
			if (options["dry-run"]) {
				setStatus("done");
				setMessage("Dry run - no changes made");
				setTimeout(() => exit(), 100);
				return;
			}

			// Skip confirmation if force flag
			if (options.force) {
				await removeStaleWorktrees();
				return;
			}

			setStatus("confirming");
		}

		run();
	}, [options["dry-run"], options.force]);

	const isLoading = status === "checking" || status === "removing";

	return (
		<Box flexDirection="column" padding={1} width="100%">
			<Box marginBottom={1}>
				<Text bold color="cyan">
					🧹 Clean
				</Text>
				{options["dry-run"] && <Text color="yellow"> (dry run)</Text>}
			</Box>

			{isLoading && (
				<Box marginBottom={1}>
					<Text color="cyan">
						<Spinner type="dots" />
					</Text>
					<Text> {message}</Text>
				</Box>
			)}

			{staleWorktrees.length > 0 && (
				<Box flexDirection="column" marginBottom={1}>
					<Text>
						Found{" "}
						<Text color="yellow" bold>
							{staleWorktrees.length}
						</Text>{" "}
						stale worktree(s):
					</Text>

					{staleWorktrees.map((wt) => (
						<Box
							key={wt.branch}
							flexDirection="column"
							borderStyle="round"
							borderColor={wt.prState === "MERGED" ? "magenta" : "red"}
							paddingX={1}
							marginTop={1}
							width="100%"
						>
							<Box gap={1}>
								<Text dimColor>branch:</Text>
								<Text color="cyan" bold>
									{wt.branch}
								</Text>
							</Box>
							<Box gap={1}>
								<Text dimColor>PR:</Text>
								<Text>#{wt.prNum}</Text>
								<Text
									backgroundColor={wt.prState === "MERGED" ? "magenta" : "red"}
									color="white"
								>
									{` ${wt.prState.toLowerCase()} `}
								</Text>
							</Box>
							<Box gap={1}>
								<Text dimColor>path:</Text>
								<Text dimColor>{wt.path}</Text>
							</Box>
						</Box>
					))}
				</Box>
			)}

			{status === "confirming" && (
				<Box marginTop={1}>
					<Text bold color="yellow">
						Remove these worktrees? [y/N]:{" "}
					</Text>
				</Box>
			)}

			{status === "none-found" && (
				<Text color="green" bold>
					✓ {message}
				</Text>
			)}

			{status === "done" && (
				<Text color={failed > 0 ? "yellow" : "green"} bold>
					✓ {message}
				</Text>
			)}

			{status === "cancelled" && <Text color="yellow">✗ {message}</Text>}

			{status === "error" && (
				<Text color="red" bold>
					✗ {message}
				</Text>
			)}
		</Box>
	);
}
