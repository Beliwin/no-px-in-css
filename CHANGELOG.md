# Change Log

All notable changes to the "no-px-in-css" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

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