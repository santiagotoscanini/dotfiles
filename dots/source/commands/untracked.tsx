import React, { useState, useEffect } from "react";
import { Box, Text, useApp } from "ink";
import Spinner from "ink-spinner";
import { Header } from "../components/Header.js";
import { getTrackedPackages } from "../lib/config.js";
import { getInstalledFormulas, getInstalledCasks } from "../handlers/index.js";

type Phase = "loading" | "done" | "error";

interface UntrackedPackage {
	name: string;
	type: "formula" | "cask";
}

export default function Untracked() {
	const { exit } = useApp();
	const [phase, setPhase] = useState<Phase>("loading");
	const [untracked, setUntracked] = useState<UntrackedPackage[]>([]);
	const [errorMessage, setErrorMessage] = useState<string>("");

	useEffect(() => {
		async function run() {
			await new Promise((r) => setTimeout(r, 100));

			try {
				// Get installed packages
				const [formulas, casks] = await Promise.all([
					getInstalledFormulas(),
					getInstalledCasks(),
				]);

				// Get tracked packages
				const tracked = getTrackedPackages();

				// Find untracked
				const untrackedList: UntrackedPackage[] = [];

				for (const name of formulas) {
					if (!tracked.has(name)) {
						untrackedList.push({ name, type: "formula" });
					}
				}

				for (const name of casks) {
					if (!tracked.has(name)) {
						untrackedList.push({ name, type: "cask" });
					}
				}

				// Sort by name
				untrackedList.sort((a, b) => a.name.localeCompare(b.name));

				setUntracked(untrackedList);
				setPhase("done");
				setTimeout(() => exit(), 100);
			} catch (error) {
				setErrorMessage(error instanceof Error ? error.message : "Unknown error");
				setPhase("error");
				setTimeout(() => exit(), 100);
			}
		}

		run();
	}, [exit]);

	const formulas = untracked.filter((p) => p.type === "formula");
	const casks = untracked.filter((p) => p.type === "cask");

	return (
		<Box flexDirection="column" padding={1}>
			<Header
				icon="🔍"
				title="Untracked Packages"
				subtitle="Installed but not in any profile"
			/>

			{phase === "loading" && (
				<Box gap={1}>
					<Text color="cyan">
						<Spinner type="dots" />
					</Text>
					<Text>Scanning installed packages...</Text>
				</Box>
			)}

			{phase === "done" && (
				<Box
					flexDirection="column"
					borderStyle="round"
					borderColor={untracked.length > 0 ? "yellow" : "green"}
					paddingX={1}
					paddingY={1}
				>
					{untracked.length === 0 ? (
						<Text color="green" bold>
							✓ All installed packages are tracked in profiles
						</Text>
					) : (
						<>
							<Text color="yellow" bold>
								Found {untracked.length} untracked packages:
							</Text>

							{formulas.length > 0 && (
								<Box flexDirection="column" marginTop={1}>
									<Text bold color="cyan">Formulas ({formulas.length}):</Text>
									<Box flexDirection="column" marginLeft={2}>
										{formulas.slice(0, 15).map((pkg) => (
											<Text key={pkg.name} dimColor>• {pkg.name}</Text>
										))}
										{formulas.length > 15 && (
											<Text dimColor>... and {formulas.length - 15} more</Text>
										)}
									</Box>
								</Box>
							)}

							{casks.length > 0 && (
								<Box flexDirection="column" marginTop={1}>
									<Text bold color="magenta">Casks ({casks.length}):</Text>
									<Box flexDirection="column" marginLeft={2}>
										{casks.slice(0, 15).map((pkg) => (
											<Text key={pkg.name} dimColor>• {pkg.name}</Text>
										))}
										{casks.length > 15 && (
											<Text dimColor>... and {casks.length - 15} more</Text>
										)}
									</Box>
								</Box>
							)}

							<Box marginTop={1}>
								<Text dimColor>
									Run 'dots backup' to add them to config, then 'dots add' to add to a profile.
								</Text>
							</Box>
						</>
					)}
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
