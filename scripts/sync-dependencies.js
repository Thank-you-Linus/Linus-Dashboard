#!/usr/bin/env node

const https = require('https');
const fs = require('fs').promises;
const path = require('path');

const HA_PACKAGE_URL = 'https://raw.githubusercontent.com/home-assistant/frontend/master/package.json';
const LOCAL_PACKAGE = path.join(__dirname, '../package.json');

// Couleurs pour l'affichage console
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(message, color = '') {
    console.log(`${color}${message}${colors.reset}`);
}

// Configuration des packages à ignorer (spécifiques à votre projet)
const IGNORE_PACKAGES = new Set([
    'version-bump-prompt',
    'ignore-loader'
]);

// Catégories de packages par type
const PACKAGE_CATEGORIES = {
    build: ['webpack', 'webpack-cli', 'ts-loader', 'typescript'],
    homeassistant: ['home-assistant-js-websocket', 'superstruct'],
    utilities: ['lodash.merge', 'deepmerge'],
    development: ['ts-node'],
    types: ['@types/']
};

function categorizePackage(packageName) {
    for (const [category, packages] of Object.entries(PACKAGE_CATEGORIES)) {
        if (packages.some(p => packageName.startsWith(p) || packageName === p)) {
            return category;
        }
    }
    return 'other';
}

// Fonction pour télécharger le package.json de Home Assistant
function downloadHAPackage() {
    return new Promise((resolve, reject) => {
        log('📥 Téléchargement du package.json de Home Assistant...', colors.blue);

        https.get(HA_PACKAGE_URL, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const packageData = JSON.parse(data);
                    log('✅ Package.json de Home Assistant téléchargé avec succès', colors.green);
                    resolve(packageData);
                } catch (error) {
                    reject(new Error('Erreur lors du parsing du JSON: ' + error.message));
                }
            });
        }).on('error', (error) => {
            reject(new Error('Erreur lors du téléchargement: ' + error.message));
        });
    });
}

// Fonction pour lire le package.json local
async function readLocalPackage() {
    try {
        const data = await fs.readFile(LOCAL_PACKAGE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error('Erreur lors de la lecture du package.json local: ' + error.message);
    }
}

// Fonction pour sauvegarder le package.json local
async function saveLocalPackage(packageData) {
    try {
        await fs.writeFile(LOCAL_PACKAGE, JSON.stringify(packageData, null, 2) + '\n');
        log('💾 Package.json sauvegardé', colors.green);
    } catch (error) {
        throw new Error('Erreur lors de la sauvegarde: ' + error.message);
    }
}

// Fonction pour comparer les versions semver
function isNewerVersion(current, target) {
    const cleanVersion = (v) => v.replace(/[\^~]/, '');
    const currentParts = cleanVersion(current).split('.').map(Number);
    const targetParts = cleanVersion(target).split('.').map(Number);

    for (let i = 0; i < Math.max(currentParts.length, targetParts.length); i++) {
        const currentPart = currentParts[i] || 0;
        const targetPart = targetParts[i] || 0;

        if (targetPart > currentPart) return true;
        if (targetPart < currentPart) return false;
    }
    return false;
}

// Fonction pour demander confirmation
function askQuestion(question) {
    return new Promise((resolve) => {
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.toLowerCase().startsWith('y'));
        });
    });
}

