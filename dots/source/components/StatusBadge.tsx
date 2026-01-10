import React from "react";
import { Text } from "ink";
import type { Status, ProgressState } from "../lib/types.js";

interface StatusBadgeProps {
	status: Status | ProgressState;
}

export function StatusBadge({ status }: StatusBadgeProps) {
	switch (status) {
		case "installed":
		case "done":
			return <Text color="green">✓</Text>;
		case "not_installed":
		case "pending":
			return <Text color="gray">○</Text>;
		case "modified":
			return <Text color="yellow">⚠</Text>;
		case "error":
			return <Text color="red">✗</Text>;
		case "in_progress":
			return <Text color="cyan">⋯</Text>;
		default:
			return <Text color="gray">?</Text>;
	}
}

export function getStatusColor(status: Status | ProgressState): string {
	switch (status) {
		case "installed":
		case "done":
			return "green";
		case "not_installed":
		case "pending":
			return "gray";
		case "modified":
			return "yellow";
		case "error":
			return "red";
		case "in_progress":
			return "cyan";
		default:
			return "gray";
	}
}

export function getBorderColor(status: Status | ProgressState): string {
	switch (status) {
		case "installed":
		case "done":
			return "green";
		case "not_installed":
		case "pending":
			return "gray";
		case "modified":
			return "yellow";
		case "error":
			return "red";
		case "in_progress":
			return "blue";
		default:
			return "gray";
	}
}
