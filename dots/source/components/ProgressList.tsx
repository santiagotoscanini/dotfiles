import React from "react";
import { Box, Text } from "ink";
import Spinner from "ink-spinner";
import type { ProgressItem, ItemStatus } from "../lib/types.js";
import { StatusBadge, getStatusColor } from "./StatusBadge.js";

interface ProgressListProps {
	items: ProgressItem[];
	maxVisible?: number;
}

export function ProgressList({ items, maxVisible = 10 }: ProgressListProps) {
	// Find the current in-progress item
	const inProgressIndex = items.findIndex((item) => item.state === "in_progress");

	// Calculate which items to show
	let startIndex = 0;
	let endIndex = items.length;

	if (items.length > maxVisible) {
		if (inProgressIndex >= 0) {
			// Show items around the in-progress item
			startIndex = Math.max(0, inProgressIndex - Math.floor(maxVisible / 2));
			endIndex = Math.min(items.length, startIndex + maxVisible);
			if (endIndex === items.length) {
				startIndex = Math.max(0, endIndex - maxVisible);
			}
		} else {
			// Show the last maxVisible items
			startIndex = items.length - maxVisible;
		}
	}

	const visibleItems = items.slice(startIndex, endIndex);
	const hiddenBefore = startIndex;
	const hiddenAfter = items.length - endIndex;

	return (
		<Box flexDirection="column">
			{hiddenBefore > 0 && (
				<Text dimColor>  ↑ {hiddenBefore} more items above</Text>
			)}
			{visibleItems.map((item, index) => (
				<Box key={startIndex + index} gap={1}>
					<Text dimColor>├─</Text>
					{item.state === "in_progress" ? (
						<Text color="cyan">
							<Spinner type="dots" />
						</Text>
					) : (
						<StatusBadge status={item.state} />
					)}
					<Text color={getStatusColor(item.state)} bold={item.state === "in_progress"}>
						{item.name}
					</Text>
					{item.message && (
						<Text dimColor>{item.message}</Text>
					)}
				</Box>
			))}
			{hiddenAfter > 0 && (
				<Text dimColor>  ↓ {hiddenAfter} more items below</Text>
			)}
		</Box>
	);
}

interface StatusListProps {
	items: ItemStatus[];
	showAll?: boolean;
}

export function StatusList({ items, showAll = false }: StatusListProps) {
	// Group by status if not showing all
	const installed = items.filter((i) => i.status === "installed");
	const notInstalled = items.filter((i) => i.status === "not_installed");
	const modified = items.filter((i) => i.status === "modified");
	const errors = items.filter((i) => i.status === "error");

	if (showAll) {
		return (
			<Box flexDirection="column">
				{items.map((item, index) => (
					<Box key={index} gap={1}>
						<Text dimColor>├─</Text>
						<StatusBadge status={item.status} />
						<Text color={getStatusColor(item.status)}>
							{item.name}
						</Text>
						{item.description && (
							<Text dimColor>{item.description}</Text>
						)}
						{item.message && item.status !== "installed" && (
							<Text dimColor>({item.message})</Text>
						)}
					</Box>
				))}
			</Box>
		);
	}

	return (
		<Box flexDirection="column">
			{/* Summary */}
			<Box gap={2} marginBottom={1}>
				<Text color="green">✓ {installed.length} installed</Text>
				{modified.length > 0 && (
					<Text color="yellow">⚠ {modified.length} modified</Text>
				)}
				{notInstalled.length > 0 && (
					<Text color="gray">○ {notInstalled.length} missing</Text>
				)}
				{errors.length > 0 && (
					<Text color="red">✗ {errors.length} errors</Text>
				)}
			</Box>

			{/* Show issues only */}
			{modified.length > 0 && (
				<Box flexDirection="column" marginTop={1}>
					<Text bold color="yellow">Modified:</Text>
					{modified.map((item, index) => (
						<Box key={index} gap={1}>
							<Text dimColor>├─</Text>
							<Text color="yellow">{item.name}</Text>
							<Text dimColor>{item.message}</Text>
						</Box>
					))}
				</Box>
			)}

			{notInstalled.length > 0 && (
				<Box flexDirection="column" marginTop={1}>
					<Text bold color="gray">Not Installed:</Text>
					{notInstalled.slice(0, 10).map((item, index) => (
						<Box key={index} gap={1}>
							<Text dimColor>├─</Text>
							<Text>{item.name}</Text>
							{item.description && <Text dimColor>{item.description}</Text>}
						</Box>
					))}
					{notInstalled.length > 10 && (
						<Text dimColor>  ... and {notInstalled.length - 10} more</Text>
					)}
				</Box>
			)}

			{errors.length > 0 && (
				<Box flexDirection="column" marginTop={1}>
					<Text bold color="red">Errors:</Text>
					{errors.map((item, index) => (
						<Box key={index} gap={1}>
							<Text dimColor>├─</Text>
							<Text color="red">{item.name}</Text>
							<Text dimColor>{item.message}</Text>
						</Box>
					))}
				</Box>
			)}
		</Box>
	);
}
