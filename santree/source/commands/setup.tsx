import { useEffect, useState } from "react";
import { Text, Box } from "ink";
import Spinner from "ink-spinner";
import { spawn } from "child_process";
import * as path from "path";
import * as fs from "fs";
import { findMainRepoRoot, getSantreeDir, isInWorktree } from "../lib/git.js";

type Status = "checking" | "running" | "done" | "error";

export default function Setup() {
	const [status, setStatus] = useState<Status>("checking");
	const [message, setMessage] = useState("");
	const [worktreePath, setWorktreePath] = useState("");
	const [scriptPath, setScriptPath] = useState("");
	const [output, setOutput] = useState("");

	useEffect(() => {
		async function run() {
			// Small delay to allow initial render with spinner
			await new Promise((r) => setTimeout(r, 100));

			const mainRepo = findMainRepoRoot();
			if (!mainRepo) {
				setStatus("error");
				setMessage("Not inside a git repository");
				return;
			}

			const santreeDir = getSantreeDir(mainRepo);
			const initScript = path.join(santreeDir, "init.sh");
			setScriptPath(initScript);

			if (!fs.existsSync(initScript)) {
				setStatus("error");
				setMessage(`No init script found at ${initScript}`);
				return;
			}

			try {
				fs.accessSync(initScript, fs.constants.X_OK);
			} catch {
				setStatus("error");
				setMessage(`Init script is not executable. Run: chmod +x ${initScript}`);
				return;
			}

			const cwd = process.cwd();
			if (!isInWorktree()) {
				setStatus("error");
				setMessage("Not inside a worktree (you are in the main repository)");
				return;
			}

			setWorktreePath(cwd);
			setStatus("running");

			// Run script and capture output
			const exitCode = await new Promise<number>((resolve) => {
				const child = spawn(initScript, [], {
					cwd,
					stdio: "pipe",
					env: {
						...process.env,
						SANTREE_WORKTREE_PATH: cwd,
						SANTREE_REPO_ROOT: mainRepo,
					},
				});

				let scriptOutput = "";

				child.stdout?.on("data", (data) => {
					scriptOutput += data.toString();
					setOutput(scriptOutput);
				});

				child.stderr?.on("data", (data) => {
					scriptOutput += data.toString();
					setOutput(scriptOutput);
				});

				child.on("close", (code) => {
					resolve(code ?? 1);
				});

				child.on("error", (err) => {
					setOutput(err.message);
					resolve(1);
				});
			});

			if (exitCode === 0) {
				setStatus("done");
				setMessage("Init script completed successfully");
			} else {
				setStatus("error");
				setMessage(`Init script failed (exit code ${exitCode})`);
			}
		}

		run();
	}, []);

	const isLoading = status === "checking" || status === "running";

	return (
		<Box flexDirection="column" padding={1} width="100%">
			<Box marginBottom={1}>
				<Text bold color="cyan">⚙️ Setup</Text>
			</Box>

			<Box
				flexDirection="column"
				borderStyle="round"
				borderColor={status === "error" ? "red" : status === "done" ? "green" : "blue"}
				paddingX={1}
				width="100%"
			>
				{worktreePath && (
					<Box gap={1}>
						<Text dimColor>worktree:</Text>
						<Text color="cyan">{worktreePath}</Text>
					</Box>
				)}
				{scriptPath && (
					<Box gap={1}>
						<Text dimColor>script:</Text>
						<Text dimColor>{scriptPath}</Text>
					</Box>
				)}
			</Box>

			{output && (
				<Box marginTop={1} flexDirection="column">
					<Text dimColor>Output:</Text>
					<Text>{output}</Text>
				</Box>
			)}

			<Box marginTop={1}>
				{isLoading && (
					<Box gap={1}>
						<Text color="cyan"><Spinner type="dots" /></Text>
						<Text>{status === "checking" ? "Checking..." : "Running init script..."}</Text>
					</Box>
				)}
				{status === "done" && (
					<Text color="green" bold>✓ {message}</Text>
				)}
				{status === "error" && (
					<Text color="red" bold>✗ {message}</Text>
				)}
			</Box>
		</Box>
	);
}
