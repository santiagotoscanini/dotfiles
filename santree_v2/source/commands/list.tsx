import { useEffect, useState } from "react";
import { Text, Box } from "ink";
import Spinner from "ink-spinner";
import { execSync } from "child_process";
import {
	listWorktrees,
	getWorktreeMetadata,
	isWorktreePath,
} from "../lib/git.js";
import { getPRInfo } from "../lib/github.js";

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

function getCommitsAhead(worktreePath: string, baseBranch: string): number {
	try {
		const output = execSync(
			`git -C "${worktreePath}" rev-list --count ${baseBranch}..HEAD`,
			{ encoding: "utf-8" },
		);
		return parseInt(output.trim(), 10) || 0;
	} catch {
		return -1;
	}
}

function isDirty(worktreePath: string): boolean {
	try {
		const output = execSync(`git -C "${worktreePath}" status --porcelain`, {
			encoding: "utf-8",
		});
		return Boolean(output.trim());
	} catch {
		return false;
	}
}

function StatusBadge({ status }: { status: string }) {
	if (status === "dirty") {
		return (
			<Text backgroundColor="yellow" color="black" bold>
				{" DIRTY "}
			</Text>
		);
	}
	if (status === "clean") {
		return (
			<Text backgroundColor="green" color="black">
				{" clean "}
			</Text>
		);
	}
	return <Text dimColor>-</Text>;
}

function PRBadge({ pr, state }: { pr: string; state: string }) {
	if (pr === "-") {
		return <Text dimColor>no PR</Text>;
	}
	if (state === "MERGED") {
		return (
			<Text backgroundColor="magenta" color="white" bold>
				{` ${pr} merged `}
			</Text>
		);
	}
	if (state === "CLOSED") {
		return (
			<Text backgroundColor="red" color="white">
				{` ${pr} closed `}
			</Text>
		);
	}
	return (
		<Text backgroundColor="blue" color="white">
			{` ${pr} open `}
		</Text>
	);
}

function AheadBadge({ ahead }: { ahead: number }) {
	if (ahead < 0) {
		return <Text dimColor>-</Text>;
	}
	if (ahead === 0) {
		return <Text dimColor>0 ahead</Text>;
	}
	return (
		<Text color="green" bold>
			↑{ahead}
		</Text>
	);
}

export default function List() {
	const [wtInfo, setWtInfo] = useState<WorktreeInfo[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		try {
			const worktrees = listWorktrees();
			const info: WorktreeInfo[] = [];

			for (const wt of worktrees) {
				const branch = wt.branch || "(detached)";
				const isMain = !isWorktreePath(wt.path);

				// Get metadata for base branch
				let base = "-";
				let ahead = -1;
				if (!isMain) {
					const metadata = getWorktreeMetadata(wt.path);
					if (metadata?.base_branch) {
						base = metadata.base_branch;
						ahead = getCommitsAhead(wt.path, base);
					}
				}

				// Get PR info
				let pr = "-";
				let prState = "";
				if (!isMain && wt.branch) {
					const prInfo = getPRInfo(wt.branch);
					if (prInfo) {
						pr = `#${prInfo.number}`;
						prState = prInfo.state;
					}
				}

				// Get dirty status
				let status = "-";
				if (!isMain) {
					status = isDirty(wt.path) ? "dirty" : "clean";
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
	}, []);

	if (error) {
		return (
			<Box padding={1}>
				<Text color="red" bold>
					✗ Error: {error}
				</Text>
			</Box>
		);
	}

	if (loading) {
		return (
			<Box padding={1}>
				<Text color="cyan">
					<Spinner type="dots" />
				</Text>
				<Text> Loading worktrees...</Text>
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
		<Box flexDirection="column" padding={1} width="100%">
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
						w.isMain ? "gray" : w.status === "dirty" ? "yellow" : "green"
					}
					paddingX={1}
					marginBottom={i < wtInfo.length - 1 ? 1 : 0}
					width="100%"
				>
					{/* Branch name row */}
					<Box>
						<Text bold color={w.isMain ? "white" : "cyan"}>
							{w.branch}
						</Text>
						{w.isMain && <Text dimColor> (main repo)</Text>}
					</Box>

					{/* Info row - only for worktrees */}
					{!w.isMain && (
						<Box marginTop={0} gap={2}>
							<Box>
								<Text dimColor>base: </Text>
								<Text color="blue">{w.base}</Text>
							</Box>
							<AheadBadge ahead={w.ahead} />
							<PRBadge pr={w.pr} state={w.prState} />
							<StatusBadge status={w.status} />
						</Box>
					)}

					{/* Path row */}
					<Box>
						<Text dimColor>{w.path}</Text>
					</Box>
				</Box>
			))}
		</Box>
	);
}
