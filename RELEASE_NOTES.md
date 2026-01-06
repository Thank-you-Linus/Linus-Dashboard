# 🎉 Linus Dashboard 1.4.0 - A Major Milestone!

> **A huge THANK YOU to our amazing community!** 🙏
> Thanks to your support, we've reached **100+ GitHub stars** ⭐ and are approaching **4,000 downloads**! 🚀
> This release is dedicated to all of you who believe in making Home Assistant more accessible and beautiful.

---

## 🇬🇧 English

### 🎊 Celebrating Our Community

This isn't just another release - it's a **celebration of what we've built together**!

**Milestone Achieved:**
- ⭐ **100+ GitHub Stars** - Your trust means everything to us
- 📥 **Nearly 4,000 Downloads** - From around the world
- 💬 **Active Community** - Constant feedback and feature requests
- 🌍 **Growing Global Presence** - Users from France, USA, Germany, and beyond

**Special Thanks:**
- To every **beta tester** who helped us catch bugs before production
- To our **French community** at HACF for the incredible support
- To everyone who **reported issues**, **suggested features**, and **spread the word**
- To the **Home Assistant team** for creating such an amazing platform

### ✨ Major New Features

#### 🎨 **Custom Embedded Dashboards** (Advanced Users)

**The most powerful feature for advanced users!**

Take complete control of your dashboard by embedding your own custom Lovelace views directly into Linus Dashboard. Perfect for power users who want to:

- **Mix auto-generated views with custom designs** - Keep Linus' smart automation while adding your personal touch
- **Create specialized dashboards** - Energy monitoring, security cameras, custom graphs, or any Lovelace card you can imagine
- **Full Lovelace compatibility** - Use ANY card from HACS or custom cards
- **Seamless integration** - Your custom views appear right alongside auto-generated ones

**How it works:**
1. Create your custom dashboard in Home Assistant
2. Configure it in Linus Dashboard settings
3. Choose which views to embed (or embed the whole dashboard)
4. Your custom content appears perfectly integrated!

**Use cases:**
- Energy dashboard with detailed consumption graphs
- Security system with all your cameras
- Climate control with advanced HVAC management
- Media center with all your entertainment devices
- Custom automations dashboard

This feature bridges the gap between **full automation** and **complete customization** - the best of both worlds!

#### 🔲 **Enhanced Aggregate Popup Modal**

**A game-changer for managing multiple devices!**

We've completely redesigned how you interact with groups of similar devices. The new aggregate popup modal provides:

**Smart Device Grouping:**
- **Lights** - Control all lights in a room with one tap (brightness, color, temperature)
- **Covers** - Open/close all blinds or shutters together
- **Climate** - Adjust temperature for multiple zones
- **Media Players** - Control volume and playback across devices
- **Switches** - Toggle multiple switches as a group

**Intuitive Interface:**
- Beautiful, responsive modal design
- Individual device controls within the group
- Visual feedback for device states
- Quick actions for common scenarios
- Smooth animations and transitions

**Performance Optimized:**
- Faster rendering for large device groups
- Reduced Home Assistant load
- Better state synchronization
- Improved error handling

**Example:** Tap "All Lights" in your living room - instantly see and control each light individually, or use the master control to adjust everything at once!

### 🐛 Bug Fixes & Improvements

**Light Chip Handling**
- Completely refactored light chip rendering for **2x faster performance**
- Fixed aggregation issues with grouped lights
- Better color temperature representation
- Improved brightness slider responsiveness

**Code Quality & Developer Experience**
- Added **7 Claude Code Skills** for streamlined development
- Fixed version consistency checks across all files
- Resolved Python formatting issues (Ruff compliance)
- Enhanced NPM scripts for release management
- Better error messages and debugging tools

**Stability Improvements**
- Fixed edge cases in device state updates
- Better handling of unavailable entities
- Improved error recovery mechanisms
- Memory usage optimizations

### 🎯 What's Next?

We're listening to your feedback! Upcoming features being considered:
- Enhanced tablet/mobile layouts
- More customization options for cards
- Additional language support
- Integration with popular HACS cards
- Performance optimizations for large homes

