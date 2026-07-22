import * as vscode from 'vscode';
import { getConfig } from './config';
import { formatRem } from './core';
import { DIAGNOSTIC_CODE, DIAGNOSTIC_SOURCE } from './diagnostics';

export const CODE_ACTION_KINDS = [vscode.CodeActionKind.QuickFix, vscode.CodeActionKind.Source];

export class PxToRemCodeActionProvider implements vscode.CodeActionProvider {
	provideCodeActions(
		document: vscode.TextDocument,
		_range: vscode.Range | vscode.Selection,
		context: vscode.CodeActionContext
	): vscode.CodeAction[] {
		const relevantDiagnostics = context.diagnostics.filter(
			diagnostic => diagnostic.source === DIAGNOSTIC_SOURCE && diagnostic.code === DIAGNOSTIC_CODE
		);
		if (relevantDiagnostics.length === 0) {
			return [];
		}

		const config = getConfig(document.uri);
		const actions: vscode.CodeAction[] = [];

		for (const diagnostic of relevantDiagnostics) {
			const pxValue = parseFloat(document.getText(diagnostic.range));
			if (!Number.isFinite(pxValue)) {
				continue;
			}
			const remString = formatRem(pxValue, config.baseFontSize);
			const quickFix = new vscode.CodeAction(`Convert to ${remString}`, vscode.CodeActionKind.QuickFix);
			quickFix.edit = new vscode.WorkspaceEdit();
			quickFix.edit.replace(document.uri, diagnostic.range, remString);
			quickFix.diagnostics = [diagnostic];
			quickFix.isPreferred = true;
			actions.push(quickFix);
		}

		if (actions.length > 0) {
			const convertAll = new vscode.CodeAction(
				'Convert all px values to rem in this file',
				vscode.CodeActionKind.Source
			);
			convertAll.command = {
				command: 'no-px-in-css.convertAllInFile',
				title: 'Convert all px to rem in file',
				arguments: [document.uri],
			};
			actions.push(convertAll);
		}

		return actions;
	}
}
