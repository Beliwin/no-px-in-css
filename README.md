# No Px in CSS

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://marketplace.visualstudio.com/)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.104.0+-green.svg)](https://code.visualstudio.com/)

A comprehensive VS Code extension that helps you identify, analyze, and automatically convert pixel (px) values to rem units in your CSS, SCSS, SASS, LESS, Vue, and other files.

## 🎯 Features

### 🔍 **Detection and Analysis**
- **Automatic Scan**: Detects all px values in your workspace
- **Organized View**: Displays results by folders and files with counters
- **Smart Filtering**: Ignores build folders, node_modules, etc.
- **Multi-format Support**: CSS, SCSS, SASS, LESS, Stylus, Vue

### 🚨 **Real-time Alerts** 
- **Inline Diagnostics**: Colored underlines directly in the code
- **Quick Fixes**: VS Code lightbulbs with conversion suggestions
- **Severity Levels**: Configurable Error, Warning, or Information
- **Live Updates**: Real-time detection while typing

### ⚡ **Fast Conversion**
- **Individual Conversion**: Click button for each value
- **Entire File Conversion**: Context menu on files
- **Automatic Conversion**: On save (optional)
- **Batch Actions**: From command palette

### 🎛️ **Advanced Configuration**
- **Customizable Extensions**: Add your file types
- **Exclusion Patterns**: Ignore certain folders/files
- **Threshold Exclusion**: Ignore px values ≤ threshold (fine borders, etc.)
- **Auto-conversion**: Activatable on save

## 📦 Installation

1. Open VS Code
2. Go to Extensions tab (`Ctrl+Shift+X`)
3. Search for "No Px in CSS"
4. Click "Install"

## 🚀 Usage

### 🔍 Scanning your workspace

1. Open the "Px Scanner" view in the sidebar
2. Click the search icon to scan your files
3. Results are displayed organized by folders and files

### 🎯 Converting values

#### **Method 1 - Buttons in the view:**
```
PX SCANNER: PX VALUES
├── 📁 src/styles
│   ├── 📄 main.css (5)
│   │   ├── 24px - Line 12 [📁] [🔄]    margin: 24px auto;
│   │   ├── 16px - Line 15 [📁] [🔄]    font-size: 16px;
```
- **📁 Button**: Opens the file at the exact location
- **🔄 Button**: Converts the px value to rem

#### **Method 2 - Inline diagnostics:**
```css
.container {
  margin: 24px auto;  /* 🟡 Underline + 💡 Lightbulb */
  padding: 16px;      /* 🟡 Quick Fix available */
}
```
- Click the **lightbulb 💡** to see options
- **"Convert to 1.5rem"** - Quick conversion
- **"Convert all px values to rem"** - Convert entire file

#### **Method 3 - Context menu:**
- **Right-click** on a CSS file in Explorer
- Select **"Convert all px to rem in file"**

#### **Method 4 - Command palette:**
- **`Cmd+Shift+P`** → "No Px in CSS: Convert all px to rem in current file"
- Confirmation with count of values to convert

#### **Method 5 - Auto-conversion:**
- Enable `autoConvertOnSave` in settings
- Px values are automatically converted on each save

## 🎯 Keep px values intentionally

You can prevent specific lines from being converted by adding a `keep-px` comment:

```css
.component {
  margin: 24px;           /* This will be converted */
  border: 1px solid;      /* keep-px - This will NOT be converted */
  padding: 16px;          /* This will be converted */
  box-shadow: 0 2px 4px;  /* keep-px - Shadows often look better in px */
}
```

The `keep-px` comment can be placed anywhere on the line and will prevent **all** px values on that line from being:
- ✅ Detected in scans
- ✅ Shown in diagnostics
- ✅ Converted (manual or automatic)

**Use cases:**
- Fine borders (`1px`, `2px`)
- Box shadows
- Specific design requirements
- Pixel-perfect positioning

## ⚙️ Configuration

### Available settings
```
PX SCANNER: PX VALUES
├── 📁 src/styles
│   ├── 📄 main.css (5)
│   │   ├── 24px - Line 12 [📁] [🔄]    margin: 24px auto;
│   │   ├── 16px - Line 15 [📁] [🔄]    font-size: 16px;
```
- **📁 Bouton** : Ouvre le fichier à l'emplacement exact
- **� Bouton** : Convertit la valeur px en rem

#### **Méthode 2 - Diagnostics inline :**
```css
.container {
  margin: 24px auto;  /* 🟡 Soulignement + 💡 Ampoule */
  padding: 16px;      /* 🟡 Quick Fix disponible */
}
```
- Cliquez sur l'**ampoule 💡** pour voir les options
- **"Convert to 1.5rem"** - Conversion rapide
- **"Convert all px values to rem"** - Conversion du fichier entier

#### **Méthode 3 - Menu contextuel :**
- **Clic droit** sur un fichier CSS dans l'Explorer
- Sélectionnez **"Convert all px to rem in file"**

#### **Méthode 4 - Palette de commandes :**
- **`Cmd+Shift+P`** → "No Px in CSS: Convert all px to rem in current file"
- Confirmation avec comptage des valeurs à convertir

#### **Méthode 5 - Auto-conversion :**
- Activez `autoConvertOnSave` dans les paramètres
- Les valeurs px sont automatiquement converties à chaque sauvegarde

## ⚙️ Configuration

### Paramètres disponibles

```json
{
  "noPxInCss.fileExtensions": [
    "css", "scss", "sass", "less", "stylus", "vue"
  ],
  "noPxInCss.ignoreThreshold": 1,
  "noPxInCss.ignorePatterns": [
    "**/.nuxt/**",
    "**/.output/**", 
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/.git/**",
    "**/coverage/**"
  ],
  "noPxInCss.enableInlineDiagnostics": true,
  "noPxInCss.diagnosticSeverity": "warning",
  "noPxInCss.autoConvertOnSave": false
}
```

