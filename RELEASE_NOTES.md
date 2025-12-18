# 🧪 Beta Release

> **This is a pre-release version for testing.**  
> Please report any issues on [GitHub Issues](https://github.com/Thank-you-Linus/Linus-Dashboard/issues)

---

## ✨ What's New

- **AI-Powered Intelligent Release System** - Introduces an automated release workflow that analyzes git commits semantically, determines appropriate version bumps (major/minor/patch), and generates comprehensive release notes with AI assistance. The system adapts automatically between first beta releases (requiring analysis) and incremental betas (auto-increment), streamlining the entire release process from version detection to publication.

<details>
<summary>📖 <b>View detailed descriptions / Voir les descriptions détaillées</b></summary>

### 🇬🇧 English


- **AI-Powered Intelligent Release System** - Introduces an automated release workflow that analyzes git commits semantically, determines appropriate version bumps (major/minor/patch), and generates comprehensive release notes with AI assistance. The system adapts automatically between first beta releases (requiring analysis) and incremental betas (auto-increment), streamlining the entire release process from version detection to publication.


### 🇫🇷 Français


- **Système de Release Intelligent avec IA** - Introduction d'un workflow de release automatisé qui analyse les commits git de manière sémantique, détermine les augmentations de version appropriées (majeure/mineure/patch) et génère des notes de version complètes avec l'assistance de l'IA. Le système s'adapte automatiquement entre les premières versions beta (nécessitant une analyse) et les betas incrémentielles (auto-incrémentation), rationalisant l'ensemble du processus de release de la détection de version à la publication.


</details>

## 🐛 Bug Fixes

- **Release Notifications Formatting** - Improved Discord notification formatting and URL display for better readability and clickability in release announcements. URLs are now properly formatted and displayed in notification messages sent to the beta testing community.

## ⚡ Improvements

- **Activity Detection Simplification** - Clarified the distinction between standard activity detection and Linus Brain-powered detection, making it easier for users to understand which detection method is being used and how they differ in functionality
- **Unified Release Notes System** - Simplified the release notes workflow to use a single RELEASE_NOTES.md file instead of multiple separate files, reducing complexity and making it easier to maintain consistent release documentation
- **Unified Beta Release Commands** - Consolidated multiple beta release commands into a single `/release-beta` command that intelligently adapts to the release context, providing a more streamlined and intuitive release workflow

<details>
<summary>🇫🇷 <b>Version française</b></summary>

- **Simplification de la Détection d'Activité** - Clarification de la distinction entre la détection d'activité standard et la détection alimentée par Linus Brain, facilitant la compréhension par les utilisateurs de la méthode de détection utilisée et de leurs différences fonctionnelles
- **Système de Notes de Version Unifié** - Simplification du workflow des notes de version pour utiliser un seul fichier RELEASE_NOTES.md au lieu de plusieurs fichiers séparés, réduisant la complexité et facilitant le maintien d'une documentation de release cohérente
- **Commandes de Release Beta Unifiées** - Consolidation de plusieurs commandes de release beta en une seule commande `/release-beta` qui s'adapte intelligemment au contexte de release, offrant un workflow de release plus rationalisé et intuitif

</details>

---

## 🧪 For Beta Testers

**What to test:**
- [ ] Test the new AI-powered release workflow by reviewing the generated release notes quality and accuracy
- [ ] Verify that Discord notifications are properly formatted with working URLs when releases are published
- [ ] Check that activity detection labels clearly distinguish between standard and Linus Brain-powered detection
- [ ] Confirm that the simplified release notes system is easier to understand and navigate
- [ ] Test the unified `/release-beta` command workflow for ease of use

<details>
<summary>🇫🇷 <b>Quoi tester</b></summary>

- [ ] Tester le nouveau workflow de release avec IA en vérifiant la qualité et la précision des notes de version générées
- [ ] Vérifier que les notifications Discord sont correctement formatées avec des URLs fonctionnelles lors de la publication des releases
- [ ] Vérifier que les labels de détection d'activité distinguent clairement la détection standard de celle alimentée par Linus Brain
- [ ] Confirmer que le système de notes de version simplifié est plus facile à comprendre et à naviguer
- [ ] Tester le workflow de la commande unifiée `/release-beta` pour la facilité d'utilisation

</details>

**Known Issues:**
- None currently

---

<details>
<summary>📊 <b>Technical Details</b></summary>

### Contributors
- @github-actions[bot]
- @Julien-Decoen

</details>


---

## 📦 Installation

**Via HACS (Recommended):**
1. Open HACS → Integrations
2. Search for "Linus Dashboard"
3. Click Update (if already installed) or Install
4. Restart Home Assistant
5. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)

**Manual Installation:**
1. Download the `linus_dashboard.zip` file from this release
2. Extract to `custom_components/linus_dashboard/`
3. Restart Home Assistant
4. Clear browser cache

---

## 🔗 Links

- 📖 [Documentation](https://github.com/Thank-you-Linus/Linus-Dashboard)
- 🐛 [Report Issues](https://github.com/Thank-you-Linus/Linus-Dashboard/issues)
- 💬 [Discord Community](https://discord.gg/your-discord-link)

