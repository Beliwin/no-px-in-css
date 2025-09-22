// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// Constants
const EXTENSION_ID = 'noPxInCss';
const DIAGNOSTIC_CODE = 'px-to-rem';
const DEFAULT_BASE_FONT_SIZE = 16;

interface PxValue {
	value: string;
	file: string;
	line: number;
	column: number;
	context: string;
}

// Diagnostic manager for inline px warnings
class PxDiagnosticManager {
	private diagnosticCollection: vscode.DiagnosticCollection;

	constructor() {
		this.diagnosticCollection = vscode.languages.createDiagnosticCollection(EXTENSION_ID);
	}

	async updateDiagnostics(document: vscode.TextDocument): Promise<void> {
		const enableInlineDiagnostics = ConfigManager.getEnableInlineDiagnostics();
		const fileExtensions = ConfigManager.getFileExtensions();
		const ignoreThreshold = ConfigManager.getIgnoreThreshold();
		const severityString = ConfigManager.getDiagnosticSeverity();

		// Clear diagnostics if disabled or file type not supported
		if (!enableInlineDiagnostics || !this.isSupportedFile(document, fileExtensions)) {
			this.diagnosticCollection.delete(document.uri);
			return;
		}

		const diagnostics: vscode.Diagnostic[] = [];
		const text = document.getText();
		const lines = text.split('\n');

		const severity = this.getSeverityFromString(severityString);

		for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
			const line = lines[lineIndex];
			let match;
			
			// Reset regex for each line
			const regex = new RegExp(ConversionUtils.PX_REGEX.source, 'g');
			
			while ((match = regex.exec(line)) !== null) {
				const value = match[1];
				const numericValue = ConversionUtils.extractNumericValue(value);
				
				// Skip values below or equal to threshold
				if (ConversionUtils.shouldIgnore(numericValue, ignoreThreshold)) {
					continue;
				}

				const startPos = new vscode.Position(lineIndex, match.index);
				const endPos = new vscode.Position(lineIndex, match.index + value.length);
				const range = new vscode.Range(startPos, endPos);

				const remValue = ConversionUtils.pxToRem(numericValue);

				const diagnostic = new vscode.Diagnostic(
					range,
					`Consider using rem instead of px. Suggestion: ${remValue}rem`,
					severity
				);

				diagnostic.code = DIAGNOSTIC_CODE;
				diagnostic.source = EXTENSION_ID;
				diagnostic.tags = [vscode.DiagnosticTag.Unnecessary];

				diagnostics.push(diagnostic);
			}
		}

		this.diagnosticCollection.set(document.uri, diagnostics);
	}

	private isSupportedFile(document: vscode.TextDocument, extensions: string[]): boolean {
		const ext = path.extname(document.fileName).slice(1).toLowerCase();
		return extensions.includes(ext);
	}

	private getSeverityFromString(severity: string): vscode.DiagnosticSeverity {
		switch (severity.toLowerCase()) {
			case 'error':
				return vscode.DiagnosticSeverity.Error;
			case 'warning':
				return vscode.DiagnosticSeverity.Warning;
			case 'information':
				return vscode.DiagnosticSeverity.Information;
			default:
				return vscode.DiagnosticSeverity.Warning;
		}
	}

	dispose(): void {
		this.diagnosticCollection.dispose();
	}
}

// Code Action Provider for px to rem conversions
class PxToRemCodeActionProvider implements vscode.CodeActionProvider {
	provideCodeActions(
		document: vscode.TextDocument,
		range: vscode.Range | vscode.Selection,
		context: vscode.CodeActionContext,
		token: vscode.CancellationToken
	): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
		const actions: vscode.CodeAction[] = [];

		// Check if there are diagnostics from our extension
		const relevantDiagnostics = context.diagnostics.filter(
			diagnostic => diagnostic.source === EXTENSION_ID && diagnostic.code === DIAGNOSTIC_CODE
		);

