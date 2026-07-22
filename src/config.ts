import * as path from 'path';
import * as vscode from 'vscode';

export const CONFIG_SECTION = 'noPxInCss';

export const DEFAULT_FILE_EXTENSIONS = ['css', 'scss', 'sass', 'less', 'styl', 'vue'];
export const DEFAULT_IGNORE_PATTERNS = [
	'**/.nuxt/**',
	'**/.output/**',
	'**/node_modules/**',
	'**/dist/**',
	'**/build/**',
	'**/.git/**',
	'**/coverage/**',
];

export interface ExtensionConfig {
	fileExtensions: string[];
	ignoreThreshold: number;
	ignorePatterns: string[];
	enableInlineDiagnostics: boolean;
	diagnosticSeverity: vscode.DiagnosticSeverity;
	autoConvertOnSave: boolean;
	baseFontSize: number;
}

const SEVERITY_BY_NAME = new Map<string, vscode.DiagnosticSeverity>([
	['error', vscode.DiagnosticSeverity.Error],
	['warning', vscode.DiagnosticSeverity.Warning],
	['information', vscode.DiagnosticSeverity.Information],
]);

export function getConfig(scope?: vscode.ConfigurationScope): ExtensionConfig {
	const config = vscode.workspace.getConfiguration(CONFIG_SECTION, scope);
	const baseFontSize = config.get<number>('baseFontSize', 16);
	return {
		fileExtensions: config
			.get<string[]>('fileExtensions', DEFAULT_FILE_EXTENSIONS)
			.map(extension => extension.toLowerCase().replace(/^\./, '')),
		ignoreThreshold: config.get<number>('ignoreThreshold', 1),
		ignorePatterns: config.get<string[]>('ignorePatterns', DEFAULT_IGNORE_PATTERNS),
		enableInlineDiagnostics: config.get<boolean>('enableInlineDiagnostics', true),
		diagnosticSeverity:
			SEVERITY_BY_NAME.get(config.get<string>('diagnosticSeverity', 'warning').toLowerCase()) ??
			vscode.DiagnosticSeverity.Warning,
		autoConvertOnSave: config.get<boolean>('autoConvertOnSave', false),
		baseFontSize: Number.isFinite(baseFontSize) && baseFontSize > 0 ? baseFontSize : 16,
	};
}

export function isSupportedPath(filePath: string, config: ExtensionConfig): boolean {
	return config.fileExtensions.includes(path.extname(filePath).slice(1).toLowerCase());
}

export function isSupportedDocument(document: vscode.TextDocument, config: ExtensionConfig): boolean {
	return isSupportedPath(document.uri.fsPath, config);
}
