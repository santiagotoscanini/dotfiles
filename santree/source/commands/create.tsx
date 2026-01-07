import { useEffect, useState } from "react";
import { Text, Box } from "ink";
import Spinner from "ink-spinner";
import { z } from "zod";
import { spawn } from "child_process";
import * as fs from "fs";
import {
	createWorktree,
	findMainRepoRoot,
	getDefaultBranch,
	pullLatest,
	hasInitScript,
	getInitScriptPath,
} from "../lib/git.js";

export const options = z.object({
	base: z.string().optional().describe("Base branch to create from"),
	work: z.boolean().optional().describe("Launch Claude after creating"),
	plan: z.boolean().optional().describe("With --work, only plan"),
	"no-pull": z.boolean().optional().describe("Skip pulling latest changes"),
});

export const args = z.tuple([z.string().optional().describe("Branch name")]);

type Props = {
	options: z.infer<typeof options>;
	args: z.infer<typeof args>;
};

type Status =
	| "idle"
	| "pulling"
	| "creating"
	| "init-script"
	| "done"
	| "error";

export default function Create({ options, args }: Props) {
	const [branchName] = args;
	const [status, setStatus] = useState<Status>("idle");
	const [message, setMessage] = useState("");
	const [worktreePath, setWorktreePath] = useState("");
	const [baseBranch, setBaseBranch] = useState<string | null>(null);

	useEffect(() => {
		async function run() {
			// Small delay to allow spinner to render
			await new Promise((r) => setTimeout(r, 100));

			if (!branchName) {
				setStatus("error");
				setMessage("Branch name is required");
				return;
			}

			const mainRepo = findMainRepoRoot();
			if (!mainRepo) {
				setStatus("error");
				setMessage("Not inside a git repository");
				return;
			}

			const base = options.base ?? getDefaultBranch();
			setBaseBranch(base);

			// Pull latest unless --no-pull
			if (!options["no-pull"]) {
				setStatus("pulling");
				setMessage(`Fetching latest changes for ${base}...`);

				const pullResult = pullLatest(base, mainRepo);
				if (!pullResult.success) {
					// Just warn, continue anyway
					setMessage(`Warning: ${pullResult.message}`);
				}
			}

			setStatus("creating");
			setMessage(`Creating worktree from ${base}...`);

			const result = await createWorktree(branchName, base, mainRepo);

			if (result.success && result.path) {
				setWorktreePath(result.path);

				// Run init script if it exists
				if (hasInitScript(mainRepo)) {
					setStatus("init-script");
					setMessage("Running init script...");

					const initScript = getInitScriptPath(mainRepo);

					// Check if executable
					try {
						fs.accessSync(initScript, fs.constants.X_OK);
					} catch {
						setMessage("Warning: Init script exists but is not executable");
						setStatus("done");
						setMessage("Worktree created successfully!");
						console.log(`SANTREE_CD:${result.path}`);
						if (options.work) {
							const mode = options.plan ? "plan" : "implement";
							console.log(`SANTREE_WORK:${mode}`);
						}
						return;
					}

					const child = spawn(initScript, [], {
						cwd: result.path,
						stdio: "inherit",
						env: {
							...process.env,
							SANTREE_WORKTREE_PATH: result.path,
							SANTREE_REPO_ROOT: mainRepo,
						},
					});

					child.on("error", (err) => {
						setMessage(`Warning: Init script failed: ${err.message}`);
					});

					child.on("close", (code) => {
						if (code !== 0) {
							setMessage(`Warning: Init script exited with code ${code}`);
						}
						setStatus("done");
						setMessage("Worktree created successfully!");

						// Output SANTREE_CD for shell wrapper
						console.log(`SANTREE_CD:${result.path}`);

						if (options.work) {
							const mode = options.plan ? "plan" : "implement";
							console.log(`SANTREE_WORK:${mode}`);
						}
					});
				} else {
					setStatus("done");
					setMessage("Worktree created successfully!");

					// Output SANTREE_CD for shell wrapper
					console.log(`SANTREE_CD:${result.path}`);

					if (options.work) {
						const mode = options.plan ? "plan" : "implement";
						console.log(`SANTREE_WORK:${mode}`);
					}
				}
			} else {
				setStatus("error");
				setMessage(result.error ?? "Unknown error");
			}
		}

		run();
	}, [
		branchName,
		options.base,
		options.work,
		options.plan,
		options["no-pull"],
	]);

	const isLoading =
		status === "pulling" || status === "creating" || status === "init-script";

	return (
		<Box flexDirection="column" padding={1} width="100%">
			<Box marginBottom={1}>
				<Text bold color="cyan">
					🌱 Create Worktree
				</Text>
			</Box>

			{branchName && (
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

					{baseBranch && (
						<Box gap={1}>
							<Text dimColor>base:</Text>
							<Text color="blue">{baseBranch}</Text>
						</Box>
					)}

					{options["no-pull"] && (
						<Box gap={1}>
							<Text dimColor>skip pull:</Text>
							<Text color="yellow">yes</Text>
						</Box>
					)}

					{options.work && (
						<Box gap={1}>
							<Text dimColor>after:</Text>
							<Text backgroundColor="magenta" color="white">
								{options.plan ? " plan " : " work "}
							</Text>
						</Box>
					)}
				</Box>
			)}

			<Box marginTop={1}>
				{isLoading && (
					<Box>
						<Text color="cyan">
							<Spinner type="dots" />
						</Text>
						<Text> {message}</Text>
					</Box>
				)}
				{status === "done" && (
					<Box flexDirection="column">
						<Text color="green" bold>
							✓ {message}
						</Text>
						<Text dimColor> {worktreePath}</Text>
					</Box>
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