		for (const diagnostic of relevantDiagnostics) {
			const text = document.getText(diagnostic.range);
			const pxMatch = text.match(/(\d+(?:\.\d+)?)px/);
			
			if (pxMatch) {
				const numericValue = parseFloat(pxMatch[1]);
				const remValue = ConversionUtils.pxToRem(numericValue);
				
				// Quick fix action
				const quickFix = new vscode.CodeAction(
					`Convert to ${remValue}rem`,
					vscode.CodeActionKind.QuickFix
				);
				
				quickFix.edit = new vscode.WorkspaceEdit();
				quickFix.edit.replace(document.uri, diagnostic.range, `${remValue}rem`);
				quickFix.diagnostics = [diagnostic];
				
				actions.push(quickFix);

				// Convert all px in file action
				const convertAllAction = new vscode.CodeAction(
					'Convert all px values to rem in this file',
					vscode.CodeActionKind.Source
				);
				
				convertAllAction.command = {
					command: 'no-px-in-css.convertAllInFile',
					title: 'Convert all px to rem',
					arguments: [document.uri]
				};
				
				actions.push(convertAllAction);
			}
		}

		return actions;
	}
}

// Configuration helper
class ConfigManager {
	static getConfig() {
		return vscode.workspace.getConfiguration('noPxInCss');
	}

	static getFileExtensions(): string[] {
		return this.getConfig().get<string[]>('fileExtensions', ['css', 'scss', 'sass', 'less', 'stylus', 'vue']);
	}

	static getIgnoreThreshold(): number {
		return this.getConfig().get<number>('ignoreThreshold', 1);
	}

