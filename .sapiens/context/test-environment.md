# Environnement de test

## Renvoi

Le geste qui déploie une PR sur l'instance Home Assistant de test n'est pas défini dans ce dépôt : il est déclaré dans le dépôt cible ci-dessous.

- Geste réel déclaré dans : Julien-Decoen/hermes-config
- Rôle : linus-dashboard
- Chemin du geste : ha-test/deploy-pr.sh (documenté dans ha-test/README.md) (chemins relatifs à la racine du dépôt cible)
- Prérequis d'accès : droit de lecture sur le dépôt privé cible ; exécution depuis la machine qui héberge l'instance Home Assistant de test ; un jeton d'API propre à cette instance, fourni hors dépôt.

## Pièges connus

Propriétés du code à garder en tête avant de tester une PR.

1. Le build du frontend n'est pas commité (`custom_components/linus_dashboard/www/linus-strategy.js`, son `.map` et les morceaux à nom haché sont ignorés par git). La CI le construit sur chaque PR et le publie comme artefact `build-output`, que le geste de déploiement installe : une PR dont la CI n'a pas tourné n'a rien à tester.
2. La branche par défaut est `main`, pas `master`.
3. Home Assistant ne consomme que `custom_components/`, `config/` et `src/` : des modifications non commitées sur ces chemins faussent un test de PR.
