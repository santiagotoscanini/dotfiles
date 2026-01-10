import React, { useState, useEffect } from "react";
import { Box, Text, useApp, useInput } from "ink";
import Spinner from "ink-spinner";
import { z } from "zod";
import { Header, SectionHeader } from "../components/Header.js";
import { ProgressList } from "../components/ProgressList.js";
import type { ProgressItem } from "../lib/types.js";
import { resolveProfile, getProfileNames } from "../lib/config.js";
import { uninstallProfile } from "../lib/runner.js";

export const options = z.object({
	profile: z.string().default("personal").describe("Profile to uninstall"),
	"dry-run": z.boolean().default(false).describe("Show what would be uninstalled without making changes"),
	yes: z.boolean().default(false).describe("Skip confirmation prompt"),
});

type Props = {
	options: z.infer<typeof options>;
};

type Phase = "confirm" | "loading" | "uninstalling" | "done" | "error" | "cancelled";

export default function Uninstall({ options }: Props) {
	const { exit } = useApp();
	const [phase, setPhase] = useState<Phase>(options.yes || options["dry-run"] ? "loading" : "confirm");
	const [items, setItems] = useState<ProgressItem[]>([]);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [success, setSuccess] = useState(false);

	const profileName = options.profile;
	const dryRun = options["dry-run"];

	useInput((input, key) => {
		if (phase === "confirm") {
			if (input.toLowerCase() === "y") {
				setPhase("loading");
			} else if (input.toLowerCase() === "n" || key.escape) {
				setPhase("cancelled");
				setTimeout(() => exit(), 100);
			}
		}
	});

	useEffect(() => {
		if (phase !== "loading") return;

		async function run() {
			await new Promise((r) => setTimeout(r, 100));

			try {
				// Validate profile exists
				const profileNames = getProfileNames();
				if (!profileNames.includes(profileName)) {
					setErrorMessage(`Profile '${profileName}' not found. Available: ${profileNames.join(", ")}`);
					setPhase("error");
					setTimeout(() => exit(), 100);
					return;
				}

				// Get profile items
				const profile = resolveProfile(profileName);

				// Initialize progress items (packages in reverse order)
				const allItems: ProgressItem[] = [
					...profile.packages.sort().reverse().map((name) => ({
						name,
						state: "pending" as const,
					})),
				];

				setItems(allItems);
				setPhase("uninstalling");

				// Run uninstallation with progress callback
				const result = await uninstallProfile(profileName, dryRun, (item) => {
					setItems((prev) =>
						prev.map((p) => (p.name === item.name ? item : p))
					);
				});

				setSuccess(result);
				setPhase("done");
				setTimeout(() => exit(), 100);
			} catch (error) {
				setErrorMessage(error instanceof Error ? error.message : "Unknown error");
				setPhase("error");
				setTimeout(() => exit(), 100);
			}
		}

		run();
	}, [phase, profileName, dryRun, exit]);

	const completed = items.filter((i) => i.state === "done").length;

	return (
		<Box flexDirection="column" padding={1}>
			<Header
				icon={dryRun ? "🔍" : "🗑️"}
				title={dryRun ? "Dry Run (Uninstall)" : "Uninstalling"}
				subtitle={`profile: ${profileName}`}
			/>

			{phase === "confirm" && (
				<Box flexDirection="column">
					<Text color="yellow" bold>
						⚠ This will uninstall all packages from the '{profileName}' profile.
					</Text>
					<Box marginTop={1}>
						<Text>Continue? </Text>
						<Text bold color="cyan">[y/N]</Text>
					</Box>
				</Box>
			)}

			{phase === "cancelled" && (
				<Text dimColor>Cancelled.</Text>
			)}

			{phase === "loading" && (
				<Box gap={1}>
					<Text color="cyan">
						<Spinner type="dots" />
					</Text>
					<Text>Loading profile...</Text>
				</Box>
			)}

			{(phase === "uninstalling" || phase === "done") && items.length > 0 && (
				<Box
					flexDirection="column"
					borderStyle="round"
					borderColor={phase === "done" ? (success ? "green" : "red") : "blue"}
					paddingX={1}
				>
					<SectionHeader
						title="Packages"
						count={completed}
						total={items.length}
					/>
					<ProgressList items={items} maxVisible={10} />
				</Box>
			)}

			{phase === "done" && (
				<Box marginTop={1}>
					{success ? (
						<Text color="green" bold>
							✓ {dryRun ? "Dry run complete" : "Uninstallation complete"}
						</Text>
					) : (
						<Text color="red" bold>
							✗ Uninstallation completed with errors
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
