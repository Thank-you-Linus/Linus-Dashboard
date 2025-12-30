# 📖 Glossaire - Langage Commun Linus Dashboard

> **Vocabulaire unique utilisé dans le code, la documentation et la communication**
>
> Date: 2025-12-30
> Version: 1.0.0

---

## 🎯 Principe

Ce glossaire définit **LE** vocabulaire officiel du projet.
- ✅ Utilisé dans le **code TypeScript** (noms de classes, méthodes, variables)
- ✅ Utilisé dans la **documentation** (UX_REFERENCE.md, README, etc.)
- ✅ Utilisé dans la **communication** (issues, PRs, discussions)

**Règle:** Un concept = Un seul terme, partout.

---

## 🏗️ Architecture

### View (Vue)

**Terme:** `View`
**Pluriel:** `Views`
**Usage code:** Suffixe de classe (ex: `HomeView`, `AreaView`)

**Définition:** Page complète du dashboard affichant du contenu organisé.

**Types:**
- `HomeView` - Page d'accueil
- `AreaView` - Vue d'une pièce
- `FloorView` - Vue d'un étage/groupe
- `DomainView` - Vue globale d'un domaine (Light, Cover, etc.)

**Exemples:**
- ✅ Code: `class HomeView extends AbstractView`
- ✅ Doc: "La Home View affiche l'horloge"
- ✅ Comm: "Bug dans l'Area View du Salon"

---

### Badges (Zone de Badges)

**Terme:** `Badges`
**Singulier:** `Badge` (rare)
**Usage code:**
- Méthode: `createSectionBadges()`
- Variable: `badges`

**Définition:** Zone horizontale en haut d'une vue contenant les chips de contrôle/statut.

**Synonymes INTERDITS:** ❌ "Chips en haut", "Barre de chips", "Top chips"

**Exemples:**
- ✅ Code: `badges: await this.createSectionBadges()`
- ✅ Doc: "Les badges affichent les chips de contrôle"
- ✅ Comm: "Les badges de la Cover View ne sont pas séparés par device_class"

---

### Section (Section de Contenu)

**Terme:** `Section`
**Pluriel:** `Sections`
**Usage code:**
- Méthode: `createSectionCards()`
- Variable: `sections`

**Définition:** Groupe de contenu avec un titre (heading) et des cartes, organisé par domaine ou par pièce.

**Structure:**
```
Section = Heading + Cards
```

**Exemples:**
- ✅ Code: `sections: await this.createSectionCards()`
- ✅ Doc: "Chaque section a un heading cliquable"
- ✅ Comm: "La section Lumière n'affiche pas toutes les entités"

---

### Heading (Titre de Section)

**Terme:** `Heading`
**Pluriel:** `Headings`
**Usage code:** Variable ou commentaire

**Définition:** Titre d'une section, souvent avec icône et flèche `>` pour navigation.

**Format visuel:** `🎬 Salon  >`

**Synonymes INTERDITS:** ❌ "Titre", "Header de section"

**Exemples:**
- ✅ Code: `// Create heading for section`
- ✅ Doc: "Le heading 'Salon >' est cliquable"
- ✅ Comm: "Les headings de Floor View ne naviguent pas"

---

## 🎴 Composants de Carte

### Card (Carte)

**Terme:** `Card`
**Pluriel:** `Cards`
**Usage code:** Suffixe de classe (ex: `LightCard`, `AreaCard`)

**Définition:** Composant visuel individuel représentant une entité ou un groupe.

**Types:**
- `EntityCard` - Carte d'entité générique
- `AreaCard` - Carte de pièce (Home View)
- `LightCard`, `CoverCard`, etc. - Cartes spécialisées par domaine

**Synonymes INTERDITS:** ❌ "Widget", "Bloc", "Carte entité"

**Exemples:**
- ✅ Code: `class LightCard extends AbstractCard`
- ✅ Doc: "Chaque card affiche une entité"
- ✅ Comm: "Les Cover Cards manquent le bouton Stop"

---

### Chip (Puce de Contrôle)

