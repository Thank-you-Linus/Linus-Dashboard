# 🔄 Passer à Linus Dashboard

<p align="center">
  <a href="SWITCHING_TO_LINUS.md"><strong>🇬🇧 Lire en anglais</strong></a>
</p>

Linus Dashboard est un tableau de bord généré automatiquement pour Home Assistant, sans YAML : il se construit à partir des pièces et étages que vous avez déjà, et range vos appareils par pièce, par étage et par type d'appareil. Cette page vous dit ce que vous gardez, quoi vérifier après l'installation, et comment revenir en arrière si Linus ne vous convient pas.

---

## À qui s'adresse cette page

Vous utilisez déjà un tableau de bord dans Home Assistant et vous voulez essayer Linus. Vous venez peut-être :

- **(a) du tableau de bord par défaut de Home Assistant**, celui que Home Assistant construit pour vous et que vous n'avez jamais modifié ;
- **(b) d'un tableau de bord fait main**, écrit en YAML ou construit avec l'éditeur visuel ;
- **(c) d'un autre tableau de bord généré automatiquement**, construit par une stratégie plutôt que carte par carte.

Dans tous les cas, la démarche est la même : installer Linus à côté, vérifier quelques points, puis le garder ou le retirer.

---

## Ce que Linus lit, ce qu'il ajoute

- **Vos pièces, étages, appareils et entités sont lus, jamais modifiés.** Linus ne modifie jamais vos pièces, vos étages, vos appareils ni vos entités. Il ajoute ses propres appareils et entités de groupe (un appareil par pièce, un par étage et un pour toute la maison, avec « Linus Dashboard » comme fabricant). Exclure un domaine dans les options de l'intégration empêche aussi Linus de créer les entités de groupe de ce domaine.
- **Les éléments exclus et masqués restent à l'écart.** Les domaines, classes d'appareils, entités, appareils, pièces, étages et étiquettes que vous excluez dans les options de Linus n'apparaissent pas, pas plus que les entités que vous avez masquées dans Home Assistant.
- **Les entités indisponibles restent visibles.** Elles sont affichées en dernier et regroupées dans la vue des entités indisponibles, pour que vous puissiez les réparer.
- **Les appareils sans pièce sont regroupés dans une pièce non assignée**, affichée avec le libellé que Home Assistant utilise lui-même pour une pièce introuvable. Attribuez-leur une pièce dans Home Assistant pour les ranger au bon endroit.
- **Les pièces suivent l'ordre de Home Assistant.** Linus reprend l'ordre manuel défini dans Home Assistant, puis l'ordre alphabétique pour le reste. [En savoir plus →](MANUAL_ORDERING.md)
- **Linus a son propre panneau.** Il ajoute une entrée « Linus Dashboard », avec une icône nœud papillon, dans la barre latérale. Vos tableaux de bord existants restent à leur place.
- **Linus ne modifie jamais vos tableaux de bord existants.** Les tableaux de bord générés afficheront aussi les entités de groupe de Linus ; Linus charge ses cartes personnalisées embarquées sur tous les tableaux de bord, et elles passent avant les copies des mêmes cartes installées à part.

---

## D'où venez-vous ?

### (a) Le tableau de bord par défaut de Home Assistant

**Ce que vous gardez :** le tableau de bord par défaut est toujours là, dans la barre latérale, inchangé.

**Quoi vérifier :** le tableau de bord par défaut liste les entités par pièce, il affichera donc aussi les entités de groupe de Linus. Seuls les tableaux de bord qui ont leurs propres vues peuvent être intégrés dans Linus : le tableau par défaut, jamais modifié, n'en a pas, il ne peut donc pas être intégré.

