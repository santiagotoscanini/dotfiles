#!/usr/bin/env node
import Pastel from "pastel";

const app = new Pastel({
	importMeta: import.meta,
	name: "dots",
	version: "1.0.0",
	description: "Beautiful dotfile manager for macOS",
});

await app.run();
