# 📍 Manual Area & Floor Ordering

**Languages:** [English](#english) | [Français](#français)

---

## English

### Overview

Starting with **Home Assistant 2025.1**, you can manually reorder areas and floors using drag & drop. Linus Dashboard fully supports this feature while maintaining 100% backward compatibility with older versions.

### What Changed?

Previously:
- **Areas** were sorted alphabetically
- **Floors** were sorted by numeric level (basement=-1, ground=0, first=1, etc.)

Now with HA 2025.1+:
- **Drag & drop** to reorder areas and floors
- **Prioritize** your most-used rooms
- **Customize** floor ordering regardless of numeric level
- **Personalize** navigation for your specific home layout

### How to Use

#### Reorder in Home Assistant

1. Go to **Settings > Areas, labels & zones** in Home Assistant
2. Click **"Reorder floors and areas"**
3. **Drag and drop** to arrange in your preferred order
4. **Save** your changes

#### Linus Dashboard Updates Automatically

Linus Dashboard will immediately respect your custom order. No additional configuration needed!

### Sorting Priority

Linus Dashboard uses a smart sorting system that works across all Home Assistant versions:

#### For Areas

1. **Manual order** (if set in HA 2025.1+)
2. **Alphabetical** (fallback for older versions or areas without custom order)

#### For Floors

1. **Manual order** (if set in HA 2025.1+)
2. **Numeric level** (traditional: basement=-1, ground=0, first=1, etc.)
3. **Alphabetical** (final fallback)

This multi-level approach ensures:
- ✅ Manual ordering is respected when set
- ✅ Backward compatibility with older HA versions
- ✅ Consistent behavior when mixing ordered and unordered items

### Use Cases

#### Prioritize Frequently Used Areas
Put your living room, kitchen, and bedroom at the top, even though they might come later alphabetically.

#### Custom Floor Navigation
Have a basement, ground floor, and attic? Order them however makes sense for your home, regardless of numeric levels.

#### Guest vs. Private Spaces
Organize areas by privacy level or access frequency rather than alphabetical order.

#### Seasonal Adjustments
Reorder rooms based on seasonal use (e.g., move "Patio" higher in summer).

### Backward Compatibility

Linus Dashboard works seamlessly across Home Assistant versions:

| HA Version | Area Sorting | Floor Sorting |
|------------|--------------|---------------|
| < 2025.1 | Alphabetical | Numeric level → Alphabetical |
| ≥ 2025.1 without custom order | Alphabetical | Numeric level → Alphabetical |
| ≥ 2025.1 with custom order | **Manual order** | **Manual order** → Numeric level → Alphabetical |

### Tips & Best Practices

#### Start with Your Most Used Spaces
Put the areas you access most frequently at the top of your navigation.

#### Group Related Areas
Place areas that are functionally related near each other (e.g., all bedrooms together).

#### Consider Mobile Navigation
Remember that your order affects how users navigate on mobile devices with limited screen space.

#### Test and Adjust
Reordering is easy! Experiment to find what works best for your household.

### Troubleshooting

#### Order Not Updating in Linus?
- Refresh your browser
- Check that you saved the order in Home Assistant settings
- Verify you're running HA 2025.1 or newer for manual ordering

#### Some Areas Still Alphabetical?
This is normal! Only areas with a custom order value will be prioritized. Areas without custom order appear alphabetically after ordered areas.

#### Floor Order Seems Wrong?
Check the numeric level values in Home Assistant. Manual order takes precedence, then numeric level, then alphabetical.

---

## Français

### Aperçu

À partir de **Home Assistant 2025.1**, vous pouvez réorganiser manuellement les zones et étages par glisser-déposer. Linus Dashboard supporte pleinement cette fonctionnalité tout en maintenant une compatibilité totale avec les versions antérieures.

### Qu'est-ce qui a changé ?

Auparavant :
- Les **zones** étaient triées par ordre alphabétique
- Les **étages** étaient triés par niveau numérique (sous-sol=-1, rez-de-chaussée=0, premier=1, etc.)

Maintenant avec HA 2025.1+ :
- **Glissez-déposez** pour réorganiser les zones et étages
- **Priorisez** vos pièces les plus utilisées
- **Personnalisez** l'ordre des étages indépendamment du niveau numérique
- **Personnalisez** la navigation selon votre disposition spécifique

### Comment utiliser

#### Réorganiser dans Home Assistant

1. Allez dans **Paramètres > Zones, étiquettes et zones** dans Home Assistant
2. Cliquez sur **"Réorganiser les étages et les zones"**
3. **Glissez-déposez** pour arranger dans votre ordre préféré
4. **Enregistrez** vos modifications

#### Linus Dashboard se met à jour automatiquement

Linus Dashboard respectera immédiatement votre ordre personnalisé. Aucune configuration supplémentaire nécessaire !

### Priorité de tri

Linus Dashboard utilise un système de tri intelligent qui fonctionne sur toutes les versions de Home Assistant :

#### Pour les zones

1. **Ordre manuel** (si défini dans HA 2025.1+)
2. **Alphabétique** (repli pour les versions antérieures ou zones sans ordre personnalisé)

#### Pour les étages

1. **Ordre manuel** (si défini dans HA 2025.1+)
2. **Niveau numérique** (traditionnel : sous-sol=-1, rez-de-chaussée=0, premier=1, etc.)
3. **Alphabétique** (repli final)

Cette approche multi-niveaux garantit :
- ✅ L'ordre manuel est respecté quand défini
- ✅ Compatibilité avec les anciennes versions HA
- ✅ Comportement cohérent en mélangeant éléments ordonnés et non ordonnés

### Cas d'usage

#### Prioriser les zones fréquemment utilisées
Placez votre salon, cuisine et chambre en haut, même si elles viennent plus tard alphabétiquement.

#### Navigation d'étages personnalisée
Vous avez un sous-sol, rez-de-chaussée et grenier ? Organisez-les comme bon vous semble, indépendamment des niveaux numériques.

#### Espaces invités vs. privés
Organisez les zones par niveau de confidentialité ou fréquence d'accès plutôt que par ordre alphabétique.

#### Ajustements saisonniers
Réorganisez les pièces selon l'usage saisonnier (ex: montez "Terrasse" en été).

### Compatibilité ascendante

Linus Dashboard fonctionne parfaitement sur toutes les versions de Home Assistant :

| Version HA | Tri des zones | Tri des étages |
|------------|---------------|----------------|
| < 2025.1 | Alphabétique | Niveau numérique → Alphabétique |
| ≥ 2025.1 sans ordre personnalisé | Alphabétique | Niveau numérique → Alphabétique |
| ≥ 2025.1 avec ordre personnalisé | **Ordre manuel** | **Ordre manuel** → Niveau numérique → Alphabétique |

### Conseils & Bonnes pratiques

#### Commencez par vos espaces les plus utilisés
Placez les zones que vous consultez le plus fréquemment en haut de votre navigation.

#### Regroupez les zones liées
Placez les zones fonctionnellement liées ensemble (ex: toutes les chambres ensemble).

#### Pensez à la navigation mobile
Rappelez-vous que votre ordre affecte la navigation sur mobile avec un espace d'écran limité.

#### Testez et ajustez
La réorganisation est facile ! Expérimentez pour trouver ce qui fonctionne le mieux pour votre foyer.

### Dépannage

#### L'ordre ne se met pas à jour dans Linus ?
- Rafraîchissez votre navigateur
- Vérifiez que vous avez enregistré l'ordre dans les paramètres Home Assistant
- Vérifiez que vous utilisez HA 2025.1 ou plus récent pour l'ordre manuel

#### Certaines zones restent alphabétiques ?
C'est normal ! Seules les zones avec une valeur d'ordre personnalisé seront priorisées. Les zones sans ordre personnalisé apparaissent alphabétiquement après les zones ordonnées.

#### L'ordre des étages semble incorrect ?
Vérifiez les valeurs de niveau numérique dans Home Assistant. L'ordre manuel a priorité, puis le niveau numérique, puis l'ordre alphabétique.
