import * as vscode from 'vscode';
import { ExtensionConfig, getConfig } from './config';
import { formatRem, planConversions } from './core';
import { PxLocation } from './scanner';

export function buildConversionEdits(text: string, config: ExtensionConfig): vscode.TextEdit[] {
	return planConversions(text, config).map(replacement =>
		vscode.TextEdit.replace(
			new vscode.Range(
				replacement.line,
				replacement.index,
				replacement.line,
				replacement.index + replacement.text.length
			),
			replacement.replacement
		)
	);
}

/** Convert every px value of a file. Returns the number of converted values. */
export async function convertAllInDocument(uri: vscode.Uri): Promise<number> {
	const document = await vscode.workspace.openTextDocument(uri);
	const edits = buildConversionEdits(document.getText(), getConfig(uri));
	if (edits.length === 0) {
		return 0;
	}
	const workspaceEdit = new vscode.WorkspaceEdit();
	workspaceEdit.set(uri, edits);
	await vscode.workspace.applyEdit(workspaceEdit);
	return edits.length;
}

/**
 * Convert a single value found by a previous scan. Returns false when the
 * document no longer matches the scanned position (stale scan), in which
 * case nothing is modified.
 */
export async function convertSingleValue(location: PxLocation): Promise<boolean> {
	const uri = vscode.Uri.file(location.file);
	const document = await vscode.workspace.openTextDocument(uri);
	const range = new vscode.Range(location.line, location.index, location.line, location.index + location.text.length);
	if (document.lineCount <= location.line || document.getText(range) !== location.text) {
		return false;
	}
	const config = getConfig(uri);
	const workspaceEdit = new vscode.WorkspaceEdit();
	workspaceEdit.replace(uri, range, formatRem(location.value, config.baseFontSize));
	return vscode.workspace.applyEdit(workspaceEdit);
}
