import React, { useState, useEffect } from "react";
import { Box, Text, useApp } from "ink";
import Spinner from "ink-spinner";
import { Header } from "../components/Header.js";
import { loadConfig, saveConfig, getPackageNames } from "../lib/config.js";
import { getInstalledFormulas, getInstalledCasks } from "../handlers/index.js";

type Phase = "loading" | "discovering" | "done" | "error";

interface DiscoveredPackage {
	name: string;
	type: "formula" | "cask";
}

export default function Backup() {
	const { exit } = useApp();
	const [phase, setPhase] = useState<Phase>("loading");
	const [discovered, setDiscovered] = useState<DiscoveredPackage[]>([]);
	const [added, setAdded] = useState<string[]>([]);
	const [errorMessage, setErrorMessage] = useState<string>("");

	useEffect(() => {
		async function run() {
			await new Promise((r) => setTimeout(r, 100));

			try {
				setPhase("discovering");

				// Get installed packages
				const [formulas, casks] = await Promise.all([
					getInstalledFormulas(),
					getInstalledCasks(),
				]);

				const allDiscovered: DiscoveredPackage[] = [
					...formulas.map((name) => ({ name, type: "formula" as const })),
					...casks.map((name) => ({ name, type: "cask" as const })),
				];

				setDiscovered(allDiscovered);

				// Load existing config
				const config = loadConfig();
				const existingPackages = new Set(getPackageNames());
				const newPackages: string[] = [];

				// Add new packages
				for (const pkg of allDiscovered) {
					if (!existingPackages.has(pkg.name)) {
						config.packages = config.packages || {};
						config.packages[pkg.name] = {
							description: `${pkg.name} (auto-discovered)`,
							macos: {
								brew: pkg.name,
								...(pkg.type === "cask" ? { cask: true } : {}),
							},
						};
						newPackages.push(pkg.name);
					}
				}

				if (newPackages.length > 0) {
					saveConfig(config);
				}

				setAdded(newPackages);
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

	return (
		<Box flexDirection="column" padding={1}>
			<Header
				icon="💾"
				title="Backup"
				subtitle="Discover and save installed packages"
			/>

			{phase === "loading" && (
				<Box gap={1}>
					<Text color="cyan">
						<Spinner type="dots" />
					</Text>
					<Text>Initializing...</Text>
				</Box>
			)}

			{phase === "discovering" && (
				<Box gap={1}>
					<Text color="cyan">
						<Spinner type="dots" />
					</Text>
					<Text>Discovering installed packages...</Text>
				</Box>
			)}

			{phase === "done" && (
				<Box
					flexDirection="column"
					borderStyle="round"
					borderColor="green"
					paddingX={1}
					paddingY={1}
				>
					<Box gap={2} marginBottom={1}>
						<Text>Found:</Text>
						<Text color="cyan" bold>{discovered.filter((d) => d.type === "formula").length} formulas</Text>
						<Text color="magenta" bold>{discovered.filter((d) => d.type === "cask").length} casks</Text>
					</Box>

					{added.length > 0 ? (
						<Box flexDirection="column">
							<Text color="green" bold>
								✓ Added {added.length} new packages to config:
							</Text>
							<Box flexDirection="column" marginLeft={2}>
								{added.slice(0, 10).map((name) => (
									<Text key={name} dimColor>+ {name}</Text>
								))}
								{added.length > 10 && (
									<Text dimColor>... and {added.length - 10} more</Text>
								)}
							</Box>
							<Box marginTop={1}>
								<Text dimColor>
									Note: New packages are not added to any profile. Use 'dots add' to add them.
								</Text>
							</Box>
						</Box>
					) : (
						<Text color="green" bold>
							✓ All installed packages are already in config
						</Text>
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
