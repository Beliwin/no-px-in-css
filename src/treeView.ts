import * as path from 'path';
import * as vscode from 'vscode';
import { PxLocation } from './scanner';

export type TreeNode = FolderNode | FileNode | PxValueNode;

export class FolderNode extends vscode.TreeItem {
	constructor(
		public readonly folderPath: string,
		public readonly files: FileNode[]
	) {
		super(
			vscode.workspace.asRelativePath(folderPath) || path.basename(folderPath),
			vscode.TreeItemCollapsibleState.Expanded
		);
		this.contextValue = 'folder';
		this.tooltip = folderPath;
		this.iconPath = vscode.ThemeIcon.Folder;
	}
}

export class FileNode extends vscode.TreeItem {
	constructor(
		public readonly filePath: string,
		public readonly locations: PxLocation[]
	) {
		super(`${path.basename(filePath)} (${locations.length})`, vscode.TreeItemCollapsibleState.Expanded);
		this.contextValue = 'file';
		this.tooltip = filePath;
		this.resourceUri = vscode.Uri.file(filePath);
		this.iconPath = vscode.ThemeIcon.File;
	}
}

export class PxValueNode extends vscode.TreeItem {
	constructor(public readonly location: PxLocation) {
		super(`${location.text} — line ${location.line + 1}`, vscode.TreeItemCollapsibleState.None);
		this.contextValue = 'pxValue';
		this.description = location.context;
		this.tooltip = `${location.file}:${location.line + 1}:${location.index + 1}\n${location.context}`;
		this.command = {
			command: 'no-px-in-css.goToLocation',
			title: 'Go to location',
			arguments: [this],
		};
	}
}

export class PxTreeDataProvider implements vscode.TreeDataProvider<TreeNode> {
	private readonly onDidChangeTreeDataEmitter = new vscode.EventEmitter<TreeNode | undefined | null | void>();
	readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;

	private locations: PxLocation[] = [];
	private folders: FolderNode[] = [];

	setLocations(locations: PxLocation[]): void {
		this.locations = locations;
		this.rebuild();
	}

	/** Replace the entries of a single file without rescanning the workspace. */
	updateFile(filePath: string, locations: PxLocation[]): void {
		this.locations = this.locations.filter(location => location.file !== filePath).concat(locations);
		this.rebuild();
	}

	getTreeItem(element: TreeNode): vscode.TreeItem {
		return element;
	}

	getChildren(element?: TreeNode): TreeNode[] {
		if (!element) {
			return this.folders;
		}
		if (element instanceof FolderNode) {
			return element.files;
		}
		if (element instanceof FileNode) {
			return element.locations.map(location => new PxValueNode(location));
		}
		return [];
	}

	private rebuild(): void {
		const byFolder = new Map<string, Map<string, PxLocation[]>>();
		for (const location of this.locations) {
			const folderPath = path.dirname(location.file);
			const byFile = byFolder.get(folderPath) ?? new Map<string, PxLocation[]>();
			byFolder.set(folderPath, byFile);
			const list = byFile.get(location.file) ?? [];
			byFile.set(location.file, list);
			list.push(location);
		}

		this.folders = [...byFolder.entries()]
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([folderPath, byFile]) => {
				const files = [...byFile.entries()]
					.sort(([a], [b]) => path.basename(a).localeCompare(path.basename(b)))
					.map(([filePath, locations]) => new FileNode(filePath, locations));
				return new FolderNode(folderPath, files);
			});
		this.onDidChangeTreeDataEmitter.fire();
	}
}
