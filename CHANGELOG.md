# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.0-beta.1] - 2026-07-08

### Added


 differentiate activity detection by device class
- feat: add 17 supplemental domains to exclusion options
- feat: add CameraPopup with live camera feed in aggregate popups
- feat: add TagsView and TagsChip for Home Assistant labels management
- feat: add SecurityView enhancements and siren domain support for 1.5.0-beta.1
- feat: add siren domain and improve SecurityView with aggregate cards
- feat: add floor_id support to excluded_targets and fix popup navigation
- feat: improve Activity Detection popup UX with explanatory text
- feat: improve Discord notifications and release notes format
- feat: add Claude Code skills and fix npm scripts
- feat: improve aggregate popups with Linus Brain integration and enhanced layouts
- feat: add auto-detected frontend debug logging from Home Assistant logger
- feat: Implement Component Registry for dynamic imports and caching
- feat: enhance card styling and chip functionality
- feat: add state-aware dynamic icons for StandardDomainView badges
- feat: add navigation mode for HomeView chips and debug logs for CoverView
- feat: add device_class-specific chips for covers and filter empty area badges
- feat: add smart control chips for Switch, Fan, and MediaPlayer views
- feat: add RefreshChip to all dashboard views with improved user feedback
- feat: add manual registry refresh with browser_mod.javascript
- feat: Add AI-powered intelligent release system
- feat: Implement smart version management with package.json as single source of truth
- feat: Add one-command release system with improved Discord notifications
- feat: mise à jour des notes de version pour inclure le support de la réorganisation manuelle des zones et étages
- feat: ajout de la prise en charge des tableaux de bord intégrés et amélioration de l'ordre manuel des zones et étages
- feat: enhance area and floor sorting with manual order support
- feat: Update to Home Assistant 20251203.2 and add automated update process
- feat: Add comprehensive release management scripts and documentation
- feat: Ajoute des scripts pour la validation et l'envoi de notifications de version sur Discord
- feat: Améliore le système de notification et formatage des notes de version
- feat: Met à jour la version à 1.4.0-beta.1
- feat: Add comprehensive release management system
- feat: Add support for embedding external Lovelace dashboards
- Add a notification if version of frontend is not up to date
- Adding ConditionalLightChip to turn on and off area light
- Adding badge alarm, improve greeting
- feat: using new exclude options, multiple alarms and adding battery and switch features
- feat: improve configuration with additionnal exclude options and multiple alarm
- feat: update dependencies and migrate from Webpack to Rspack
- feat: Add support for area-specific temperature and humidity entities
- feat: adding script to sync dependancies
- adding fan entities
- adding Installation Tutorial to readme
- add french images
- add images
- feat: change actions in chips and add chips in floor controller
- feat: rework on dynamic icon and colors for badges
- feat: adding config options to disable greeting
- feat: fix floorView and improve security view
- feat: adding AggregateCard and improve security view
- Adding memoize function to improve performances
- feat: exclude a list of entities
- feat: adding hassfest action
- feat: adding exclude domain and device class
- feat: adding GroupedCard to improve style
- feat: simplify climate card
- feat: display light group, fix aggregate tap_action
- feat: add chips on home area cards
- feat: security view add badges and hide hidden entities
- feat: adding missing device class
- add npm run build to release action
- Add floor view
- Adding floor view
- add debug
- add debug
- add debug
- add debug for light controller
- add debug
- add debug
- Add french readme and images
- Adding social links
- add debug
- add debug
- Adding unavailable view
- add debug
- Add getFloorName and getAreaName
- add toggle on controller card
- add camera to security
- Adding areaview in separate file
- add more debug
- add log to debug
- adding stack in card
- add back linus files
 import only mushroom and mushroom strategy
 import js files

### Fixed



