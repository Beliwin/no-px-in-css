/**
 * Pure px-detection and conversion logic, free of any VS Code dependency so
 * it can be unit-tested directly.
 */

export const KEEP_PX_COMMENT = 'keep-px';

export interface PxMatch {
	/** Matched text, including a leading minus sign if present (e.g. "-16px"). */
	text: string;
	/** Numeric value in px. */
	value: number;
	/** 0-based line number. */
	line: number;
	/** 0-based character offset within the line. */
	index: number;
}

export interface ScanOptions {
	/** Values whose absolute px value is lower than or equal to this threshold are ignored. */
	ignoreThreshold: number;
}

export interface ConversionOptions extends ScanOptions {
	/** Root font size in px (16 means 16px = 1rem). */
	baseFontSize: number;
}

export interface PxReplacement extends PxMatch {
	replacement: string;
}

// A px value must not be glued to an identifier ("icon-16px"), a preceding
// digit or dot ("1.2.3px") or a following word character ("16pxx").
const PX_PATTERN = /(?<![\w.-])(-?\d*\.?\d+)px(?![\w-])/gi;

export function shouldKeepPx(lineText: string): boolean {
	return lineText.includes(KEEP_PX_COMMENT);
}

export function formatRem(px: number, baseFontSize: number): string {
	if (!Number.isFinite(px) || !Number.isFinite(baseFontSize) || baseFontSize <= 0) {
		throw new Error(`Cannot convert ${px}px with base font size ${baseFontSize}`);
	}
	// parseFloat drops the trailing zeros produced by toFixed.
	return `${parseFloat((px / baseFontSize).toFixed(4))}rem`;
}

/**
 * Blank out regions where a px occurrence must never be reported or
 * rewritten: comment bodies and url(...) arguments. Offsets and line breaks
 * are preserved so positions found in the masked text are valid in the
 * original.
 */
export function maskIgnoredRegions(text: string): string {
	const chars = text.split('');
	const blank = (from: number, to: number): void => {
		for (let i = from; i < to; i++) {
			if (chars[i] !== '\n' && chars[i] !== '\r') {
				chars[i] = ' ';
			}
		}
	};

	let i = 0;
	while (i < text.length) {
		const char = text[i];
		if (char === '/' && text[i + 1] === '*') {
			const end = text.indexOf('*/', i + 2);
			const stop = end === -1 ? text.length : end + 2;
			blank(i, stop);
			i = stop;
		} else if (char === '/' && text[i + 1] === '/') {
			let end = text.indexOf('\n', i);
			if (end === -1) {
				end = text.length;
			}
			blank(i, end);
			i = end;
		} else if (
			(char === 'u' || char === 'U') &&
			/^url\(/i.test(text.slice(i, i + 4)) &&
			!/[\w-]/.test(text[i - 1] ?? '')
		) {
			let end = text.indexOf(')', i + 4);
			if (end === -1) {
				end = text.length;
			}
			blank(i + 4, end);
			i = Math.min(end + 1, text.length);
		} else {
			i++;
		}
	}
	return chars.join('');
}

export function findPxValues(text: string, options: ScanOptions): PxMatch[] {
	const rawLines = text.split('\n');
	const maskedLines = maskIgnoredRegions(text).split('\n');
	const matches: PxMatch[] = [];

	for (let line = 0; line < rawLines.length; line++) {
		// keep-px is checked on the raw line: the marker usually lives in a
		// comment, which the mask blanks out.
		if (shouldKeepPx(rawLines[line])) {
			continue;
		}
		for (const match of maskedLines[line].matchAll(PX_PATTERN)) {
			const value = parseFloat(match[1]);
			if (!Number.isFinite(value) || Math.abs(value) <= options.ignoreThreshold) {
				continue;
			}
			matches.push({ text: match[0], value, line, index: match.index ?? 0 });
		}
	}
	return matches;
}

export function planConversions(text: string, options: ConversionOptions): PxReplacement[] {
	return findPxValues(text, options).map(match => ({
		...match,
		replacement: formatRem(match.value, options.baseFontSize),
	}));
}
