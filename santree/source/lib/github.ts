import { execSync, exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface PRInfo {
	number: string;
	state: "OPEN" | "MERGED" | "CLOSED";
	url?: string;
}

export function getPRInfo(branchName: string): PRInfo | null {
	try {
		const output = execSync(
			`gh pr view "${branchName}" --json number,state,url`,
			{ encoding: "utf-8" },
		);
		const data = JSON.parse(output);
		return {
			number: String(data.number ?? ""),
			state: data.state ?? "OPEN",
			url: data.url,
		};
	} catch {
		return null;
	}
}

export async function getPRInfoAsync(
	branchName: string,
): Promise<PRInfo | null> {
	try {
		const { stdout } = await execAsync(
			`gh pr view "${branchName}" --json number,state,url`,
		);
		const data = JSON.parse(stdout);
		return {
			number: String(data.number ?? ""),
			state: data.state ?? "OPEN",
			url: data.url,
		};
	} catch {
		return null;
	}
}

export function ghCliAvailable(): boolean {
	try {
		execSync("which gh", { stdio: "ignore" });
		return true;
	} catch {
		return false;
	}
}

export function pushBranch(branchName: string, force = false): boolean {
	try {
		const forceFlag = force ? "--force-with-lease" : "";
		execSync(`git push -u origin "${branchName}" ${forceFlag}`.trim(), {
			stdio: "inherit",
		});
		return true;
	} catch {
		return false;
	}
}

export function createPR(
	title: string,
	baseBranch: string,
	headBranch: string,
	draft: boolean,
): number {
	try {
		const draftFlag = draft ? "--draft" : "";
		execSync(
			`gh pr create --title "${title}" --base "${baseBranch}" --head "${headBranch}" --web ${draftFlag}`.trim(),
			{ stdio: "inherit" },
		);
		return 0;
	} catch {
		return 1;
	}
}

export function getPRComments(prNumber: string): string {
	try {
		const output = execSync(
			`gh pr view ${prNumber} --json comments --jq '.comments[] | "- \\(.author.login): \\(.body)"'`,
			{ encoding: "utf-8" },
		);
		return output.trim();
	} catch {
		return "";
	}
}
