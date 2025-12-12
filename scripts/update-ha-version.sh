#!/bin/bash

# Script pour mettre à jour la version de Home Assistant et synchroniser les dépendances
# Usage: ./scripts/update-ha-version.sh [version]
# Exemple: ./scripts/update-ha-version.sh 2024.12.0
# Sans argument: affiche les dernières versions disponibles

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log() {
    echo -e "${2:-$NC}$1${NC}"
}

log_header() {
    echo ""
    log "========================================" "$CYAN"
    log "$1" "$BOLD$CYAN"
    log "========================================" "$CYAN"
}

log_success() {
    log "✅ $1" "$GREEN"
}

log_error() {
    log "❌ $1" "$RED"
}

log_warning() {
    log "⚠️  $1" "$YELLOW"
}

log_info() {
    log "ℹ️  $1" "$BLUE"
}

# Fonction pour convertir YYYYMMDD.X en YYYY.M.P (format release notes HA)
format_version_display() {
    local version="$1"
    # Extraire YYYYMMDD.X
    local date_part="${version%.*}"
    local patch="${version##*.}"

    # Extraire année, mois, jour
    local year="${date_part:0:4}"
    local month="${date_part:4:2}"
    local day="${date_part:6:2}"

    # Enlever les zéros de début du mois
    month=$((10#$month))

    # Formater en YYYY.M.P
    echo "${year}.${month}.${patch}"
}

# Fonction pour comparer deux versions (retourne 0 si v1 > v2, 1 sinon)
version_greater_than() {
    local v1="$1"
    local v2="$2"

    # Comparer numériquement : extraire YYYYMMDD et X séparément
    local v1_date="${v1%.*}"
    local v1_patch="${v1##*.}"
    local v2_date="${v2%.*}"
    local v2_patch="${v2##*.}"

    # Comparer les dates
    if [ "$v1_date" -gt "$v2_date" ]; then
        return 0  # v1 > v2
    elif [ "$v1_date" -eq "$v2_date" ]; then
        # Même date, comparer les patches
        if [ "$v1_patch" -gt "$v2_patch" ]; then
            return 0  # v1 > v2
        fi
    fi

    return 1  # v1 <= v2
}

# Fonction pour récupérer les dernières versions de Home Assistant
fetch_latest_versions() {
    local count=${1:-10}
    local current_version="${2:-}"

    log_header "Récupération des dernières versions Home Assistant" >&2
    log_info "Interrogation de l'API GitHub..." >&2

    # Récupérer les releases depuis GitHub API
    local response=$(curl -s "https://api.github.com/repos/home-assistant/frontend/releases?per_page=50")

    if [ $? -ne 0 ]; then
        log_error "Impossible de récupérer les versions depuis GitHub" >&2
        return 1
    fi

    # Extraire toutes les versions (format YYYYMMDD.X)
    local all_versions=$(echo "$response" | grep -o '"tag_name":[^,]*' | \
                         grep -o '[0-9]\{8\}\.[0-9]\+' | \
                         sort -rV)

    # Si une version actuelle est fournie, filtrer les versions supérieures
    if [ -n "$current_version" ]; then
        local filtered_versions=""
        while IFS= read -r version; do
            if version_greater_than "$version" "$current_version"; then
                filtered_versions="${filtered_versions}${version}\n"
            fi
        done <<< "$all_versions"
        all_versions=$(echo -e "$filtered_versions" | head -n "$count")
    else
        all_versions=$(echo "$all_versions" | head -n "$count")
    fi

    if [ -z "$all_versions" ]; then
        log_error "Aucune version trouvée" >&2
        return 1
    fi

    echo "$all_versions"
}

# Fonction pour afficher le menu de sélection
select_version() {
    local versions="$1"
    local current_ws_version="${2:-unknown}"

    # Convertir en tableau
    local version_array=()
    while IFS= read -r version; do
        version_array+=("$version")
    done <<< "$versions"

    log_header "Sélection de la version" >&2
    echo "" >&2
    if [ "$current_ws_version" != "unknown" ]; then
        log "Version actuelle: home-assistant-js-websocket ${YELLOW}${current_ws_version}${NC}" "" >&2
        echo "" >&2
    fi
    log "Versions disponibles:" "$BOLD" >&2
    echo "" >&2
    for i in "${!version_array[@]}"; do
        local num=$((i + 1))
        local version="${version_array[$i]}"
        local display_version=$(format_version_display "$version")

        # Afficher en vert
        printf "  ${BOLD}${MAGENTA}%2d)${NC} ${BOLD}${GREEN}%s${NC} ${CYAN}(${version})${NC}\n" "$num" "$display_version" >&2
    done

    echo "" >&2
    log "  ${BOLD}${MAGENTA} q)${NC} Quitter" "$NC" >&2
    echo "" >&2

    # Demander la sélection
    while true; do
        read -p "$(echo -e "${BOLD}Choisissez une version (1-${#version_array[@]}) ou 'q' pour quitter:${NC} ")" choice

        if [[ "$choice" == "q" ]] || [[ "$choice" == "Q" ]]; then
            log_info "Opération annulée" >&2
            exit 0
        fi

        if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "${#version_array[@]}" ]; then
            local selected_version="${version_array[$((choice - 1))]}"
            echo "$selected_version"
            return 0
        else
            log_error "Choix invalide. Entrez un nombre entre 1 et ${#version_array[@]} ou 'q' pour quitter." >&2
        fi
    done
}

# Fonction pour obtenir la version actuelle de home-assistant-js-websocket
get_current_ha_dependency_version() {
    if [ -f "package.json" ]; then
        local version=$(node -e "
            const pkg = require('./package.json');
            const deps = {...pkg.dependencies, ...pkg.devDependencies};
            console.log(deps['home-assistant-js-websocket'] || 'unknown');
        " 2>/dev/null)
        echo "$version"
    else
        echo "unknown"
    fi
}

# Fonction pour trouver la version frontend actuelle basée sur websocket
find_current_frontend_version() {
    local ws_version="$1"

    if [ "$ws_version" == "unknown" ]; then
        echo ""
        return
    fi

    log_info "Recherche de la version frontend correspondante..." >&2

    # Récupérer quelques versions récentes et trouver celle qui correspond
    local response=$(curl -s "https://api.github.com/repos/home-assistant/frontend/releases?per_page=30")
    local versions=$(echo "$response" | grep -o '"tag_name":[^,]*' | grep -o '[0-9]\{8\}\.[0-9]\+')

    # Chercher la version qui utilise notre version websocket
    while IFS= read -r version; do
        local pkg_url="https://raw.githubusercontent.com/home-assistant/frontend/${version}/package.json"
        local remote_ws=$(curl -s "$pkg_url" | grep '"home-assistant-js-websocket"' | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+' | head -1)

        if [ "$remote_ws" == "$ws_version" ]; then
            echo "$version"
            return
        fi
    done <<< "$versions"

    # Si aucune correspondance trouvée, retourner vide
    echo ""
}

# Fonction principale de mise à jour
update_to_version() {
    local HA_VERSION="$1"

    # Validation du format de version (YYYYMMDD.X)
    if ! [[ "$HA_VERSION" =~ ^[0-9]{8}\.[0-9]+$ ]]; then
        log_error "Format de version invalide: $HA_VERSION"
        log_info "Format attendu: YYYYMMDD.X (ex: 20241203.0)"
        exit 1
    fi

    log_header "Mise à jour vers Home Assistant $HA_VERSION"

    # Vérifier que nous sommes dans le bon répertoire
    if [ ! -f "package.json" ]; then
        log_error "Fichier package.json introuvable. Exécutez ce script depuis la racine du projet."
        exit 1
    fi

    # Afficher la version actuelle
    local current_version=$(get_current_ha_dependency_version)
    log_info "Version actuelle de home-assistant-js-websocket: $current_version"

    # Vérifier l'état git
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        log_warning "Vous avez des modifications non commitées"
        read -p "Voulez-vous continuer ? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Opération annulée"
            exit 0
        fi
    fi

    # Créer une branche pour la mise à jour
    BRANCH_NAME="update/ha-${HA_VERSION}"
    log_info "Création de la branche: $BRANCH_NAME"

    # Vérifier si la branche existe déjà
    if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
        log_warning "La branche $BRANCH_NAME existe déjà, réutilisation de la branche"
        git checkout "$BRANCH_NAME"
    else
        git checkout -b "$BRANCH_NAME"
    fi

    log_success "Branche activée: $BRANCH_NAME"

    # Étape 1: Récupérer le package.json de Home Assistant frontend pour la version spécifiée
    log_header "Étape 1/6: Récupération du package.json HA"

    # Essayer de récupérer le package.json pour la version spécifiée
    HA_PACKAGE_URL="https://raw.githubusercontent.com/home-assistant/frontend/${HA_VERSION}/package.json"
    log_info "URL: $HA_PACKAGE_URL"

    # Créer un fichier temporaire avec extension .json
    TMP_HA_PACKAGE=$(mktemp --suffix=.json)

    if curl -f -s -o "$TMP_HA_PACKAGE" "$HA_PACKAGE_URL"; then
        log_success "Package.json HA récupéré avec succès"

        # Afficher quelques informations sur le package
        HA_PKG_VERSION=$(node -e "const pkg = require('$TMP_HA_PACKAGE'); console.log(pkg.version || 'unknown');")
        log_info "Version du package HA frontend: $HA_PKG_VERSION"
    else
        log_error "Impossible de récupérer le package.json pour la version $HA_VERSION"
        log_info "Vérifiez que la version existe: https://github.com/home-assistant/frontend/releases"
        rm -f "$TMP_HA_PACKAGE"
        exit 1
    fi

    # Étape 2: Synchroniser les dépendances
    log_header "Étape 2/6: Synchronisation des dépendances"

    # Sauvegarder le package.json actuel
    cp package.json package.json.backup

    log_info "Analyse des dépendances à mettre à jour..."

    # Utiliser Node.js pour synchroniser les dépendances
    node << 'EOF' "$TMP_HA_PACKAGE"
const fs = require('fs');
const path = require('path');

const haPackagePath = process.argv[1];
const localPackagePath = path.join(process.cwd(), 'package.json');

const haPackage = JSON.parse(fs.readFileSync(haPackagePath, 'utf8'));
const localPackage = JSON.parse(fs.readFileSync(localPackagePath, 'utf8'));

// Packages à ignorer (spécifiques au projet)
const IGNORE_PACKAGES = new Set([
    'version-bump-prompt',
    'ignore-loader',
    '@rspack/cli',
    '@rspack/core',
    '@rspack/dev-server',
    'concurrently',
    'rimraf'
]);

// Packages à synchroniser depuis HA
const SYNC_PACKAGES = [
    'home-assistant-js-websocket',
    'superstruct',
    'core-js',
    'typescript',
    '@babel/core',
    '@babel/runtime',
    '@babel/preset-env',
    '@babel/plugin-transform-runtime',
    '@babel/plugin-transform-class-properties',
    '@babel/plugin-transform-private-methods',
    'babel-loader',
    'ts-loader',
    'eslint',
    'eslint-config-prettier',
    'eslint-plugin-import',
    'eslint-plugin-lit',
    'eslint-plugin-wc',
    '@typescript-eslint/eslint-plugin',
    '@typescript-eslint/parser'
];

let updateCount = 0;
const updates = [];

// Combiner toutes les dépendances HA
const allHADeps = {
    ...haPackage.dependencies || {},
    ...haPackage.devDependencies || {}
};

// Mettre à jour les dépendances
for (const pkgName of SYNC_PACKAGES) {
    if (IGNORE_PACKAGES.has(pkgName)) continue;

    const haVersion = allHADeps[pkgName];
    if (!haVersion) continue;

    let updated = false;

    // Vérifier dans dependencies
    if (localPackage.dependencies && localPackage.dependencies[pkgName]) {
        const oldVersion = localPackage.dependencies[pkgName];
        if (oldVersion !== haVersion) {
            localPackage.dependencies[pkgName] = haVersion;
            updates.push({ name: pkgName, old: oldVersion, new: haVersion, type: 'dependencies' });
            updateCount++;
            updated = true;
        }
    }

    // Vérifier dans devDependencies
    if (localPackage.devDependencies && localPackage.devDependencies[pkgName]) {
        const oldVersion = localPackage.devDependencies[pkgName];
        if (oldVersion !== haVersion) {
            localPackage.devDependencies[pkgName] = haVersion;
            updates.push({ name: pkgName, old: oldVersion, new: haVersion, type: 'devDependencies' });
            updateCount++;
            updated = true;
        }
    }
}

// Sauvegarder le package.json mis à jour
fs.writeFileSync(localPackagePath, JSON.stringify(localPackage, null, 2) + '\n');

// Afficher les mises à jour
console.log(`\n📦 ${updateCount} package(s) mis à jour:\n`);
updates.forEach(update => {
    console.log(`   ${update.name}`);
    console.log(`   ${update.old} → ${update.new} [${update.type}]\n`);
});

process.exit(0);
EOF

    if [ $? -eq 0 ]; then
        log_success "Dépendances synchronisées"
    else
        log_error "Erreur lors de la synchronisation des dépendances"
        mv package.json.backup package.json
        rm -f "$TMP_HA_PACKAGE"
        exit 1
    fi

    # Nettoyer le fichier temporaire
    rm -f "$TMP_HA_PACKAGE"

    # Étape 3: Installer les dépendances
    log_header "Étape 3/6: Installation des dépendances"

    log_info "Exécution de npm install..."
    if npm install --legacy-peer-deps; then
        log_success "Dépendances installées"
    else
        log_error "Erreur lors de l'installation des dépendances"
        log_warning "Vous pouvez restaurer l'ancien package.json avec: mv package.json.backup package.json"
        exit 1
    fi

    # Supprimer le backup si tout s'est bien passé
    rm -f package.json.backup

    # Étape 4: Mise à jour de requirements.txt
    log_header "Étape 4/6: Mise à jour de requirements.txt"

    if [ -f "requirements.txt" ]; then
        log_info "Conversion de la version frontend vers version Core..."

        # Convertir YYYYMMDD.X vers YYYY.M.P pour Home Assistant Core
        local core_version=$(format_version_display "$HA_VERSION")

        log_info "Version Core correspondante: $core_version"

        # Sauvegarder requirements.txt
        cp requirements.txt requirements.txt.backup

        # Mettre à jour la ligne homeassistant==X.Y.Z
        if grep -q "^homeassistant==" requirements.txt; then
            local old_core_version=$(grep "^homeassistant==" requirements.txt | cut -d'=' -f3)
            sed -i "s/^homeassistant==.*/homeassistant==${core_version}/" requirements.txt
            log_success "requirements.txt mis à jour: ${old_core_version} → ${core_version}"
        else
            log_warning "Aucune ligne 'homeassistant==' trouvée dans requirements.txt"
        fi
    else
        log_warning "Fichier requirements.txt introuvable, étape ignorée"
    fi

    # Étape 5: Réinstallation des dépendances Python
    log_header "Étape 5/6: Réinstallation des dépendances Python"

    if [ -f "requirements.txt" ] && [ -f "scripts/setup" ]; then
        log_info "Voulez-vous réinstaller les dépendances Python maintenant ?"
        read -p "$(echo -e "${BOLD}Réinstaller avec ./scripts/setup ? (y/N):${NC} ")" reinstall

        if [[ "$reinstall" =~ ^[Yy]$ ]]; then
            log_info "Exécution de ./scripts/setup..."
            if ./scripts/setup; then
                log_success "Dépendances Python réinstallées"
            else
                log_warning "Erreur lors de la réinstallation. Vous pouvez exécuter manuellement: ./scripts/setup"
            fi
        else
            log_info "Vous pourrez réinstaller plus tard avec: ${CYAN}./scripts/setup${NC}"
        fi
    else
        log_warning "Script d'installation introuvable, étape ignorée"
    fi

    # Supprimer le backup de requirements.txt si tout s'est bien passé
    rm -f requirements.txt.backup

    # Étape 6: Vérification et tests
    log_header "Étape 6/6: Vérification"

    log_info "Vérification du type checking..."
    if npm run type-check; then
        log_success "Type checking réussi"
    else
        log_warning "Le type checking a échoué. Vous devrez peut-être ajuster le code."
    fi

    log_info "Vérification du build..."
    if npm run build; then
        log_success "Build réussi"
    else
        log_warning "Le build a échoué. Vous devrez peut-être ajuster le code."
    fi

    # Résumé
    log_header "Résumé de la mise à jour"

    log_success "Version HA frontend cible: $HA_VERSION"
    log_success "Version HA core cible: $(format_version_display "$HA_VERSION")"
    log_success "Branche: $BRANCH_NAME"
    log_info "Fichiers modifiés:"
    log_info "  - package.json"
    log_info "  - package-lock.json"
    if [ -f "requirements.txt" ]; then
        log_info "  - requirements.txt"
    fi

    echo ""
    log_info "Prochaines étapes:"
    echo "  1. Vérifiez les changements: ${CYAN}git diff${NC}"
    echo "  2. Testez l'application: ${CYAN}npm run build${NC}"
    if [ -f "requirements.txt" ]; then
        echo "  3. Committez les changements: ${CYAN}git add package.json package-lock.json requirements.txt && git commit -m 'chore: update to Home Assistant $HA_VERSION'${NC}"
    else
        echo "  3. Committez les changements: ${CYAN}git add package.json package-lock.json && git commit -m 'chore: update to Home Assistant $HA_VERSION'${NC}"
    fi
    echo "  4. Poussez la branche: ${CYAN}git push -u origin $BRANCH_NAME${NC}"
    echo "  5. Créez une pull request"
    echo ""

    log_success "Mise à jour terminée avec succès! 🎉"
}

# Point d'entrée principal
main() {
    # Si une version est fournie en argument, l'utiliser directement
    if [ -n "$1" ]; then
        update_to_version "$1"
    else
        # Sinon, afficher le menu de sélection
        log_header "Mise à jour de Home Assistant - Sélection de version"

        # Détecter la version actuelle
        local current_ws_version=$(get_current_ha_dependency_version)
        local current_frontend_version=""

        if [ "$current_ws_version" != "unknown" ]; then
            current_frontend_version=$(find_current_frontend_version "$current_ws_version")
            if [ -n "$current_frontend_version" ]; then
                local current_display=$(format_version_display "$current_frontend_version")
                log_success "Version actuelle détectée: $current_display ($current_frontend_version)"
                echo ""
            fi
        fi

        # Récupérer les dernières versions (supérieures à la version actuelle)
        versions=$(fetch_latest_versions 15 "$current_frontend_version")

        if [ $? -ne 0 ] || [ -z "$versions" ]; then
            log_error "Impossible de récupérer les versions disponibles"
            log_info "Vous pouvez spécifier une version manuellement:"
            log_info "  $0 <version>"
            log_info "Exemple: $0 20241203.0"
            exit 1
        fi

        log_success "$(echo "$versions" | wc -l) version(s) plus récente(s) disponible(s)"
        echo ""

        # Sélectionner une version
        selected_version=$(select_version "$versions" "$current_ws_version")

        if [ -z "$selected_version" ]; then
            log_error "Aucune version sélectionnée"
            exit 1
        fi

        echo ""
        local display_version=$(format_version_display "$selected_version")
        log_success "Version sélectionnée: $display_version ($selected_version)"
        echo ""

        # Demander confirmation
        read -p "$(echo -e "${BOLD}Confirmer la mise à jour vers $display_version ? (Y/n):${NC} ")" confirm
        if [[ "$confirm" =~ ^[Nn]$ ]]; then
            log_info "Opération annulée"
            exit 0
        fi

        # Procéder à la mise à jour
        update_to_version "$selected_version"
    fi
}

# Exécuter le script
main "$@"
