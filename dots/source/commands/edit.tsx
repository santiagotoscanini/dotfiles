import React, { useEffect, useState } from "react";
import { Box, Text, useApp } from "ink";
import { spawn } from "child_process";
import { Header } from "../components/Header.js";
import { getConfigPath } from "../lib/config.js";

type Phase = "opening" | "done" | "error";

export default function Edit() {
	const { exit } = useApp();
	const [phase, setPhase] = useState<Phase>("opening");
	const [errorMessage, setErrorMessage] = useState("");

	const configPath = getConfigPath();
	const editor = process.env.EDITOR || process.env.VISUAL || "vim";

	useEffect(() => {
		async function run() {
			await new Promise((r) => setTimeout(r, 100));

			try {
				// Spawn editor
				const child = spawn(editor, [configPath], {
					stdio: "inherit",
					detached: true,
				});

				child.on("error", (err) => {
					setErrorMessage(`Failed to open editor: ${err.message}`);
					setPhase("error");
					setTimeout(() => exit(), 100);
				});

				child.on("close", (code) => {
					if (code === 0) {
						setPhase("done");
					} else {
						setErrorMessage(`Editor exited with code ${code}`);
						setPhase("error");
					}
					setTimeout(() => exit(), 100);
				});

				// Unref to allow parent to exit
				child.unref();
			} catch (error) {
				setErrorMessage(error instanceof Error ? error.message : "Unknown error");
				setPhase("error");
				setTimeout(() => exit(), 100);
			}
		}

		run();
	}, [exit, editor, configPath]);

	return (
		<Box flexDirection="column" padding={1}>
			<Header
				icon="📝"
				title="Edit Config"
				subtitle={`using ${editor}`}
			/>

			{phase === "opening" && (
				<Box flexDirection="column">
					<Text>Opening <Text color="cyan">{configPath}</Text>...</Text>
				</Box>
			)}

			{phase === "done" && (
				<Box marginTop={1}>
					<Text color="green" bold>
						✓ Config saved
					</Text>
				</Box>
			)}

			{phase === "error" && (
				<Box marginTop={1}>
					<Text color="red" bold>
						✗ Error: {errorMessage}
					</Text>
				</Box>
			)}
		</Box>
	);
}
