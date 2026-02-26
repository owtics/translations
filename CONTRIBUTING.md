# Contributing to OWTICS Translations

Thank you for helping translate OWTICS.GG! This guide covers everything you need to contribute.

## Table of Contents

- [Getting Started](#getting-started)
- [Updating Existing Translations](#updating-existing-translations)
- [Adding a New Locale](#adding-a-new-locale)
- [ICU MessageFormat Quick Reference](#icu-messageformat-quick-reference)
- [Running Validation Locally](#running-validation-locally)
- [PR Guidelines](#pr-guidelines)

## Getting Started

**You don't need any coding experience** to contribute translations. You only need:

- A GitHub account
- Knowledge of the target language and Overwatch terminology

### File format

All translations are stored as JSON files. Each locale has 5 files (namespaces):

| File | Content |
|------|---------|
| `game.json` | Overwatch game terms — hero names, roles, tiers, stats |
| `site.json` | Shared UI — navigation, filters, pagination, esports enums |
| `pages.json` | Page-specific — titles, descriptions, SEO metadata |
| `error.json` | Error pages — 404s, general errors |
| `faq.json` | FAQ content — questions and answers |

See [TRANSLATION_GUIDE.md](TRANSLATION_GUIDE.md) for detailed namespace descriptions.

## Updating Existing Translations

1. **Fork** this repository
2. Find the file you want to edit in `locales/<locale>/`
3. Edit the **values** (right side of `:`) — never change the keys (left side)
4. Commit and open a **Pull Request**

### Example

```jsonc
// locales/ko-KR/site.json
{
    "nav": {
        "hero-statistics": "영웅 통계",  // ← edit this value
        "esports": "E-Sports"            // ← or this one
    }
}
```

### Rules

- **Never modify `en-US/`** unless you're fixing a source string (maintainers only)
- **Never change JSON keys** — only translate the values
- **Keep ICU placeholders intact** — `{count}`, `{hero}`, `{type, select, ...}` must remain as-is
- **Match the tone** — OWTICS uses a clean, informative tone (not overly casual)
- **Use official Overwatch terminology** — hero names, role names, and tier names should match the game's official localization

## Adding a New Locale

1. **Open an issue** using the [New Locale Request](https://github.com/owtics/translations/issues/new?template=new-locale.yml) template
2. Once approved, create a new directory: `locales/<locale-code>/`
3. Copy all 5 files from `en-US/` into your new directory
4. Translate the values
5. Open a Pull Request

### Locale code format

Use [BCP 47](https://www.rfc-editor.org/info/bcp47) codes: `<language>-<REGION>`

Examples: `zh-CN`, `zh-TW`, `fr-FR`, `de-DE`, `es-ES`, `pt-BR`, `th-TH`

### Partial translations are welcome

You don't need to translate everything at once. Start with the most visible files:

1. `game.json` — hero names and roles (players see these everywhere)
2. `site.json` — navigation and filters
3. `pages.json` — page titles and descriptions
4. `error.json` and `faq.json` — lower priority

CI will report your translation coverage in the PR.

## ICU MessageFormat Quick Reference

This project uses **ICU MessageFormat** with **single curly braces**. Never use double braces `{{...}}`.

### Simple variable

```json
"page": "Page {page}"
```

The `{page}` placeholder will be replaced with the actual page number at runtime.

### Plural

```json
"teams": "{count, plural, one {# team} other {# teams}}"
```

- `one` — when count is 1
- `other` — all other counts
- `#` — replaced by the count number

**Note:** Languages without plural distinctions (Korean, Japanese, Chinese) can simplify:

```json
"teams": "{count}개 팀"
```

### Select

```json
"GOLD": "{type, select, short {G} long {Gold} other {Gold}}"
```

- `short` — abbreviated form (used in compact UI)
- `long` — full form (used in dropdowns, text)
- `other` — fallback (required)

### HTML-like tags

```json
"subtitle": "Meet the people who manage <brand/> esports data"
```

`<brand/>` is a component placeholder — keep it exactly as-is.

### Common mistakes

| Wrong | Correct | Why |
|-------|---------|-----|
| `{{count}}` | `{count}` | ICU uses single braces |
| `{Count}` | `{count}` | Placeholder names are case-sensitive |
| Removing `{count}` | Keep `{count}` | All source placeholders must be present |
| Adding `{extra}` | Don't add new placeholders | Only use placeholders from `en-US` |

## Running Validation Locally

```bash
# Install dependencies (requires Bun: https://bun.sh)
bun install

# Run all checks
bun run validate
```

The validator checks:
- **Errors** (will fail CI): invalid JSON, invalid ICU syntax, extra keys, placeholder mismatches
- **Warnings** (won't fail CI): missing translations, empty values

## PR Guidelines

1. **One locale per PR** — makes review easier
2. **Descriptive title** — e.g., "Add zh-CN translations for game.json and site.json"
3. **Don't use raw machine translation** — AI/MT output is fine as a starting point, but must be reviewed by a human
4. **Test your JSON** — make sure it's valid JSON before submitting (the validator will catch this too)
5. **Be responsive** — maintainers may ask for adjustments based on context you can't see in the JSON alone

### Review process

1. CI validates your PR automatically
2. A maintainer reviews the translations for accuracy and context
3. Once approved, your changes are merged and synced to the live site
