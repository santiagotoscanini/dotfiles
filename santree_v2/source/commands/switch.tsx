import { useEffect, useState } from "react";
import { Text, Box } from "ink";
import Spinner from "ink-spinner";
import { z } from "zod";
import { getWorktreePath } from "../lib/git.js";

export const args = z.tuple([z.string().describe("Branch name to switch to")]);

type Props = {
	args: z.infer<typeof args>;
};

export default function Switch({ args }: Props) {
	const [branchName] = args;
	const [status, setStatus] = useState<"checking" | "done" | "error">(
		"checking",
	);
	const [error, setError] = useState<string | null>(null);
	const [path, setPath] = useState<string | null>(null);

	useEffect(() => {
		const worktreePath = getWorktreePath(branchName);
		if (worktreePath) {
			setPath(worktreePath);
			setStatus("done");
			// Output SANTREE_CD for shell wrapper
			console.log(`SANTREE_CD:${worktreePath}`);
		} else {
			setStatus("error");
			setError(`Worktree not found for branch: ${branchName}`);
		}
	}, [branchName]);

	return (
		<Box flexDirection="column" padding={1} width="100%">
			<Box marginBottom={1}>
				<Text bold color="cyan">
					🔀 Switch
				</Text>
			</Box>

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

				{path && (
					<Box gap={1}>
						<Text dimColor>path:</Text>
						<Text dimColor>{path}</Text>
					</Box>
				)}
			</Box>

			<Box marginTop={1}>
				{status === "checking" && (
					<Box>
						<Text color="cyan">
							<Spinner type="dots" />
						</Text>
						<Text> Finding worktree...</Text>
					</Box>
				)}
				{status === "done" && (
					<Text color="green" bold>
						✓ Switching to worktree
					</Text>
				)}
				{status === "error" && (
					<Text color="red" bold>
						✗ {error}
					</Text>
				)}
			</Box>
		</Box>
	);
}