- fix: use tile card for activity sensors to get real entity icons
- fix: use reactive Jinja2 templates instead of static state values in popups and chips
- fix: resolve devcontainer venv installation

 update bundled libs and add custom-elements-guard
 remove turn on/off from popup and fix icon resolution
 resolve ruff formatting and PLC0207 lint errors
 hide badge icon when count is zero
 use Jinja2 templates for real-time updates in security view
 prevent duplicate cover entities in chips and badges
 remove UNDISCLOSED entities from global popups and fix cover icon color
 use floor scope for aggregate chips instead of area scope
 skip release workflow for prereleases created via GitHub UI
 prevent release workflow from triggering on beta/alpha tags
- fix: use correct scope for badges in AreaView and FloorView

- fix: harmonize badge popups with hierarchical Floor → Area → Entity grouping
- fix: preserve RELEASE_NOTES.md in stable release workflow
- fix: improve cover popup UX with side-by-side buttons and individual entities
- fix: improve Discord webhook selection logic for beta vs stable releases
- fix: remove memoization from groupEntitiesByDomain to fix entity retrieval bug
- fix: exclude Magic Areas entities from binary_sensor/sensor popups and improve navigation labels
- fix: enhance domain checking logic for device classes in createItemsFromList function
 prevent false positives for unknown backend version
- fix: improve Discord notifications for stable releases
- fix: update release workflow to trigger on tag push
- fix: resolve Ruff formatting issues and remove deprecated rule
- fix: rename babel.config.js to .cjs for ES modules compatibility
- fix: improve domain handling and type safety
- fix: resolve TypeScript type errors in RegistryManager and CardFactory
- fix: correct EntityResolver import path case sensitivity
- fix: resolve cover chip issues with device_class filtering and badge layout
- fix: use literal import paths in factories for webpack compatibility
- fix: correct CardFactory basePath - remove incorrect relative paths
- fix: display entity count in global badges and disable sensor/binary_sensor chips
- fix: enable control chips for all domains in AreaView and FloorView
- fix: allow extraControls for aggregate domains without device_class
- fix: correct floor aggregate chips and cover extraControls
- fix: exclude Magic Areas entities and improve chip colors
- fix: update tag validation to disallow 'v' prefix and reflect changes in release guide
- fix: accept 'v' prefix in pre-release tag validation
- fix: Improve release notifications formatting and Discord URL display
- fix: Update version consistency check to use Python import for CONST_VERSION
- fix: Add eslint-disable for __VERSION__ naming convention and enforce linting rule
- fix: Automatically clean up duplicate resource versions to prevent CustomElementRegistry conflicts
- fix: eliminate blocking I/O operations in async event loop
- fix: modernize linting configuration and resolve all CI errors
- fix: Improve tag detection to include pre-releases in generate-release-notes
- fix: Fix smoke tests script arithmetic with set -e
- fix: Resolve lint pipeline errors with ruff formatting and rule adjustments
- Fix for coverView, welcomeCard and settingsPopup
- fix: create MA slug from identifiers instead of slugify
- fix: adding shortcut for linus dashboard
- fix: show area badge if not clear
- fix: mettre à jour la version à 1.3.0-alpha.1
- fix: mettre à jour la version de Home Assistant à 2025.10.1 et corriger les dépendances
- fix: layout, change area card and default colors
- fix: Refactor AreaStateChip to use Helper methods for entity ID retrieval
- Fix cover name in security view
- fix security view
- Fix tap and hold action on chips
- fix requirement
- fix settingsPopup
- fix: bump package and replace deepmerge by lodash
- fix: adding after_dependancies to load all icons before init
- fix: remove tap_action toggle from switch
- fix build frontend
- fix: using websocket_api fromhomeassistant.components import and fix warnings
- Fix space issue in translations
- Fix translation issue
- fix: display all entities in area and fix colors for sensors
- fix: fix sensor icon in aggregate view
- fix: remove log
- fix: fix card and chips params
- fix: display all device classes for covers
- fix: always use mushroom-template-card in aggregateCard
- fix: hide controls in abstract view for sensors
- fix: get back chips from binary sensor and sensor in area view
- fix: huge fix of aggregate cart and chips
mushroom-entity-card
- fix: remove log
- fix: fix hold_action on floor chips
- fix: fix ControllerCard for views
 add fallback when no available entities
 get sum or average from state_class
