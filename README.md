# OWTICS.GG Translations

Community translations for [OWTICS.GG](https://owtics.gg) — Overwatch statistics, analytics, and esports platform.

## Translation Status

<!-- TRANSLATION_STATUS:START -->
| Locale | Language | Coverage |
|--------|----------|----------|
| `en-US` | English | Source |
| `ja-JP` | 日本語 | 669/700 (96%) |
| `ko-KR` | 한국어 | 700/700 (100%) |
| `zh-CN` | 简体中文 | 669/700 (96%) |
| `zh-TW` | 繁體中文 | 669/700 (96%) |
| | [Add your language!](CONTRIBUTING.md#adding-a-new-locale) | |
<!-- TRANSLATION_STATUS:END -->

## How to Contribute

See **[CONTRIBUTING.md](CONTRIBUTING.md)** for step-by-step instructions.

**Quick start:**

1. Fork this repository
2. Edit JSON files in `locales/<your-locale>/`
3. Open a Pull Request
4. CI will automatically validate your changes

All translations use **ICU MessageFormat** (`{variable}`, not `{{variable}}`).
See the **[Translation Guide](TRANSLATION_GUIDE.md)** for syntax reference.

## Structure

```
locales/
├── en-US/          ← Source of truth (do not modify unless you're a maintainer)
│   ├── game.json       Overwatch game terms (heroes, roles, tiers)
│   ├── site.json       Site-wide UI text (nav, filters, pagination)
│   ├── pages.json      Page-specific content (titles, descriptions, SEO)
│   ├── error.json      Error pages
│   └── faq.json        FAQ content
├── ko-KR/          ← Korean
├── ja-JP/          ← Japanese
└── <your-locale>/  ← Add your language here!
```

## Validation

Every PR is automatically validated:

- JSON syntax
- Key consistency with source (`en-US`)
- ICU MessageFormat syntax
- Placeholder consistency (`{count}`, `{hero}`, etc.)

Run locally:

```bash
bun install
bun run validate
```

## License

Translation content is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
