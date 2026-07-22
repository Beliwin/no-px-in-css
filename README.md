# No Px in CSS

A VS Code extension that helps you identify, analyze, and automatically convert pixel (px) values to rem units in your CSS, SCSS, Sass, LESS, Stylus and Vue files.

## Features

### Detection and analysis
- **Workspace scan**: detects all px values across your workspace, organized by folder and file in a dedicated sidebar view
- **Inline diagnostics**: configurable underlines (error / warning / information) directly in the editor, updated as you type
- **Smart matching**: values inside comments, `url(...)` arguments, and identifiers (`.icon-16px`) are ignored; decimal (`.5px`) and negative (`-24px`) values are handled

### Conversion
- **Quick Fixes**: lightbulb actions to convert a single value or the whole file
- **Tree view buttons**: navigate to a value or convert it with one click — conversions are position-checked, so a stale scan never corrupts your file
- **Bulk conversion**: from the context menu (editor or Explorer) or the command palette, with confirmation
- **Auto-convert on save** (optional): conversions are applied as part of the save itself, so the file never stays dirty afterwards

### Configuration
- Customizable file extensions, exclusion globs, ignore threshold, severity
- **Configurable base font size** (`baseFontSize`, default 16) for projects using e.g. `html { font-size: 62.5% }`

## Usage

### Scanning your workspace

1. Open the **Px Scanner** view in the activity bar (the first scan runs automatically when the view is shown)
2. Use the search icon to re-scan, or the refresh icon to refresh silently
3. Click any value to jump to its location; use the inline buttons to navigate or convert

### Converting values

- **Quick Fix**: put the cursor on an underlined value, click the lightbulb → *Convert to 1.5rem* or *Convert all px values to rem in this file*
- **Context menu**: right-click a supported file in the Explorer or the editor → *Convert all px to rem in file*
- **Command palette**: `No Px in CSS: Convert all px to rem in current file` (asks for confirmation with the number of values)
- **On save**: enable `noPxInCss.autoConvertOnSave`

## Keeping px values intentionally

Add a `keep-px` comment anywhere on a line to exclude **all** px values on that line from scans, diagnostics and conversions:

```css
.component {
  margin: 24px;           /* converted */
  border: 1px solid;      /* keep-px — kept as px */
  box-shadow: 0 2px 4px;  /* keep-px — shadows often look better in px */
}
```

Typical use cases: fine borders, box shadows, pixel-perfect positioning.

## Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `noPxInCss.fileExtensions` | `array` | `["css", "scss", "sass", "less", "styl", "vue"]` | File extensions to scan |
| `noPxInCss.baseFontSize` | `number` | `16` | Root font size used for the conversion (16 means 16px = 1rem) |
| `noPxInCss.ignoreThreshold` | `number` | `1` | Ignore values whose absolute px value is ≤ this threshold (0 = scan everything) |
| `noPxInCss.ignorePatterns` | `array` | `["**/node_modules/**", …]` | Glob patterns excluded from scans |
| `noPxInCss.enableInlineDiagnostics` | `boolean` | `true` | Show diagnostics in the editor |
| `noPxInCss.diagnosticSeverity` | `string` | `"warning"` | `error`, `warning` or `information` |
| `noPxInCss.autoConvertOnSave` | `boolean` | `false` | Convert automatically when saving |

### Examples

```jsonc
// Vue / Nuxt project
{
  "noPxInCss.fileExtensions": ["css", "scss", "vue"],
  "noPxInCss.ignorePatterns": ["**/.nuxt/**", "**/.output/**", "**/node_modules/**"]
}

// Project using html { font-size: 62.5% }
{
  "noPxInCss.baseFontSize": 10
}

// Strict mode
{
  "noPxInCss.ignoreThreshold": 0,
  "noPxInCss.diagnosticSeverity": "error",
  "noPxInCss.autoConvertOnSave": true
}
```

## Conversion logic

- Formula: `rem = px / baseFontSize` (default base: 16)
- Precision: 4 decimals, trailing zeros removed
- Examples (base 16): `24px` → `1.5rem`, `14px` → `0.875rem`, `-16px` → `-1rem`, `1px` → ignored with the default threshold

## Known limitations

- px values inside string literals (e.g. `content: "16px"`, JS strings in `.vue` files) may be detected — use a `keep-px` comment to opt out
- `calc()` expressions are converted term by term, which preserves their meaning but may not be what you want stylistically

## Contributing

Contributions are welcome — report bugs, propose features or open pull requests on [GitHub](https://github.com/Beliwin/no-px-in-css).

## License

[MIT License](LICENSE)
