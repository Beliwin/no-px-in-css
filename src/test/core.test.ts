import * as assert from 'assert';
import { findPxValues, formatRem, maskIgnoredRegions, planConversions, shouldKeepPx } from '../core';

suite('formatRem', () => {
	test('converts px to rem with the given base font size', () => {
		assert.strictEqual(formatRem(24, 16), '1.5rem');
		assert.strictEqual(formatRem(14, 16), '0.875rem');
		assert.strictEqual(formatRem(10, 20), '0.5rem');
	});

	test('drops trailing zeros', () => {
		assert.strictEqual(formatRem(16, 16), '1rem');
		assert.strictEqual(formatRem(32, 16), '2rem');
		assert.strictEqual(formatRem(160, 16), '10rem');
	});

	test('keeps 4 decimals of precision', () => {
		assert.strictEqual(formatRem(1, 16), '0.0625rem');
		assert.strictEqual(formatRem(7, 48), '0.1458rem');
	});

	test('supports negative values', () => {
		assert.strictEqual(formatRem(-16, 16), '-1rem');
	});

	test('rejects invalid base font sizes', () => {
		assert.throws(() => formatRem(16, 0));
		assert.throws(() => formatRem(16, NaN));
	});
});

suite('findPxValues', () => {
	const all = { ignoreThreshold: 0 };

	test('reports value, line and column', () => {
		const matches = findPxValues('.a {\n  margin: 24px auto;\n}', all);
		assert.deepStrictEqual(matches, [{ text: '24px', value: 24, line: 1, index: 10 }]);
	});

	test('finds several values on one line', () => {
		const matches = findPxValues('padding: 8px 16px 24px 32px;', all);
		assert.deepStrictEqual(
			matches.map(match => match.text),
			['8px', '16px', '24px', '32px']
		);
	});

	test('applies the ignore threshold to absolute values', () => {
		const matches = findPxValues('border: 1px solid;\nmargin: -24px;\ntop: -1px;', { ignoreThreshold: 1 });
		assert.deepStrictEqual(
			matches.map(match => match.text),
			['-24px']
		);
	});

	test('supports decimal values without a leading zero', () => {
		const matches = findPxValues('border-width: .5px;', all);
		assert.deepStrictEqual(
			matches.map(match => match.value),
			[0.5]
		);
	});

	test('skips lines with a keep-px comment', () => {
		const css = 'margin: 24px;\nborder: 3px solid; /* keep-px */\npadding: 16px;';
		assert.deepStrictEqual(
			findPxValues(css, all).map(match => match.text),
			['24px', '16px']
		);
	});

	test('ignores px inside identifiers and class names', () => {
		const matches = findPxValues('.icon-16px { width: 16px; }', all);
		assert.deepStrictEqual(
			matches.map(match => match.index),
			[20]
		);
	});

	test('ignores px inside url() arguments', () => {
		const css = 'background: url(icons/16px.png) no-repeat;\nwidth: 24px;';
		assert.deepStrictEqual(
			findPxValues(css, all).map(match => match.text),
			['24px']
		);
	});

	test('ignores px inside comments', () => {
		const css = '/* margin: 24px */\nmargin: 32px; // 48px old value\n/*\n 64px\n*/\npadding: 8px;';
		assert.deepStrictEqual(
			findPxValues(css, all).map(match => match.text),
			['32px', '8px']
		);
	});

	test('does not match when px is glued to word characters', () => {
		assert.deepStrictEqual(findPxValues('font: 16pxx; grid-area: a16px;', all), []);
	});

	test('matches case-insensitively', () => {
		assert.deepStrictEqual(
			findPxValues('margin: 24PX;', all).map(match => match.value),
			[24]
		);
	});
});

suite('planConversions', () => {
	test('produces rem replacements', () => {
		const plan = planConversions('margin: 24px 16px;', { ignoreThreshold: 1, baseFontSize: 16 });
		assert.deepStrictEqual(
			plan.map(replacement => replacement.replacement),
			['1.5rem', '1rem']
		);
	});

	test('honours a custom base font size', () => {
		const plan = planConversions('margin: 20px;', { ignoreThreshold: 1, baseFontSize: 10 });
		assert.deepStrictEqual(
			plan.map(replacement => replacement.replacement),
			['2rem']
		);
	});
});

suite('maskIgnoredRegions', () => {
	test('preserves text length and line breaks', () => {
		const css = 'a {\n/* 16px */\nbackground: url(a/16px.png);\n}';
		const masked = maskIgnoredRegions(css);
		assert.strictEqual(masked.length, css.length);
		assert.strictEqual(masked.split('\n').length, css.split('\n').length);
	});

	test('handles unterminated comments', () => {
		assert.strictEqual(maskIgnoredRegions('a /* 16px').includes('16px'), false);
	});
});

suite('shouldKeepPx', () => {
	test('detects the keep-px marker anywhere on the line', () => {
		assert.ok(shouldKeepPx('border: 1px; /* keep-px */'));
		assert.ok(!shouldKeepPx('border: 1px;'));
	});
});
