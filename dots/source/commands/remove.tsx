import React, { useState } from "react";
import { Box, Text, useApp, useInput } from "ink";
import SelectInput from "ink-select-input";
import { z } from "zod";
import { Header } from "../components/Header.js";
import {
	getPackage,
	getPackageNames,
	removePackage,
	removePackageFromProfile,
	getProfileNames,
	resolveProfile,
} from "../lib/config.js";

export const args = z.tuple([
	z.string().optional().describe("Package name to remove"),
]);

export const options = z.object({
	"from-profile": z.string().optional().describe("Only remove from this profile, keep package definition"),
});

type Props = {
	args: z.infer<typeof args>;
	options: z.infer<typeof options>;
};

type Step = "select" | "confirm" | "done" | "error";

export default function Remove({ args, options }: Props) {
	const { exit } = useApp();
	const [step, setStep] = useState<Step>(args[0] ? "confirm" : "select");
	const [name, setName] = useState(args[0] || "");
	const [errorMessage, setErrorMessage] = useState("");

	const fromProfile = options["from-profile"];
	const packageNames = getPackageNames();

	// If removing from profile, only show packages in that profile
	let selectablePackages = packageNames;
	if (fromProfile) {
		try {
			const resolved = resolveProfile(fromProfile);
			selectablePackages = resolved.packages;
		} catch {
			// Profile doesn't exist
		}
	}

	const packageItems = selectablePackages.map((p) => {
		const pkg = getPackage(p);
		return {
			label: `${p}${pkg?.description ? ` - ${pkg.description}` : ""}`,
			value: p,
		};
	});

	useInput((input, key) => {
		if (key.escape) {
			exit();
		}
		if (step === "confirm") {
			if (input.toLowerCase() === "y") {
				handleRemove();
			} else if (input.toLowerCase() === "n") {
				exit();
			}
		}
	});

	function handleSelect(item: { value: string }) {
		setName(item.value);
		setStep("confirm");
	}

	function handleRemove() {
		try {
			if (fromProfile) {
				// Only remove from profile
				const success = removePackageFromProfile(name, fromProfile);
				if (!success) {
					setErrorMessage(`Package ${name} not found in profile ${fromProfile}`);
					setStep("error");
					setTimeout(() => exit(), 100);
					return;
				}
			} else {
				// Remove package entirely
				const success = removePackage(name);
				if (!success) {
					setErrorMessage(`Package ${name} not found`);
					setStep("error");
					setTimeout(() => exit(), 100);
					return;
				}
			}

			setStep("done");
			setTimeout(() => exit(), 100);
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : "Unknown error");
			setStep("error");
			setTimeout(() => exit(), 100);
		}
	}

	// Find which profiles contain this package
	function getPackageProfiles(pkgName: string): string[] {
		const profiles: string[] = [];
		for (const profileName of getProfileNames()) {
			try {
				const resolved = resolveProfile(profileName);
				if (resolved.packages.includes(pkgName)) {
					profiles.push(profileName);
				}
			} catch {
				// Skip
			}
		}
		return profiles;
	}

	const pkg = getPackage(name);
	const inProfiles = name ? getPackageProfiles(name) : [];

	return (
		<Box flexDirection="column" padding={1}>
			<Header
				icon="🗑️"
				title="Remove Package"
				subtitle={fromProfile ? `from ${fromProfile}` : undefined}
			/>

			{step === "select" && (
				<Box flexDirection="column">
					<Text>Select package to remove:</Text>
					{packageItems.length > 0 ? (
						<SelectInput items={packageItems} onSelect={handleSelect} limit={15} />
					) : (
						<Text color="yellow">No packages found</Text>
					)}
				</Box>
			)}

			{step === "confirm" && (
				<Box flexDirection="column">
					<Box
						flexDirection="column"
						borderStyle="round"
						borderColor="red"
						paddingX={1}
						paddingY={1}
					>
						<Text bold color="red">
							{fromProfile
								? `Remove ${name} from ${fromProfile}?`
								: `Remove ${name} entirely?`}
						</Text>
						{pkg?.description && (
							<Box gap={1}>
								<Text dimColor>Description:</Text>
								<Text>{pkg.description}</Text>
							</Box>
						)}
						{!fromProfile && inProfiles.length > 0 && (
							<Box gap={1}>
								<Text dimColor>In profiles:</Text>
								<Text color="magenta">{inProfiles.join(", ")}</Text>
							</Box>
						)}
						{!fromProfile && (
							<Box marginTop={1}>
								<Text color="yellow">
									⚠ This will remove the package from all profiles and the config
								</Text>
							</Box>
						)}
					</Box>
					<Box marginTop={1}>
						<Text>Confirm? </Text>
						<Text bold color="cyan">[y/N]</Text>
					</Box>
				</Box>
			)}

			{step === "done" && (
				<Box marginTop={1}>
					<Text color="green" bold>
						✓ Removed {name}{fromProfile ? ` from ${fromProfile}` : ""}
					</Text>
				</Box>
			)}

			{step === "error" && (
				<Box marginTop={1}>
					<Text color="red" bold>
						✗ Error: {errorMessage}
					</Text>
				</Box>
			)}
		</Box>
	);
}
