#!/bin/bash

# Script pour mettre à jour la version de Home Assistant et synchroniser les dépendances
# Usage: ./scripts/update-ha-version.sh [version]
# Exemple: ./scripts/update-ha-version.sh 2026.4.0
# Sans argument: affiche les dernières versions disponibles (depuis HA Core)

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

# Fonction pour comparer deux versions Core YYYY.M.P (retourne 0 si v1 > v2, 1 sinon)
version_greater_than() {
    local v1="$1"
    local v2="$2"

    # Découper en composantes (année, mois, patch)
    local v1_year v1_month v1_patch
    IFS='.' read -r v1_year v1_month v1_patch <<< "$v1"
    local v2_year v2_month v2_patch
    IFS='.' read -r v2_year v2_month v2_patch <<< "$v2"

    v1_patch="${v1_patch:-0}"
    v2_patch="${v2_patch:-0}"

    if [ "$v1_year" -gt "$v2_year" ]; then return 0
    elif [ "$v1_year" -eq "$v2_year" ] && [ "$v1_month" -gt "$v2_month" ]; then return 0
    elif [ "$v1_year" -eq "$v2_year" ] && [ "$v1_month" -eq "$v2_month" ] && [ "$v1_patch" -gt "$v2_patch" ]; then return 0
    fi

    return 1
}

# Fonction pour récupérer la version frontend bundlée dans une version Core donnée
# En lisant homeassistant/package_constraints.txt du repo core
fetch_frontend_version_for_core() {
    local core_version="$1"

    local constraints_url="https://raw.githubusercontent.com/home-assistant/core/${core_version}/homeassistant/package_constraints.txt"
    local frontend_version=$(curl -sf "$constraints_url" | grep '^home-assistant-frontend==' | cut -d'=' -f3)

    echo "$frontend_version"
}