// Fonction principale d'analyse
async function analyzeDependencies() {
    try {
        log('🔍 Analyse des dépendances Linus Dashboard vs Home Assistant', colors.bold + colors.cyan);
        log('='.repeat(70), colors.cyan);

        const [haPackage, localPackage] = await Promise.all([
            downloadHAPackage(),
            readLocalPackage()
        ]);

        // Combiner toutes les dépendances HA
        const allHADeps = {
            ...haPackage.dependencies || {},
            ...haPackage.devDependencies || {}
        };

        // Combiner toutes les dépendances locales
        const allLocalDeps = {
            ...localPackage.dependencies || {},
            ...localPackage.devDependencies || {}
        };

        // Analyse 1: Packages à mettre à jour
        const packagesToUpdate = [];
        const upToDatePackages = [];

        for (const [name, version] of Object.entries(allLocalDeps)) {
            if (IGNORE_PACKAGES.has(name)) continue;

            if (allHADeps[name]) {
                if (isNewerVersion(version, allHADeps[name])) {
                    packagesToUpdate.push({
                        name,
                        current: version,
                        target: allHADeps[name],
                        category: categorizePackage(name)
                    });
                } else {
                    upToDatePackages.push({ name, version, category: categorizePackage(name) });
                }
            }
        }

        // Analyse 2: Nouveaux packages disponibles
        const newPackagesAvailable = [];
        for (const [name, version] of Object.entries(allHADeps)) {
            if (!allLocalDeps[name] && !IGNORE_PACKAGES.has(name)) {
                const category = categorizePackage(name);
                if (['build', 'homeassistant', 'utilities', 'development'].includes(category)) {
                    newPackagesAvailable.push({ name, version, category });
                }
            }
        }

        // Analyse 3: Packages uniques à votre projet
        const uniquePackages = [];
        for (const [name, version] of Object.entries(allLocalDeps)) {
            if (!allHADeps[name] && !IGNORE_PACKAGES.has(name)) {
                uniquePackages.push({ name, version, category: categorizePackage(name) });
            }
        }

        // Affichage des résultats
        log('\n📊 RÉSULTATS DE L\'ANALYSE', colors.bold + colors.yellow);
        log('='.repeat(50), colors.yellow);

        // 1. Packages à mettre à jour
        if (packagesToUpdate.length > 0) {
            log(`\n🔄 PACKAGES À METTRE À JOUR (${packagesToUpdate.length})`, colors.bold + colors.green);
            packagesToUpdate.forEach(pkg => {
                log(`  📦 ${pkg.name} [${pkg.category}]`, colors.cyan);
                log(`     ${pkg.current} → ${pkg.target}`, colors.yellow);
            });
        } else {
            log('\n✅ Tous vos packages sont à jour !', colors.green);
        }

        // 2. Nouveaux packages recommandés
        if (newPackagesAvailable.length > 0) {
            log(`\n➕ NOUVEAUX PACKAGES RECOMMANDÉS (${newPackagesAvailable.length})`, colors.bold + colors.magenta);
            const categorized = {};
            newPackagesAvailable.forEach(pkg => {
                if (!categorized[pkg.category]) categorized[pkg.category] = [];
                categorized[pkg.category].push(pkg);
            });

            Object.entries(categorized).forEach(([category, packages]) => {
                log(`\n  🏷️  ${category.toUpperCase()}:`, colors.cyan);
                packages.forEach(pkg => {
                    log(`     📦 ${pkg.name} (${pkg.version})`, colors.yellow);
                });
            });
        }

        // 3. Packages uniques à votre projet
        if (uniquePackages.length > 0) {
            log(`\n🎯 VOS PACKAGES SPÉCIFIQUES (${uniquePackages.length})`, colors.bold + colors.blue);
            log('   (Non présents dans Home Assistant - Vérifiez s\'ils sont encore nécessaires)', colors.blue);
            uniquePackages.forEach(pkg => {
                log(`  📦 ${pkg.name} [${pkg.category}] (${pkg.version})`, colors.cyan);
            });
        }

        // 4. Packages à jour
        if (upToDatePackages.length > 0) {
            log(`\n✅ PACKAGES À JOUR (${upToDatePackages.length})`, colors.green);
            upToDatePackages.forEach(pkg => {
                log(`  📦 ${pkg.name} [${pkg.category}] (${pkg.version})`, colors.green);
            });
        }

        // Proposer les mises à jour
        if (packagesToUpdate.length > 0) {
            log('\n' + '='.repeat(50), colors.yellow);
            const shouldUpdate = await askQuestion(`\n❓ Voulez-vous mettre à jour les ${packagesToUpdate.length} packages ? (y/N): `);

            if (shouldUpdate) {
                let hasChanges = false;

                for (const pkg of packagesToUpdate) {
                    // Trouver dans quelle section mettre à jour
                    if (localPackage.dependencies && localPackage.dependencies[pkg.name]) {
                        localPackage.dependencies[pkg.name] = pkg.target;
                        hasChanges = true;
                    } else if (localPackage.devDependencies && localPackage.devDependencies[pkg.name]) {
                        localPackage.devDependencies[pkg.name] = pkg.target;
                        hasChanges = true;
                    }
                }

                if (hasChanges) {
                    await saveLocalPackage(localPackage);
                    log('\n✅ Packages mis à jour avec succès !', colors.green);
                    log('\n📝 N\'oubliez pas d\'exécuter:', colors.yellow);
                    log('   npm install', colors.cyan);
                    log('\n🔍 Pour voir les changements:', colors.yellow);
                    log('   git diff package.json', colors.cyan);
                }
            }
        }

        log('\n🎉 Analyse terminée !', colors.bold + colors.green);

    } catch (error) {
        log(`❌ Erreur: ${error.message}`, colors.red);
        process.exit(1);
    }
}

// Exécuter le script
analyzeDependencies();