- fix: disable live camera feed on security view
- fix: lint
- fix: undefined error when no exlude entities or domains
- fix: downgrade action-gh-release
- fix: helpers for aggregate chips
- fix: lint files
- fix: fix unavailable view
- fix: fix area with no floor_id
- fix: fix dashboard layout on desktop
- fix: remove floor controller when no floors and fix unavailable chips
 allow undefined entities
- fix release workflow
- fix lint
- Fix naviagation path
- fix aggregate homeAreaCard
- fix aggregate min width on heading
- fix conditionalChip
- fix controlChips
- fix home badges
- fix security view
- fix exclude unknown
- fix title navigate
- fix area slug
- fix some chips card
- fix controller card
- fix readme
- Fix entity for sensors chips
- fix lint
- fix controller card
- Fix control chips
- fix magic entity
- fix lot of chips with colors and icons
- fix content for chips
- fix UnavailableChip again
- fix groupBypopup
- fix unavailablechip
- fix unavailable chips
- fix anavailable chips
- fix area issue
- fix again
- fix issue
- fix light chip
- fix config flow
- fix config flow
- fix add area button trad
- fix conditional chip
- fix helpers for duplicate entities
- fix swipe card import
- fix area card
- fix device by slug for controlling
- fix controller cards
- fix domain views
- fix controller card
- fix abstract view and controller card
- fix console error
- fix: revert some area_id
- fix area as target
- fix js files
- fix navigation to area slug
- fix getting Helper.magicAreasDevices
- fix UndisclosedAreaConfig
- fix lot of stuff and test sections
 fix js and yaml load
 change name to linus_dashboard

### Changed

