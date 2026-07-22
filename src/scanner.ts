import { TextDecoder } from 'util';
import * as vscode from 'vscode';
import { getConfig } from './config';
import { findPxValues, PxMatch } from './core';

export interface PxLocation extends PxMatch {
	/** Absolute file system path. */
	file: string;
	/** Trimmed source line, for display purposes. */
	context: string;
}

export async function scanWorkspace(token?: vscode.CancellationToken): Promise<PxLocation[]> {
	const config = getConfig();
	if (config.fileExtensions.length === 0 || !vscode.workspace.workspaceFolders?.length) {
		return [];
	}

	const include =
		config.fileExtensions.length === 1
			? `**/*.${config.fileExtensions[0]}`
			: `**/*.{${config.fileExtensions.join(',')}}`;
	const exclude = config.ignorePatterns.length > 0 ? `{${config.ignorePatterns.join(',')}}` : undefined;
	const files = await vscode.workspace.findFiles(include, exclude, undefined, token);

	const decoder = new TextDecoder();
	const locations: PxLocation[] = [];

	for (const file of files) {
		if (token?.isCancellationRequested) {
			break;
		}
		const text = await readFileText(file, decoder);
		if (text === undefined) {
			continue;
		}
		const lines = text.split('\n');
		for (const match of findPxValues(text, config)) {
			locations.push({ ...match, file: file.fsPath, context: lines[match.line].trim() });
		}
	}
	return locations;
}

/** Scan a single (possibly unsaved) document, e.g. to refresh the tree after an edit. */
export function scanDocument(document: vscode.TextDocument): PxLocation[] {
	const config = getConfig(document.uri);
	const text = document.getText();
	const lines = text.split('\n');
	return findPxValues(text, config).map(match => ({
		...match,
		file: document.uri.fsPath,
		context: lines[match.line].trim(),
	}));
}

async function readFileText(file: vscode.Uri, decoder: TextDecoder): Promise<string | undefined> {
	// Prefer the in-memory version of files that are open (possibly unsaved).
	const open = vscode.workspace.textDocuments.find(document => document.uri.toString() === file.toString());
	if (open) {
		return open.getText();
	}
	try {
		return decoder.decode(await vscode.workspace.fs.readFile(file));
	} catch (error) {
		console.error(`no-px-in-css: could not read ${file.fsPath}`, error);
		return undefined;
	}
}
