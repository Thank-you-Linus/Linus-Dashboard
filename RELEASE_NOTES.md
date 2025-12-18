# 🧪 Beta Release

> **This is a pre-release version for testing.**  
> Please report any issues on [GitHub Issues](https://github.com/Thank-you-Linus/Linus-Dashboard/issues)

---

## ✨ What's New

- **AI-Powered Intelligent Release System** - Introduced a comprehensive AI-driven release workflow that automates version analysis, semantic commit evaluation, and release note generation. The system intelligently determines version bump types (major/minor/patch) based on commit history analysis and provides detailed reasoning for version decisions. Includes automated validation checks, quality gates, and streamlined beta release processes.

<details>
<summary>📖 <b>View detailed descriptions / Voir les descriptions détaillées</b></summary>

### 🇬🇧 English


- **AI-Powered Intelligent Release System** - Introduced a comprehensive AI-driven release workflow that automates version analysis, semantic commit evaluation, and release note generation. The system intelligently determines version bump types (major/minor/patch) based on commit history analysis and provides detailed reasoning for version decisions. Includes automated validation checks, quality gates, and streamlined beta release processes.


### 🇫🇷 Français


- **Système de Release Intelligent Propulsé par IA** - Introduction d'un workflow de release complet piloté par IA qui automatise l'analyse de version, l'évaluation sémantique des commits et la génération des notes de version. Le système détermine intelligemment le type de bump de version (majeur/mineur/patch) basé sur l'analyse de l'historique des commits et fournit un raisonnement détaillé pour les décisions de version. Inclut des vérifications de validation automatisées, des points de contrôle qualité et des processus de release beta simplifiés.


</details>

## 🐛 Bug Fixes

- **Git Tag Validation Consistency** - Fixed tag validation to properly handle version prefixes in both stable and pre-release scenarios, ensuring consistent tagging behavior across the release pipeline.
- **Release Notification Formatting** - Improved Discord notification formatting with better URL display and structured release information for clearer communication with beta testers.

## ⚡ Improvements

- **Simplified Activity Detection Logic** - Streamlined activity detection code with clearer distinction between standard sensors and Linus Brain-powered detection, improving code maintainability and reducing complexity.
- **Unified Release Notes System** - Consolidated release notes into a single file system, eliminating redundancy and simplifying the release workflow. The new system automatically cleans up after releases.
- **Consolidated Beta Release Commands** - Unified all beta release commands into a single `/release-beta` command with intelligent workflow adaptation based on version context.

<details>
<summary>🇫🇷 <b>Version française</b></summary>

- **Logique de Détection d'Activité Simplifiée** - Rationalisation du code de détection d'activité avec une distinction plus claire entre les capteurs standards et la détection propulsée par Linus Brain, améliorant la maintenabilité du code et réduisant la complexité.
- **Système de Notes de Release Unifié** - Consolidation des notes de release dans un système à fichier unique, éliminant la redondance et simplifiant le workflow de release. Le nouveau système nettoie automatiquement après les releases.
- **Commandes de Release Beta Consolidées** - Unification de toutes les commandes de release beta en une seule commande `/release-beta` avec adaptation intelligente du workflow basée sur le contexte de version.

</details>

---

## 🧪 For Beta Testers

**What to test:**
- [ ] Test the new `/release-beta` command workflow and verify it correctly detects incremental vs first beta scenarios
- [ ] Verify activity detection sensors display correctly in area views and work with Linus Brain integration
- [ ] Check that release notifications appear properly in Discord with correct formatting
- [ ] Confirm git tagging works correctly without 'v' prefix issues
- [ ] Test the automated release notes generation and validation process

<details>
<summary>🇫🇷 <b>Quoi tester</b></summary>

- [ ] Tester le workflow de la nouvelle commande `/release-beta` et vérifier qu'elle détecte correctement les scénarios incrémentaux vs première beta
- [ ] Vérifier que les capteurs de détection d'activité s'affichent correctement dans les vues de zone et fonctionnent avec l'intégration Linus Brain
- [ ] Vérifier que les notifications de release apparaissent correctement dans Discord avec le bon formatage
- [ ] Confirmer que le tagging git fonctionne correctement sans problèmes de préfixe 'v'
- [ ] Tester le processus de génération et validation automatisée des notes de release

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