	static getIgnorePatterns(): string[] {
		return this.getConfig().get<string[]>('ignorePatterns', ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**', '**/coverage/**']);
	}

	static getEnableInlineDiagnostics(): boolean {
		return this.getConfig().get<boolean>('enableInlineDiagnostics', true);
	}

	static getDiagnosticSeverity(): string {
		return this.getConfig().get<string>('diagnosticSeverity', 'warning');
	}

	static getAutoConvertOnSave(): boolean {
		return this.getConfig().get<boolean>('autoConvertOnSave', false);
	}

	static isSupportedFile(filePath: string): boolean {
		const ext = path.extname(filePath).slice(1).toLowerCase();
		return this.getFileExtensions().includes(ext);
	}
}

// Utility class for px/rem conversions
class ConversionUtils {
	static readonly PX_REGEX = /(\d+(?:\.\d+)?px)/g;
	static readonly BASE_FONT_SIZE = DEFAULT_BASE_FONT_SIZE;

	static pxToRem(pxValue: number): string {
		if (!Number.isFinite(pxValue) || pxValue < 0) {
			throw new Error(`Invalid px value: ${pxValue}`);
		}
		return (pxValue / this.BASE_FONT_SIZE).toFixed(4).replace(/\.?0+$/, '');
	}

	static shouldIgnore(pxValue: number, threshold: number): boolean {
		return Number.isFinite(pxValue) && Number.isFinite(threshold) && pxValue <= threshold;
	}

	static extractNumericValue(pxString: string): number {
		const value = parseFloat(pxString.replace('px', ''));
		if (!Number.isFinite(value)) {
			throw new Error(`Invalid px string: ${pxString}`);
		}
		return value;
	}

	static createRemString(pxValue: number): string {
		return `${this.pxToRem(pxValue)}rem`;
	}
}

// Base class for tree items
abstract class BaseTreeItem extends vscode.TreeItem {
	constructor(
		label: string,
		collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly contextValue: string
	) {
		super(label, collapsibleState);
		this.contextValue = contextValue;
	}
}

// Folder item
class FolderItem extends BaseTreeItem {
	constructor(
		public readonly folderPath: string,
		public readonly files: FileItem[]
	) {
		super(path.basename(folderPath) || 'Root', vscode.TreeItemCollapsibleState.Expanded, 'folder');
		this.tooltip = folderPath;
		this.iconPath = new vscode.ThemeIcon('folder');
	}
}

// File item
class FileItem extends BaseTreeItem {
	constructor(
		public readonly filePath: string,
		public readonly pxValues: PxValue[]
	) {
		super(`${path.basename(filePath)} (${pxValues.length})`, vscode.TreeItemCollapsibleState.Expanded, 'file');
		this.tooltip = filePath;
		this.iconPath = new vscode.ThemeIcon('file');
	}
}

// Px value item
class PxValueItem extends BaseTreeItem {
	constructor(
		public readonly pxValue: PxValue
	) {
		super(`${pxValue.value} - Line ${pxValue.line}`, vscode.TreeItemCollapsibleState.None, 'pxValue');
		this.tooltip = `${pxValue.file}:${pxValue.line}:${pxValue.column} - ${pxValue.context.trim()}`;
		this.description = pxValue.context.trim();
		
		// No default command since we have inline buttons now
		// this.command = {
		// 	command: 'no-px-in-css.goToLocation',
		// 	title: 'Go to location',
		// 	arguments: [pxValue]
		// };
		
		// Store the pxValue in the item for inline button commands
		(this as any).pxValue = pxValue;
	}
}

class PxValuesProvider implements vscode.TreeDataProvider<BaseTreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<BaseTreeItem | undefined | null | void> = new vscode.EventEmitter<BaseTreeItem | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<BaseTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

	private pxValues: PxValue[] = [];
	private folderItems: FolderItem[] = [];

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: BaseTreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: BaseTreeItem): Thenable<BaseTreeItem[]> {
		if (!element) {
			// Root level: return folders
			return Promise.resolve(this.folderItems);
		} else if (element instanceof FolderItem) {
			// Folder level: return files
			return Promise.resolve(element.files);
		} else if (element instanceof FileItem) {
			// File level: return px values
			return Promise.resolve(element.pxValues.map(pv => new PxValueItem(pv)));
		}
		return Promise.resolve([]);
	}

	setPxValues(values: PxValue[]): void {
		this.pxValues = values;
		this.buildHierarchy();
		this.refresh();
	}

	private buildHierarchy(): void {
		// Group px values by folder and file
		const folderMap = new Map<string, Map<string, PxValue[]>>();

		for (const pxValue of this.pxValues) {
			const folderPath = path.dirname(pxValue.file);
			const fileName = pxValue.file;

			if (!folderMap.has(folderPath)) {
				folderMap.set(folderPath, new Map<string, PxValue[]>());
			}

			const fileMap = folderMap.get(folderPath)!;
			if (!fileMap.has(fileName)) {
				fileMap.set(fileName, []);
			}

			fileMap.get(fileName)!.push(pxValue);
		}

		// Convert to tree structure
		this.folderItems = [];
		for (const [folderPath, fileMap] of folderMap) {
			const fileItems: FileItem[] = [];
			
			for (const [fileName, pxValues] of fileMap) {
				fileItems.push(new FileItem(fileName, pxValues));
			}

			// Sort files alphabetically
			fileItems.sort((a, b) => path.basename(a.filePath).localeCompare(path.basename(b.filePath)));

			this.folderItems.push(new FolderItem(folderPath, fileItems));
		}

		// Sort folders alphabetically
		this.folderItems.sort((a, b) => a.folderPath.localeCompare(b.folderPath));
	}

	getPxValues(): PxValue[] {
		return this.pxValues;
	}
}

class PxScanner {
	private static readonly PX_REGEX = /(\d+(?:\.\d+)?px)/g;

	static async scanWorkspace(): Promise<PxValue[]> {
		const config = vscode.workspace.getConfiguration('noPxInCss');
		const fileExtensions = config.get<string[]>('fileExtensions', ['css', 'scss', 'sass', 'less', 'stylus', 'vue']);
		const ignoreThreshold = config.get<number>('ignoreThreshold', 1);
		const ignorePatterns = config.get<string[]>('ignorePatterns', ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**', '**/coverage/**']);

		const pxValues: PxValue[] = [];
		
		if (!vscode.workspace.workspaceFolders) {
			return pxValues;
		}

		const workspaceFolder = vscode.workspace.workspaceFolders[0];
		const pattern = `**/*.{${fileExtensions.join(',')}}`;
		
		// Combine the default exclude pattern with user-defined ignore patterns
		const excludePattern = `{${ignorePatterns.join(',')}}`;
		
		const files = await vscode.workspace.findFiles(pattern, excludePattern);

		for (const file of files) {
			try {
				const document = await vscode.workspace.openTextDocument(file);
				const text = document.getText();
				const lines = text.split('\n');

				for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
					const line = lines[lineIndex];
					let match;
					
					// Reset regex for each line
					this.PX_REGEX.lastIndex = 0;
					
					while ((match = this.PX_REGEX.exec(line)) !== null) {
						const value = match[1];
						const numericValue = parseFloat(value.replace('px', ''));
						
						// Skip values below or equal to threshold
						if (numericValue <= ignoreThreshold) {
							continue;
						}

						pxValues.push({
							value: value,
							file: file.fsPath,
							line: lineIndex + 1,
							column: match.index + 1,
							context: line.trim()
						});
					}
				}
			} catch (error) {
				console.error(`Error reading file ${file.fsPath}:`, error);
			}
		}

		return pxValues;
	}
}

function goToLocation(pxValue: PxValue): void {
	if (!pxValue || !pxValue.file) {
		vscode.window.showErrorMessage('Invalid px value data');
		return;
	}

	const uri = vscode.Uri.file(pxValue.file);
	vscode.workspace.openTextDocument(uri).then(document => {
		vscode.window.showTextDocument(document).then(editor => {
			const position = new vscode.Position(pxValue.line - 1, pxValue.column - 1);
			editor.selection = new vscode.Selection(position, position);
			editor.revealRange(new vscode.Range(position, position));
		});
	});
}

async function convertToRem(pxValue: PxValue): Promise<void> {
	console.log('convertToRem called with:', pxValue);
	
	if (!pxValue) {
		throw new Error('No px value provided');
	}
	
	if (!pxValue.file) {
		throw new Error('Invalid px value: missing file path');
	}
	
	if (!pxValue.value) {
		throw new Error('Invalid px value: missing value');
	}

	try {
		const uri = vscode.Uri.file(pxValue.file);
		const document = await vscode.workspace.openTextDocument(uri);
		const editor = await vscode.window.showTextDocument(document);

		// Extract numeric value from px string
		const numericValue = parseFloat(pxValue.value.replace('px', ''));
		if (isNaN(numericValue)) {
			throw new Error(`Invalid px value: ${pxValue.value}`);
		}

		const remValue = (numericValue / 16).toFixed(4).replace(/\.?0+$/, ''); // Remove trailing zeros
		const remString = `${remValue}rem`;

		// Create edit to replace px value with rem value
		const position = new vscode.Position(pxValue.line - 1, pxValue.column - 1);
		const range = new vscode.Range(position, new vscode.Position(pxValue.line - 1, pxValue.column - 1 + pxValue.value.length));
		
		const edit = new vscode.WorkspaceEdit();
		edit.replace(uri, range, remString);
		
		await vscode.workspace.applyEdit(edit);
		
		vscode.window.showInformationMessage(`Converted ${pxValue.value} to ${remString}`);
	} catch (error) {
		console.error('Error in convertToRem:', error);
		throw error;
	}
}

async function convertAllPxInFile(uri: vscode.Uri): Promise<void> {
	try {
		const document = await vscode.workspace.openTextDocument(uri);
		const editor = await vscode.window.showTextDocument(document);
		
		const config = vscode.workspace.getConfiguration('noPxInCss');
		const ignoreThreshold = config.get<number>('ignoreThreshold', 1);
		
		const text = document.getText();
		const PX_REGEX = /(\d+(?:\.\d+)?px)/g;
		
		const edits: vscode.TextEdit[] = [];
		let match;
		let totalConverted = 0;
		
		// Reset regex
		PX_REGEX.lastIndex = 0;
		
		while ((match = PX_REGEX.exec(text)) !== null) {
			const value = match[1];
			const numericValue = parseFloat(value.replace('px', ''));
			
			if (isNaN(numericValue)) {
				continue;
			}
			
			// Skip values below or equal to threshold
			if (numericValue <= ignoreThreshold) {
				continue;
			}
			
			const remValue = (numericValue / 16).toFixed(4).replace(/\.?0+$/, '');
			const remString = `${remValue}rem`;
			
			const startPos = document.positionAt(match.index);
			const endPos = document.positionAt(match.index + value.length);
			const range = new vscode.Range(startPos, endPos);
			
			edits.push(vscode.TextEdit.replace(range, remString));
			totalConverted++;
		}
		
		if (edits.length > 0) {
			const workspaceEdit = new vscode.WorkspaceEdit();
			workspaceEdit.set(uri, edits);
			await vscode.workspace.applyEdit(workspaceEdit);
			
			vscode.window.showInformationMessage(`Converted ${totalConverted} px values to rem`);
		} else {
			vscode.window.showInformationMessage('No px values found to convert');
		}
	} catch (error) {
		console.error('Error converting all px in file:', error);
		vscode.window.showErrorMessage(`Error converting px values: ${error instanceof Error ? error.message : String(error)}`);
	}
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Extension "no-px-in-css" is now active!');

	// Create the tree data provider
	const pxValuesProvider = new PxValuesProvider();
	
	// Register the tree view
	const treeView = vscode.window.createTreeView('pxValuesView', {
		treeDataProvider: pxValuesProvider,
		showCollapseAll: false
	});

	// Create diagnostic manager for inline warnings
	const diagnosticManager = new PxDiagnosticManager();
	
	// Register code action provider for quick fixes
	const codeActionProvider = vscode.languages.registerCodeActionsProvider(
		['css', 'scss', 'sass', 'less', 'stylus'],
		new PxToRemCodeActionProvider(),
		{
			providedCodeActionKinds: [vscode.CodeActionKind.QuickFix, vscode.CodeActionKind.Source]
		}
	);

	// Update diagnostics when documents are opened or changed
	const onDidOpenTextDocument = vscode.workspace.onDidOpenTextDocument((document) => {
		diagnosticManager.updateDiagnostics(document);
	});

	const onDidChangeTextDocument = vscode.workspace.onDidChangeTextDocument((event) => {
		diagnosticManager.updateDiagnostics(event.document);
	});

	// Auto-convert on save if enabled
	const onWillSaveTextDocument = vscode.workspace.onWillSaveTextDocument(async (event) => {
		const config = vscode.workspace.getConfiguration('noPxInCss');
		const autoConvertOnSave = config.get<boolean>('autoConvertOnSave', false);
		
		if (!autoConvertOnSave) {
			return;
		}

		const document = event.document;
		const fileExtensions = config.get<string[]>('fileExtensions', ['css', 'scss', 'sass', 'less', 'stylus', 'vue']);
		const ext = path.extname(document.fileName).slice(1).toLowerCase();
		
		// Only process supported file types
		if (!fileExtensions.includes(ext)) {
			return;
		}

		// Check if there are px values to convert
		const text = document.getText();
		const ignoreThreshold = config.get<number>('ignoreThreshold', 1);
		const PX_REGEX = /(\d+(?:\.\d+)?px)/g;
		
		const edits: vscode.TextEdit[] = [];
		let match;
		let convertedCount = 0;
		
		// Reset regex
		PX_REGEX.lastIndex = 0;
		
		while ((match = PX_REGEX.exec(text)) !== null) {
			const value = match[1];
			const numericValue = parseFloat(value.replace('px', ''));
			
			if (isNaN(numericValue)) {
				continue;
			}
			
			// Skip values below or equal to threshold
			if (numericValue <= ignoreThreshold) {
				continue;
			}
			
			const remValue = (numericValue / 16).toFixed(4).replace(/\.?0+$/, '');
			const remString = `${remValue}rem`;
			
			const startPos = document.positionAt(match.index);
			const endPos = document.positionAt(match.index + value.length);
			const range = new vscode.Range(startPos, endPos);
			
			edits.push(vscode.TextEdit.replace(range, remString));
			convertedCount++;
		}
		
		if (convertedCount > 0) {
			// Apply edits before save
			event.waitUntil(
				Promise.resolve().then(async () => {
					const workspaceEdit = new vscode.WorkspaceEdit();
					workspaceEdit.set(document.uri, edits);
					await vscode.workspace.applyEdit(workspaceEdit);
					
					// Update diagnostics after conversion
					setTimeout(() => {
						diagnosticManager.updateDiagnostics(document);
						// Refresh the tree view to reflect changes
						PxScanner.scanWorkspace().then(pxValues => {
							pxValuesProvider.setPxValues(pxValues);
						});
					}, 100);
				})
			);
		}
	});

	// Update diagnostics for already open documents
	vscode.workspace.textDocuments.forEach(document => {
		diagnosticManager.updateDiagnostics(document);
	});

	// Register commands
	const scanFilesCommand = vscode.commands.registerCommand('no-px-in-css.scanFiles', async () => {
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "Scanning files for px values...",
			cancellable: false
		}, async (progress) => {
			const pxValues = await PxScanner.scanWorkspace();
			pxValuesProvider.setPxValues(pxValues);
			vscode.window.showInformationMessage(`Found ${pxValues.length} px values`);
		});
	});

	const refreshCommand = vscode.commands.registerCommand('no-px-in-css.refresh', async () => {
		const pxValues = await PxScanner.scanWorkspace();
		pxValuesProvider.setPxValues(pxValues);
	});

	const goToLocationCommand = vscode.commands.registerCommand('no-px-in-css.goToLocation', (item?: PxValueItem | PxValue) => {
		console.log('goToLocationCommand called with:', item);
		
		let pxValue: PxValue | undefined;
		
		// Handle different types of input
		if (item instanceof PxValueItem) {
			pxValue = item.pxValue;
		} else if (item && typeof item === 'object' && 'value' in item && 'file' in item) {
			pxValue = item as PxValue;
		} else {
			// If no item is provided, try to get the selected item from tree view
			const selection = treeView.selection;
			if (selection && selection.length > 0 && selection[0] instanceof PxValueItem) {
				pxValue = (selection[0] as PxValueItem).pxValue;
			}
		}
		
		if (!pxValue) {
			vscode.window.showErrorMessage('No px value selected or invalid selection');
			return;
		}
		
		goToLocation(pxValue);
	});

	const convertToRemCommand = vscode.commands.registerCommand('no-px-in-css.convertToRem', async (item?: PxValueItem | PxValue) => {
		console.log('convertToRemCommand called with:', item);
		
		let pxValue: PxValue | undefined;
		
		// Handle different types of input
		if (item instanceof PxValueItem) {
			pxValue = item.pxValue;
		} else if (item && typeof item === 'object' && 'value' in item && 'file' in item) {
			pxValue = item as PxValue;
		} else {
			// If no item is provided or item is invalid, try to get the selected item from tree view
			const selection = treeView.selection;
			if (selection && selection.length > 0 && selection[0] instanceof PxValueItem) {
				pxValue = (selection[0] as PxValueItem).pxValue;
			}
		}
		
		if (!pxValue) {
			vscode.window.showErrorMessage('No px value selected or invalid selection');
			return;
		}
		
		try {
			await convertToRem(pxValue);
			// Refresh the view after conversion
			const pxValues = await PxScanner.scanWorkspace();
			pxValuesProvider.setPxValues(pxValues);
		} catch (error) {
			console.error('Error in convertToRemCommand:', error);
			vscode.window.showErrorMessage(`Error converting to rem: ${error instanceof Error ? error.message : String(error)}`);
		}
	});

	const convertAllInFileCommand = vscode.commands.registerCommand('no-px-in-css.convertAllInFile', async (uri?: vscode.Uri) => {
		try {
			// If no URI provided, use the currently active editor
			let targetUri = uri;
			if (!targetUri) {
				const activeEditor = vscode.window.activeTextEditor;
				if (!activeEditor) {
					vscode.window.showErrorMessage('No file is currently open');
					return;
				}
				targetUri = activeEditor.document.uri;
			}

			// Check if the file is a supported type
			const config = vscode.workspace.getConfiguration('noPxInCss');
			const fileExtensions = config.get<string[]>('fileExtensions', ['css', 'scss', 'sass', 'less', 'stylus', 'vue']);
			const ext = path.extname(targetUri.fsPath).slice(1).toLowerCase();
			
			if (!fileExtensions.includes(ext)) {
				vscode.window.showWarningMessage(`File type ".${ext}" is not supported. Supported types: ${fileExtensions.join(', ')}`);
				return;
			}

			await convertAllPxInFile(targetUri);
			
			// Refresh the view and diagnostics after conversion
			const pxValues = await PxScanner.scanWorkspace();
			pxValuesProvider.setPxValues(pxValues);
			
			// Update diagnostics for the modified document
			const document = await vscode.workspace.openTextDocument(targetUri);
			diagnosticManager.updateDiagnostics(document);
		} catch (error) {
			console.error('Error in convertAllInFileCommand:', error);
			vscode.window.showErrorMessage(`Error converting all px values: ${error instanceof Error ? error.message : String(error)}`);
		}
	});

	const convertAllInCurrentFileCommand = vscode.commands.registerCommand('no-px-in-css.convertAllInCurrentFile', async () => {
		const activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) {
			vscode.window.showErrorMessage('No file is currently open');
			return;
		}

		const document = activeEditor.document;
		const config = vscode.workspace.getConfiguration('noPxInCss');
		const fileExtensions = config.get<string[]>('fileExtensions', ['css', 'scss', 'sass', 'less', 'stylus', 'vue']);
		const ext = path.extname(document.fileName).slice(1).toLowerCase();
		
		if (!fileExtensions.includes(ext)) {
			vscode.window.showWarningMessage(`File type ".${ext}" is not supported. Supported types: ${fileExtensions.join(', ')}`);
			return;
		}

		// Count px values first
		const text = document.getText();
		const ignoreThreshold = config.get<number>('ignoreThreshold', 1);
		const PX_REGEX = /(\d+(?:\.\d+)?px)/g;
		let pxCount = 0;
		let match;
		
		PX_REGEX.lastIndex = 0;
		while ((match = PX_REGEX.exec(text)) !== null) {
			const value = match[1];
			const numericValue = parseFloat(value.replace('px', ''));
			if (numericValue <= ignoreThreshold) {
				continue;
			}
			pxCount++;
		}

		if (pxCount === 0) {
			vscode.window.showInformationMessage('No px values found in this file');
			return;
		}

		// Show confirmation dialog
		const fileName = path.basename(document.fileName);
		const response = await vscode.window.showWarningMessage(
			`Convert ${pxCount} px value${pxCount > 1 ? 's' : ''} to rem in "${fileName}"?`,
			{ modal: true },
			'Convert',
			'Cancel'
		);

		if (response === 'Convert') {
			try {
				await convertAllPxInFile(document.uri);
				
				// Refresh the view and diagnostics after conversion
				const pxValues = await PxScanner.scanWorkspace();
				pxValuesProvider.setPxValues(pxValues);
				diagnosticManager.updateDiagnostics(document);
			} catch (error) {
				console.error('Error in convertAllInCurrentFileCommand:', error);
				vscode.window.showErrorMessage(`Error converting px values: ${error instanceof Error ? error.message : String(error)}`);
			}
		}
	});

	// Register all disposables
	context.subscriptions.push(
		treeView,
		scanFilesCommand,
		refreshCommand,
		goToLocationCommand,
		convertToRemCommand,
		convertAllInFileCommand,
		convertAllInCurrentFileCommand,
		diagnosticManager,
		codeActionProvider,
		onDidOpenTextDocument,
		onDidChangeTextDocument,
		onWillSaveTextDocument
	);

	// Initial scan when extension activates
	PxScanner.scanWorkspace().then(pxValues => {
		pxValuesProvider.setPxValues(pxValues);
	});
}

// This method is called when your extension is deactivated
export function deactivate() {}
