# 🎉 Release Notes

> **Instructions:** This file was auto-generated from git commits.
> Please review and edit the sections below, especially:
> - Add detailed explanations in English and French
> - Fill in the "For Beta Testers" section
> - Remove any commits that shouldn't be in release notes

---

## 🇬🇧 English

### ✨ New Features

- **Magic Areas fallback support is back**
  Magic Areas integration was previously removed, which broke scene toggles and hid some grouped
  actions for setups that relied on it. This release reintroduces Magic Areas as a compatibility
  layer, with entity resolution priority **Linus Brain > Magic Areas > native**. Installations using
  Linus Brain or neither integration are unaffected; installations using Magic Areas regain scene
  toggle behavior and the related settings UI entry point.

### 🐛 Bug Fixes

_No user-facing bug fixes in this release_

### ⚡ Improvements

_No additional improvements in this release_

### 📝 Documentation

_No documentation changes in this release_

### 🧪 For Beta Testers

**What to test:**
- [ ] **Linus Brain only**: confirm dashboard behavior is unchanged (no regression)
- [ ] **Magic Areas only**: confirm scene toggle and Magic Areas settings/UI entry point work again
- [ ] **Linus Brain + Magic Areas together**: confirm Linus Brain takes priority and Magic Areas entities are not duplicated
- [ ] **Neither integration installed**: confirm native fallback behavior is unchanged

**Known Issues:**
- Magic Areas entity naming can vary across Magic Areas versions; report any entity resolution mismatch you see

---

## 🇫🇷 Français

### ✨ Nouvelles fonctionnalités

- **Retour du support Magic Areas (compatibilité)**
  L'intégration Magic Areas avait été retirée précédemment, ce qui cassait le toggle de scène et
  masquait certaines actions groupées pour les installations qui en dépendaient. Cette version
  réintègre Magic Areas comme couche de compatibilité, avec une priorité de résolution d'entités
  **Linus Brain > Magic Areas > natif**. Les installations utilisant Linus Brain ou aucune des deux
  intégrations ne sont pas impactées ; celles utilisant Magic Areas retrouvent le toggle de scène et
  le point d'entrée correspondant dans les réglages.

### 🐛 Corrections de bugs

_Aucune correction visible pour l'utilisateur dans cette version_

### ⚡ Améliorations

_Aucune amélioration additionnelle dans cette version_

### 📝 Documentation

_Aucun changement de documentation dans cette version_

### 🧪 Pour les Beta Testeurs

**Quoi tester :**
- [ ] **Linus Brain seul** : vérifier que le comportement du dashboard est inchangé (pas de régression)
- [ ] **Magic Areas seul** : vérifier que le toggle de scène et le point d'entrée Magic Areas dans les réglages fonctionnent à nouveau
- [ ] **Linus Brain + Magic Areas ensemble** : vérifier que Linus Brain est prioritaire et que les entités Magic Areas ne sont pas dupliquées
- [ ] **Aucune des deux intégrations** : vérifier que le comportement natif de fallback est inchangé

**Problèmes connus :**
- Les noms d'entités Magic Areas peuvent varier selon la version de Magic Areas ; merci de signaler tout problème de résolution d'entité

---

## 📊 Technical Details

### Key Commits

- feat: reintroduce Magic Areas fallback support (705e56e)

### Contributors

- @Juicy
- @s4piens
