# Change Log

All notable changes to the "no-px-in-css" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.1.0] - 2026-07-22

### ✨ Added
- **`baseFontSize` setting**: configure the root font size used for the conversion (default 16), for projects using e.g. `html { font-size: 62.5% }`
- **Quick Fixes in Vue files**: the code action provider is now registered for `.vue` files as well
- **Debounced diagnostics**: the editor analysis now waits for a 300 ms typing pause instead of running on every keystroke
- **Lazy first scan**: the workspace scan runs when the Px Scanner view is first shown instead of at startup
- **Click-to-navigate**: clicking a value in the tree view jumps to its location
- **Unit tests** covering the detection and conversion logic

### 🐛 Fixed
- **Stale-scan corruption**: converting a value from the tree view now verifies the document still matches the scanned position before editing; a stale entry triggers a refresh instead of corrupting the file
- **False positives**: px values inside comments, `url(...)` arguments and identifiers (`icon-16px`) are no longer detected or converted; `.5px` and negative values are now handled correctly
- **Auto-convert on save**: edits are now applied through `waitUntil` as part of the save itself — the document no longer stays dirty after saving
- **Duplicated code action**: "Convert all px values to rem in this file" was listed once per diagnostic in the lightbulb menu
- **Explorer context menu** no longer offers unsupported file types (jsx/tsx/svelte)
- Diagnostics no longer use the `Unnecessary` tag, which faded the code as if it were dead

### 🔧 Changed
- Codebase split into focused modules with a pure, dependency-free detection core
- Workspace scans read files from disk instead of opening each one as a text document (much faster on large workspaces)
- Default `fileExtensions` now lists `styl` (the actual Stylus file extension) instead of `stylus`
- Minimum VS Code version lowered from 1.104 to 1.85

## [1.0.1] - 2025-10-09

### 🎯 Added
- **Keep-px Comment Support**: Add `keep-px` anywhere on a line to prevent conversion of ALL px values on that line
  - Prevents values from appearing in scan results
  - Skips inline diagnostics/warnings
  - Excludes from bulk conversions
  - Ignores during auto-save conversion
  - Perfect for borders, shadows, and pixel-perfect positioning

## [1.0.0] - 2025-09-22

### 🎉 Initial Release

#### ✨ Added
- **Smart Px Detection**: Automatic scanning of px values across CSS, SCSS, SASS, LESS, Stylus, and Vue files
- **Real-time Inline Diagnostics**: Colored underlines with customizable severity levels (Error, Warning, Information)
- **Quick Fixes Integration**: VS Code lightbulb suggestions for instant px to rem conversion
- **Interactive Tree View**: Hierarchical display of px values organized by folders and files with counters
- **Multiple Conversion Methods**:
  - Individual value conversion via buttons
  - Bulk file conversion via context menu
  - Auto-conversion on save (optional)
  - Command palette integration
- **Advanced Configuration System**:
  - Customizable file extensions
  - Configurable threshold for ignoring small values (replaces simple 1px ignore)
  - Flexible exclusion patterns for folders/files
  - Toggle for inline diagnostics
- **Centralized Configuration Management**: `ConfigManager` class for consistent settings
- **Robust Error Handling**: Comprehensive try-catch blocks with user-friendly error messages
- **Performance Optimized**: Efficient regex handling and file processing for large projects

#### 🔧 Technical Features
- **TypeScript Implementation**: Fully typed codebase with interfaces and proper error handling
- **VS Code API Integration**: Proper use of DiagnosticCollection, CodeActionProvider, and TreeDataProvider
- **Conversion Utilities**: Centralized `ConversionUtils` class with validation
- **Smart Filtering**: Respects .gitignore-style patterns and build folder exclusions
- **Multi-format Support**: CSS, SCSS, SASS, LESS, Stylus, Vue Single File Components

#### 🎛️ Configuration Options
- `fileExtensions`: Array of file types to scan
- `ignoreThreshold`: Numeric threshold for ignoring small px values (0 = scan all)
- `ignorePatterns`: Glob patterns for excluding files/folders
- `enableInlineDiagnostics`: Toggle real-time code analysis
- `diagnosticSeverity`: Error, Warning, or Information level
- `autoConvertOnSave`: Automatic conversion on file save

#### 📋 Available Commands
- `no-px-in-css.scanFiles`: Scan workspace for px values
- `no-px-in-css.refresh`: Refresh the tree view
- `no-px-in-css.goToLocation`: Navigate to px value location
- `no-px-in-css.convertToRem`: Convert individual px value
- `no-px-in-css.convertAllInFile`: Convert all px values in file
- `no-px-in-css.convertAllInCurrentFile`: Convert with confirmation dialog

#### 🧮 Conversion Logic
- Base: 16px = 1rem (HTML standard)
- Formula: `rem = px / 16`
- Precision: 4 decimals with trailing zeros removed
- Validation: Input validation with error handling

### 🚀 First Public Release
This release marks the first stable version ready for production use. The extension provides a comprehensive solution for modernizing CSS codebases by converting pixel units to responsive rem units while maintaining developer productivity through intelligent automation and real-time feedback.

## [Unreleased]