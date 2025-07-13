# AI File Companion - Instructions Copilot

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Contexte du projet

Ce projet est une application desktop Electron avec React et TypeScript qui créé un assistant IA intelligent pour rechercher et analyser le contenu de dossiers locaux avec capacités OCR.

## Technologies utilisées

- **Frontend**: Electron + React + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Node.js avec TypeScript
- **Base de données**: SQLite avec FTS5 (Full-Text Search)
- **OCR**: Tesseract.js
- **IA**: Support pour modèles locaux (Ollama) et APIs externes (OpenAI, Anthropic)

## Architecture du projet

```
src/
├── main/           # Processus principal Electron
├── renderer/       # Interface React
├── shared/         # Types et utilitaires partagés
├── services/       # Services (indexation, OCR, IA)
└── database/       # Schémas et migrations SQLite
```

## Conventions de codage

- Utiliser TypeScript strict mode
- Composants React fonctionnels avec hooks
- Interfaces TypeScript pour tous les types de données
- Services modulaires et réutilisables
- Gestion d'erreur robuste avec try/catch
- Logging structuré pour le débogage

## Fonctionnalités principales

1. **Interface utilisateur moderne** avec thème sombre/clair
2. **Sélection et indexation de dossiers** en temps réel
3. **Moteur de recherche intelligent** avec full-text et recherche sémantique
4. **OCR intégré** pour l'analyse d'images
5. **Intégration IA** pour l'analyse contextuelle
6. **Performance optimisée** avec cache et worker threads

## Priorités de développement

- Performance et réactivité de l'interface
- Robustesse de l'indexation des fichiers
- Précision de l'OCR et de l'IA
- Expérience utilisateur intuitive
- Sécurité des données locales
