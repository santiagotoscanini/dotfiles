import { useEffect, useState } from "react";
import { Text, Box } from "ink";
import Spinner from "ink-spinner";
import { z } from "zod";
import { spawn } from "child_process";
import * as path from "path";
import * as fs from "fs";
import { getCurrentBranch, extractTicketId, findRepoRoot } from "../lib/git.js";

export const options = z.object({
	plan: z.boolean().optional().describe("Only create implementation plan"),
	review: z.boolean().optional().describe("Review changes against ticket"),
	"fix-pr": z.boolean().optional().describe("Fetch PR comments and fix them"),
});

type Props = {
	options: z.infer<typeof options>;
};

type Status = "loading" | "ready" | "launching" | "error";

const TEMPLATES = {
	implement: `Fetch Linear ticket {{ticket_id}} using MCP and analyze what needs to be done.

Review the codebase to understand the relevant areas and existing patterns.

Create an implementation plan, then implement the changes.

After implementation:
- Run tests if applicable
- Ensure code follows existing patterns`,

	plan: `Fetch Linear ticket {{ticket_id}} using MCP and analyze what needs to be done.

Review the codebase to understand:
- Relevant files and modules
- Existing patterns and conventions
- Dependencies and potential impact areas

Create a detailed implementation plan with:
- Step-by-step approach
- Files to modify
- Potential risks or edge cases

Do NOT implement yet - just plan. Wait for approval before making changes.`,

	review: `Fetch Linear ticket {{ticket_id}} using MCP to understand the requirements and acceptance criteria.

Review the current changes by running \`git diff\` against the base branch.

Analyze:
- Do the changes fully address the ticket requirements?
- Are there any missing acceptance criteria?
- Any potential bugs or edge cases?
- Code quality and adherence to patterns?

Provide a summary of findings and any recommended changes.`,

	"fix-pr": `Fetch Linear ticket {{ticket_id}} using MCP to understand the original requirements.

## PR Comments to Address

{{pr_comments}}

## Task

1. Review each comment and understand what changes are requested
2. Make the necessary code changes to address each comment
3. Ensure the changes align with the original ticket requirements
4. Run tests if applicable to verify the fixes

Address all comments systematically, starting from the most critical ones.`,
};

function getClaudePath(): string {
	const paths = [
		path.join(process.env.HOME ?? "", ".claude", "local", "claude"),
		"/usr/local/bin/claude",
		path.join(process.env.HOME ?? "", ".local", "bin", "claude"),
	];

	for (const p of paths) {
		if (fs.existsSync(p)) {
			return p;
		}
	}

	return "claude";
}

function getMode(opts: z.infer<typeof options>): keyof typeof TEMPLATES {
	if (opts["fix-pr"]) return "fix-pr";
	if (opts.review) return "review";
	if (opts.plan) return "plan";
	return "implement";
}

function getModeLabel(mode: keyof typeof TEMPLATES): string {
	switch (mode) {
		case "implement":
			return "implement";
		case "plan":
			return "plan only";
		case "review":
			return "review";
		case "fix-pr":
			return "fix PR";
	}
}

function getModeColor(mode: keyof typeof TEMPLATES): string {
	switch (mode) {
		case "implement":
			return "green";
		case "plan":
			return "blue";
		case "review":
			return "yellow";
		case "fix-pr":
			return "magenta";
	}
}

export default function Work({ options }: Props) {
	const [status, setStatus] = useState<Status>("loading");
	const [branch, setBranch] = useState<string | null>(null);
	const [ticketId, setTicketId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [mode, setMode] = useState<keyof typeof TEMPLATES>("implement");

	useEffect(() => {
		const repoRoot = findRepoRoot();
		if (!repoRoot) {
			setStatus("error");
			setError("Not inside a git repository");
			return;
		}

		const currentBranch = getCurrentBranch();
		if (!currentBranch) {
			setStatus("error");
			setError("Could not determine current branch");
			return;
		}

		setBranch(currentBranch);

		const ticket = extractTicketId(currentBranch);
		if (!ticket) {
			setStatus("error");
			setError(
				"Could not extract ticket ID from branch name. Expected format: user/TEAM-123-description",
			);
			return;
		}

		setTicketId(ticket);
		setMode(getMode(options));
		setStatus("ready");
	}, [options]);

	useEffect(() => {
		if (status !== "ready" || !ticketId) return;

		setStatus("launching");

		const template = TEMPLATES[mode];
		const prompt = template.replace(/\{\{ticket_id\}\}/g, ticketId);

		const claudePath = getClaudePath();

		// Spawn Claude as a child process
		const child = spawn(claudePath, [prompt], {
			stdio: "inherit",
			shell: true,
		});

		child.on("error", (err) => {
			setStatus("error");
			setError(`Failed to launch Claude: ${err.message}`);
		});

		child.on("close", () => {
			process.exit(0);
		});
	}, [status, ticketId, mode]);

	const isLoading = status === "loading";

	return (
		<Box flexDirection="column" padding={1} width="100%">
			<Box marginBottom={1}>
				<Text bold color="cyan">
					🤖 Work
				</Text>
			</Box>

			<Box
				flexDirection="column"
				borderStyle="round"
				borderColor={status === "error" ? "red" : getModeColor(mode)}
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

				<Box gap={1}>
					<Text dimColor>mode:</Text>
					<Text backgroundColor={getModeColor(mode) as any} color="white" bold>
						{` ${getModeLabel(mode)} `}
					</Text>
				</Box>
			</Box>

			<Box marginTop={1}>
				{isLoading && (
					<Box>
						<Text color="cyan">
							<Spinner type="dots" />
						</Text>
						<Text> Loading...</Text>
					</Box>
				)}
				{status === "launching" && (
					<Text color="green" bold>
						✓ Launching Claude...
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
