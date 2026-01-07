import { useEffect, useRef } from "react";
import { Text, Box } from "ink";
import { z } from "zod";
import { getWorktreePath } from "../lib/git.js";

export const args = z.tuple([z.string().describe("Branch name to switch to")]);

type Props = {
	args: z.infer<typeof args>;
};

export default function Switch({ args }: Props) {
	const [branchName] = args;
	const hasOutputRef = useRef(false);

	// Find worktree path synchronously
	const worktreePath = getWorktreePath(branchName);

	// Output SANTREE_CD once (before Ink fully renders)
	useEffect(() => {
		if (worktreePath && !hasOutputRef.current) {
			hasOutputRef.current = true;
			process.stdout.write(`SANTREE_CD:${worktreePath}\n`);
		}
	}, [worktreePath]);

	const status = worktreePath ? "done" : "error";
	const error = worktreePath ? null : `Worktree not found for branch: ${branchName}`;

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
				borderColor={status === "error" ? "red" : "green"}
				paddingX={1}
				width="100%"
			>
				<Box gap={1}>
					<Text dimColor>branch:</Text>
					<Text color="cyan" bold>
						{branchName}
					</Text>
				</Box>

				{worktreePath && (
					<Box gap={1}>
						<Text dimColor>path:</Text>
						<Text dimColor>{worktreePath}</Text>
					</Box>
				)}
			</Box>

			<Box marginTop={1}>
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