**Revenir en arrière :** voir [Revenir en arrière / désinstaller](#revenir-en-arrière--désinstaller).

### (b) Un tableau de bord fait main (YAML ou éditeur visuel)

**Ce que vous gardez :** votre tableau de bord et ses vues, inchangés. Ne repartez pas de zéro : un tableau de bord fait main a ses propres vues, vous pouvez donc les intégrer comme onglets dans Linus (énergie, caméras, multimédia…). [En savoir plus →](EMBEDDED_DASHBOARDS.md)

**Quoi vérifier :** si votre tableau de bord utilise des cartes personnalisées que Linus embarque aussi, la copie chargée par Linus passe avant celle que vous avez installée à part. Ouvrez votre tableau de bord après avoir installé Linus et vérifiez qu'il s'affiche comme prévu.

**Revenir en arrière :** voir [Revenir en arrière / désinstaller](#revenir-en-arrière--désinstaller). Lisez la mise en garde sur les cartes embarquées avant de retirer les ressources.

### (c) Un autre tableau de bord généré automatiquement

**Ce que vous gardez :** l'autre tableau de bord reste dans la barre latérale ; Linus ne touche pas à sa configuration.

**Quoi vérifier :** un tableau de bord généré liste les entités par pièce, il affichera donc aussi les entités de groupe de Linus. Seuls les tableaux de bord qui ont leurs propres vues peuvent être intégrés dans Linus : un tableau construit uniquement par une stratégie n'en a pas, il ne peut donc pas être intégré.

**Revenir en arrière :** voir [Revenir en arrière / désinstaller](#revenir-en-arrière--désinstaller).

---

## À vérifier après l'installation

1. **Appareils sans pièce :** ouvrez la pièce non assignée dans Linus et attribuez une pièce à ces appareils dans Home Assistant (Paramètres → Zones et secteurs).
2. **Éléments exclus ou masqués :** s'il manque quelque chose, vérifiez les exclusions dans les options de Linus (Paramètres → Appareils et services → Linus Dashboard → Configurer) et si l'entité est masquée dans Home Assistant.
3. **Entités indisponibles :** ouvrez la vue des entités indisponibles et réparez ou retirez ce qui y figure.
4. **Ordre des pièces :** réorganisez vos pièces dans Home Assistant si besoin ; Linus suit cet ordre. [En savoir plus →](MANUAL_ORDERING.md)
5. **Vos autres tableaux de bord :** ouvrez-les une fois et vérifiez qu'ils s'affichent toujours correctement (voir la remarque sur les cartes embarquées ci-dessus).

---

## Revenir en arrière / désinstaller

Votre tableau de bord précédent n'a jamais été modifié : revenir en arrière, c'est retirer Linus.

1. **Supprimez l'intégration :** Paramètres → Appareils et services → Linus Dashboard → ⋮ → Supprimer. Le panneau de Linus disparaît de la barre latérale.
2. **Activez le mode avancé** dans votre profil utilisateur (il fait apparaître la page des ressources).
3. Allez dans **Paramètres → Tableaux de bord → ⋮ (en haut à droite) → Ressources**.
4. **Supprimez chaque ressource dont l'URL commence par `/linus_dashboard_files/`.** Supprimer l'intégration ne les retire pas.
5. **Redémarrez Home Assistant** (Paramètres → Système → Redémarrer). Home Assistant ne cesse de servir les fichiers `/linus_dashboard_files/` qu'après un redémarrage.
6. **Rafraîchissez votre navigateur sans cache** (Ctrl+F5, ou Cmd+Shift+R sur macOS).

> ⚠️ **Cartes embarquées :** si l'un de vos autres tableaux de bord utilise une carte personnalisée fournie uniquement par Linus, cette carte cesse de s'afficher une fois les ressources supprimées. Installez cette carte à part avant de retirer les ressources si vous voulez la garder.

Si vos ressources Lovelace sont gérées en YAML, il n'y a rien à supprimer à l'étape 4 : Linus charge ses fichiers sans les ajouter à la liste, et le redémarrage de l'étape 5 suffit.

Home Assistant retire normalement les appareils et entités d'une intégration supprimée ; vérifiez ensuite Paramètres → Appareils et services → Appareils et supprimez tout appareil encore listé avec « Linus Dashboard » comme fabricant.

---

## Guides liés

- [🚀 Guide de démarrage rapide](QUICK_START.md#étape-2--configuration-2-minutes) - Installer et configurer Linus en 5 minutes
- [🎨 Tableaux de bord intégrés](EMBEDDED_DASHBOARDS.md#comment-configurer) - Intégrer vos propres vues dans Linus
- [📍 Ordre manuel des pièces et étages](MANUAL_ORDERING.md#comment-utiliser) - Choisir l'ordre de vos pièces et de vos étages
- [📚 Carte de la documentation](DOCUMENTATION_MAP.md) - Tous les guides au même endroit
