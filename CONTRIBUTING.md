# Contributing to Electron - AI File Companion

Merci de votre intérêt pour contribuer à ce projet ! Voici comment vous pouvez aider.

## 🚀 Comment contribuer

### 1. Fork le projet
Cliquez sur le bouton "Fork" en haut à droite de la page GitHub.

### 2. Cloner votre fork
```bash
git clone https://github.com/VOTRE-USERNAME/Electron.git
cd Electron
```

### 3. Créer une branche
```bash
git checkout -b feature/nouvelle-fonctionnalite
```

### 4. Faire vos changements
- Suivez les conventions de code existantes
- Ajoutez des tests si nécessaire
- Documentez vos changements

### 5. Tester vos changements
```bash
npm install
npm start
```

### 6. Commit et push
```bash
git add .
git commit -m "feat: description de votre changement"
git push origin feature/nouvelle-fonctionnalite
```

### 7. Créer une Pull Request
Ouvrez une Pull Request depuis votre fork vers la branche `main` du projet principal.

## 📝 Conventions

### Messages de commit
Utilisez le format [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` pour une nouvelle fonctionnalité
- `fix:` pour un bug fix
- `docs:` pour la documentation
- `style:` pour le formatage
- `refactor:` pour la refactorisation
- `test:` pour les tests
- `chore:` pour les tâches de maintenance

### Code Style
- Utilisez TypeScript pour tout nouveau code
- Suivez les règles ESLint configurées
- Ajoutez des commentaires pour les fonctions complexes
- Utilisez des noms de variables descriptifs

## 🐛 Signaler un bug

1. Vérifiez que le bug n'est pas déjà signalé dans les [Issues](https://github.com/Lounes-M/Electron/issues)
2. Créez une nouvelle issue avec le template "Bug Report"
3. Incluez :
   - Description détaillée du problème
   - Étapes pour reproduire
   - Version de l'OS et de l'application
   - Screenshots si pertinents

## 💡 Proposer une fonctionnalité

1. Vérifiez qu'elle n'est pas déjà proposée dans les [Issues](https://github.com/Lounes-M/Electron/issues)
2. Créez une nouvelle issue avec le template "Feature Request"
3. Décrivez :
   - Le problème que cela résoudrait
   - La solution proposée
   - Des alternatives considérées

## 🏗️ Structure du projet

```
src/
├── main/           # Processus principal Electron
├── renderer/       # Interface React/TypeScript
├── shared/         # Types et utilitaires partagés
├── services/       # Services backend
└── database/       # Base de données SQLite
```

## 📚 Ressources utiles

- [Documentation Electron](https://electronjs.org/docs)
- [Documentation React](https://reactjs.org/docs)
- [Documentation TypeScript](https://www.typescriptlang.org/docs)
- [Documentation SQLite](https://www.sqlite.org/docs.html)

## ❓ Questions

Si vous avez des questions, n'hésitez pas à :
- Ouvrir une [Discussion](https://github.com/Lounes-M/Electron/discussions)
- Créer une issue avec le label "question"

Merci pour votre contribution ! 🙏
