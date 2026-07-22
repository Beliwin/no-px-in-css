import * as vscode from 'vscode';
import { getConfig, isSupportedDocument } from './config';
import { findPxValues, formatRem } from './core';

export const DIAGNOSTIC_SOURCE = 'noPxInCss';
export const DIAGNOSTIC_CODE = 'px-to-rem';

const REFRESH_DELAY_MS = 300;

export class DiagnosticManager implements vscode.Disposable {
	private readonly collection = vscode.languages.createDiagnosticCollection(DIAGNOSTIC_SOURCE);
	private readonly pending = new Map<string, NodeJS.Timeout>();

	/** Debounced refresh, used while the user is typing. */
	schedule(document: vscode.TextDocument): void {
		const key = document.uri.toString();
		const timer = this.pending.get(key);
		if (timer !== undefined) {
			clearTimeout(timer);
		}
		this.pending.set(
			key,
			setTimeout(() => {
				this.pending.delete(key);
				this.refresh(document);
			}, REFRESH_DELAY_MS)
		);
	}

	refresh(document: vscode.TextDocument): void {
		const config = getConfig(document.uri);
		if (!config.enableInlineDiagnostics || !isSupportedDocument(document, config)) {
			this.collection.delete(document.uri);
			return;
		}

		const diagnostics = findPxValues(document.getText(), config).map(match => {
			const range = new vscode.Range(match.line, match.index, match.line, match.index + match.text.length);
			const diagnostic = new vscode.Diagnostic(
				range,
				`Consider using ${formatRem(match.value, config.baseFontSize)} instead of ${match.text}.`,
				config.diagnosticSeverity
			);
			diagnostic.source = DIAGNOSTIC_SOURCE;
			diagnostic.code = DIAGNOSTIC_CODE;
			return diagnostic;
		});
		this.collection.set(document.uri, diagnostics);
	}

	refreshAllOpen(): void {
		for (const document of vscode.workspace.textDocuments) {
			this.refresh(document);
		}
	}

	clear(uri: vscode.Uri): void {
		this.collection.delete(uri);
	}

	dispose(): void {
		for (const timer of this.pending.values()) {
			clearTimeout(timer);
		}
		this.pending.clear();
		this.collection.dispose();
	}
}
