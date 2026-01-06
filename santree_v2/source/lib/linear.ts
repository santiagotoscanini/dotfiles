import * as fs from "fs";
import * as path from "path";
import { getSantreeDir } from "./git.js";

const GRAPHQL_URL = "https://api.linear.app/graphql";

export interface LinearConfig {
	linear_api_key?: string;
}

export function loadLinearConfig(repoRoot: string): string | null {
	const santreeDir = getSantreeDir(repoRoot);
	const configFile = path.join(santreeDir, "config.json");

	if (!fs.existsSync(configFile)) {
		return null;
	}

	try {
		const config: LinearConfig = JSON.parse(
			fs.readFileSync(configFile, "utf-8"),
		);
		return config.linear_api_key ?? null;
	} catch {
		return null;
	}
}

export async function getIssueTitle(
	apiKey: string,
	identifier: string,
): Promise<string | null> {
	const query = `
		query GetIssue($id: String!) {
			issue(id: $id) {
				title
			}
		}
	`;

	try {
		const response = await fetch(GRAPHQL_URL, {
			method: "POST",
			headers: {
				Authorization: apiKey,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				query,
				variables: { id: identifier },
			}),
		});

		if (!response.ok) {
			return null;
		}

		const result = await response.json();
		return result?.data?.issue?.title ?? null;
	} catch {
		return null;
	}
}