**Want to influence the roadmap?** Join the discussion on our [GitHub Issues](https://github.com/Thank-you-Linus/Linus-Dashboard/issues)!

---

## 🇫🇷 Français

### 🎊 Célébration de Notre Communauté

Ce n'est pas qu'une simple release - c'est une **célébration de ce que nous avons construit ensemble** !

**Jalons Atteints :**
- ⭐ **Plus de 100 étoiles GitHub** - Votre confiance nous touche énormément
- 📥 **Près de 4 000 téléchargements** - Du monde entier
- 💬 **Communauté Active** - Retours constants et demandes de fonctionnalités
- 🌍 **Présence Mondiale Croissante** - Utilisateurs de France, USA, Allemagne et au-delà

**Remerciements Spéciaux :**
- À tous les **beta testeurs** qui nous ont aidés à corriger les bugs avant la production
- À notre **communauté française** sur HACF pour le soutien incroyable
- À tous ceux qui ont **signalé des problèmes**, **suggéré des fonctionnalités** et **fait passer le mot**
- À l'**équipe Home Assistant** pour avoir créé une plateforme aussi extraordinaire

### ✨ Nouvelles Fonctionnalités Majeures

#### 🎨 **Dashboards Personnalisés Intégrés** (Utilisateurs Avancés)

**La fonctionnalité la plus puissante pour les utilisateurs avancés !**

Prenez le contrôle total de votre dashboard en intégrant vos propres vues Lovelace personnalisées directement dans Linus Dashboard. Parfait pour les power users qui veulent :

- **Mixer vues auto-générées et designs personnalisés** - Gardez l'automatisation intelligente de Linus tout en ajoutant votre touche personnelle
- **Créer des dashboards spécialisés** - Monitoring énergétique, caméras de sécurité, graphiques personnalisés, ou toute carte Lovelace imaginable
- **Compatibilité Lovelace complète** - Utilisez N'IMPORTE quelle carte de HACS ou carte personnalisée
- **Intégration transparente** - Vos vues personnalisées apparaissent aux côtés des vues auto-générées

**Comment ça marche :**
1. Créez votre dashboard personnalisé dans Home Assistant
2. Configurez-le dans les paramètres de Linus Dashboard
3. Choisissez quelles vues intégrer (ou intégrez tout le dashboard)
4. Votre contenu personnalisé apparaît parfaitement intégré !

**Cas d'usage :**
- Dashboard énergétique avec graphiques détaillés de consommation
- Système de sécurité avec toutes vos caméras
- Contrôle climatique avec gestion HVAC avancée
- Centre multimédia avec tous vos appareils de divertissement
- Dashboard d'automatisations personnalisées

Cette fonctionnalité fait le pont entre **automatisation complète** et **personnalisation totale** - le meilleur des deux mondes !

#### 🔲 **Modal Popup Agrégée Améliorée**

**Un game-changer pour gérer plusieurs appareils !**

Nous avons complètement repensé comment vous interagissez avec les groupes d'appareils similaires. La nouvelle modal popup agrégée offre :

**Regroupement Intelligent des Appareils :**
- **Lumières** - Contrôlez toutes les lumières d'une pièce en un tap (luminosité, couleur, température)
- **Volets** - Ouvrez/fermez tous les volets ou stores ensemble
- **Climat** - Ajustez la température pour plusieurs zones
- **Lecteurs Média** - Contrôlez le volume et la lecture sur plusieurs appareils
- **Interrupteurs** - Basculez plusieurs interrupteurs en groupe

**Interface Intuitive :**
- Design de modal magnifique et réactif
- Contrôles individuels des appareils au sein du groupe
- Feedback visuel pour les états des appareils
- Actions rapides pour les scénarios courants
- Animations et transitions fluides

**Optimisé pour la Performance :**
- Rendu plus rapide pour les grands groupes d'appareils
- Charge Home Assistant réduite
- Meilleure synchronisation des états
- Gestion d'erreurs améliorée

**Exemple :** Tapez "Toutes les Lumières" dans votre salon - voyez et contrôlez instantanément chaque lumière individuellement, ou utilisez le contrôle maître pour tout ajuster d'un coup !

### 🐛 Corrections de Bugs & Améliorations

**Gestion des Chips de Lumière**
- Refonte complète du rendu des chips de lumière pour **2x plus de performance**
- Correction des problèmes d'agrégation avec les lumières groupées
- Meilleure représentation de la température de couleur
- Slider de luminosité plus réactif

**Qualité du Code & Expérience Développeur**
- Ajout de **7 Skills Claude Code** pour un développement optimisé
- Correction des vérifications de cohérence de version sur tous les fichiers
- Résolution des problèmes de formatage Python (conformité Ruff)
- Scripts NPM améliorés pour la gestion des releases
- Meilleurs messages d'erreur et outils de débogage

**Améliorations de Stabilité**
- Correction de cas limites dans les mises à jour d'état des appareils
- Meilleure gestion des entités indisponibles
- Mécanismes de récupération d'erreur améliorés
- Optimisations de l'utilisation mémoire

### 🎯 Et Ensuite ?

Nous écoutons vos retours ! Fonctionnalités à venir considérées :
- Mises en page améliorées pour tablettes/mobiles
- Plus d'options de personnalisation pour les cartes
- Support de langues supplémentaires
- Intégration avec les cartes HACS populaires
- Optimisations de performance pour les grandes maisons

**Vous voulez influencer la roadmap ?** Rejoignez la discussion sur nos [GitHub Issues](https://github.com/Thank-you-Linus/Linus-Dashboard/issues) !

---

## 💝 A Message From The Team

Building Linus Dashboard has been an incredible journey. What started as a personal project to make Home Assistant more accessible has grown into something much bigger - a community-driven effort to reimagine what a smart home dashboard can be.

**Thank you for:**
- Every bug report that made us better
- Every feature request that pushed our boundaries
- Every star that motivated us to keep going
- Every download that validated our vision
- Every message of support that reminded us why we do this

**Here's to the next 4,000 downloads and beyond!** 🚀

With gratitude,
The Linus Dashboard Team

---

## 📊 Technical Details

### Changelog Since 1.3.0

**Features:**
- Custom embedded dashboards with full Lovelace compatibility
- Enhanced aggregate popup modal with improved UX
- Claude Code Skills integration for development
- 7 new NPM scripts for release management

**Bug Fixes:**
- Fixed light chip rendering performance (2x faster)
- Resolved version consistency check issues
- Fixed Python formatting compliance
- Improved aggregate popup behavior

**Performance:**
- Optimized light chip rendering
- Reduced memory usage
- Better state synchronization
- Faster modal loading

### Contributors

A massive thank you to:
- @Julien-Decoen - Lead Developer
- All our beta testers
- The HACF community
- Everyone who contributed feedback

### Download Stats

- **Total Downloads:** ~4,000 (and growing!)
- **GitHub Stars:** 100+
- **Active Installations:** Growing daily
- **Community Forums:** Active on HA Community & HACF

---

**Ready to upgrade?** Update through HACS or manually download from our [GitHub Releases](https://github.com/Thank-you-Linus/Linus-Dashboard/releases)!