- Update/ha 2026.4.0 (#132)

- refactor: improve aggregate popup UX with cleaner status display
- refactor: organize sensor constants and reduce Area/Floor chips
- refactor: improve SecurityView layout and remove stats card
- refactor: add exclusion utility methods to reduce code duplication
- refactor: consolidate domain tag construction and improve code maintainability
- Refactor HomeAreaCard to simplify light chip creation
- Refactor light chip handling and improve aggregate popup behavior
- refactor: simplify version retrieval by using const.py instead of manifest.json
- Refactor time-related attributes in Helper and popups
- refactor: remove unused imports and debug console logs
- Enhance domain label localization in AggregatePopup
- Enhance documentation and clean up debug logs in Helper.ts
- Refactor ActivityDetectionPopup: Clean up code by removing unnecessary lines and comments
- Refactor Helper class sorting logic and improve badge creation in StandardDomainView
- refactor: implement factories and services for Phase 3 completion
- refactor: eliminate domain view duplication with StandardDomainView
- refactor: simplify domain configuration and remove unused options
- refactor: add floor_id filtering and eliminate code duplication
- refactor: unify chip system with AggregateChip and specialized popups
- refactor: remove redundant titles from domain views and move global chips to badges
- refactor: simplify activity detection with clear Linus Brain distinction
- refactor: Simplify release notes system to single file
- refactor: Unify beta release commands into single /release-beta
- Enhance HomeAreaCard icon color logic and update version mismatch notification
- refactor: Simplify release system and make CI checks blocking
- refactor: Clean up scripts directory - remove obsolete and redundant scripts
- Refactor code structure for improved readability and maintainability
- Update ressources
- Improve ConditionalChip type
- Refactor item creation in createItemsFromList to streamline chip and card handling
- Refactor build scripts and configurations with integration and device
- Refactor SettingsPopup styles to use CSS variables for primary color
- Update settings popup
- Update github action release
- Update readmes
- Update screenshots
- update screens
- Improve performances
- improve view loading
- improve linus-strategy
- update manifest
- Update readme image links
- Update readme
- update js conf
 update Linus dashboard integration
 update Linus Dashboard integration

<details>
<summary>Documentation Updates</summary>

- docs: add proper release notes for 1.4.1 stable release
- docs: add Discord webhooks configuration guide
- docs: Add comprehensive release notes for 1.4.1-beta.1
- docs: add critical warning about tag format in all release skills
- docs: finalize release notes for v1.4.0-beta.7
- docs: prepare release notes for v1.4.0-beta.7
- docs: comprehensive documentation overhaul for v1.4.0 release
- docs: add comprehensive chip system architecture documentation
- docs: Prepare release notes for v1.4.0-beta.4
- docs: Add comprehensive automated beta release documentation and OpenCode command
- docs: Prepare release notes for v1.4.0-beta.2
- docs: Add quick reference guide for new release system
- docs: Update release notes for v1.4.1
- docs: update release notes with "Embed Anything" title and enhanced custom dashboard focus
- docs: Update CONTRIBUTING.md for improved clarity and structure in both English and French
- docs(readme): add a troubleshooting section for timeout issue
- docs(readme): adding setup section on readme
- docs: fix french readme
- docs: update readme files

</details>

### Other Changes

- build(deps): update pip requirement from >=26.1 to >=26.1.1 (#141)
- build(deps): bump ruff from 0.15.9 to 0.15.12 (#140)
- build(deps): bump softprops/action-gh-release from 2 to 3 (#133)
- build(deps): bump actions/github-script from 8 to 9 (#134)
- build(deps): update pip requirement from >=21.3.1 to >=26.1 (#139)
- build(deps): bump actions/setup-python from 6.1.0 to 6.2.0 (#107)
- build(deps): bump ruff from 0.14.10 to 0.15.9 (#130)
- perf: defer component preload, parallelize embedded dashboards and resource registration
- build: rebuild after babel config fix
- build: rebuild after cleanup
- build(deps): bump actions/upload-artifact from 4 to 6
- build(deps): bump actions/github-script from 7 to 8
- build(deps): bump ruff from 0.14.8 to 0.14.10
- build: rebuild bundle after translation additions
- revert: Remove problematic dependency detection logic that prevented cards from loading
- ci: Streamline workflows
- ci: Add TypeScript and ESLint checks on push
- ci: Add confirmation message after lint/type-check step
- Remove unused utilities and refactor dashboard configuration
- build(deps): bump actions/setup-python from 6.0.0 to 6.1.0 (#94)
- build(deps): bump actions/setup-python from 6.0.0 to 6.1.0 (#94)
- build(deps): bump ruff from 0.13.1 to 0.14.8 (#95)
- Mise à jour de la version à 1.3.0
- Put unavailable entities in the end of group
- Remove light refaut toggle to magicAreaLight and revert getMagicAreaSlug to use again slugify
- upgrade browser mod
- Remove mini graph card
- Clean const
- build(deps): bump softprops/action-gh-release from 2.3.2 to 2.3.3 (#73)
- build(deps): bump actions/checkout from 4 to 5 (#65)
- build(deps): bump ruff from 0.12.1 to 0.13.1 (#76)
- build(deps): bump actions/setup-node from 4 to 5 (#71)
- build(deps): bump actions/setup-python from 5.6.0 to 6.0.0 (#72)
- quick fix settings popup
- Supprimer les options de mise en page et les badges des cartes dans ControllerCard, HomeView et SecurityView
- build(deps): bump softprops/action-gh-release from 2.1.0 to 2.3.2 (#57)
- build(deps): bump ruff from 0.11.4 to 0.12.1 (#59)
- Simplify HACS installation
- Settings chips navigate to magic areas integration
- build(deps): bump ruff from 0.9.6 to 0.11.4 (#40)
- build(deps): bump actions/setup-python from 5.4.0 to 5.6.0
- remove old images
- Change sensor display, fix light and scene setting chips. Add areastate and aggregates chips on homepage
- build(deps): bump actions/checkout from 3 to 4
- build(deps): bump actions/setup-python from 5.3.0 to 5.4.0
- build(deps): bump ruff from 0.8.4 to 0.9.6
- build(deps-dev): bump webpack from 5.89.0 to 5.97.1
- build(deps): bump softprops/action-gh-release from 2.1.0 to 2.2.0
- build(deps): bump ruff from 0.8.2 to 0.8.4
- build(deps): bump ruff from 0.8.1 to 0.8.2
- build(deps): bump ruff from 0.7.4 to 0.8.1
- build(deps): bump actions/setup-node from 3 to 4
- using alarm config in security view
- using config flow entities for weather and alarm
- use ha icons from websocket
- clean const
- condition for initialize
- reduce complexity
- build(deps): bump actions/setup-python from 5.2.0 to 5.3.0
- build(deps): bump actions/checkout from 4.1.7 to 4.2.2
- build(deps): bump colorlog from 6.8.2 to 6.9.0
- remove console.log
- remove some controller card
- try to gif getDomains
- remove double quote from template
- change target to area slug
- try a fix for helpers
- change image on html
- remove debug
- try to fix areas helper
- more debug
- mini fix
- Rename home area card
- use dictionnaries for entities
- upgrade control
- Use back swipe card
- using stack in card for area card
- remove usage of swipe card
- more debug
- again more log
- replace area.area_id to area.slug
- try to fix stack-in-card
- rename to linus-strategy
- move home to section
- remove console error
- Initial commit

## [1.5.1-beta.3] - 2026-03-29

## [1.5.1-beta.2] - 2026-03-09

## [1.5.1-beta.1] - 2026-03-07

## [1.5.1] - 2026-04-11

### Added

 differentiate activity detection by device class

### Fixed

- fix: use tile card for activity sensors to get real entity icons
- fix: use reactive Jinja2 templates instead of static state values in popups and chips
- fix: resolve devcontainer venv installation

### Changed

- Update/ha 2026.4.0 (#132)


### Other Changes

- build(deps): bump actions/setup-python from 6.1.0 to 6.2.0 (#107)
- build(deps): bump ruff from 0.14.10 to 0.15.9 (#130)

## [1.5.0-beta.3] - 2026-02-17

## [1.5.0-beta.2] - 2026-02-12

## [1.5.0-beta.1] - 2026-02-05

## [1.5.0] - 2026-03-04

### Added

- feat: add 17 supplemental domains to exclusion options
- feat: add CameraPopup with live camera feed in aggregate popups
- feat: add TagsView and TagsChip for Home Assistant labels management

### Fixed

 remove turn on/off from popup and fix icon resolution
 resolve ruff formatting and PLC0207 lint errors
 hide badge icon when count is zero
 use Jinja2 templates for real-time updates in security view
 prevent duplicate cover entities in chips and badges
 remove UNDISCLOSED entities from global popups and fix cover icon color
 use floor scope for aggregate chips instead of area scope
 skip release workflow for prereleases created via GitHub UI
 prevent release workflow from triggering on beta/alpha tags
- fix: use correct scope for badges in AreaView and FloorView

### Changed

- refactor: improve aggregate popup UX with cleaner status display
- refactor: organize sensor constants and reduce Area/Floor chips
- refactor: improve SecurityView layout and remove stats card

### Other Changes

- perf: defer component preload, parallelize embedded dashboards and resource registration

## [1.4.3-beta.1] - 2026-02-07

## [1.4.1-beta.4] - 2026-01-10

## [1.4.1-beta.3] - 2026-01-10

## [1.4.1-beta.2] - 2026-01-10

## [1.4.1-beta.1] - 2026-01-08

## [1.4.1] - 2026-01-11

### Added

- feat: improve Activity Detection popup UX with explanatory text
- feat: improve Discord notifications and release notes format

### Fixed

- fix: preserve RELEASE_NOTES.md in stable release workflow
- fix: improve cover popup UX with side-by-side buttons and individual entities
- fix: improve Discord webhook selection logic for beta vs stable releases
- fix: remove memoization from groupEntitiesByDomain to fix entity retrieval bug

<details>
<summary>Documentation Updates</summary>

- docs: add proper release notes for 1.4.1 stable release
- docs: add Discord webhooks configuration guide
- docs: Add comprehensive release notes for 1.4.1-beta.1
- docs: add critical warning about tag format in all release skills

</details>

## [1.4.0-beta.9] - 2026-01-06

## [1.4.0-beta.8] - 2026-01-05

## [1.4.0-beta.7] - 2025-12-31

## [1.4.0-beta.6] - 2025-12-31

## [1.4.0-beta.4] - 2025-12-15

## [1.4.0-beta.3] - 2025-12-14

## [1.4.0-beta.1] - 2025-11-18

### Added

- feat: Add comprehensive release management system

## [1.4.0] - 2026-01-06

### Added

- feat: add Claude Code skills and fix npm scripts
- feat: improve aggregate popups with Linus Brain integration and enhanced layouts
- feat: add auto-detected frontend debug logging from Home Assistant logger
- feat: Implement Component Registry for dynamic imports and caching
- feat: enhance card styling and chip functionality
- feat: add state-aware dynamic icons for StandardDomainView badges
- feat: add navigation mode for HomeView chips and debug logs for CoverView
- feat: add device_class-specific chips for covers and filter empty area badges
- feat: add smart control chips for Switch, Fan, and MediaPlayer views
- feat: add RefreshChip to all dashboard views with improved user feedback
- feat: add manual registry refresh with browser_mod.javascript
- feat: Add AI-powered intelligent release system
- feat: Implement smart version management with package.json as single source of truth
- feat: Add one-command release system with improved Discord notifications
- feat: mise à jour des notes de version pour inclure le support de la réorganisation manuelle des zones et étages
- feat: ajout de la prise en charge des tableaux de bord intégrés et amélioration de l'ordre manuel des zones et étages
- feat: enhance area and floor sorting with manual order support
- feat: Update to Home Assistant 20251203.2 and add automated update process
- feat: Add comprehensive release management scripts and documentation
- feat: Ajoute des scripts pour la validation et l'envoi de notifications de version sur Discord
- feat: Améliore le système de notification et formatage des notes de version
- feat: Met à jour la version à 1.4.0-beta.1
- feat: Add comprehensive release management system

### Fixed

- fix: update release workflow to trigger on tag push
- fix: resolve Ruff formatting issues and remove deprecated rule
- fix: rename babel.config.js to .cjs for ES modules compatibility
- fix: improve domain handling and type safety
- fix: resolve TypeScript type errors in RegistryManager and CardFactory
- fix: correct EntityResolver import path case sensitivity
- fix: resolve cover chip issues with device_class filtering and badge layout
- fix: use literal import paths in factories for webpack compatibility
- fix: correct CardFactory basePath - remove incorrect relative paths
- fix: display entity count in global badges and disable sensor/binary_sensor chips
- fix: enable control chips for all domains in AreaView and FloorView
- fix: allow extraControls for aggregate domains without device_class
- fix: correct floor aggregate chips and cover extraControls
- fix: exclude Magic Areas entities and improve chip colors
- fix: update tag validation to disallow 'v' prefix and reflect changes in release guide
- fix: accept 'v' prefix in pre-release tag validation
- fix: Improve release notifications formatting and Discord URL display
- fix: Update version consistency check to use Python import for CONST_VERSION
- fix: Add eslint-disable for __VERSION__ naming convention and enforce linting rule
- fix: Automatically clean up duplicate resource versions to prevent CustomElementRegistry conflicts
- fix: eliminate blocking I/O operations in async event loop
- fix: modernize linting configuration and resolve all CI errors
- fix: Improve tag detection to include pre-releases in generate-release-notes
- fix: Fix smoke tests script arithmetic with set -e
- fix: Resolve lint pipeline errors with ruff formatting and rule adjustments

### Changed

- Refactor light chip handling and improve aggregate popup behavior
- refactor: simplify version retrieval by using const.py instead of manifest.json
- Refactor time-related attributes in Helper and popups
- refactor: remove unused imports and debug console logs
- Enhance domain label localization in AggregatePopup
- Enhance documentation and clean up debug logs in Helper.ts
- Refactor ActivityDetectionPopup: Clean up code by removing unnecessary lines and comments
- Refactor Helper class sorting logic and improve badge creation in StandardDomainView
- refactor: implement factories and services for Phase 3 completion
- refactor: eliminate domain view duplication with StandardDomainView
- refactor: simplify domain configuration and remove unused options
- refactor: add floor_id filtering and eliminate code duplication
- refactor: unify chip system with AggregateChip and specialized popups
- refactor: remove redundant titles from domain views and move global chips to badges
- refactor: simplify activity detection with clear Linus Brain distinction
- refactor: Simplify release notes system to single file
- refactor: Unify beta release commands into single /release-beta
- Enhance HomeAreaCard icon color logic and update version mismatch notification
- refactor: Simplify release system and make CI checks blocking
- refactor: Clean up scripts directory - remove obsolete and redundant scripts
- Refactor code structure for improved readability and maintainability

<details>
<summary>Documentation Updates</summary>

- docs: finalize release notes for v1.4.0-beta.7
- docs: prepare release notes for v1.4.0-beta.7
- docs: comprehensive documentation overhaul for v1.4.0 release
- docs: add comprehensive chip system architecture documentation
- docs: Prepare release notes for v1.4.0-beta.4
- docs: Add comprehensive automated beta release documentation and OpenCode command
- docs: Prepare release notes for v1.4.0-beta.2
- docs: Add quick reference guide for new release system
- docs: Update release notes for v1.4.1
- docs: update release notes with "Embed Anything" title and enhanced custom dashboard focus

</details>

### Other Changes

- build: rebuild after babel config fix
- build: rebuild after cleanup
- build(deps): bump actions/upload-artifact from 4 to 6
- build(deps): bump actions/github-script from 7 to 8
- build(deps): bump ruff from 0.14.8 to 0.14.10
- build: rebuild bundle after translation additions
- revert: Remove problematic dependency detection logic that prevented cards from loading
- ci: Streamline workflows
- ci: Add TypeScript and ESLint checks on push
- ci: Add confirmation message after lint/type-check step
- Remove unused utilities and refactor dashboard configuration
- build(deps): bump actions/setup-python from 6.0.0 to 6.1.0 (#94)
- build(deps): bump actions/setup-python from 6.0.0 to 6.1.0 (#94)
- build(deps): bump ruff from 0.13.1 to 0.14.8 (#95)

## [1.3.0] - 2025-10-24

## [1.2.5] - 2025-09-27

## [1.2.4] - 2025-08-24

## [1.2.3] - 2025-07-01

## [1.2.2] - 2025-06-16

## [1.2.1] - 2025-05-09

## [1.2.0] - 2025-05-06

## [1.1.0] - 2025-02-28

## [1.0.9] - 2025-02-25

## [1.0.8] - 2025-01-05

## [1.0.7] - 2025-01-03

## [1.0.6] - 2024-12-30

## [1.0.5] - 2024-12-20

## [1.0.4] - 2024-12-12

## [1.0.3] - 2024-12-11

## [1.0.2] - 2024-12-10

## [1.0.1] - 2024-12-05

## [1.0.0] - 2024-12-02


---

For more details about each release, see the [GitHub Releases](https://github.com/Thank-you-Linus/Linus-Dashboard/releases) page.
