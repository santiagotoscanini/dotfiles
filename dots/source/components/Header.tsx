import React from "react";
import { Box, Text } from "ink";

interface HeaderProps {
	icon: string;
	title: string;
	subtitle?: string;
}

export function Header({ icon, title, subtitle }: HeaderProps) {
	return (
		<Box marginBottom={1}>
			<Text bold color="cyan">
				{icon} {title}
			</Text>
			{subtitle && (
				<Text dimColor> {subtitle}</Text>
			)}
		</Box>
	);
}

interface SectionHeaderProps {
	title: string;
	count?: number;
	total?: number;
}

export function SectionHeader({ title, count, total }: SectionHeaderProps) {
	return (
		<Box marginTop={1} marginBottom={0}>
			<Text bold dimColor>
				{title}
			</Text>
			{count !== undefined && total !== undefined && (
				<Text dimColor> ({count}/{total})</Text>
			)}
		</Box>
	);
}
