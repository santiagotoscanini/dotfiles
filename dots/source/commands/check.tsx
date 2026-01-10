import React, { useState, useEffect } from "react";
import { Box, Text, useApp } from "ink";
import Spinner from "ink-spinner";
import { z } from "zod";
import { Header } from "../components/Header.js";
import { StatusList } from "../components/ProgressList.js";
import type { ItemStatus } from "../lib/types.js";
import { getProfileNames } from "../lib/config.js";
import { checkProfileParallel } from "../lib/runner.js";

export const options = z.object({
	profile: z.string().default("personal").describe("Profile to check"),
	all: z.boolean().default(false).describe("Show all items, not just issues"),
});

type Props = {
	options: z.infer<typeof options>;
};

type Phase = "loading" | "done" | "error";

export default function Check({ options }: Props) {
	const { exit } = useApp();
	const [phase, setPhase] = useState<Phase>("loading");
	const [items, setItems] = useState<ItemStatus[]>([]);
	const [errorMessage, setErrorMessage] = useState<string>("");

	const profileName = options.profile;
	const showAll = options.all;

	useEffect(() => {
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

				// Check all items in parallel
				const results = await checkProfileParallel(profileName);
				setItems(results);
				setPhase("done");
				setTimeout(() => exit(), 100);
			} catch (error) {
				setErrorMessage(error instanceof Error ? error.message : "Unknown error");
				setPhase("error");
				setTimeout(() => exit(), 100);
			}
		}

		run();
	}, [profileName, exit]);

	return (
		<Box flexDirection="column" padding={1}>
			<Header
				icon="📋"
				title="System Status"
				subtitle={`profile: ${profileName}`}
			/>

			{phase === "loading" && (
				<Box gap={1}>
					<Text color="cyan">
						<Spinner type="dots" />
					</Text>
					<Text>Checking installation status...</Text>
				</Box>
			)}

			{phase === "done" && (
				<Box
					flexDirection="column"
					borderStyle="round"
					borderColor="blue"
					paddingX={1}
					paddingY={1}
				>
					<StatusList items={items} showAll={showAll} />
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
