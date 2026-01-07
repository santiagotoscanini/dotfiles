import { useEffect, useState } from "react";
import { Text, Box } from "ink";
import Spinner from "ink-spinner";
import { exec } from "child_process";
import { promisify } from "util";
import {
	listWorktrees,
	getWorktreeMetadata,
	isWorktreePath,
} from "../lib/git.js";
import { getPRInfoAsync } from "../lib/github.js";

const execAsync = promisify(exec);

interface WorktreeInfo {
	branch: string;
	base: string;
	ahead: number;
	pr: string;
	prState: string;
	status: string;
	path: string;
	isMain: boolean;
}

async function getCommitsAhead(
	worktreePath: string,
	baseBranch: string,
): Promise<number> {
	try {
		const { stdout } = await execAsync(
			`git -C "${worktreePath}" rev-list --count ${baseBranch}..HEAD`,
		);
		return parseInt(stdout.trim(), 10) || 0;
	} catch {
		return -1;
	}
}

async function isDirty(worktreePath: string): Promise<boolean> {
	try {
		const { stdout } = await execAsync(
			`git -C "${worktreePath}" status --porcelain`,
		);
		return Boolean(stdout.trim());
	} catch {
		return false;
	}
}

export default function List() {
	const [wtInfo, setWtInfo] = useState<WorktreeInfo[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [loadingMsg, setLoadingMsg] = useState("Loading worktrees...");

	useEffect(() => {
		async function run() {
			await new Promise((r) => setTimeout(r, 100));

			try {
				const worktrees = listWorktrees();
				const info: WorktreeInfo[] = [];

				for (let i = 0; i < worktrees.length; i++) {
					const wt = worktrees[i]!;
					setLoadingMsg(`Checking ${i + 1}/${worktrees.length}...`);

					const branch = wt.branch || "(detached)";
					const isMain = !isWorktreePath(wt.path);

					let base = "-";
					let ahead = -1;
					let pr = "-";
					let prState = "";
					let status = "-";

					if (!isMain) {
						const metadata = getWorktreeMetadata(wt.path);
						if (metadata?.base_branch) {
							base = metadata.base_branch;
						}

						// Run async operations in parallel
						const [aheadResult, dirtyResult, prInfo] = await Promise.all([
							base !== "-" ? getCommitsAhead(wt.path, base) : Promise.resolve(-1),
							isDirty(wt.path),
							wt.branch ? getPRInfoAsync(wt.branch) : Promise.resolve(null),
						]);

						ahead = aheadResult;
						status = dirtyResult ? "dirty" : "clean";

						if (prInfo) {
							pr = `#${prInfo.number}`;
							prState = prInfo.state;
						}
					}

					info.push({
						branch,
						base,
						ahead,
						pr,
						prState,
						status,
						path: wt.path,
						isMain,
					});
				}

				setWtInfo(info);
				setLoading(false);
			} catch (e) {
				setError(e instanceof Error ? e.message : "Unknown error");
				setLoading(false);
			}
		}

		run();
	}, []);

	if (error) {
		return (
			<Box padding={1}>
				<Text color="red" bold>
					✗ {error}
				</Text>
			</Box>
		);
	}

	if (loading) {
		return (
			<Box padding={1} gap={1}>
				<Text color="cyan">
					<Spinner type="dots" />
				</Text>
				<Text>{loadingMsg}</Text>
			</Box>
		);
	}

	if (wtInfo.length === 0) {
		return (
			<Box padding={1}>
				<Text color="yellow">No worktrees found</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column" padding={1}>
			<Box marginBottom={1}>
				<Text bold color="cyan">
					🌳 Worktrees
				</Text>
				<Text dimColor> ({wtInfo.length})</Text>
			</Box>

			{wtInfo.map((w, i) => (
				<Box
					key={i}
					flexDirection="column"
					borderStyle="round"
					borderColor={
						w.isMain
							? "white"
							: w.prState === "MERGED"
								? "magenta"
								: w.prState === "CLOSED"
									? "red"
									: w.status === "dirty"
										? "yellow"
										: "green"
					}
					paddingX={1}
					marginBottom={i < wtInfo.length - 1 ? 1 : 0}
				>
					<Box gap={1}>
						<Text color={w.isMain ? "white" : "cyan"} bold>
							{w.branch}
						</Text>
						{w.isMain && <Text dimColor>(main repo)</Text>}
					</Box>

					{!w.isMain && (
						<>
							<Box gap={1}>
								<Text dimColor>base:</Text>
								<Text>{w.base}</Text>
								{w.ahead > 0 && (
									<Text color="green" bold>
										+{w.ahead} ahead
									</Text>
								)}
								{w.ahead === 0 && <Text dimColor>up to date</Text>}
							</Box>

							<Box gap={1}>
								<Text dimColor>status:</Text>
								{w.status === "dirty" ? (
									<Text color="yellow" bold>
										● dirty
									</Text>
								) : (
									<Text color="green">✓ clean</Text>
								)}
							</Box>

							<Box gap={1}>
								<Text dimColor>PR:</Text>
								{w.pr === "-" ? (
									<Text dimColor>none</Text>
								) : w.prState === "MERGED" ? (
									<Text color="magenta">
										{w.pr} merged
									</Text>
								) : w.prState === "CLOSED" ? (
									<Text color="red">
										{w.pr} closed
									</Text>
								) : (
									<Text color="blue">
										{w.pr} open
									</Text>
								)}
							</Box>
						</>
					)}

					<Box>
						<Text dimColor>{w.path}</Text>
					</Box>
				</Box>
			))}
		</Box>
	);
}