# Fonction pour récupérer les dernières versions Core depuis GitHub
fetch_latest_versions() {
    local count=${1:-10}
    local current_version="${2:-}"

    log_header "Récupération des dernières versions Home Assistant Core" >&2
    log_info "Interrogation de l'API GitHub (home-assistant/core)..." >&2

    # Récupérer les releases Core stables (exclure les betas/rc)
    local response=$(curl -s "https://api.github.com/repos/home-assistant/core/releases?per_page=50")

    if [ $? -ne 0 ]; then
        log_error "Impossible de récupérer les versions depuis GitHub" >&2
        return 1
    fi

    # Extraire les tags stables au format YYYY.M.P (sans b/rc/dev)
    local all_versions=$(echo "$response" | grep -o '"tag_name": *"[^"]*"' | \
                         grep -o '"[0-9]\{4\}\.[0-9]\+\.[0-9]\+"' | \
                         tr -d '"' | \
                         sort -t. -k1,1rn -k2,2rn -k3,3rn)

    # Filtrer les versions supérieures à la version actuelle
    if [ -n "$current_version" ]; then
        local filtered_versions=""
        while IFS= read -r version; do
            if version_greater_than "$version" "$current_version"; then
                filtered_versions="${filtered_versions}${version}\n"
            fi
        done <<< "$all_versions"
        all_versions=$(echo -e "$filtered_versions" | grep -v '^$' | head -n "$count")
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
    local current_version="${2:-unknown}"

    local version_array=()
    while IFS= read -r version; do
        [ -n "$version" ] && version_array+=("$version")
    done <<< "$versions"

    log_header "Sélection de la version" >&2
    echo "" >&2
    if [ "$current_version" != "unknown" ]; then
        log "Version actuelle: ${YELLOW}${current_version}${NC}" "" >&2
        echo "" >&2
    fi
    log "Versions Core disponibles:" "$BOLD" >&2
    echo "" >&2
    for i in "${!version_array[@]}"; do
        local num=$((i + 1))
        local version="${version_array[$i]}"
        printf "  ${BOLD}${MAGENTA}%2d)${NC} ${BOLD}${GREEN}%s${NC}\n" "$num" "$version" >&2
    done

    echo "" >&2
    log "  ${BOLD}${MAGENTA} q)${NC} Quitter" "$NC" >&2
    echo "" >&2

    while true; do
        read -p "$(echo -e "${BOLD}Choisissez une version (1-${#version_array[@]}) ou 'q' pour quitter:${NC} ")" choice

        if [[ "$choice" == "q" ]] || [[ "$choice" == "Q" ]]; then
            log_info "Opération annulée" >&2
            exit 0
        fi

        if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "${#version_array[@]}" ]; then
            echo "${version_array[$((choice - 1))]}"
            return 0
        else
            log_error "Choix invalide. Entrez un nombre entre 1 et ${#version_array[@]} ou 'q' pour quitter." >&2
        fi
    done
}

# Fonction pour obtenir la version Core actuelle depuis requirements.txt
get_current_core_version() {
    if [ -f "requirements.txt" ]; then
        grep "^homeassistant==" requirements.txt | cut -d'=' -f3
    else
        echo "unknown"
    fi
}

# Fonction principale de mise à jour
update_to_version() {
    local CORE_VERSION="$1"

    # Validation du format YYYY.M.P
    if ! [[ "$CORE_VERSION" =~ ^[0-9]{4}\.[0-9]+\.[0-9]+$ ]]; then
        log_error "Format de version invalide: $CORE_VERSION"
        log_info "Format attendu: YYYY.M.P (ex: 2026.4.0)"
        exit 1
    fi

    log_header "Mise à jour vers Home Assistant Core $CORE_VERSION"

    if [ ! -f "package.json" ]; then
        log_error "Fichier package.json introuvable. Exécutez ce script depuis la racine du projet."
        exit 1
    fi

    local current_version=$(get_current_core_version)
    log_info "Version Core actuelle: ${current_version:-inconnue}"

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
    BRANCH_NAME="update/ha-${CORE_VERSION}"
    log_info "Création de la branche: $BRANCH_NAME"

    if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
        log_warning "La branche $BRANCH_NAME existe déjà, réutilisation de la branche"
        git checkout "$BRANCH_NAME"
    else
        git checkout -b "$BRANCH_NAME"
    fi

    log_success "Branche activée: $BRANCH_NAME"

    # Étape 1: Trouver la version frontend bundlée dans ce Core
    log_header "Étape 1/6: Résolution du tag frontend bundlé"

    log_info "Lecture de homeassistant/package_constraints.txt pour Core $CORE_VERSION..."
    FRONTEND_VERSION=$(fetch_frontend_version_for_core "$CORE_VERSION")

    if [ -z "$FRONTEND_VERSION" ]; then
        log_error "Impossible de trouver la version frontend pour Core $CORE_VERSION"
        log_info "Vérifiez que la version existe: https://github.com/home-assistant/core/releases/tag/$CORE_VERSION"
        exit 1
    fi

    log_success "Frontend bundlé: home-assistant-frontend==${FRONTEND_VERSION}"

    # Étape 2: Récupérer le package.json du frontend à ce tag
    log_header "Étape 2/6: Récupération du package.json HA Frontend"

    HA_PACKAGE_URL="https://raw.githubusercontent.com/home-assistant/frontend/${FRONTEND_VERSION}/package.json"
    log_info "URL: $HA_PACKAGE_URL"

    TMP_HA_PACKAGE=$(mktemp --suffix=.json)

    if curl -f -s -o "$TMP_HA_PACKAGE" "$HA_PACKAGE_URL"; then
        log_success "Package.json HA Frontend récupéré avec succès"
        HA_PKG_VERSION=$(node -e "const pkg = require('$TMP_HA_PACKAGE'); console.log(pkg.version || 'unknown');")
        log_info "Version du package HA Frontend: $HA_PKG_VERSION"
    else
        log_error "Impossible de récupérer le package.json pour le tag frontend $FRONTEND_VERSION"
        rm -f "$TMP_HA_PACKAGE"
        exit 1
    fi

    # Étape 3: Synchroniser les dépendances npm
    log_header "Étape 3/6: Synchronisation des dépendances npm"

    cp package.json package.json.backup

    log_info "Analyse des dépendances à mettre à jour..."

    node << 'EOF' "$TMP_HA_PACKAGE"
const fs = require('fs');
const path = require('path');

const haPackagePath = process.argv[1];
const localPackagePath = path.join(process.cwd(), 'package.json');

const haPackage = JSON.parse(fs.readFileSync(haPackagePath, 'utf8'));
const localPackage = JSON.parse(fs.readFileSync(localPackagePath, 'utf8'));

const IGNORE_PACKAGES = new Set([
    'version-bump-prompt',
    'ignore-loader',
    '@rspack/cli',
    '@rspack/core',
    '@rspack/dev-server',
    'concurrently',
    'rimraf'
]);

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

const allHADeps = {
    ...haPackage.dependencies || {},
    ...haPackage.devDependencies || {}
};

for (const pkgName of SYNC_PACKAGES) {
    if (IGNORE_PACKAGES.has(pkgName)) continue;

    const haVersion = allHADeps[pkgName];
    if (!haVersion) continue;

    if (localPackage.dependencies && localPackage.dependencies[pkgName]) {
        const oldVersion = localPackage.dependencies[pkgName];
        if (oldVersion !== haVersion) {
            localPackage.dependencies[pkgName] = haVersion;
            updates.push({ name: pkgName, old: oldVersion, new: haVersion, type: 'dependencies' });
            updateCount++;
        }
    }

    if (localPackage.devDependencies && localPackage.devDependencies[pkgName]) {
        const oldVersion = localPackage.devDependencies[pkgName];
        if (oldVersion !== haVersion) {
            localPackage.devDependencies[pkgName] = haVersion;
            updates.push({ name: pkgName, old: oldVersion, new: haVersion, type: 'devDependencies' });
            updateCount++;
        }
    }
}

fs.writeFileSync(localPackagePath, JSON.stringify(localPackage, null, 2) + '\n');

console.log(`\n📦 ${updateCount} package(s) mis à jour:\n`);
updates.forEach(update => {
    console.log(`   ${update.name}`);
    console.log(`   ${update.old} → ${update.new} [${update.type}]\n`);
});

process.exit(0);
EOF

    if [ $? -eq 0 ]; then
        log_success "Dépendances npm synchronisées"
    else
        log_error "Erreur lors de la synchronisation des dépendances"
        mv package.json.backup package.json
        rm -f "$TMP_HA_PACKAGE"
        exit 1
    fi

    rm -f "$TMP_HA_PACKAGE"

    # Étape 4: Installer les dépendances npm
    log_header "Étape 4/6: Installation des dépendances npm"

    log_info "Exécution de npm install..."
    if npm install --legacy-peer-deps; then
        log_success "Dépendances installées"
    else
        log_error "Erreur lors de l'installation des dépendances"
        log_warning "Vous pouvez restaurer l'ancien package.json avec: mv package.json.backup package.json"
        exit 1
    fi

    rm -f package.json.backup

    # Étape 5: Mise à jour de requirements.txt
    log_header "Étape 5/6: Mise à jour de requirements.txt"

    if [ -f "requirements.txt" ]; then
        cp requirements.txt requirements.txt.backup

        if grep -q "^homeassistant==" requirements.txt; then
            local old_core_version=$(grep "^homeassistant==" requirements.txt | cut -d'=' -f3)
            sed -i "s/^homeassistant==.*/homeassistant==${CORE_VERSION}/" requirements.txt
            log_success "requirements.txt mis à jour: ${old_core_version} → ${CORE_VERSION}"
        else
            log_warning "Aucune ligne 'homeassistant==' trouvée dans requirements.txt"
        fi

        rm -f requirements.txt.backup
    else
        log_warning "Fichier requirements.txt introuvable, étape ignorée"
    fi

    # Étape 6: Réinstallation des dépendances Python
    log_header "Étape 6/6: Réinstallation des dépendances Python"

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

    # Vérification et tests
    log_header "Vérification"

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

    log_success "Version HA Core: $CORE_VERSION"
    log_success "Frontend bundlé: $FRONTEND_VERSION"
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
        echo "  3. Committez: ${CYAN}git add package.json package-lock.json requirements.txt && git commit -m 'chore: update to Home Assistant $CORE_VERSION'${NC}"
    else
        echo "  3. Committez: ${CYAN}git add package.json package-lock.json && git commit -m 'chore: update to Home Assistant $CORE_VERSION'${NC}"
    fi
    echo "  4. Poussez la branche: ${CYAN}git push -u origin $BRANCH_NAME${NC}"
    echo "  5. Créez une pull request"
    echo ""

    log_success "Mise à jour terminée avec succès! 🎉"
}

# Point d'entrée principal
main() {
    if [ -n "$1" ]; then
        update_to_version "$1"
    else
        log_header "Mise à jour de Home Assistant - Sélection de version"

        local current_version=$(get_current_core_version)

        if [ "$current_version" != "unknown" ] && [ -n "$current_version" ]; then
            log_success "Version Core actuelle détectée: $current_version"
            echo ""
        fi

        versions=$(fetch_latest_versions 15 "$current_version")

        if [ $? -ne 0 ] || [ -z "$versions" ]; then
            log_error "Impossible de récupérer les versions disponibles"
            log_info "Vous pouvez spécifier une version manuellement:"
            log_info "  $0 <version>"
            log_info "Exemple: $0 2026.4.0"
            exit 1
        fi

        local version_count=$(echo "$versions" | grep -c .)
        log_success "${version_count} version(s) plus récente(s) disponible(s)"
        echo ""

        selected_version=$(select_version "$versions" "$current_version")

        if [ -z "$selected_version" ]; then
            log_error "Aucune version sélectionnée"
            exit 1
        fi

        echo ""
        log_success "Version sélectionnée: $selected_version"
        echo ""

        read -p "$(echo -e "${BOLD}Confirmer la mise à jour vers $selected_version ? (Y/n):${NC} ")" confirm
        if [[ "$confirm" =~ ^[Nn]$ ]]; then
            log_info "Opération annulée"
            exit 0
        fi

        update_to_version "$selected_version"
    fi
}

main "$@"
