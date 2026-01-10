import React, { useState, useEffect } from "react";
import { Box, Text, useApp } from "ink";
import Spinner from "ink-spinner";
import { z } from "zod";
import { Header, SectionHeader } from "../components/Header.js";
import { ProgressList } from "../components/ProgressList.js";
import type { ProgressItem } from "../lib/types.js";
import { resolveProfile, getProfileNames } from "../lib/config.js";
import { installProfile } from "../lib/runner.js";

export const options = z.object({
	profile: z.string().default("personal").describe("Profile to install"),
	"dry-run": z.boolean().default(false).describe("Show what would be installed without making changes"),
});

type Props = {
	options: z.infer<typeof options>;
};

type Phase = "loading" | "pre-install" | "packages" | "done" | "error";

export default function Install({ options }: Props) {
	const { exit } = useApp();
	const [phase, setPhase] = useState<Phase>("loading");
	const [preInstallItems, setPreInstallItems] = useState<ProgressItem[]>([]);
	const [packageItems, setPackageItems] = useState<ProgressItem[]>([]);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [success, setSuccess] = useState(false);

	const profileName = options.profile;
	const dryRun = options["dry-run"];

	useEffect(() => {
		async function run() {
			// Small delay to allow UI to render
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

				// Initialize progress items
				const preInstall: ProgressItem[] = profile.preInstall.map((name) => ({
					name,
					state: "pending",
				}));
				const packages: ProgressItem[] = profile.packages.sort().map((name) => ({
					name,
					state: "pending",
				}));

				setPreInstallItems(preInstall);
				setPackageItems(packages);
				setPhase("pre-install");

				// Run installation with progress callback
				const result = await installProfile(profileName, dryRun, (item) => {
					// Update the appropriate list
					const isPreInstall = profile.preInstall.includes(item.name);
					if (isPreInstall) {
						setPreInstallItems((prev) =>
							prev.map((p) => (p.name === item.name ? item : p))
						);
					} else {
						setPackageItems((prev) =>
							prev.map((p) => (p.name === item.name ? item : p))
						);
					}

					// Update phase based on what's being processed
					if (isPreInstall) {
						setPhase("pre-install");
					} else {
						setPhase("packages");
					}
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
	}, [profileName, dryRun, exit]);

	const completedPreInstall = preInstallItems.filter((i) => i.state === "done").length;
	const completedPackages = packageItems.filter((i) => i.state === "done").length;

	return (
		<Box flexDirection="column" padding={1}>
			<Header
				icon={dryRun ? "🔍" : "🔧"}
				title={dryRun ? "Dry Run" : "Installing"}
				subtitle={`profile: ${profileName}`}
			/>

			{phase === "loading" && (
				<Box gap={1}>
					<Text color="cyan">
						<Spinner type="dots" />
					</Text>
					<Text>Loading profile...</Text>
				</Box>
			)}

			{(phase === "pre-install" || phase === "packages" || phase === "done") && (
				<Box
					flexDirection="column"
					borderStyle="round"
					borderColor={phase === "done" ? (success ? "green" : "red") : "blue"}
					paddingX={1}
				>
					{preInstallItems.length > 0 && (
						<>
							<SectionHeader
								title="Pre-install tasks"
								count={completedPreInstall}
								total={preInstallItems.length}
							/>
							<ProgressList items={preInstallItems} maxVisible={5} />
						</>
					)}

					{packageItems.length > 0 && (
						<>
							<SectionHeader
								title="Packages"
								count={completedPackages}
								total={packageItems.length}
							/>
							<ProgressList items={packageItems} maxVisible={8} />
						</>
					)}
				</Box>
			)}

			{phase === "done" && (
				<Box marginTop={1}>
					{success ? (
						<Text color="green" bold>
							✓ {dryRun ? "Dry run complete" : "Installation complete"}
						</Text>
					) : (
						<Text color="red" bold>
							✗ Installation completed with errors
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
