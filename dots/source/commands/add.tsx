import React, { useState } from "react";
import { Box, Text, useApp, useInput } from "ink";
import TextInput from "ink-text-input";
import SelectInput from "ink-select-input";
import { z } from "zod";
import { Header } from "../components/Header.js";
import {
	getPackage,
	getProfileNames,
	addPackage,
	addPackageToProfile,
} from "../lib/config.js";
import type { Package } from "../lib/types.js";

export const args = z.tuple([
	z.string().optional().describe("Package name to add"),
]);

type Props = {
	args: z.infer<typeof args>;
};

type Step = "name" | "type" | "profile" | "description" | "confirm" | "done" | "error";

type PackageType = "brew" | "cask" | "mas" | "npm";

const PACKAGE_TYPES: Array<{ label: string; value: PackageType }> = [
	{ label: "Homebrew Formula", value: "brew" },
	{ label: "Homebrew Cask", value: "cask" },
	{ label: "Mac App Store", value: "mas" },
	{ label: "NPM Global Package", value: "npm" },
];

export default function Add({ args }: Props) {
	const { exit } = useApp();
	const [step, setStep] = useState<Step>(args[0] ? "type" : "name");
	const [name, setName] = useState(args[0] || "");
	const [packageType, setPackageType] = useState<PackageType>("brew");
	const [profile, setProfile] = useState<string>("");
	const [description, setDescription] = useState("");
	const [masId, setMasId] = useState("");
	const [errorMessage, setErrorMessage] = useState("");

	const profileNames = getProfileNames();
	const profileItems = profileNames.map((p) => ({ label: p, value: p }));

	useInput((input, key) => {
		if (key.escape) {
			exit();
		}
	});

	function handleNameSubmit(value: string) {
		if (!value.trim()) {
			setErrorMessage("Package name is required");
			setStep("error");
			setTimeout(() => exit(), 100);
			return;
		}

		// Check if package already exists
		if (getPackage(value.trim())) {
			setStep("profile");
			setName(value.trim());
			return;
		}

		setName(value.trim());
		setStep("type");
	}

	function handleTypeSelect(item: { value: PackageType }) {
		setPackageType(item.value);
		if (item.value === "mas") {
			setStep("description"); // Will prompt for MAS ID
		} else {
			setStep("profile");
		}
	}

	function handleProfileSelect(item: { value: string }) {
		setProfile(item.value);
		setStep("description");
	}

	function handleDescriptionSubmit(value: string) {
		setDescription(value.trim() || `${name} package`);

		// If MAS, we need the app ID
		if (packageType === "mas" && !masId) {
			// Already have profile, need MAS ID
			setStep("confirm");
			return;
		}

		setStep("confirm");
	}

	function handleMasIdSubmit(value: string) {
		const id = parseInt(value.trim(), 10);
		if (isNaN(id)) {
			setErrorMessage("Invalid MAS ID - must be a number");
			setStep("error");
			setTimeout(() => exit(), 100);
			return;
		}
		setMasId(value.trim());
		setStep("profile");
	}

	function handleConfirm() {
		try {
			// Build package config
			const pkg: Package = {
				description,
				macos: buildMacOSConfig(),
			};

			// Check if package already exists
			const existing = getPackage(name);
			if (!existing) {
				addPackage(name, pkg);
			}

			// Add to profile
			if (profile) {
				addPackageToProfile(name, profile);
			}

			setStep("done");
			setTimeout(() => exit(), 100);
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : "Unknown error");
			setStep("error");
			setTimeout(() => exit(), 100);
		}
	}

	function buildMacOSConfig() {
		switch (packageType) {
			case "brew":
				return { brew: name };
			case "cask":
				return { brew: name, cask: true };
			case "mas":
				return { mas: parseInt(masId, 10) };
			case "npm":
				return { npm: name };
		}
	}

	return (
		<Box flexDirection="column" padding={1}>
			<Header icon="➕" title="Add Package" />

			{step === "name" && (
				<Box flexDirection="column">
					<Text>Package name:</Text>
					<Box>
						<Text color="cyan" bold>{">"} </Text>
						<TextInput value={name} onChange={setName} onSubmit={handleNameSubmit} />
					</Box>
				</Box>
			)}

			{step === "type" && (
				<Box flexDirection="column">
					<Text>Package type for <Text color="cyan" bold>{name}</Text>:</Text>
					<SelectInput items={PACKAGE_TYPES} onSelect={handleTypeSelect} />
				</Box>
			)}

			{step === "profile" && packageType === "mas" && !masId && (
				<Box flexDirection="column">
					<Text>Mac App Store ID for <Text color="cyan" bold>{name}</Text>:</Text>
					<Box>
						<Text color="cyan" bold>{">"} </Text>
						<TextInput value={masId} onChange={setMasId} onSubmit={handleMasIdSubmit} />
					</Box>
					<Text dimColor>Find the ID in the App Store URL: apps.apple.com/app/id123456789</Text>
				</Box>
			)}

			{step === "profile" && (packageType !== "mas" || masId) && (
				<Box flexDirection="column">
					<Text>Add <Text color="cyan" bold>{name}</Text> to profile:</Text>
					<SelectInput items={profileItems} onSelect={handleProfileSelect} />
				</Box>
			)}

			{step === "description" && (
				<Box flexDirection="column">
					<Text>Description (optional):</Text>
					<Box>
						<Text color="cyan" bold>{">"} </Text>
						<TextInput
							value={description}
							onChange={setDescription}
							onSubmit={handleDescriptionSubmit}
							placeholder={`${name} package`}
						/>
					</Box>
				</Box>
			)}

			{step === "confirm" && (
				<Box flexDirection="column">
					<Box
						flexDirection="column"
						borderStyle="round"
						borderColor="blue"
						paddingX={1}
						paddingY={1}
					>
						<Text bold>Summary:</Text>
						<Box gap={1}>
							<Text dimColor>Name:</Text>
							<Text color="cyan" bold>{name}</Text>
						</Box>
						<Box gap={1}>
							<Text dimColor>Type:</Text>
							<Text>{PACKAGE_TYPES.find((t) => t.value === packageType)?.label}</Text>
						</Box>
						<Box gap={1}>
							<Text dimColor>Profile:</Text>
							<Text color="magenta">{profile}</Text>
						</Box>
						<Box gap={1}>
							<Text dimColor>Description:</Text>
							<Text>{description}</Text>
						</Box>
						{packageType === "mas" && (
							<Box gap={1}>
								<Text dimColor>MAS ID:</Text>
								<Text>{masId}</Text>
							</Box>
						)}
					</Box>
					<Box marginTop={1}>
						<Text>Press </Text>
						<Text color="green" bold>Enter</Text>
						<Text> to confirm or </Text>
						<Text color="red" bold>Esc</Text>
						<Text> to cancel</Text>
					</Box>
					<TextInput value="" onChange={() => {}} onSubmit={handleConfirm} />
				</Box>
			)}

			{step === "done" && (
				<Box marginTop={1}>
					<Text color="green" bold>
						✓ Added {name} to {profile} profile
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
