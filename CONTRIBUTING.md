# Contributing Guidelines

**Languages:** [English](#english) | [Français](#français)

---

## English

Contributing to this project should be as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features

## GitHub is used for everything

GitHub is used to host code, to track issues and feature requests, as well as accept pull requests.

Pull requests are the best way to propose changes to the codebase.

## 🚀 Development Environment Setup

### Prerequisites

- **Visual Studio Code** with **Dev Containers** extension
- **Docker** installed and running

### Setup Steps

#### 1. Clone and open the project

```bash
git clone https://github.com/Thank-you-Linus/Linus-Dashboard.git
cd Linus-Dashboard
code .
```

#### 2. Launch the development container

1. **Open in container**: When VS Code detects the `.devcontainer.json` file, a notification appears
   - Click **"Reopen in Container"**
   - Or use `Ctrl+Shift+P` → **"Dev Containers: Reopen in Container"**

2. **Wait for installation**: The container will automatically:
   - Download the Python 3.13 image
   - Install all dependencies via `scripts/setup`
   - Configure the development environment

   ⏱️ *This step may take a few minutes on first launch*

#### 3. Launch Home Assistant

Once the container is ready, you have **two options**:

**Option A: Via Debugger (Recommended)**
1. Go to **"Run and Debug"** tab (`Ctrl+Shift+D`)
2. Select **"Home Assistant"** from the dropdown
3. Click **"Play"** (▶️) or press `F5`

**Option B: Via VS Code Task**
1. `Ctrl+Shift+P` → **"Tasks: Run Task"**
2. Select **"Run Home Assistant on port 8123"**

🌟 **Home Assistant will be accessible at**: `http://localhost:8123`

#### 4. Develop the frontend

In a **new terminal** (while Home Assistant is running):

```bash
# For development with watch mode
npm run build-dev

# For a single build
npm run build
```

### 🔧 Useful Commands

```bash
# Lint the code
scripts/lint

# Initial setup (already done automatically)
scripts/setup

# Launch Home Assistant in development mode
scripts/develop
```

### 📁 Project Structure

```
/workspaces/Linus-Dashboard/
├── .devcontainer.json          # Dev container configuration
├── .vscode/
│   ├── launch.json            # Debug configurations
│   └── tasks.json             # VS Code tasks
├── config/                    # Home Assistant configuration
├── custom_components/         # Linus Dashboard component
├── src/                       # TypeScript source code
├── scripts/                   # Utility scripts
└── package.json              # Node.js dependencies
```

## 📝 Contribution Process

1. **Fork** the repo and create your branch from `main`
2. **Develop** using the development environment
3. **Test** your contribution with Home Assistant running
4. **Lint** your code with `scripts/lint`
5. **Update** documentation if necessary
6. **Submit** your pull request!

## 🐛 Report bugs

GitHub issues are used to track public bugs.
Report a bug by [opening a new issue](../../issues/new/choose)!

### Detailed bug reports

**Good bug reports** typically have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## 🎨 Consistent coding style

- Use the included ESLint/Prettier configurations
- TypeScript code must respect project standards
- Test with `scripts/lint` before submitting

## 🧪 Test your code

This custom component is based on the [Linus Dashboard template](https://github.com/Thank-you-Linus/Linus-Dashboard).

The containerized development environment provides:
- A standalone Home Assistant instance
- Pre-configured setup with [`configuration.yaml`](./config/configuration.yaml)
- Automatic frontend reloading in development mode
- Integrated debugging tools

## � License

Any contributions you make will be under the MIT Software License.

In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project.

By contributing, you agree that your contributions will be licensed under its MIT License.

---

## Français

Contribuer à ce projet doit être aussi simple et transparent que possible, que ce soit pour :

- Signaler un bug
- Discuter de l'état actuel du code
- Soumettre un correctif
- Proposer de nouvelles fonctionnalités

## GitHub est utilisé pour tout

GitHub est utilisé pour héberger le code, suivre les problèmes et les demandes de fonctionnalités, ainsi que pour accepter les pull requests.

Les pull requests sont la meilleure façon de proposer des modifications au code.

## 🚀 Configuration de l'environnement de développement

- **Visual Studio Code** avec l'extension **Dev Containers**
- **Docker** installé et en cours d'exécution

### Étapes de configuration

#### 1. Cloner et ouvrir le projet

```bash
git clone https://github.com/Thank-you-Linus/Linus-Dashboard.git
cd Linus-Dashboard
code .
```

#### 2. Lancer le conteneur de développement

1. **Ouvrir dans le conteneur** : Quand VS Code détecte le fichier `.devcontainer.json`, une notification apparaît
   - Cliquer sur **"Reopen in Container"**
   - Ou utiliser `Ctrl+Shift+P` → **"Dev Containers: Reopen in Container"**

2. **Attendre l'installation** : Le conteneur va automatiquement :
   - Télécharger l'image Python 3.13
   - Installer toutes les dépendances via `scripts/setup`
   - Configurer l'environnement de développement

   ⏱️ *Cette étape peut prendre quelques minutes lors du premier lancement*

#### 3. Lancer Home Assistant

Une fois le conteneur prêt, vous avez **deux options** :

**Option A : Via le Debugger (Recommandée)**
1. Aller dans l'onglet **"Run and Debug"** (`Ctrl+Shift+D`)
2. Sélectionner **"Home Assistant"** dans la liste déroulante
3. Cliquer sur **"Play"** (▶️) ou appuyer sur `F5`

**Option B : Via la tâche VS Code**
1. `Ctrl+Shift+P` → **"Tasks: Run Task"**
2. Sélectionner **"Run Home Assistant on port 8123"**

🌟 **Home Assistant sera accessible sur** : `http://localhost:8123`

#### 4. Développer le frontend

Dans un **nouveau terminal** (pendant que Home Assistant tourne) :

```bash
# Pour le développement avec watch mode
npm run build-dev

# Pour un build unique
npm run build
```

### 🔧 Commandes utiles

```bash
# Linter le code
scripts/lint

# Setup initial (déjà fait automatiquement)
scripts/setup

# Lancer Home Assistant en mode développement
scripts/develop
```

### 📁 Structure du projet

```
/workspaces/Linus-Dashboard/
├── .devcontainer.json          # Configuration du conteneur de dev
├── .vscode/
│   ├── launch.json            # Configurations de debug
│   └── tasks.json             # Tâches VS Code
├── config/                    # Configuration Home Assistant
├── custom_components/         # Composant Linus Dashboard
├── src/                       # Code source TypeScript
├── scripts/                   # Scripts utilitaires
└── package.json              # Dépendances Node.js
```

## 📝 Processus de contribution

1. **Fork** le repo et créer votre branche depuis `main`
2. **Développer** en utilisant l'environnement de développement
3. **Tester** votre contribution avec Home Assistant en cours d'exécution
4. **Linter** votre code avec `scripts/lint`
5. **Mettre à jour** la documentation si nécessaire
6. **Soumettre** votre pull request !

## 🐛 Signaler des bugs

Les issues GitHub sont utilisées pour suivre les bugs publics.
Signaler un bug en [ouvrant une nouvelle issue](../../issues/new/choose) !

### Rapports de bug détaillés

**Les bons rapports de bugs** contiennent généralement :

- Un résumé rapide et/ou le contexte
- Les étapes pour reproduire
  - Soyez spécifique !
  - Donnez un exemple de code si possible
- Ce à quoi vous vous attendiez
- Ce qui se passe réellement
- Notes (pourquoi vous pensez que cela pourrait arriver, ou ce que vous avez essayé qui n'a pas fonctionné)

## 🎨 Style de code cohérent

- Utilisez les configurations ESLint/Prettier incluses
- Le code TypeScript doit respecter les standards du projet
- Testez avec `scripts/lint` avant de soumettre

## 🧪 Tester votre code

Ce composant personnalisé est basé sur le [template Linus Dashboard](https://github.com/Thank-you-Linus/Linus-Dashboard).

L'environnement de développement en conteneur fournit :
- Une instance Home Assistant autonome
- Configuration pré-configurée avec [`configuration.yaml`](./config/configuration.yaml)
- Rechargement automatique du frontend en mode développement
- Outils de debug intégrés

## 📄 Licence

Toutes les contributions que vous apportez seront sous la Licence Logicielle MIT.

En bref, lorsque vous soumettez des modifications de code, vos soumissions sont comprises comme étant sous la même [Licence MIT](http://choosealicense.com/licenses/mit/) qui couvre le projet.

En contribuant, vous acceptez que vos contributions soient licenciées sous sa Licence MIT.
