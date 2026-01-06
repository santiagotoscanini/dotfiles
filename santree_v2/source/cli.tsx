#!/usr/bin/env node
import Pastel from "pastel";

const app = new Pastel({
	importMeta: import.meta,
	name: "santree",
	version: "2.0.0",
	description: "Git worktree manager with Linear integration",
});

await app.run();
