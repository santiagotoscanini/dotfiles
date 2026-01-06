import { useEffect, useState } from "react";
import { Text, Box, useInput, useApp } from "ink";
import Spinner from "ink-spinner";
import { execSync } from "child_process";
import * as readline from "readline";
import {
	findRepoRoot,
	getCurrentBranch,
	extractTicketId,
	getGitStatus,
	getStagedDiffStat,
	hasStagedChanges,
	hasUnstagedChanges,
} from "../lib/git.js";

type Status =
	| "loading"
	| "confirm-stage"
	| "awaiting-message"
	| "committing"
	| "pushing"
	| "done"
	| "no-changes"
	| "error";

export default function Commit() {
	const { exit } = useApp();
	const [status, setStatus] = useState<Status>("loading");
	const [message, setMessage] = useState("");
	const [branch, setBranch] = useState<string | null>(null);
	const [ticketId, setTicketId] = useState<string | null>(null);
	const [gitStatus, setGitStatus] = useState("");
	const [diffStat, setDiffStat] = useState("");
	const [repoRoot, setRepoRoot] = useState<string | null>(null);

	// Handle confirmation for staging
	useInput((input) => {
		if (status === "confirm-stage") {
			if (input === "y" || input === "Y") {
				stageAndContinue();
			} else if (input === "n" || input === "N" || input === "\x03") {
				// Check if there are staged changes to commit
				if (hasStagedChanges()) {
					promptForMessage();
				} else {
					setStatus("no-changes");
					setMessage("No staged changes to commit");
					setTimeout(() => exit(), 100);
				}
			}
		}
	});

	function stageAndContinue() {
		try {
			execSync("git add -A", { cwd: repoRoot ?? undefined, stdio: "ignore" });
			// Refresh status
			setGitStatus(getGitStatus());
			setDiffStat(getStagedDiffStat());
			promptForMessage();
		} catch (e) {
			setStatus("error");
			setMessage(`Failed to stage changes: ${e}`);
		}
	}

	function promptForMessage() {
		setStatus("awaiting-message");

		// Use readline for interactive input
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		const prefix = ticketId ? `[${ticketId}] ` : "";

		// Clear the current line and show prompt
		process.stdout.write("\n");

		rl.question(`Commit message: `, (answer) => {
			rl.close();

			const finalMessage = answer.trim() || prefix.trim();
			if (!finalMessage) {
				setStatus("error");
				setMessage("Empty commit message, cancelled");
				setTimeout(() => exit(), 100);
				return;
			}

			// Prepend ticket ID if not already present
			const commitMessage =
				ticketId && !answer.includes(`[${ticketId}]`)
					? `[${ticketId}] ${answer}`
					: answer;

			performCommit(commitMessage);
		});

		// Pre-fill the input with ticket ID
		rl.write(prefix);
	}

	function performCommit(commitMessage: string) {
		setStatus("committing");
		setMessage("Creating commit...");

		try {
			execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, {
				cwd: repoRoot ?? undefined,
				stdio: "pipe",
			});
		} catch (e: unknown) {
			setStatus("error");
			const errorMsg = e instanceof Error ? e.message : String(e);
			setMessage(`Commit failed: ${errorMsg}`);
			setTimeout(() => exit(), 100);
			return;
		}

		// Push to origin
		setStatus("pushing");
		setMessage("Pushing to origin...");

		try {
			execSync(`git push -u origin "${branch}"`, {
				cwd: repoRoot ?? undefined,
				stdio: "pipe",
			});
		} catch (e: unknown) {
			setStatus("error");
			const errorMsg = e instanceof Error ? e.message : String(e);
			setMessage(`Push failed: ${errorMsg}`);
			setTimeout(() => exit(), 100);
			return;
		}

		setStatus("done");
		setMessage("Committed and pushed successfully!");
		setTimeout(() => exit(), 100);
	}

	useEffect(() => {
		// Check we're in a git repo
		const root = findRepoRoot();
		if (!root) {
			setStatus("error");
			setMessage("Not inside a git repository");
			return;
		}
		setRepoRoot(root);

		// Get current branch
		const currentBranch = getCurrentBranch();
		if (!currentBranch) {
			setStatus("error");
			setMessage("Could not determine current branch");
			return;
		}
		setBranch(currentBranch);

		// Extract ticket ID
		const ticket = extractTicketId(currentBranch);
		setTicketId(ticket);

		// Get git status
		const statusOutput = getGitStatus();
		if (!statusOutput) {
			setStatus("no-changes");
			setMessage("No changes");
			setTimeout(() => exit(), 100);
			return;
		}
		setGitStatus(statusOutput);

		// Check if we need to stage changes
		const unstaged = hasUnstagedChanges();
		const staged = hasStagedChanges();

		if (unstaged) {
			setStatus("confirm-stage");
		} else if (staged) {
			setDiffStat(getStagedDiffStat());
			promptForMessage();
		} else {
			setStatus("no-changes");
			setMessage("No changes to commit");
			setTimeout(() => exit(), 100);
		}
	}, []);

	const isLoading =
		status === "loading" || status === "committing" || status === "pushing";

	return (
		<Box flexDirection="column" padding={1} width="100%">
			<Box marginBottom={1}>
				<Text bold color="cyan">
					💾 Commit
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
				{branch && (
					<Box gap={1}>
						<Text dimColor>branch:</Text>
						<Text color="cyan" bold>
							{branch}
						</Text>
					</Box>
				)}

				{ticketId && (
					<Box gap={1}>
						<Text dimColor>ticket:</Text>
						<Text color="blue" bold>
							{ticketId}
						</Text>
					</Box>
				)}
			</Box>

			{gitStatus && (
				<Box flexDirection="column" marginTop={1}>
					<Text bold dimColor>
						Changes:
					</Text>
					<Box
						flexDirection="column"
						borderStyle="round"
						borderColor="gray"
						paddingX={1}
						width="100%"
					>
						{gitStatus
							.split("\n")
							.slice(0, 10)
							.map((line, i) => {
								let color: string | undefined;
								if (
									line.startsWith("A ") ||
									line.startsWith("M ") ||
									line.startsWith("D ")
								) {
									color = "green";
								} else if (line.startsWith("??")) {
									color = "gray";
								} else if (line.startsWith(" M") || line.startsWith(" D")) {
									color = "yellow";
								}
								return (
									<Text key={i} color={color as any}>
										{line}
									</Text>
								);
							})}
						{gitStatus.split("\n").length > 10 && (
							<Text dimColor>
								... and {gitStatus.split("\n").length - 10} more
							</Text>
						)}
					</Box>
				</Box>
			)}

			{diffStat && (
				<Box flexDirection="column" marginTop={1}>
					<Text bold dimColor>
						Staged:
					</Text>
					<Box
						flexDirection="column"
						borderStyle="round"
						borderColor="green"
						paddingX={1}
						width="100%"
					>
						{diffStat.split("\n").map((line, i) => (
							<Text key={i} dimColor>
								{line}
							</Text>
						))}
					</Box>
				</Box>
			)}

			<Box marginTop={1}>
				{isLoading && (
					<Box>
						<Text color="cyan">
							<Spinner type="dots" />
						</Text>
						<Text> {message || "Loading..."}</Text>
					</Box>
				)}
				{status === "confirm-stage" && (
					<Text color="yellow" bold>
						Stage all changes? [y/N]:{" "}
					</Text>
				)}
				{status === "awaiting-message" && (
					<Text dimColor>(enter commit message above)</Text>
				)}
				{status === "done" && (
					<Text color="green" bold>
						✓ {message}
					</Text>
				)}
				{status === "no-changes" && <Text dimColor>✓ {message}</Text>}
				{status === "error" && (
					<Text color="red" bold>
						✗ {message}
					</Text>
				)}
			</Box>
		</Box>
	);
}
