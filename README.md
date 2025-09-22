# No Px in CSS

[![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)](https://marketplace.visualstudio.com/)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.104.0+-green.svg)](https://code.visualstudio.com/)

Une extension VS Code complète qui vous aide à identifier, analyser et convertir automatiquement les valeurs en pixels (px) vers des unités rem dans vos fichiers CSS, SCSS, SASS, LESS, Vue et autres.

## 🎯 Fonctionnalités

### 🔍 **Détection et analyse**
- **Scan automatique** : Détecte toutes les valeurs px dans votre workspace
- **Vue organisée** : Affiche les résultats par dossiers et fichiers avec compteurs
- **Filtrage intelligent** : Ignore les dossiers de build, node_modules, etc.
- **Support multi-formats** : CSS, SCSS, SASS, LESS, Stylus, Vue

### 🚨 **Alertes en temps réel** 
- **Diagnostics inline** : Soulignements colorés directement dans le code
- **Quick Fixes** : Ampoules VS Code avec suggestions de conversion
- **Niveaux de sévérité** : Error, Warning ou Information configurable
- **Mise à jour live** : Détection en temps réel pendant la frappe

### ⚡ **Conversion rapide**
- **Conversion individuelle** : Clic sur bouton pour chaque valeur
- **Conversion de fichier entier** : Menu contextuel sur fichiers
- **Conversion automatique** : À la sauvegarde (optionnel)
- **Actions par lot** : Depuis la palette de commandes

### 🎛️ **Configuration avancée**
- **Extensions personnalisables** : Ajoutez vos types de fichiers
- **Patterns d'exclusion** : Ignorez certains dossiers/fichiers
- **Ignore 1px** : Optionnel pour les bordures
- **Auto-conversion** : Activable pour la sauvegarde

## 📦 Installation

1. Ouvrez VS Code
2. Allez dans l'onglet Extensions (`Ctrl+Shift+X`)
3. Recherchez "No Px in CSS"
4. Cliquez sur "Install"

## 🚀 Utilisation

### 🔍 Scanner votre workspace

1. Ouvrez la vue "Px Scanner" dans la barre latérale
2. Cliquez sur l'icône de recherche pour scanner vos fichiers
3. Les résultats s'affichent organisés par dossiers et fichiers

### 🎯 Conversion des valeurs

#### **Méthode 1 - Boutons dans la vue :**
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
  "noPxInCss.ignore1px": true,
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

### Description des paramètres

| Paramètre | Type | Défaut | Description |
|-----------|------|---------|-------------|
| `fileExtensions` | `array` | `["css", "scss", "sass", "less", "stylus", "vue"]` | Extensions de fichiers à scanner |
| `ignore1px` | `boolean` | `true` | Ignorer les valeurs 1px (bordures) |
| `ignorePatterns` | `array` | `["**/node_modules/**", ...]` | Patterns glob à ignorer |
| `enableInlineDiagnostics` | `boolean` | `true` | Afficher les alertes dans le code |
| `diagnosticSeverity` | `string` | `"warning"` | Niveau de sévérité (`error`, `warning`, `information`) |
| `autoConvertOnSave` | `boolean` | `false` | Conversion automatique à la sauvegarde |

### Exemples de configuration

#### **Pour un projet Vue/Nuxt :**
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

#### **Pour un projet React/Next.js :**
```json
{
  "noPxInCss.fileExtensions": ["css", "scss", "jsx", "tsx"],
  "noPxInCss.autoConvertOnSave": true,
  "noPxInCss.diagnosticSeverity": "information"
}
```

#### **Mode strict (tout convertir) :**
```json
{
  "noPxInCss.ignore1px": false,
  "noPxInCss.diagnosticSeverity": "error",
  "noPxInCss.autoConvertOnSave": true
}
```

## 📋 Commandes disponibles

| Commande | Description | Raccourci |
|----------|-------------|-----------|
| `no-px-in-css.scanFiles` | Scanner les fichiers pour les valeurs px | - |
| `no-px-in-css.refresh` | Actualiser la vue | - |
| `no-px-in-css.goToLocation` | Aller à l'emplacement d'une valeur px | - |
| `no-px-in-css.convertToRem` | Convertir une valeur px en rem | - |
| `no-px-in-css.convertAllInFile` | Convertir toutes les valeurs px du fichier | - |
| `no-px-in-css.convertAllInCurrentFile` | Convertir avec confirmation | `Cmd+Shift+P` |

## 🧮 Logique de conversion

- **Base de conversion** : 16px = 1rem (standard HTML)
- **Formule** : `rem = px / 16`
- **Précision** : 4 décimales, zéros supprimés
- **Exemples** :
  - `24px` → `1.5rem`
  - `12px` → `0.75rem`
  - `32px` → `2rem`
  - `14px` → `0.875rem`

## 🎨 Types de fichiers supportés

- **CSS** (`.css`)
- **SCSS** (`.scss`) 
- **Sass** (`.sass`)
- **LESS** (`.less`)
- **Stylus** (`.stylus`)
- **Vue** (`.vue`) - Single File Components
- **Personnalisable** via la configuration

## 🔧 Workflow recommandé

### **1. Configuration initiale**
```json
{
  "noPxInCss.enableInlineDiagnostics": true,
  "noPxInCss.diagnosticSeverity": "warning"
}
```

### **2. Développement actif**
- Utilisez les **diagnostics inline** pour voir les suggestions
- Convertissez au fur et à mesure avec les **Quick Fixes**

### **3. Refactoring de fichiers existants**
- Utilisez **"Convert all px to rem in current file"** 
- Vérifiez les résultats avant de sauvegarder

### **4. Automatisation (optionnel)**
```json
{
  "noPxInCss.autoConvertOnSave": true
}
```

## 🚨 Notifications et feedback

### **Auto-conversion :**
> ✅ "Auto-converted 5 px values to rem in styles.css"

### **Conversion manuelle :**
> ✅ "Converted 24px to 1.5rem"

### **Scan terminé :**
> ℹ️ "Found 42 px values"

## 🐛 Problèmes connus

- Les valeurs px dans les commentaires CSS sont détectées
- Les expressions `calc()` contenant px ne sont pas converties
- Les valeurs px dans les chaînes de caractères JavaScript peuvent être détectées

## 📝 Notes de version

### 0.0.1 (Version actuelle)

#### ✨ **Nouvelles fonctionnalités**
- ✅ Scan intelligent des valeurs px avec filtrage
- ✅ Vue hiérarchique interactive par dossiers/fichiers  
- ✅ Diagnostics inline avec soulignements colorés
- ✅ Quick Fixes (ampoules) avec suggestions de conversion
- ✅ Conversion individuelle et par lot
- ✅ Auto-conversion à la sauvegarde (optionnel)
- ✅ Menu contextuel pour fichiers
- ✅ Configuration avancée et flexible
- ✅ Support multi-formats (CSS, SCSS, Vue, etc.)

#### 🔧 **Améliorations techniques**
- ✅ Gestionnaire de configuration centralisé
- ✅ Gestion robuste des erreurs
- ✅ Performance optimisée pour gros projets
- ✅ Validation des types de fichiers
- ✅ Patterns d'exclusion configurables

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. **Reporter des bugs** via les Issues GitHub
2. **Proposer des fonctionnalités** 
3. **Soumettre des pull requests**
4. **Améliorer la documentation**

## 📄 Licence

[MIT License](LICENSE)

## 🔗 Liens utiles

- [Repository GitHub](https://github.com/Beliwin/no-px-in-css)
- [Documentation VS Code Extensions](https://code.visualstudio.com/api)
- [Guide CSS rem vs px](https://www.w3schools.com/css/css_units.asp)
- [Accessibilité web et unités relatives](https://developer.mozilla.org/en-US/docs/Web/CSS/length)

---

**Transformez votre CSS en unités accessibles et responsives !** 🎉✨
