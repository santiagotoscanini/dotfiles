import React from "react";
import { Box, Text } from "ink";
import { z } from "zod";
import { Header } from "../components/Header.js";
import {
	loadConfig,
	getProfileNames,
	resolveProfile,
	getPackage,
	getPreInstall,
} from "../lib/config.js";

export const options = z.object({
	profile: z.string().optional().describe("Show details for a specific profile"),
	packages: z.boolean().default(false).describe("List all packages"),
	"pre-install": z.boolean().default(false).describe("List all pre-install tasks"),
});

type Props = {
	options: z.infer<typeof options>;
};

export default function List({ options }: Props) {
	const config = loadConfig();
	const profileNames = getProfileNames();

	// Show specific profile details
	if (options.profile) {
		const resolved = resolveProfile(options.profile);
		return (
			<Box flexDirection="column" padding={1}>
				<Header icon="📦" title={`Profile: ${options.profile}`} />

				<Box
					flexDirection="column"
					borderStyle="round"
					borderColor="cyan"
					paddingX={1}
					paddingY={1}
				>
					{/* Pre-install tasks */}
					{resolved.preInstall.length > 0 && (
						<Box flexDirection="column" marginBottom={1}>
							<Text bold color="yellow">Pre-install tasks ({resolved.preInstall.length})</Text>
							{resolved.preInstall.map((name) => {
								const task = getPreInstall(name);
								return (
									<Box key={name} gap={1}>
										<Text dimColor>├─</Text>
										<Text color="yellow">{name}</Text>
										{task?.description && <Text dimColor>{task.description}</Text>}
									</Box>
								);
							})}
						</Box>
					)}

					{/* Packages */}
					<Box flexDirection="column">
						<Text bold color="green">Packages ({resolved.packages.length})</Text>
						{resolved.packages.sort().map((name) => {
							const pkg = getPackage(name);
							const type = getPackageType(pkg);
							return (
								<Box key={name} gap={1}>
									<Text dimColor>├─</Text>
									<Text color="green">{name}</Text>
									<Text color="gray">[{type}]</Text>
									{pkg?.description && <Text dimColor>{pkg.description}</Text>}
								</Box>
							);
						})}
					</Box>
				</Box>
			</Box>
		);
	}

	// List all packages
	if (options.packages) {
		const packages = Object.entries(config.packages || {}).sort(([a], [b]) => a.localeCompare(b));
		return (
			<Box flexDirection="column" padding={1}>
				<Header icon="📦" title="All Packages" subtitle={`${packages.length} total`} />

				<Box
					flexDirection="column"
					borderStyle="round"
					borderColor="green"
					paddingX={1}
					paddingY={1}
				>
					{packages.map(([name, pkg]) => {
						const type = getPackageType(pkg);
						return (
							<Box key={name} gap={1}>
								<Text color="green">{name.padEnd(25)}</Text>
								<Text color="gray">[{type.padEnd(6)}]</Text>
								<Text dimColor>{pkg.description || ""}</Text>
							</Box>
						);
					})}
				</Box>
			</Box>
		);
	}

	// List all pre-install tasks
	if (options["pre-install"]) {
		const tasks = Object.entries(config["pre-install"] || {}).sort(([a], [b]) => a.localeCompare(b));
		return (
			<Box flexDirection="column" padding={1}>
				<Header icon="⚙️" title="Pre-install Tasks" subtitle={`${tasks.length} total`} />

				<Box
					flexDirection="column"
					borderStyle="round"
					borderColor="yellow"
					paddingX={1}
					paddingY={1}
				>
					{tasks.map(([name, task]) => {
						const provider = task.provider || "script";
						return (
							<Box key={name} gap={1}>
								<Text color="yellow">{name.padEnd(25)}</Text>
								<Text color="gray">[{provider.padEnd(9)}]</Text>
								<Text dimColor>{task.description || ""}</Text>
							</Box>
						);
					})}
				</Box>
			</Box>
		);
	}

	// Default: show all profiles with summary
	return (
		<Box flexDirection="column" padding={1}>
			<Header icon="📋" title="Profiles" subtitle={`${profileNames.length} available`} />

			{profileNames.map((name) => {
				const resolved = resolveProfile(name);
				const profile = config.profiles?.[name];
				const baseInfo = profile?.base
					? Array.isArray(profile.base)
						? profile.base.join(", ")
						: profile.base
					: null;

				return (
					<Box
						key={name}
						flexDirection="column"
						borderStyle="round"
						borderColor={name === "personal" ? "cyan" : name === "work" ? "magenta" : "gray"}
						paddingX={1}
						marginBottom={1}
					>
						<Box gap={2}>
							<Text bold color={name === "personal" ? "cyan" : name === "work" ? "magenta" : "white"}>
								{name}
							</Text>
							{baseInfo && (
								<Text dimColor>extends {baseInfo}</Text>
							)}
						</Box>

						<Box gap={2} marginTop={0}>
							<Text>
								<Text color="yellow">{resolved.preInstall.length}</Text>
								<Text dimColor> pre-install</Text>
							</Text>
							<Text>
								<Text color="green">{resolved.packages.length}</Text>
								<Text dimColor> packages</Text>
							</Text>
						</Box>

						{/* Show first few packages as preview */}
						<Box marginTop={0}>
							<Text dimColor>
								{resolved.packages.slice(0, 8).join(", ")}
								{resolved.packages.length > 8 && `, +${resolved.packages.length - 8} more`}
							</Text>
						</Box>
					</Box>
				);
			})}

			<Box marginTop={1}>
				<Text dimColor>
					Use --profile NAME for details, --packages for all packages, --pre-install for tasks
				</Text>
			</Box>
		</Box>
	);
}

function getPackageType(pkg: { macos?: Record<string, unknown> } | undefined): string {
	if (!pkg?.macos) return "?";
	if ("brew" in pkg.macos) {
		return pkg.macos.cask ? "cask" : "brew";
	}
	if ("mas" in pkg.macos) return "mas";
	if ("npm" in pkg.macos) return "npm";
	return "?";
}
