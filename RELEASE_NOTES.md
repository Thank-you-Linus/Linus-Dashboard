# 🧪 Beta Release

> **This is a pre-release version for testing.**  
> Please report any issues on [GitHub Issues](https://github.com/Thank-you-Linus/Linus-Dashboard/issues)

---

## ✨ What's New

_No new features in this release_

## 🐛 Bug Fixes

_No bug fixes in this release_

## ⚡ Improvements

- **Unified beta release workflow** - Consolidated multiple release commands into a single streamlined `/release-beta` command with built-in quality gates, manual approval process, and comprehensive validation. The new workflow includes automatic logging, supports dry-run mode for testing, and provides a compact summary for quick review before publication.
- **Enhanced release notifications** - Improved Discord notification formatting to properly display full release URLs without truncation, ensuring beta testers can easily access new releases. Fixed GitHub release notes formatting to prevent content duplication and maintain clean bilingual sections.
- **Automated cleanup** - Release notes files are now automatically cleaned up after pre-release publication, reducing repository clutter and ensuring a clean working directory.

<details>
<summary>🇫🇷 <b>Version française</b></summary>

- **Workflow de version bêta unifié** - Consolidation de plusieurs commandes de version en une seule commande `/release-beta` rationalisée avec des points de contrôle qualité intégrés, un processus d'approbation manuelle et une validation complète. Le nouveau workflow inclut la journalisation automatique, prend en charge le mode test (dry-run) et fournit un résumé compact pour une révision rapide avant publication.
- **Notifications de version améliorées** - Amélioration du formatage des notifications Discord pour afficher correctement les URL complètes des versions sans troncature, permettant aux bêta-testeurs d'accéder facilement aux nouvelles versions. Correction du formatage des notes de version GitHub pour éviter la duplication de contenu et maintenir des sections bilingues propres.
- **Nettoyage automatisé** - Les fichiers de notes de version sont maintenant automatiquement nettoyés après la publication de la pré-version, réduisant l'encombrement du dépôt et assurant un répertoire de travail propre.

</details>

---

## 🧪 For Beta Testers

**What to test:**
- [ ] Verify the new unified release workflow displays correctly in your environment
- [ ] Check that Discord notifications show complete release URLs and are properly formatted
- [ ] Confirm that release notes appear clean with no duplicate content
- [ ] Test that bilingual sections (English/French) are properly organized

<details>
<summary>🇫🇷 <b>Quoi tester</b></summary>

- [ ] Vérifier que le nouveau workflow de version unifié s'affiche correctement dans votre environnement
- [ ] Vérifier que les notifications Discord affichent les URL complètes des versions et sont correctement formatées
- [ ] Confirmer que les notes de version apparaissent propres sans contenu dupliqué
- [ ] Tester que les sections bilingues (anglais/français) sont correctement organisées

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

