import * as path from 'path';
import * as vscode from 'vscode';
import { CODE_ACTION_KINDS, PxToRemCodeActionProvider } from './codeActions';
import { CONFIG_SECTION, ExtensionConfig, getConfig, isSupportedDocument, isSupportedPath } from './config';
import { buildConversionEdits, convertAllInDocument, convertSingleValue } from './convert';
import { findPxValues } from './core';
import { DiagnosticManager } from './diagnostics';
import { PxLocation, scanDocument, scanWorkspace } from './scanner';
import { PxTreeDataProvider, PxValueNode } from './treeView';

const SUPPORTED_LANGUAGES = ['css', 'scss', 'sass', 'less', 'stylus', 'vue'];

export function activate(context: vscode.ExtensionContext): void {
	const diagnosticManager = new DiagnosticManager();
	const treeDataProvider = new PxTreeDataProvider();
	const treeView = vscode.window.createTreeView('pxValuesView', {
		treeDataProvider,
		showCollapseAll: true,
	});

	let hasScanned = false;
	async function runScan(showSummary: boolean): Promise<void> {
		hasScanned = true;
		const locations = await vscode.window.withProgress(
			{ location: vscode.ProgressLocation.Window, title: 'Scanning for px values…' },
			(_progress, token) => scanWorkspace(token)
		);
		treeDataProvider.setLocations(locations);
		if (showSummary) {
			vscode.window.showInformationMessage(`Found ${locations.length} px value${locations.length === 1 ? '' : 's'}`);
		}
	}

	function refreshAfterEdit(document: vscode.TextDocument): void {
		diagnosticManager.refresh(document);
		if (hasScanned) {
			treeDataProvider.updateFile(document.uri.fsPath, scanDocument(document));
		}
	}

	function resolveTreeSelection(item?: PxValueNode | PxLocation): PxLocation | undefined {
		if (item instanceof PxValueNode) {
			return item.location;
		}
		if (item && 'file' in item && 'text' in item) {
			return item;
		}
		const selected = treeView.selection[0];
		return selected instanceof PxValueNode ? selected.location : undefined;
	}

	function warnUnsupported(filePath: string, config: ExtensionConfig): void {
		vscode.window.showWarningMessage(
			`File type "${path.extname(filePath) || path.basename(filePath)}" is not supported. ` +
				`Supported types: ${config.fileExtensions.join(', ')}`
		);
	}

	const codeActionProvider = vscode.languages.registerCodeActionsProvider(
		SUPPORTED_LANGUAGES,
		new PxToRemCodeActionProvider(),
		{ providedCodeActionKinds: CODE_ACTION_KINDS }
	);

	const scanFilesCommand = vscode.commands.registerCommand('no-px-in-css.scanFiles', () => runScan(true));
	const refreshCommand = vscode.commands.registerCommand('no-px-in-css.refresh', () => runScan(false));

	const goToLocationCommand = vscode.commands.registerCommand(
		'no-px-in-css.goToLocation',
		async (item?: PxValueNode | PxLocation) => {
			const location = resolveTreeSelection(item);
			if (!location) {
				vscode.window.showErrorMessage('No px value selected');
				return;
			}
			const document = await vscode.workspace.openTextDocument(vscode.Uri.file(location.file));
			const editor = await vscode.window.showTextDocument(document);
			const position = new vscode.Position(location.line, location.index);
			editor.selection = new vscode.Selection(position, position);
			editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenterIfOutsideViewport);
		}
	);

	const convertToRemCommand = vscode.commands.registerCommand(
		'no-px-in-css.convertToRem',
		async (item?: PxValueNode | PxLocation) => {
			const location = resolveTreeSelection(item);
			if (!location) {
				vscode.window.showErrorMessage('No px value selected');
				return;
			}
			try {
				const converted = await convertSingleValue(location);
				if (!converted) {
					vscode.window.showWarningMessage(
						`${path.basename(location.file)} changed since the last scan — refreshing instead of converting.`
					);
				}
			} catch (error) {
				vscode.window.showErrorMessage(`Could not convert ${location.text}: ${errorMessage(error)}`);
				return;
			}
			refreshAfterEdit(await vscode.workspace.openTextDocument(vscode.Uri.file(location.file)));
		}
	);

	const convertAllInFileCommand = vscode.commands.registerCommand(
		'no-px-in-css.convertAllInFile',
		async (uri?: vscode.Uri) => {
			const targetUri = uri ?? vscode.window.activeTextEditor?.document.uri;
			if (!targetUri) {
				vscode.window.showErrorMessage('No file is currently open');
				return;
			}
			const config = getConfig(targetUri);
			if (!isSupportedPath(targetUri.fsPath, config)) {
				warnUnsupported(targetUri.fsPath, config);
				return;
			}
			try {
				const converted = await convertAllInDocument(targetUri);
				vscode.window.showInformationMessage(
					converted > 0
						? `Converted ${converted} px value${converted === 1 ? '' : 's'} to rem`
						: 'No px values found to convert'
				);
				refreshAfterEdit(await vscode.workspace.openTextDocument(targetUri));
			} catch (error) {
				vscode.window.showErrorMessage(`Could not convert px values: ${errorMessage(error)}`);
			}
		}
	);

	const convertAllInCurrentFileCommand = vscode.commands.registerCommand(
		'no-px-in-css.convertAllInCurrentFile',
		async () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showErrorMessage('No file is currently open');
				return;
			}
			const document = editor.document;
			const config = getConfig(document.uri);
			if (!isSupportedDocument(document, config)) {
				warnUnsupported(document.uri.fsPath, config);
				return;
			}
			const count = findPxValues(document.getText(), config).length;
			if (count === 0) {
				vscode.window.showInformationMessage('No px values found in this file');
				return;
			}
			const confirm = await vscode.window.showWarningMessage(
				`Convert ${count} px value${count === 1 ? '' : 's'} to rem in "${path.basename(document.fileName)}"?`,
				{ modal: true },
				'Convert'
			);
			if (confirm === 'Convert') {
				await vscode.commands.executeCommand('no-px-in-css.convertAllInFile', document.uri);
			}
		}
	);

	const openListener = vscode.workspace.onDidOpenTextDocument(document => diagnosticManager.refresh(document));
	const changeListener = vscode.workspace.onDidChangeTextDocument(event => diagnosticManager.schedule(event.document));
	const closeListener = vscode.workspace.onDidCloseTextDocument(document => diagnosticManager.clear(document.uri));

	// Convert px values right before the file is written when enabled. The
	// edits are handed to waitUntil so VS Code applies them as part of the
	// save itself (no dirty document afterwards).
	const willSaveListener = vscode.workspace.onWillSaveTextDocument(event => {
		const config = getConfig(event.document.uri);
		if (!config.autoConvertOnSave || !isSupportedDocument(event.document, config)) {
			return;
		}
		const edits = buildConversionEdits(event.document.getText(), config);
		if (edits.length > 0) {
			event.waitUntil(Promise.resolve(edits));
		}
	});

	const saveListener = vscode.workspace.onDidSaveTextDocument(document => {
		if (isSupportedDocument(document, getConfig(document.uri))) {
			refreshAfterEdit(document);
		}
	});

	const configListener = vscode.workspace.onDidChangeConfiguration(event => {
		if (!event.affectsConfiguration(CONFIG_SECTION)) {
			return;
		}
		diagnosticManager.refreshAllOpen();
		if (hasScanned) {
			void runScan(false);
		}
	});

	// Diagnostics for documents that are already open.
	diagnosticManager.refreshAllOpen();

	// The first workspace scan is deferred until the view is actually shown,
	// so activation stays cheap on large workspaces.
	if (treeView.visible) {
		void runScan(false);
	}
	const visibilityListener = treeView.onDidChangeVisibility(event => {
		if (event.visible && !hasScanned) {
			void runScan(false);
		}
	});

	context.subscriptions.push(
		treeView,
		diagnosticManager,
		codeActionProvider,
		scanFilesCommand,
		refreshCommand,
		goToLocationCommand,
		convertToRemCommand,
		convertAllInFileCommand,
		convertAllInCurrentFileCommand,
		openListener,
		changeListener,
		closeListener,
		willSaveListener,
		saveListener,
		configListener,
		visibilityListener
	);
}

export function deactivate(): void {}

function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
