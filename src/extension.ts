// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface PxValue {
	value: string;
	file: string;
	line: number;
	column: number;
	context: string;
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
		const ignore1px = config.get<boolean>('ignore1px', true);
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
						
						// Skip 1px if configured to ignore
						if (ignore1px && value === '1px') {
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

	// Register all disposables
	context.subscriptions.push(
		treeView,
		scanFilesCommand,
		refreshCommand,
		goToLocationCommand,
		convertToRemCommand
	);

	// Initial scan when extension activates
	PxScanner.scanWorkspace().then(pxValues => {
		pxValuesProvider.setPxValues(pxValues);
	});
}

// This method is called when your extension is deactivated
export function deactivate() {}
