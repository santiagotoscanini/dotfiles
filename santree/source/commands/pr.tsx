import { useEffect, useState } from "react";
import { Text, Box, useApp } from "ink";
import TextInput from "ink-text-input";
import Spinner from "ink-spinner";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
import {
	findMainRepoRoot,
	findRepoRoot,
	getCurrentBranch,
	getDefaultBranch,
	getWorktreeMetadata,
	hasUncommittedChanges,
	getCommitsAhead,
	remoteBranchExists,
	getUnpushedCommits,
	extractTicketId,
	isInWorktree,
} from "../lib/git.js";
import {
	ghCliAvailable,
	getPRInfoAsync,
	pushBranch,
	createPR,
} from "../lib/github.js";
import { loadLinearConfig, getIssueTitle } from "../lib/linear.js";

const execAsync = promisify(exec);

export const options = z.object({
	draft: z.boolean().optional().describe("Create as draft PR"),
});

type Props = {
	options: z.infer<typeof options>;
};

type Status =
	| "checking"
	| "pushing"
	| "fetching-title"
	| "awaiting-title"
	| "creating"
	| "done"
	| "existing"
	| "error";

// Pattern: <author>/<team>-<number>-<description>
const BRANCH_PATTERN = /^[^/]+\/([a-zA-Z]+)-(\d+)-(.+)$/;

function parseBranchName(
	branch: string,
): { team: string; number: string; description: string } | null {
	const match = branch.match(BRANCH_PATTERN);
	if (match) {
		return {
			team: match[1]!,
			number: match[2]!,
			description: match[3]!,
		};
	}
	return null;
}

export default function PR({ options }: Props) {
	const { exit } = useApp();
	const [status, setStatus] = useState<Status>("checking");
	const [message, setMessage] = useState("");
	const [branch, setBranch] = useState<string | null>(null);
	const [baseBranch, setBaseBranch] = useState<string | null>(null);
	const [issueId, setIssueId] = useState<string | null>(null);
	const [titleInput, setTitleInput] = useState("");

	async function handleTitleSubmit(value: string) {
		const finalTitle = value.trim();
		if (!finalTitle) {
			setStatus("error");
			setMessage("PR title is required");
			setTimeout(() => exit(), 100);
			return;
		}

		if (!branch || !baseBranch) return;

		setStatus("creating");
		setMessage("Creating PR...");

		const result = createPR(finalTitle, baseBranch, branch, options.draft ?? false);

		if (result === 0) {
			setStatus("done");
			setMessage("Opened PR creation page in browser");
		} else {
			setStatus("error");
			setMessage("Failed to create PR");
		}
		setTimeout(() => exit(), 100);
	}

	useEffect(() => {
		async function run() {
			// Allow spinner to render first
			await new Promise((r) => setTimeout(r, 100));

			// Check gh CLI is available
			if (!ghCliAvailable()) {
				setStatus("error");
				setMessage(
					"GitHub CLI (gh) is not installed. Install with: brew install gh",
				);
				return;
			}

			// Find repos
			const mainRepoRoot = findMainRepoRoot();
			const currentRepo = findRepoRoot();

			if (!mainRepoRoot || !currentRepo) {
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

			// Check for uncommitted changes
			if (hasUncommittedChanges()) {
				setStatus("error");
				setMessage(
					"You have uncommitted changes. Please commit your changes before creating a PR.",
				);
				return;
			}

			// Get base branch from metadata
			const metadata = getWorktreeMetadata(currentRepo);
			const base = metadata?.base_branch ?? getDefaultBranch();
			setBaseBranch(base);

			// Check commits ahead
			const commitsAhead = getCommitsAhead(base);
			if (commitsAhead === 0) {
				setStatus("error");
				setMessage(
					`No commits ahead of ${base}. You need to make commits before creating a PR.`,
				);
				return;
			}

			// Check if we need to push
			const remoteExists = remoteBranchExists(branchName);
			const unpushed = getUnpushedCommits(branchName);

			if (!remoteExists || unpushed > 0) {
				setStatus("pushing");
				setMessage("Pushing to remote...");

				if (!pushBranch(branchName)) {
					setStatus("error");
					setMessage("Failed to push branch to remote");
					return;
				}
			}

			// Check if PR already exists
			const existingPr = await getPRInfoAsync(branchName);
			if (existingPr) {
				setStatus("existing");
				setMessage(
					`PR already exists (#${existingPr.number}) - ${existingPr.state}`,
				);
				if (existingPr.url) {
					try {
						await execAsync(`open "${existingPr.url}"`);
					} catch {
						// Ignore open errors
					}
				}
				setTimeout(() => exit(), 100);
				return;
			}

			// Parse branch name
			const parsed = parseBranchName(branchName);
			let suggestedTitle = "";

			if (parsed) {
				const { team, number, description } = parsed;
				const issue = `${team.toUpperCase()}-${number}`;
				setIssueId(issue);

				// Try to get title from Linear
				setStatus("fetching-title");
				setMessage("Fetching title from Linear...");

				const apiKey = loadLinearConfig(mainRepoRoot);
				let linearTitle: string | null = null;

				if (apiKey) {
					linearTitle = await getIssueTitle(apiKey, issue);
				}

				if (linearTitle) {
					suggestedTitle = `[${issue}] ${linearTitle}`;
				} else {
					// Fallback to branch description
					const fallbackTitle = description.replace(/-/g, " ");
					suggestedTitle = `[${issue}] ${fallbackTitle.charAt(0).toUpperCase() + fallbackTitle.slice(1)}`;
				}
			} else {
				// No issue ID, extract ticket ID if possible
				const ticket = extractTicketId(branchName);
				if (ticket) {
					setIssueId(ticket);
					suggestedTitle = `[${ticket}] `;
				}
			}

			setTitleInput(suggestedTitle);
			setStatus("awaiting-title");
		}

		run();
	}, [options.draft]);

	const isLoading =
		status === "checking" ||
		status === "pushing" ||
		status === "fetching-title" ||
		status === "creating";

	return (
		<Box flexDirection="column" padding={1} width="100%">
			<Box marginBottom={1}>
				<Text bold color="cyan">
					🔗 Pull Request
				</Text>
			</Box>

			<Box
				flexDirection="column"
				borderStyle="round"
				borderColor={
					status === "error"
						? "red"
						: status === "done"
							? "green"
							: status === "existing"
								? "yellow"
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

				{issueId && (
					<Box gap={1}>
						<Text dimColor>issue:</Text>
						<Text color="blue" bold>
							{issueId}
						</Text>
					</Box>
				)}

				<Box gap={1}>
					<Text dimColor>type:</Text>
					<Text
						backgroundColor={options.draft ? "yellow" : "green"}
						color="black"
					>
						{options.draft ? " draft " : " ready "}
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
				{status === "awaiting-title" && (
					<Box>
						<Text color="cyan" bold>PR Title: </Text>
						<TextInput
							value={titleInput}
							onChange={setTitleInput}
							onSubmit={handleTitleSubmit}
						/>
					</Box>
				)}
				{status === "done" && (
					<Text color="green" bold>
						✓ {message}
					</Text>
				)}
				{status === "existing" && (
					<Text color="yellow" bold>
						⚠ {message}
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
