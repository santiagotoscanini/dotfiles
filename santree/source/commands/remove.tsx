import { useEffect, useState } from "react";
import { Text, Box } from "ink";
import Spinner from "ink-spinner";
import { z } from "zod";
import { removeWorktree, findMainRepoRoot } from "../lib/git.js";

export const options = z.object({
	force: z.boolean().optional().describe("Force removal"),
});

export const args = z.tuple([z.string().describe("Branch name to remove")]);

type Props = {
	options: z.infer<typeof options>;
	args: z.infer<typeof args>;
};

export default function Remove({ options, args }: Props) {
	const [branchName] = args;
	const [status, setStatus] = useState<"idle" | "removing" | "done" | "error">(
		"idle",
	);
	const [message, setMessage] = useState("");

	useEffect(() => {
		async function run() {
			// Small delay to allow spinner to render
			await new Promise((r) => setTimeout(r, 100));

			const repoRoot = findMainRepoRoot();
			if (!repoRoot) {
				setStatus("error");
				setMessage("Not inside a git repository");
				return;
			}

			setStatus("removing");
			setMessage(`Removing worktree ${branchName}...`);

			const result = await removeWorktree(
				branchName,
				repoRoot,
				options.force ?? false,
			);

			if (result.success) {
				setStatus("done");
				setMessage(`Removed worktree and branch: ${branchName}`);
			} else {
				setStatus("error");
				setMessage(result.error ?? "Unknown error");
			}
		}

		run();
	}, [branchName, options.force]);

	const isLoading = status === "idle" || status === "removing";

	return (
		<Box flexDirection="column" padding={1} width="100%">
			<Box marginBottom={1}>
				<Text bold color="cyan">
					🗑️ Remove
				</Text>
			</Box>

			<Box
				flexDirection="column"
				borderStyle="round"
				borderColor={
					status === "error" ? "red" : status === "done" ? "green" : "yellow"
				}
				paddingX={1}
				width="100%"
			>
				<Box gap={1}>
					<Text dimColor>branch:</Text>
					<Text color="red" bold>
						{branchName}
					</Text>
				</Box>

				{options.force && (
					<Box gap={1}>
						<Text dimColor>force:</Text>
						<Text backgroundColor="red" color="white">
							{" "}
							yes{" "}
						</Text>
					</Box>
				)}
			</Box>

			<Box marginTop={1}>
				{isLoading && (
					<Box>
						<Text color="yellow">
							<Spinner type="dots" />
						</Text>
						<Text> {message || "Removing..."}</Text>
					</Box>
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
