# Translation Guide

Detailed reference for all translation namespaces and conventions used in OWTICS.GG.

## Namespaces Overview

```
locales/{locale}/
  game.json     ← Overwatch game domain terms
  site.json     ← Site-wide shared UI
  pages.json    ← Page-specific content
  error.json    ← Error pages
  faq.json      ← FAQ
```

---

## game.json — Overwatch Game Domain

Game-originated proper nouns and terminology. Used across many pages.

| Key | Description | Example |
|-----|-------------|---------|
| `hero.*` | Hero names (47+) | `"Kiriko": "키리코"` |
| `role.*` | Roles (player + team roles) | `"TANK": "Tank"`, `"COACH": "Coach"` |
| `subRole.*` | Sub-roles | `"FLANKER": "Flanker"` |
| `region.*` | Leaderboard regions | `"ASIA": "Asia"`, `"CN": "China"` |
| `mode.*` | Game modes | `"COMPETITIVE": "Competitive"` |
| `tier.*` | Competitive/Stadium tiers | ICU select with short/long variants |
| `stat.*` | Statistics labels | `"pick-rate": "Pick Rate"` |

### Tier format (ICU select)

```json
"GOLD": "{type, select, short {G} long {Gold} other {Gold}}"
```

- `short` — abbreviation for compact spaces (badges, chips)
- `long` — full name for dropdowns, body text
- `other` — required fallback (usually same as `long`)

### Stat key convention

- `stat.pick-rate` — full label: "Pick Rate"
- `stat.pick-rate-short` — abbreviated: "Pick" (for narrow columns)

### Important: Use official Overwatch localization

Hero names, role names, and game modes should match Blizzard's official localization for your language. Check the in-game text if unsure.

---

## site.json — Site-wide Shared UI

Reusable text for components that appear on multiple pages.

| Key | Description | Example |
|-----|-------------|---------|
| `nav.*` | Header navigation | `"hero-statistics": "Hero Statistics"` |
| `filter.*` | Filter labels | `"region": "Region"`, `"tier": "Tier"` |
| `pagination.*` | Pagination controls | `"previous": "Previous"`, `"page": "Page {page}"` |
| `empty.*` | Empty state messages | `"no-results": "No results found"` |
| `actions.*` | Action feedback | `"copied": "Copied!"` |
| `labels.*` | Generic labels | `"inactive": "Disbanded"` |
| `units.*` | Unit labels (ICU plural) | `"teams": "{count, plural, one {# team} other {# teams}}"` |
| `preview.*` | Preview banners | Development status notices |
| `filter-toggle.*` | Filter expand/collapse | `"expand": "More"` |
| `esports.*` | Esports shared enums | Status, phase, format, regions, etc. |

### `esports.*` sub-keys

Shared across all esports pages:

| Key | Description |
|-----|-------------|
| `esports.status.*` | Competition/match status (Upcoming, Ongoing, Completed) |
| `esports.phase.*` | Tournament phases (Regular Season, Playoffs) |
| `esports.format.*` | Match formats (First to 2, First to 3) |
| `esports.series.*` | Series names (OWCS, OWL) |
| `esports.region.*` | Esports regions (Global, EMEA, North America) |
| `esports.filter.*` | Filter default text (All Regions, All Tiers) |
| `esports.competition-tier.*` | Competition tier labels (S-Tier, A-Tier) |

> **Note:** `game.region` (leaderboard: ASIA, EU, AMER, CN) and `site.esports.region` (esports: GLOBAL, EMEA, NORTH_AMERICA, ...) are **different** value sets.

---

## pages.json — Page-specific Content

Text used on specific pages only. Not reused across pages.

| Key | Target Page | Content |
|-----|-------------|---------|
| `home.*` | Home page | Match center, hero strip |
| `hero-statistics.*` | Hero stats list | Page name, SEO meta |
| `hero-details.*` | Hero detail | SEO meta with `{hero}`, `{role}` |
| `ichi-rating.*` | ICHI Rating chart | Chart UI, selector, zoom controls |
| `contributors.*` | Contributors page | Banner, join CTA |
| `notable-heroes.*` | Notable heroes | Card labels |
| `hero-treemap.*` | Treemap visualization | Section title |
| `all-heroes-list.*` | Hero roster | Search, tabs |
| `hero-stats-table.*` | Stats table | Column headers, toolbar, errors |
| `hero-stats-by-tier.*` | Tier stats | Filters, errors |
| `hero-summary.*` | Hero summary | Perk labels |
| `hero-map-stats.*` | Map statistics | Best/worst maps, insights |
| `esports.*` | All esports pages | Hub, tournaments, teams, matches |

### SEO meta pattern

Many pages have a `meta` object:

```json
"meta": {
    "title": "{hero} Statistics | OWtics.GG - ...",
    "description": "Detailed description with {hero} and {role} placeholders...",
    "keywords": "Comma, separated, keywords"
}
```

Translate the text around placeholders, keeping placeholders intact.

---

## error.json — Error Pages

| Key | Description |
|-----|-------------|
| `heroNotFound.*` | Hero page 404 |
| `general.*` | Generic error (with cache-clear hint) |
| `esports.competition-not-found.*` | Competition 404 |
| `esports.team-not-found.*` | Team 404 |
| `esports.match-not-found.*` | Match 404 |

---

## faq.json — FAQ Content

| Key | Description |
|-----|-------------|
| `ichi-rating.*` | ICHI Rating FAQ (Q&A array) |

FAQ items use an array structure:

```json
{
    "ichi-rating": {
        "title": "About ICHI Rating",
        "items": [
            { "q": "What is ICHI Rating?", "a": "ICHI Rating is..." },
            { "q": "How is it calculated?", "a": "The system crawls..." }
        ]
    }
}
```

Translate both `q` (question) and `a` (answer) values. Keep the array structure intact.

---

## ICU MessageFormat Reference

This project uses **ICU MessageFormat** via `i18next-icu`. All interpolation uses **single curly braces** `{variable}`.

### Syntax

| Pattern | Description | Example |
|---------|-------------|---------|
| `{name}` | Simple variable | `"Page {page}"` |
| `{n, plural, one {...} other {...}}` | Plural | `"{count, plural, one {# team} other {# teams}}"` |
| `{v, select, a {...} b {...} other {...}}` | Select | `"{type, select, short {G} long {Gold} other {Gold}}"` |
| `#` | Number inside plural | `"one {# team}"` → "1 team" |
| `<tag>...</tag>` | Component placeholder | `"<brand/>"` |

### Rules

1. **Single braces only** — `{count}`, never `{{count}}`
2. **Case-sensitive** — `{count}` and `{Count}` are different
3. **All source placeholders required** — if `en-US` has `{count}`, your translation must too
4. **No new placeholders** — don't add `{extra}` that doesn't exist in `en-US`
5. **`other` is required** — select and plural must always have an `other` case

### Languages without plurals

Korean, Japanese, and Chinese don't distinguish singular/plural.
You can simplify ICU plural to a plain pattern:

```json
// en-US (source)
"teams": "{count, plural, one {# team} other {# teams}}"

// ko-KR (simplified - both are valid)
"teams": "{count}개 팀"
```

The validator accepts both forms as long as the `{count}` placeholder is present.