### Parameter descriptions

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `fileExtensions` | `array` | `["css", "scss", "sass", "less", "stylus", "vue"]` | File extensions to scan |
| `ignoreThreshold` | `number` | `1` | Ignore px values less than or equal to this threshold (0 = scan all values) |
| `ignorePatterns` | `array` | `["**/node_modules/**", ...]` | Glob patterns to ignore |
| `enableInlineDiagnostics` | `boolean` | `true` | Show alerts in code |
| `diagnosticSeverity` | `string` | `"warning"` | Severity level (`error`, `warning`, `information`) |
| `autoConvertOnSave` | `boolean` | `false` | Automatic conversion on save |

### Configuration examples

#### **For a Vue/Nuxt project:**
```json
{
  "noPxInCss.fileExtensions": ["css", "scss", "vue"],
  "noPxInCss.ignorePatterns": [
    "**/.nuxt/**",
    "**/.output/**",
    "**/node_modules/**"
  ]
}
```

#### **For a React/Next.js project:**
```json
{
  "noPxInCss.fileExtensions": ["css", "scss", "jsx", "tsx"],
  "noPxInCss.autoConvertOnSave": true,
  "noPxInCss.diagnosticSeverity": "information"
}
```

#### **Strict mode (convert everything):**
```json
{
  "noPxInCss.ignoreThreshold": 0,
  "noPxInCss.diagnosticSeverity": "error",
  "noPxInCss.autoConvertOnSave": true
}
```

#### **Ignore only fine borders (≤ 2px):**
```json
{
  "noPxInCss.ignoreThreshold": 2,
  "noPxInCss.diagnosticSeverity": "warning"
}
```

## 📋 Available commands

| Command | Description | Shortcut |
|----------|-------------|-----------|
| `no-px-in-css.scanFiles` | Scan files for px values | - |
| `no-px-in-css.refresh` | Refresh view | - |
| `no-px-in-css.goToLocation` | Go to px value location | - |
| `no-px-in-css.convertToRem` | Convert a px value to rem | - |
| `no-px-in-css.convertAllInFile` | Convert all px values in file | - |
| `no-px-in-css.convertAllInCurrentFile` | Convert with confirmation | `Cmd+Shift+P` |

## 🧮 Conversion logic

- **Conversion base**: 16px = 1rem (HTML standard)
- **Formula**: `rem = px / 16`
- **Precision**: 4 decimals, trailing zeros removed
- **Exclusion threshold**: Configurable to ignore small values
- **Examples**:
  - `24px` → `1.5rem`
  - `12px` → `0.75rem`
  - `32px` → `2rem`
  - `14px` → `0.875rem`
  - `1px` → ignored if threshold ≥ 1 (borders)
  - `2px` → ignored if threshold ≥ 2 (fine borders)

## 🎨 Supported file types

- **CSS** (`.css`)
- **SCSS** (`.scss`) 
- **Sass** (`.sass`)
- **LESS** (`.less`)
- **Stylus** (`.stylus`)
- **Vue** (`.vue`) - Single File Components
- **Customizable** via configuration

## 🔧 Recommended workflow

### **1. Initial configuration**
```json
{
  "noPxInCss.enableInlineDiagnostics": true,
  "noPxInCss.diagnosticSeverity": "warning"
}
```

### **2. Active development**
- Use **inline diagnostics** to see suggestions
- Convert progressively with **Quick Fixes**

### **3. Refactoring existing files**
- Use **"Convert all px to rem in current file"** 
- Check results before saving

### **4. Automation (optional)**
```json
{
  "noPxInCss.autoConvertOnSave": true
}
```

## 🚨 Notifications and feedback

### **Auto-conversion:**
> ✅ "Auto-converted 5 px values to rem in styles.css"

### **Manual conversion:**
> ✅ "Converted 24px to 1.5rem"

### **Scan completed:**
> ℹ️ "Found 42 px values"

## 🐛 Known issues

- Px values in CSS comments are detected
- `calc()` expressions containing px are not converted
- Px values in JavaScript strings may be detected

## 📝 Version notes

### 1.0.0 (Current version) - September 22, 2025

#### ✨ **New features**
- ✅ Smart px value scanning with filtering
- ✅ Interactive hierarchical view by folders/files  
- ✅ Inline diagnostics with colored underlines
- ✅ Quick Fixes (lightbulbs) with conversion suggestions
- ✅ Individual and batch conversion
- ✅ Auto-conversion on save (optional)
- ✅ Context menu for files
- ✅ Advanced and flexible configuration
- ✅ Multi-format support (CSS, SCSS, Vue, etc.)

#### 🔧 **Technical improvements**
- ✅ Centralized configuration manager
- ✅ Robust error handling
- ✅ Optimized performance for large projects
- ✅ File type validation
- ✅ Configurable exclusion patterns
- ✅ Threshold-based filtering system
- ✅ TypeScript implementation with full type safety

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. **Report bugs** via GitHub Issues
2. **Propose features** 
3. **Submit pull requests**
4. **Improve documentation**

## 📄 License

[MIT License](LICENSE)

## 🔗 Useful links

- [GitHub Repository](https://github.com/Beliwin/no-px-in-css)
- [VS Code Extensions Documentation](https://code.visualstudio.com/api)
- [CSS rem vs px Guide](https://www.w3schools.com/css/css_units.asp)
- [Web accessibility and relative units](https://developer.mozilla.org/en-US/docs/Web/CSS/length)

---

**Transform your CSS into accessible and responsive units!** 🎉✨