**Terme:** `Chip`
**Pluriel:** `Chips`
**Usage code:**
- Suffixe de classe (ex: `AggregateChip`)
- Variable: `chips`
- Fonction: `createChipsFromList()`

**Définition:** Petit bouton interactif avec icône et contenu optionnel.

**Types:**
- `Control Chip` - Contrôle d'entités
- `Status Chip` - Affichage d'état
- `Action Chip` - Action générique (refresh, etc.)
- `Quick Chip` - Chip en bas d'une Area Card

**Format visuel:** `[💡 Lights: 3]`

**Synonymes INTERDITS:** ❌ "Badge", "Bouton", "Puce"

**Exemples:**
- ✅ Code: `const chips = await createChipsFromList(...)`
- ✅ Doc: "Les chips sont séparées par device_class"
- ✅ Comm: "Le chip de lumière ne fonctionne pas"

**Note:** "Chip" est déjà le terme Mushroom cards, on le garde.

---

## 🏠 Concepts Spatiaux

### Area (Pièce)

**Terme:** `Area`
**Pluriel:** `Areas`
**Usage code:**
- Type: `Area` (interface HA)
- Variable: `area`, `areas`
- Classe: `AreaView`

**Définition:** Pièce ou zone définie dans Home Assistant.

**Synonymes INTERDITS:** ❌ "Room", "Pièce" (sauf dans l'UI traduite)

**Exemples:**
- ✅ Code: `this.area.name`
- ✅ Doc: "Chaque area a sa propre vue"
- ✅ Comm: "L'area Salon ne charge pas"

**Note:** On utilise "Area" même en français dans le code/doc technique.

---

### Floor (Étage)

**Terme:** `Floor`
**Pluriel:** `Floors`
**Usage code:**
- Type: `Floor` (interface HA)
- Variable: `floor`, `floors`
- Classe: `FloorView`

**Définition:** Étage ou niveau regroupant plusieurs areas.

**Synonymes INTERDITS:** ❌ "Level", "Étage" (sauf dans l'UI traduite)

**Exemples:**
- ✅ Code: `this.floor.areas`
- ✅ Doc: "Chaque floor a des badges agrégés"
- ✅ Comm: "Le Floor View ne filtre pas les entités"

---

### Scope (Portée)

**Terme:** `Scope`
**Pluriel:** `Scopes`
**Usage code:** Variable ou commentaire

**Définition:** Périmètre de données (global, floor, area).

**Valeurs:**
- `global` - Toutes les areas
- `floor` - Areas d'un étage
- `area` - Une seule area

**Exemples:**
- ✅ Code: `// Badges with area scope`
- ✅ Doc: "Les badges ont un scope area"
- ✅ Comm: "Le scope des chips est incorrect"

---

## 🎨 Composants Visuels

### Picture Header (En-tête Photo)

**Terme:** `Picture Header`
**Pluriel:** `Picture Headers`
**Usage code:** Méthode ou commentaire

**Définition:** Photo/image en haut d'une Area View (généralement caméra).

**Synonymes INTERDITS:** ❌ "Header image", "Photo de pièce"

**Exemples:**
- ✅ Code: `createPictureHeader()`
- ✅ Doc: "Le Picture Header affiche la caméra"
- ✅ Comm: "Le Picture Header ne se charge pas"

---

### Area Card (Carte de Pièce)

**Terme:** `Area Card`
**Pluriel:** `Area Cards`
**Usage code:** Classe `AreaCard` (si existe)

**Définition:** Carte cliquable représentant une area dans la Home View.

**Contenu:**
- Nom de la pièce
- Icône décorative
- Température/humidité
- Quick Chips en bas

**Synonymes INTERDITS:** ❌ "Room Card", "Carte de pièce"

**Exemples:**
- ✅ Code: `createAreaCard(area)`
- ✅ Doc: "Les Area Cards sont en grille"
- ✅ Comm: "L'Area Card du Garage n'affiche pas les chips"

---

### Quick Chip

**Terme:** `Quick Chip`
**Pluriel:** `Quick Chips`
**Usage code:** Commentaire ou variable

**Définition:** Chip de contrôle rapide affiché EN BAS d'une Area Card.

**Différence avec Control Chip:**
- Control Chip → Dans les Badges (en haut de vue)
- Quick Chip → Dans les Area Cards (Home View)

**Exemples:**
- ✅ Code: `// Add quick chips to area card`
- ✅ Doc: "Les Quick Chips permettent un contrôle rapide"
- ✅ Comm: "Les Quick Chips ne s'affichent pas"

---

## 🔧 Concepts Techniques

### Domain (Domaine)

**Terme:** `Domain`
**Pluriel:** `Domains`
**Usage code:**
- Variable: `domain`, `domains`
- Constante: `DOMAINS`

**Définition:** Type d'entité Home Assistant (light, cover, climate, etc.).

**Synonymes INTERDITS:** ❌ "Type", "Category"

**Exemples:**
- ✅ Code: `DOMAINS.forEach(domain => ...)`
- ✅ Doc: "Chaque domain a sa vue"
- ✅ Comm: "Le domain cover n'est pas géré"

---

### Device Class (Classe d'Appareil)

**Terme:** `Device Class`
**Pluriel:** `Device Classes`
**Usage code:**
- Variable: `device_class`, `deviceClass`
- Constante: `DEVICE_CLASSES`

**Définition:** Sous-catégorie d'un domain (ex: cover.garage, cover.shutter).

**Synonymes INTERDITS:** ❌ "Sous-type", "Category"

**Convention de valeur:**
- `undefined` - Entités SANS device_class
- `null` - TOUTES les entités
- `"garage"` - Entités AVEC device_class="garage"

**Exemples:**
- ✅ Code: `Helper.getEntityIds({ domain, device_class })`
- ✅ Doc: "Les chips sont séparées par device_class"
- ✅ Comm: "Le device_class garage n'est pas filtré"

---

### Entity (Entité)

**Terme:** `Entity`
**Pluriel:** `Entities`
**Usage code:**
- Variable: `entity`, `entities`
- Type: `string` (entity_id)

**Définition:** Objet Home Assistant contrôlable/observable.

**Format:** `domain.object_id` (ex: `light.salon_lumiere`)

**Synonymes INTERDITS:** ❌ "Device", "Object"

**Exemples:**
- ✅ Code: `entities.map(entity => ...)`
- ✅ Doc: "Chaque entity a une card"
- ✅ Comm: "L'entity cover.garage ne s'affiche pas"

---

## 🎯 Actions & Interactions

### Tap (Tapement)

**Terme:** `Tap`
**Verbe:** `Tap on` / `Tapped`
**Usage code:** `tap_action`

**Définition:** Action de toucher/cliquer une fois.

**Synonymes INTERDITS:** ❌ "Click", "Press", "Touch"

**Exemples:**
- ✅ Code: `tap_action: { action: "toggle" }`
- ✅ Doc: "Tap sur le chip ouvre la popup"
- ✅ Comm: "Tap sur la card ne fonctionne pas"

---

### Hold (Appui Long)

**Terme:** `Hold`
**Verbe:** `Hold on` / `Held`
**Usage code:** `hold_action`

**Définition:** Action d'appuyer longuement (long press).

**Synonymes INTERDITS:** ❌ "Long press", "Long click"

**Exemples:**
- ✅ Code: `hold_action: { action: "navigate" }`
- ✅ Doc: "Hold sur le chip navigue vers la vue"
- ✅ Comm: "Hold ne déclenche pas la navigation"

---

### Navigate (Naviguer)

**Terme:** `Navigate`
**Verbe:** `Navigate to`
**Usage code:** Action `navigate`

**Définition:** Changer de vue.

**Synonymes INTERDITS:** ❌ "Go to", "Open"

**Exemples:**
- ✅ Code: `action: "navigate", navigation_path: "/lovelace/area-salon"`
- ✅ Doc: "Le heading navigue vers l'Area View"
- ✅ Comm: "La navigation ne fonctionne pas"

---

### Toggle (Basculer)

**Terme:** `Toggle`
**Verbe:** `Toggle`
**Usage code:** Action `toggle`

**Définition:** Inverser l'état (on → off, off → on).

**Synonymes INTERDITS:** ❌ "Switch", "Turn on/off"

**Exemples:**
- ✅ Code: `action: "toggle"`
- ✅ Doc: "Le bouton toggle allume/éteint"
- ✅ Comm: "Toggle ne change pas l'état"

---

## 📊 États & Données

### State (État)

**Terme:** `State`
**Pluriel:** `States`
**Usage code:** Variable `state`

**Définition:** État actuel d'une entité (on, off, open, closed, etc.).

**Synonymes INTERDITS:** ❌ "Status" (réservé pour autre usage)

**Exemples:**
- ✅ Code: `entity.state === "on"`
- ✅ Doc: "Le state de la lumière est 'on'"
- ✅ Comm: "Le state n'est pas correct"

---

### Unavailable (Indisponible)

**Terme:** `Unavailable`
**Usage code:** État `unavailable`

**Définition:** État d'une entité non joignable.

**Synonymes INTERDITS:** ❌ "Offline", "Disconnected"

**Exemples:**
- ✅ Code: `state === "unavailable"`
- ✅ Doc: "Les entities unavailable sont affichées séparément"
- ✅ Comm: "Toutes mes entités sont unavailable"

---

## 🎨 Éléments UI

### Icon (Icône)

**Terme:** `Icon`
**Pluriel:** `Icons`
**Usage code:** Variable `icon`

**Définition:** Symbole graphique (Material Design Icons).

**Format:** `mdi:icon-name` (ex: `mdi:lightbulb`)

**Synonymes INTERDITS:** ❌ "Symbol", "Emoji"

**Exemples:**
- ✅ Code: `icon: "mdi:lightbulb"`
- ✅ Doc: "Chaque domain a une icon"
- ✅ Comm: "L'icon du chip est incorrecte"

---

### Label (Libellé)

**Terme:** `Label`
**Pluriel:** `Labels`
**Usage code:** Variable `label`

**Définition:** Texte descriptif d'un élément.

**Synonymes INTERDITS:** ❌ "Text", "Title" (title = autre usage)

**Exemples:**
- ✅ Code: `label: "Lights: 3"`
- ✅ Doc: "Le label du chip affiche le nombre"
- ✅ Comm: "Le label n'est pas traduit"

---

## 🌐 Internationalisation

### Translation (Traduction)

**Terme:** `Translation`
**Pluriel:** `Translations`
**Usage code:** Fonction `translate()`, fichiers `translations/`

**Définition:** Texte traduit selon la langue de l'utilisateur.

**Langues:** `fr` (français), `en` (anglais)

**Synonymes INTERDITS:** ❌ "i18n" (terme technique OK), "Localization"

**Exemples:**
- ✅ Code: `translate("lights")`
- ✅ Doc: "Les translations sont dans translations/"
- ✅ Comm: "La translation de 'Lumière' est manquante"

---

## 🔄 Concepts Métier

### Aggregate (Agrégation)

**Terme:** `Aggregate`
**Verbe:** `Aggregate`
**Usage code:** Classe `AggregateChip`, `AggregateView`

**Définition:** Regroupement de plusieurs entités pour contrôle/affichage groupé.

**Exemples:**
- ✅ Code: `class AggregateChip`
- ✅ Doc: "Les badges agrègent les entités"
- ✅ Comm: "L'agrégation des lumières ne fonctionne pas"

---

### Expose (Exposer)

**Terme:** `Expose`
**Verbe:** `Expose`
**Usage code:** Constante `EXPOSED_CHIPS`

**Définition:** Rendre visible/accessible dans l'interface.

**Exemples:**
- ✅ Code: `AREA_EXPOSED_CHIPS`
- ✅ Doc: "Seuls les domaines exposés sont affichés"
- ✅ Comm: "Le domain fan n'est pas exposé"

---

## ⚠️ Termes à NE PAS Utiliser

| ❌ À ÉVITER | ✅ À UTILISER | Raison |
|-------------|---------------|--------|
| "Room" | `Area` | Terme HA officiel |
| "Page" | `View` | Convention Lovelace |
| "Widget" | `Card` | Terme Lovelace |
| "Button" | `Chip` | Terme Mushroom |
| "Badge" (pour chip) | `Chip` | "Badge" = zone en haut |
| "Header" (pour photo) | `Picture Header` | Précision |
| "Top chips" | `Badges` | Terme officiel |
| "Section title" | `Heading` | Convention |
| "Type" | `Domain` | Terme HA |
| "Category" | `Domain` ou `Device Class` | Confusion |
| "Click" | `Tap` | Convention mobile |
| "Long press" | `Hold` | Convention HA |

---

## 📝 Règles d'Usage

### Dans le Code TypeScript

1. **Noms de classes:** `PascalCase` + terme du glossaire
   - ✅ `HomeView`, `LightCard`, `AggregateChip`
   - ❌ `HomepageView`, `LightWidget`, `AggregateButton`

2. **Méthodes:** `camelCase` + verbe + terme du glossaire
   - ✅ `createSectionBadges()`, `createAreaCard()`
   - ❌ `makeTopChips()`, `buildRoomWidget()`

3. **Variables:** `camelCase` + terme du glossaire
   - ✅ `const badges = ...`, `const chips = ...`
   - ❌ `const topControls = ...`, `const buttons = ...`

4. **Commentaires:** Utiliser les termes du glossaire
   - ✅ `// Create badges for area scope`
   - ❌ `// Create top chips for room`

---

### Dans la Documentation

1. **Titres:** Utiliser les termes exacts
   - ✅ "## Badges Zone"
   - ❌ "## Barre de Chips en Haut"

2. **Références code:** Mettre en `code`
   - ✅ "La méthode `createSectionBadges()` génère les badges"
   - ❌ "La méthode createSectionBadges génère les chips du haut"

3. **Exemples:** Cohérence totale
   - ✅ "Les chips dans les badges sont séparées par device_class"
   - ❌ "Les boutons de la barre supérieure sont groupés par type"

---

### Dans la Communication

1. **Issues GitHub:** Termes du glossaire
   - ✅ "Les badges de CoverView ne filtrent pas par device_class"
   - ❌ "Les chips en haut de la vue Covers ne séparent pas par type"

2. **Pull Requests:** Termes du glossaire
   - ✅ "feat: add Picture Header to AreaView"
   - ❌ "feat: add camera image header to room page"

3. **Discussions:** Termes du glossaire
   - ✅ "Question: comment créer un nouveau chip?"
   - ❌ "Question: comment faire un nouveau bouton badge?"

---

## 🔍 Recherche Rapide

### Je veux parler de...

- **La page d'accueil** → `Home View`
- **La page d'une pièce** → `Area View`
- **La zone de chips en haut** → `Badges`
- **Les chips de contrôle** → `Control Chips` (dans Badges) ou `Quick Chips` (dans Area Cards)
- **Une section avec titre** → `Section` avec `Heading`
- **Une carte d'entité** → `Entity Card` ou type spécifique (`Light Card`, etc.)
- **Un clic court** → `Tap`
- **Un appui long** → `Hold`
- **Changer de page** → `Navigate`
- **Inverser un état** → `Toggle`
- **Type d'entité** → `Domain`
- **Sous-type** → `Device Class`
- **Pièce** → `Area`
- **Étage** → `Floor`

---

## ✅ Validation

Avant de commit/publier, vérifier:

- [ ] Les noms de classes utilisent les termes du glossaire
- [ ] Les méthodes utilisent les termes du glossaire
- [ ] Les commentaires utilisent les termes du glossaire
- [ ] La documentation utilise les termes du glossaire
- [ ] Les messages de commit utilisent les termes du glossaire
- [ ] Aucun terme de la liste "À ÉVITER" n'est utilisé

---

**Document maintenu par:** OpenCode AI
**Dernière mise à jour:** 2025-12-30
**Version:** 1.0.0

**Ce glossaire est la référence unique pour tout le projet.**
