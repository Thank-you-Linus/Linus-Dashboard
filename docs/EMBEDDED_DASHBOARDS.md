# 🎨 Embedded Dashboards

**Languages:** [English](#english) | [Français](#français)

---

## English

### Overview

One of Linus Dashboard's most powerful features is the ability to **embed your own custom dashboards** created with Home Assistant's visual editor. This means you can use Linus as your primary dashboard while keeping full control over specific views.

### Why Use Embedded Dashboards?

- **Best of both worlds**: Automatic organization + full customization flexibility
- **Visual editing**: Use Home Assistant's built-in UI editor for custom views
- **Unified interface**: No need to switch between multiple dashboards
- **Seamless integration**: Custom views appear as tabs alongside automatic views

### Use Cases

#### 📊 Energy Monitoring
Embed Home Assistant's built-in Energy dashboard to track consumption and production alongside your Linus dashboard.

#### 📹 Security & Cameras
Create a dedicated multi-camera view with custom layouts and card configurations.

#### 🎵 Media Control
Design a comprehensive media control center with multiple rooms and sources.

#### 🌡️ Climate & Air Quality
Build detailed climate monitoring dashboards with graphs and historical data.

#### 🏗️ Custom Integrations
Showcase specific integrations (Tesla, Solar, etc.) that need custom card layouts.

### How to Configure

#### Step 1: Create Your Custom Dashboard

1. Go to **Settings > Dashboards** in Home Assistant
2. Click **Add Dashboard**
3. Choose a URL path (e.g., `energy`, `cameras`)
4. Design your dashboard using the visual editor

#### Step 2: Embed in Linus Dashboard

1. Go to **Settings > Devices & Services**
2. Find **Linus Dashboard** integration
3. Click **Configure**
4. In the **"Embedded Dashboards"** section, select the dashboard views you want
5. **Save**

#### Step 3: Enjoy!

Your custom dashboard views will now appear as tabs in Linus Dashboard. You can:
- **Reorder** them by dragging in the selection list
- **Edit** them using Home Assistant's visual editor
- **Update** them anytime without reconfiguring Linus

### Configuration Example

When you configure embedded dashboards, you'll see a list of all available dashboard views:

```
📊 Energy > Dashboard
📹 Cameras > All Cameras
📹 Cameras > Front Door
🏠 Lovelace > Overview
```

Simply select the ones you want to embed, and they'll appear in Linus Dashboard.

### Tips & Best Practices

#### Keep Linus for Automatic Organization
Let Linus handle your areas, rooms, and devices automatically. Use embedded dashboards only for specific views that need custom layouts.

#### Use Descriptive Names
Give your custom dashboards clear names so they're easy to identify in the Linus interface.

#### Combine Multiple Views
You can embed multiple views from the same dashboard, giving you fine-grained control over what appears in Linus.

#### Maintain Consistency
Try to match your custom dashboard's theme and card styles with Linus for a cohesive user experience.

### Troubleshooting

#### Dashboard Not Appearing?
- Make sure the dashboard exists in Home Assistant
- Check that it has at least one view
- Reconfigure Linus Dashboard integration to refresh the list

#### Changes Not Reflected?
- Custom dashboard edits appear immediately
- If you add/remove views, reconfigure the integration

#### Views in Wrong Order?
- Drag and drop in the configuration to reorder
- Order is saved and respected in Linus Dashboard

---

## Français

### Aperçu

L'une des fonctionnalités les plus puissantes de Linus Dashboard est la possibilité d'**intégrer vos propres tableaux de bord personnalisés** créés avec l'éditeur visuel de Home Assistant. Cela signifie que vous pouvez utiliser Linus comme tableau de bord principal tout en gardant le contrôle total sur des vues spécifiques.

### Pourquoi utiliser les tableaux de bord intégrés ?

- **Le meilleur des deux mondes** : Organisation automatique + flexibilité de personnalisation totale
- **Édition visuelle** : Utilisez l'éditeur UI intégré de Home Assistant pour les vues personnalisées
- **Interface unifiée** : Pas besoin de basculer entre plusieurs tableaux de bord
- **Intégration transparente** : Les vues personnalisées apparaissent comme des onglets aux côtés des vues automatiques

### Cas d'usage

#### 📊 Monitoring d'énergie
Intégrez le tableau de bord Énergie natif de Home Assistant pour suivre la consommation et la production aux côtés de votre tableau de bord Linus.

#### 📹 Sécurité & Caméras
Créez une vue multi-caméras dédiée avec des dispositions et configurations de cartes personnalisées.

#### 🎵 Contrôle média
Concevez un centre de contrôle média complet avec plusieurs pièces et sources.

#### 🌡️ Climat & Qualité de l'air
Construisez des tableaux de bord de monitoring climatique détaillés avec graphiques et données historiques.

#### 🏗️ Intégrations personnalisées
Mettez en valeur des intégrations spécifiques (Tesla, Solaire, etc.) qui nécessitent des dispositions de cartes personnalisées.

### Comment configurer

#### Étape 1 : Créez votre tableau de bord personnalisé

1. Allez dans **Paramètres > Tableaux de bord** dans Home Assistant
2. Cliquez sur **Ajouter un tableau de bord**
3. Choisissez un chemin URL (ex: `energie`, `cameras`)
4. Concevez votre tableau de bord avec l'éditeur visuel

#### Étape 2 : Intégrez dans Linus Dashboard

1. Allez dans **Paramètres > Appareils et services**
2. Trouvez l'intégration **Linus Dashboard**
3. Cliquez sur **Configurer**
4. Dans la section **"Tableaux de bord intégrés"**, sélectionnez les vues de tableau de bord souhaitées
5. **Enregistrez**

#### Étape 3 : Profitez !

Vos vues de tableau de bord personnalisées apparaîtront maintenant comme des onglets dans Linus Dashboard. Vous pouvez :
- Les **réorganiser** en les faisant glisser dans la liste de sélection
- Les **modifier** avec l'éditeur visuel de Home Assistant
- Les **mettre à jour** à tout moment sans reconfigurer Linus

### Exemple de configuration

Lorsque vous configurez les tableaux de bord intégrés, vous verrez une liste de toutes les vues disponibles :

```
📊 Énergie > Tableau de bord
📹 Caméras > Toutes les caméras
📹 Caméras > Porte d'entrée
🏠 Lovelace > Vue d'ensemble
```

Sélectionnez simplement celles que vous souhaitez intégrer, et elles apparaîtront dans Linus Dashboard.

### Conseils & Bonnes pratiques

#### Gardez Linus pour l'organisation automatique
Laissez Linus gérer vos zones, pièces et appareils automatiquement. Utilisez les tableaux de bord intégrés uniquement pour des vues spécifiques nécessitant des dispositions personnalisées.

#### Utilisez des noms descriptifs
Donnez à vos tableaux de bord personnalisés des noms clairs pour qu'ils soient faciles à identifier dans l'interface Linus.

#### Combinez plusieurs vues
Vous pouvez intégrer plusieurs vues d'un même tableau de bord, vous donnant un contrôle granulaire sur ce qui apparaît dans Linus.

#### Maintenez la cohérence
Essayez de faire correspondre le thème et les styles de cartes de votre tableau de bord personnalisé avec Linus pour une expérience utilisateur cohérente.

### Dépannage

#### Le tableau de bord n'apparaît pas ?
- Assurez-vous que le tableau de bord existe dans Home Assistant
- Vérifiez qu'il a au moins une vue
- Reconfigurez l'intégration Linus Dashboard pour rafraîchir la liste

#### Les modifications ne sont pas reflétées ?
- Les modifications de tableau de bord personnalisé apparaissent immédiatement
- Si vous ajoutez/supprimez des vues, reconfigurez l'intégration

#### Les vues sont dans le mauvais ordre ?
- Glissez-déposez dans la configuration pour réorganiser
- L'ordre est sauvegardé et respecté dans Linus Dashboard
