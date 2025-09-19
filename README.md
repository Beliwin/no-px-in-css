# No Px in CSS

[![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)](https://marketplace.visualstudio.com/)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.104.0+-green.svg)](https://code.visualstudio.com/)

Une extension VS Code qui vous aide à identifier et convertir les valeurs en pixels (px) vers des unités rem dans vos fichiers CSS, SCSS, SASS, LESS et autres.

## 🎯 Fonctionnalités

- **🔍 Scan automatique** : Détecte toutes les valeurs px dans votre workspace
- **📁 Vue organisée** : Affiche les résultats par dossiers et fichiers
- **⚡ Conversion rapide** : Convertit instantanément px en rem (base 16px)
- **📍 Navigation facile** : Navigue directement vers les occurrences
- **🎛️ Configuration flexible** : Personnalisez les extensions de fichiers et les patterns d'exclusion
- **🚫 Ignore 1px** : Option pour ignorer les valeurs 1px (bordures, etc.)

## 📦 Installation

1. Ouvrez VS Code
2. Allez dans l'onglet Extensions (`Ctrl+Shift+X`)
3. Recherchez "No Px in CSS"
4. Cliquez sur "Install"

## 🚀 Utilisation

### Scanner votre workspace

1. Ouvrez la vue "Px Scanner" dans la barre latérale
2. Cliquez sur l'icône de recherche pour scanner vos fichiers
3. Les résultats s'affichent organisés par dossiers et fichiers

### Convertir les valeurs

Pour chaque valeur px trouvée, vous avez deux options :

- **📁 Aller au fichier** : Clique sur l'icône pour ouvrir le fichier à l'emplacement exact
- **🔢 Convertir en rem** : Clique sur l'icône pour convertir automatiquement en rem

### Vue d'exemple

```
PX SCANNER: PX VALUES
├── 📁 src/styles
│   ├── 📄 main.css (5)
│   │   ├── 24px - Line 12    margin: 24px auto;
│   │   ├── 16px - Line 15    font-size: 16px;
│   │   └── ...
│   └── 📄 components.scss (3)
└── 📁 public
    └── ...
```

## ⚙️ Configuration

Cette extension contribue aux paramètres suivants :

### `noPxInCss.fileExtensions`
- **Type**: `array`
- **Défaut**: `["css", "scss", "sass", "less", "stylus"]`
- **Description**: Extensions de fichiers à scanner

### `noPxInCss.ignore1px`
- **Type**: `boolean`
- **Défaut**: `true`
- **Description**: Ignorer les valeurs 1px lors du scan

### `noPxInCss.ignorePatterns`
- **Type**: `array`
- **Défaut**: `["**/node_modules/**", "**/dist/**", "**/build/**", "**/.git/**", "**/coverage/**"]`
- **Description**: Patterns glob pour ignorer certains fichiers/dossiers

### Exemple de configuration

```json
{
  "noPxInCss.fileExtensions": ["css", "scss", "vue", "jsx"],
  "noPxInCss.ignore1px": false,
  "noPxInCss.ignorePatterns": [
    "**/node_modules/**",
    "**/dist/**",
    "**/*.min.css",
    "**/vendor/**"
  ]
}
```

## 📋 Commandes

| Commande | Description |
|----------|-------------|
| `no-px-in-css.scanFiles` | Scanner les fichiers pour les valeurs px |
| `no-px-in-css.refresh` | Actualiser la vue |
| `no-px-in-css.goToLocation` | Aller à l'emplacement d'une valeur px |
| `no-px-in-css.convertToRem` | Convertir une valeur px en rem |

## 🎨 Types de fichiers supportés

- **CSS** (`.css`)
- **SCSS** (`.scss`)
- **Sass** (`.sass`)
- **LESS** (`.less`)
- **Stylus** (`.stylus`)
- **Vue** (`.vue`)
- Et plus selon votre configuration...

## 🧮 Logique de conversion

- **Base de conversion** : 16px = 1rem
- **Formule** : `rem = px / 16`
- **Exemples** :
  - `24px` → `1.5rem`
  - `12px` → `0.75rem`
  - `32px` → `2rem`

## 🐛 Problèmes connus

- Les valeurs px dans les commentaires CSS sont également détectées
- La conversion ne fonctionne que pour les valeurs numériques simples (pas de `calc()`)

## 📝 Notes de version

### 0.0.1 (Version initiale)

- ✅ Scan des valeurs px dans les fichiers CSS/SCSS/SASS/LESS
- ✅ Vue hiérarchique par dossiers et fichiers
- ✅ Navigation vers les occurrences
- ✅ Conversion px → rem
- ✅ Configuration personnalisable
- ✅ Support des patterns d'exclusion

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Reporter des bugs
2. Proposer de nouvelles fonctionnalités
3. Soumettre des pull requests

## 📄 Licence

[MIT License](LICENSE)

## 🔗 Liens utiles

- [Documentation VS Code Extensions](https://code.visualstudio.com/api)
- [Guide CSS rem vs px](https://www.w3schools.com/css/css_units.asp)

---

**Profitez de votre workspace sans pixels !** 🎉
