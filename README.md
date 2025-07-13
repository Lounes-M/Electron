# Electron

Une application desktop intelligente pour rechercher et analyser le contenu de vos fichiers locaux avec des capacités OCR et d'intelligence artificielle.

## 🚀 Fonctionnalités

- **Interface moderne** avec thème sombre/clair
- **Indexation intelligente** de dossiers avec surveillance en temps réel
- **Recherche full-text** avancée avec support FTS5 SQLite
- **OCR intégré** pour l'analyse d'images et de documents scannés
- **Intégration IA** pour l'analyse contextuelle (local et API externes)
- **Performance optimisée** avec cache et worker threads
- **Multiplateforme** (Windows, macOS, Linux)

## 🛠️ Technologies

- **Frontend**: Electron + React + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Node.js avec TypeScript
- **Base de données**: SQLite avec FTS5 (Full-Text Search)
- **OCR**: Tesseract.js
- **IA**: Support pour modèles locaux (Ollama) et APIs externes (OpenAI, Anthropic)

## 📁 Structure du projet

```
src/
├── main/           # Processus principal Electron
│   ├── main.ts     # Point d'entrée principal
│   └── preload.ts  # Script de préchargement sécurisé
├── renderer/       # Interface React
│   ├── components/ # Composants React
│   ├── hooks/      # Hooks personnalisés
│   ├── store/      # Gestion d'état Zustand
│   ├── App.tsx     # Composant principal
│   └── index.tsx   # Point d'entrée renderer
├── shared/         # Types et utilitaires partagés
│   └── types.ts    # Définitions TypeScript
├── services/       # Services backend
│   ├── indexing.ts # Service d'indexation
│   ├── ocr.ts      # Service OCR
│   ├── search.ts   # Service de recherche
│   └── config.ts   # Service de configuration
└── database/       # Base de données SQLite
    ├── schema.ts   # Schéma de base de données
    └── database.ts # Service de base de données
```

## 🏃‍♂️ Démarrage rapide

### Prérequis

- Node.js 18+ 
- npm ou yarn

### Installation

1. Cloner le projet :
```bash
git clone <repository-url>
cd electron
```

2. Installer les dépendances :
```bash
npm install
```

3. Lancer en mode développement :
```bash
npm start
```

4. Builder l'application :
```bash
npm run make
```

## 🎯 Utilisation

1. **Sélectionner des dossiers** : Utilisez le bouton "Ajouter un dossier" pour sélectionner les dossiers à indexer.

2. **Rechercher** : Tapez votre requête dans la barre de recherche. Supports :
   - Recherche textuelle classique
   - Recherche floue (fuzzy)
   - Filtres par type de fichier
   - Filtres par date

3. **Analyser avec l'IA** : Utilisez l'analyse contextuelle pour obtenir des insights sur vos fichiers.

4. **Configurer** : Accédez aux paramètres pour :
   - Configurer l'OCR (langues)
   - Choisir le fournisseur IA
   - Personnaliser l'interface
   - Gérer les motifs d'exclusion

## ⚙️ Configuration

L'application stocke sa configuration dans le dossier utilisateur :
- **macOS**: `~/Library/Application Support/Electron/`
- **Windows**: `%APPDATA%/Electron/`
- **Linux**: `~/.config/Electron/`

### Configuration IA

#### Modèles locaux (Ollama)
```bash
# Installer Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Télécharger un modèle
ollama pull llama3.1:8b
```

#### APIs externes
Configurez vos clés API dans les paramètres :
- OpenAI API Key
- Anthropic API Key

## 🔧 Développement

### Scripts disponibles

- `npm start` - Lancer en mode développement
- `npm run package` - Packager l'application
- `npm run make` - Créer les installateurs
- `npm run lint` - Vérifier le code

### Architecture

L'application suit une architecture modulaire :

- **Processus principal** : Gère la fenêtre, les services backend, et la communication IPC
- **Processus renderer** : Interface React avec état géré par Zustand
- **Services** : Modules autonomes pour l'indexation, OCR, recherche, etc.
- **Base de données** : SQLite avec FTS5 pour la recherche full-text

### Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -am 'Ajouter nouvelle fonctionnalité'`)
4. Push sur la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- [Electron](https://electronjs.org/) pour le framework desktop
- [React](https://reactjs.org/) pour l'interface utilisateur
- [Tailwind CSS](https://tailwindcss.com/) pour le styling
- [SQLite](https://sqlite.org/) pour la base de données
- [Tesseract.js](https://tesseract.projectnaptha.com/) pour l'OCR
- [Zustand](https://github.com/pmndrs/zustand) pour la gestion d'état

## 🐛 Signaler un bug

Si vous trouvez un bug, veuillez créer une issue avec :
- Description détaillée du problème
- Étapes pour reproduire
- Version de l'application
- Système d'exploitation

## 💡 Demander une fonctionnalité

Pour demander une nouvelle fonctionnalité, créez une issue avec :
- Description de la fonctionnalité souhaitée
- Cas d'usage
- Mockups ou exemples si disponibles
