# 📚 Linus Dashboard Documentation Map

**New to the project?** Start here to navigate our documentation efficiently.

**Total documentation:** 40+ markdown files | 100,000+ lines | English + Français

---

## 🚀 Quick Start Paths

### I want to use Linus Dashboard (5 minutes)

→ **[Quick Start Guide](QUICK_START.md)** - 5 minutes from install to running dashboard

### I want to contribute code (1-2 hours)

1. [CONTRIBUTING.md](../CONTRIBUTING.md) - Setup & contribution process (30 min)
2. [Dev Container Setup](../README.md#development-setup) - Auto-configured environment (15 min)
3. [AI-Driven Workflow](.aidriven/README.md) - 2-phase development workflow (20 min)
4. [Project Glossary](.aidriven/GLOSSARY.md) - Standardized vocabulary (15 min)
5. Pick a [good first issue](https://github.com/Thank-you-Linus/Linus-Dashboard/labels/good%20first%20issue)

### I want to understand the architecture (30-60 min)

1. **[Architecture Overview](development/ARCHITECTURE_OVERVIEW.md)** ⭐ START HERE
   - High-level architecture with Mermaid diagrams
   - Technology stack (Rspack, Lit, TypeScript, Python)
   - Data flow and component hierarchy
2. [Memory Bank](.aidriven/memorybank.md) - Complete architecture & decisions
3. [Chip System Architecture](development/CHIP_SYSTEM_ARCHITECTURE.md) - Core UI system (795 lines)

### I want to release a new version (5-30 min)

1. **[Release Guide](RELEASE_GUIDE.md)** ⭐ START HERE - Beta and Stable Release buttons, CHANGELOG, rollback, stable announcement
2. [Local CI Testing](LOCAL_CI_TESTING.md) - Run the buttons' checks locally (10 min)

---

## 📖 Documentation by Category

### 🏗️ Architecture & Design

| Document                                                            | Description                                          | Lines | Priority      |
| ------------------------------------------------------------------- | ---------------------------------------------------- | ----- | ------------- |
| **[Architecture Overview](development/ARCHITECTURE_OVERVIEW.md)**   | High-level architecture with diagrams (NEW)          | 400   | 🔥 START HERE |
| [Memory Bank](.aidriven/memorybank.md)                              | Complete project architecture, tech stack, decisions | 1500+ | ⭐ Essential  |
| [Chip System Architecture](development/CHIP_SYSTEM_ARCHITECTURE.md) | Detailed chip system documentation                   | 795   | ⭐ Essential  |
| [Dashboard Enhancements](DASHBOARD_ENHANCEMENTS.md)                 | Feature architecture details                         | 706   | 📖 Reference  |

### 🛠️ Development Workflow

| Document                                    | Description                                        | Lines | Priority      |
| ------------------------------------------- | -------------------------------------------------- | ----- | ------------- |
| [CONTRIBUTING.md](../CONTRIBUTING.md)       | Setup, contribution process, project structure     | 306   | 🔥 START HERE |
| [AI-Driven Workflow](.aidriven/README.md)   | 2-phase development (Opus plan → Sonnet implement) | 832   | ⭐ Essential  |
| [Testing Guide](.aidriven/TESTING_GUIDE.md) | Testing workflow and checklist                     | 423   | ⭐ Essential  |
| [Agents Reference](.aidriven/AGENTS.md)     | Quick AI agent commands                            | 50    | 📖 Reference  |

### 📏 Coding Standards

| Document                                                                   | Description                         | Lines  | Type         |
| -------------------------------------------------------------------------- | ----------------------------------- | ------ | ------------ |
| [Clean Code Rules](.aidriven/rules/clean_code.md)                          | TypeScript & Python standards       | 12,459 | MANDATORY    |
| [Home Assistant Integration](.aidriven/rules/homeassistant_integration.md) | HA-specific patterns                | 12,916 | MANDATORY    |
| [Async Patterns](.aidriven/rules/async_patterns.md)                        | Async/await best practices          | 10,630 | MANDATORY    |
| [Entity Naming](.aidriven/rules/entity_naming.md)                          | Naming conventions                  | 7,946  | MANDATORY    |
| [Translations](.aidriven/rules/translations.md)                            | i18n rules (EN/FR)                  | 6,601  | MANDATORY    |
| [Testing Documentation](.aidriven/rules/testing_documentation.md)          | Testing standards                   | 7,408  | MANDATORY    |
| [Linting Before Commit](.aidriven/rules/linting_before_commit.md)          | Pre-commit linting rules            | 9,089  | 🚨 CRITICAL  |
| [Release Notes Format](.aidriven/rules/release_notes.md)                   | Release notes standards             | 7,024  | MANDATORY    |
| **[Project Glossary](.aidriven/GLOSSARY.md)**                              | Standardized vocabulary (657 lines) | 657    | ⭐ Essential |

**Total rules:** 67,000+ lines of coding standards

**Critical:** `npm run lint` MUST pass with 0 errors before every commit

### 🚀 Release Management

| Document                                                    | Description                     | Lines  | Priority      |
| ----------------------------------------------------------- | ------------------------------- | ------ | ------------- |
| **[Release Guide](RELEASE_GUIDE.md)**                       | The single release reference    | 217    | 🔥 START HERE |
| [Local CI Testing](LOCAL_CI_TESTING.md)                     | Test CI locally before push     | 584    | 📖 Reference  |
| [Release Notes Format](.aidriven/rules/release_notes.md)    | Release notes standards         | 7,024  | MANDATORY     |

**Typical workflow:** Merge to `main` → Beta Release button → Test → Stable Release button

### 🌟 Features Documentation

| Document                                                              | Description                                  | Audience   | Priority       |
| --------------------------------------------------------------------- | -------------------------------------------- | ---------- | -------------- |
| **[Quick Start Guide](QUICK_START.md)**                               | 5-minute setup guide (NEW)                   | Users      | 🔥 NEW USERS   |
| **[Activity Detection](ACTIVITY_DETECTION.md)**                       | Automatic sensor detection & troubleshooting | Users      | ⭐ Core Feature |
| [Embedded Dashboards](EMBEDDED_DASHBOARDS.md)                         | Integrate custom Lovelace dashboards         | Users      | ⭐ Popular     |
| [Manual Ordering](MANUAL_ORDERING.md)                                 | HA 2025.1+ room ordering                     | Users      | 📖 HA 2025.1+  |
| [Area Specific Entities](AREA_SPECIFIC_ENTITIES.md)                   | Temperature/humidity per area                | Users/Devs | 📖 Advanced    |

### 🤖 AI & Automation

| Document                                          | Description                  | Lines | Usage         |
| ------------------------------------------------- | ---------------------------- | ----- | ------------- |
| [AI Agents Reference](.aidriven/AGENTS.md)        | Quick agent commands         | 50    | 📖 Quick Ref  |
| [Project Glossary](.aidriven/GLOSSARY.md)         | Standardized vocabulary      | 657   | ⭐ Essential  |
| [Memory Bank](.aidriven/memorybank.md)            | AI memory system for project | 1500+ | ⭐ AI Context |
| [OpenCode Commands](.opencode/README.md)          | Custom CLI commands          | 266   | 📖 Automation |

### 📝 User Documentation

| Document                                | Description                | Languages | Priority           |
| --------------------------------------- | -------------------------- | --------- | ------------------ |
| [README.md](../README.md)               | Main project documentation | EN        | 🔥 START HERE      |
| [README-fr.md](../README-fr.md)         | French version             | FR        | 🔥 START HERE (FR) |
| **[Quick Start Guide](QUICK_START.md)** | 5-minute setup (NEW)       | EN + FR   | ⭐ New Users       |
| [RELEASE_NOTES.md](../RELEASE_NOTES.md) | Current release notes      | EN + FR   | 📖 Latest          |

---

## 🎯 Common Tasks Quick Reference

| Task                        | Documentation                                                 | Estimated Time |
| --------------------------- | ------------------------------------------------------------- | -------------- |
| **Setup dev environment**   | [CONTRIBUTING.md](../CONTRIBUTING.md)                         | 15 min         |
| **Understand architecture** | [Architecture Overview](development/ARCHITECTURE_OVERVIEW.md) | 30 min         |
| **Add new feature**         | [AI-Driven Workflow](.aidriven/README.md)                     | Variable       |
| **Fix a bug**               | [Debug Workflow](.aidriven/prompts/debug.md)                  | Variable       |
| **Run tests locally**       | [Testing Guide](.aidriven/TESTING_GUIDE.md)                   | 10 min         |
| **Release beta**            | [Release Guide](RELEASE_GUIDE.md)                             | 5 min          |
| **Release stable**          | [Release Guide](RELEASE_GUIDE.md)                             | 10 min         |
| **Review code**             | [Code Review](.aidriven/prompts/review.md)                    | 10 min         |
| **Write release notes**     | [Release Notes Format](.aidriven/rules/release_notes.md)      | 20 min         |
| **Lint before commit**      | [Linting Rules](.aidriven/rules/linting_before_commit.md)     | 2 min          |

---

## 🗂️ Documentation Structure

```
linus-dashboard/
├── README.md                           # Main user documentation (EN)
├── README-fr.md                        # Main user documentation (FR)
├── CONTRIBUTING.md                     # Contribution guide (EN + FR)
├── RELEASE_NOTES.md                    # Current release notes (EN + FR)
│
├── docs/                               # Feature & release documentation
│   ├── QUICK_START.md                  # 5-minute setup guide (NEW)
│   ├── EMBEDDED_DASHBOARDS.md          # Custom dashboards integration
│   ├── MANUAL_ORDERING.md              # HA 2025.1+ room ordering
│   ├── AREA_SPECIFIC_ENTITIES.md       # Temperature/humidity per area
│   ├── DASHBOARD_ENHANCEMENTS.md       # Feature architecture
│   ├── DOCUMENTATION_MAP.md            # This file (NEW)
│   │
│   ├── development/                    # Developer documentation
│   │   ├── ARCHITECTURE_OVERVIEW.md    # High-level architecture (NEW)
│   │   └── CHIP_SYSTEM_ARCHITECTURE.md # Chip system details
│   │
│   ├── RELEASE_GUIDE.md                # Release reference (buttons)
│   ├── LOCAL_CI_TESTING.md             # Local CI testing
│   ├── UPDATE_HOME_ASSISTANT.md        # HA update guide
│   └── (other feature docs...)
│
├── .aidriven/                          # AI development system
│   ├── README.md                       # AI-driven workflow overview
│   ├── memorybank.md                   # Project architecture & decisions
│   ├── GLOSSARY.md                     # Standardized vocabulary
│   ├── TESTING_GUIDE.md                # Testing methodology
│   ├── AGENTS.md                       # AI agent quick reference
│   │
│   ├── rules/                          # Coding standards (67K+ lines)
│   │   ├── clean_code.md               # TypeScript & Python standards
│   │   ├── homeassistant_integration.md # HA patterns
│   │   ├── async_patterns.md           # Async/await practices
│   │   ├── entity_naming.md            # Naming conventions
│   │   ├── translations.md             # i18n rules
│   │   ├── testing_documentation.md    # Testing standards
│   │   ├── linting_before_commit.md    # Pre-commit linting (CRITICAL)
│   │   └── release_notes.md            # Release notes format
│   │
│   ├── prompts/                        # AI workflow templates
│   │   ├── elaborate_plan.md           # Planning phase
│   │   ├── implement.md                # Implementation phase
│   │   ├── debug.md                    # Debugging workflow
│   │   └── review.md                   # Code review checklist
│   │
│   └── templates/                      # Output templates
│       ├── plan_template.md            # Plan structure
│       └── implementation_template.md  # Implementation log
│
└── .opencode/                          # CLI automation
    ├── README.md                       # Custom commands overview
    └── command/*.md                    # Individual command docs
```

---

## 🔍 Finding Specific Information

### By Keyword

Use GitHub search or grep to find specific topics:

```bash
# Search all markdown files
grep -r "keyword" docs/

# Search specific directories
grep -r "chip" .aidriven/
grep -r "release" docs/

# Case-insensitive search
grep -ri "typescript" .
```

### By Topic

| Topic          | Primary Document                                                    | Supporting Docs                                                                             |
| -------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Chips**      | [Chip System Architecture](development/CHIP_SYSTEM_ARCHITECTURE.md) | [Memory Bank](.aidriven/memorybank.md), [Dashboard Enhancements](DASHBOARD_ENHANCEMENTS.md) |
| **Views**      | [Architecture Overview](development/ARCHITECTURE_OVERVIEW.md)       | [Memory Bank](.aidriven/memorybank.md)                                                      |
| **Release**    | [Release Guide](RELEASE_GUIDE.md)                                   | [Local CI Testing](LOCAL_CI_TESTING.md), [Discord Webhooks](DISCORD_WEBHOOKS_SETUP.md)      |
| **Testing**    | [Testing Guide](.aidriven/TESTING_GUIDE.md)                         | [Testing Documentation](.aidriven/rules/testing_documentation.md)                           |
| **TypeScript** | [Clean Code](.aidriven/rules/clean_code.md)                         | [Architecture Overview](development/ARCHITECTURE_OVERVIEW.md)                               |
| **Python**     | [Clean Code](.aidriven/rules/clean_code.md)                         | [HA Integration](.aidriven/rules/homeassistant_integration.md)                              |
| **Rspack**     | [Memory Bank](.aidriven/memorybank.md)                              | [Architecture Overview](development/ARCHITECTURE_OVERVIEW.md)                               |
| **i18n**       | [Translations](.aidriven/rules/translations.md)                     | [GLOSSARY](.aidriven/GLOSSARY.md)                                                           |

---

## 📊 Documentation Health

**Statistics:**

- **Total files:** 40+ markdown files
- **Total lines:** 100,000+ lines of documentation
- **Languages:** English (primary), Français (complete translation)
- **Coverage:** Architecture, features, development, testing, release, automation
- **Maintenance:** Active (updated with every release)

**Quality standards:**

- ✅ Bilingual (EN/FR) for user-facing docs
- ✅ Code examples included where relevant
- ✅ Links between related documents
- ✅ Version-specific information tracked
- ✅ Last updated dates maintained

**Last major update:** 2025-12-31 (v1.4.0-beta.6)

- ✅ Added Architecture Overview with Mermaid diagrams
- ✅ Added Documentation Map (this file)
- ✅ Added Release Workflow consolidation
- ✅ Added Quick Start Guide for users
- ✅ Improved README.md with "Why Linus Dashboard?" section
- ✅ Enhanced FAQ and troubleshooting

---

## 📝 Contributing to Documentation

Found outdated docs? Want to improve clarity?

**Documentation is code!** Follow the same contribution process:

1. **Check if it's documented** in [Memory Bank](.aidriven/memorybank.md)
2. **Follow release notes format** for user-facing changes - [Release Notes Format](.aidriven/rules/release_notes.md)
3. **Update Memory Bank** for architecture changes
4. **Maintain bilingual docs** (EN/FR) for user-facing content
5. **Link related docs** using relative paths
6. **Submit a pull request** with documentation updates

**Documentation quality checklist:**

- [ ] Clear and concise writing
- [ ] Examples included where helpful
- [ ] Links to related docs
- [ ] Bilingual (EN/FR) for user-facing docs
- [ ] Up-to-date with current version
- [ ] Mermaid diagrams for complex flows (when applicable)

---

## 🆘 Still Can't Find What You Need?

1. **Check the glossary** - [GLOSSARY.md](.aidriven/GLOSSARY.md) for terminology
2. **Ask on Discord** - [Join our community](https://discord.com/invite/ej2Xn4GTww)
3. **Open a discussion** - [GitHub Discussions](https://github.com/Thank-you-Linus/Linus-Dashboard/discussions)
4. **Report missing docs** - [GitHub Issues](https://github.com/Thank-you-Linus/Linus-Dashboard/issues)

---

**Happy exploring! 📚🚀**

_For questions or improvements, update this map or the relevant documentation._
