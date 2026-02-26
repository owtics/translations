#!/usr/bin/env bun
/**
 * Translation validation script for OWTICS.GG
 *
 * Checks:
 *   - JSON syntax
 *   - Key consistency against source locale (en-US)
 *   - ICU MessageFormat syntax
 *   - Placeholder consistency between source and target
 *   - Empty translation values
 *
 * Exit codes:
 *   0 = passed (warnings are OK)
 *   1 = errors found
 */

import { parse, TYPE } from "@formatjs/icu-messageformat-parser";
import type { MessageFormatElement } from "@formatjs/icu-messageformat-parser";
import { readdir } from "node:fs/promises";

const LOCALES_DIR = `${import.meta.dir}/../locales`;
const SOURCE_LOCALE = "en-US";
const NAMESPACES = ["game", "site", "pages", "error", "faq"] as const;

const isCI = !!process.env.GITHUB_ACTIONS;

// ── Terminal colors ──────────────────────────────────────────────

const red = (s: string) => (isCI ? s : `\x1b[31m${s}\x1b[0m`);
const yellow = (s: string) => (isCI ? s : `\x1b[33m${s}\x1b[0m`);
const green = (s: string) => (isCI ? s : `\x1b[32m${s}\x1b[0m`);
const cyan = (s: string) => (isCI ? s : `\x1b[36m${s}\x1b[0m`);
const bold = (s: string) => (isCI ? s : `\x1b[1m${s}\x1b[0m`);
const dim = (s: string) => (isCI ? s : `\x1b[2m${s}\x1b[0m`);

// ── Types ────────────────────────────────────────────────────────

interface Issue {
    type: "error" | "warning";
    locale: string;
    namespace: string;
    key: string;
    message: string;
}

// ── Helpers ──────────────────────────────────────────────────────

/**
 * Flatten a nested JSON object into dot-notation key→string pairs.
 * Arrays use numeric indices: `items.0.q`, `items.1.a`.
 */
function flatten(obj: unknown, prefix = ""): Map<string, string> {
    const result = new Map<string, string>();

    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
            const path = prefix ? `${prefix}.${i}` : `${i}`;
            if (typeof obj[i] === "string") {
                result.set(path, obj[i]);
            } else if (typeof obj[i] === "object" && obj[i] !== null) {
                for (const [k, v] of flatten(obj[i], path)) {
                    result.set(k, v);
                }
            }
        }
    } else if (typeof obj === "object" && obj !== null) {
        for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
            const path = prefix ? `${prefix}.${key}` : key;
            if (typeof value === "string") {
                result.set(path, value);
            } else if (typeof value === "object" && value !== null) {
                for (const [k, v] of flatten(value, path)) {
                    result.set(k, v);
                }
            }
        }
    }

    return result;
}

/** Walk an ICU AST and collect placeholder names. */
function collectPlaceholders(nodes: MessageFormatElement[], out: Set<string>) {
    for (const node of nodes) {
        switch (node.type) {
            case TYPE.argument:
            case TYPE.number:
            case TYPE.date:
            case TYPE.time:
                out.add(node.value);
                break;
            case TYPE.select:
            case TYPE.plural:
                out.add(node.value);
                for (const opt of Object.values(node.options)) {
                    collectPlaceholders(opt.value, out);
                }
                break;
            case TYPE.tag:
                out.add(`<${node.value}>`);
                collectPlaceholders(node.children, out);
                break;
        }
    }
}

/** Extract ICU placeholder names from a message string. */
function extractPlaceholders(message: string): Set<string> {
    const out = new Set<string>();
    try {
        collectPlaceholders(parse(message, { ignoreTag: true }), out);
    } catch {
        // parse errors are reported separately
    }
    return out;
}

/** Validate ICU syntax. Returns error message or null. */
function validateICU(message: string): string | null {
    try {
        parse(message, { ignoreTag: true });
        return null;
    } catch (e) {
        return (e as Error).message;
    }
}

async function loadJSON(locale: string, ns: string): Promise<Record<string, unknown> | null> {
    try {
        const text = await Bun.file(`${LOCALES_DIR}/${locale}/${ns}.json`).text();
        return JSON.parse(text);
    } catch {
        return null;
    }
}

async function discoverLocales(): Promise<string[]> {
    const entries = await readdir(LOCALES_DIR, { withFileTypes: true });
    return entries
        .filter((e) => e.isDirectory() && e.name !== SOURCE_LOCALE)
        .map((e) => e.name)
        .sort();
}

/** Emit a GitHub Actions annotation. */
function ghAnnotate(level: "error" | "warning", file: string, message: string) {
    if (isCI) {
        console.log(`::${level} file=${file}::${message}`);
    }
}

// ── Main ─────────────────────────────────────────────────────────

async function main() {
    const issues: Issue[] = [];
    const coverage = new Map<string, { total: number; translated: number }>();

    // ── Load & validate source locale ────────────────────────────
    const sourceData = new Map<string, Map<string, string>>();

    for (const ns of NAMESPACES) {
        const data = await loadJSON(SOURCE_LOCALE, ns);
        if (!data) {
            console.error(red(`FATAL: cannot load ${SOURCE_LOCALE}/${ns}.json`));
            process.exit(1);
        }
        const flat = flatten(data);
        sourceData.set(ns, flat);

        for (const [key, value] of flat) {
            const err = validateICU(value);
            if (err) {
                issues.push({
                    type: "error",
                    locale: SOURCE_LOCALE,
                    namespace: ns,
                    key,
                    message: `Invalid ICU in source: ${err}`,
                });
            }
        }
    }

    // ── Discover target locales ──────────────────────────────────
    const locales = await discoverLocales();
    if (locales.length === 0) {
        console.log(yellow("No target locales found."));
        process.exit(0);
    }

    // ── Validate each target locale ──────────────────────────────
    for (const locale of locales) {
        let total = 0;
        let translated = 0;

        for (const ns of NAMESPACES) {
            const sourceKeys = sourceData.get(ns)!;
            total += sourceKeys.size;

            const data = await loadJSON(locale, ns);
            if (!data) {
                issues.push({
                    type: "error",
                    locale,
                    namespace: ns,
                    key: "*",
                    message: "File missing or invalid JSON",
                });
                ghAnnotate("error", `locales/${locale}/${ns}.json`, "File missing or invalid JSON");
                continue;
            }

            const targetKeys = flatten(data);

            // Extra keys (not in source)
            for (const key of targetKeys.keys()) {
                if (!sourceKeys.has(key)) {
                    issues.push({
                        type: "error",
                        locale,
                        namespace: ns,
                        key,
                        message: "Extra key not in source (en-US)",
                    });
                    ghAnnotate("error", `locales/${locale}/${ns}.json`, `Extra key: ${key}`);
                }
            }

            // Validate each source key
            for (const [key, sourceValue] of sourceKeys) {
                const targetValue = targetKeys.get(key);

                if (targetValue === undefined) {
                    issues.push({
                        type: "warning",
                        locale,
                        namespace: ns,
                        key,
                        message: "Missing translation",
                    });
                    continue;
                }

                translated++;

                if (targetValue.trim() === "") {
                    issues.push({
                        type: "warning",
                        locale,
                        namespace: ns,
                        key,
                        message: "Empty value",
                    });
                    continue;
                }

                // ICU syntax
                const icuErr = validateICU(targetValue);
                if (icuErr) {
                    issues.push({
                        type: "error",
                        locale,
                        namespace: ns,
                        key,
                        message: `Invalid ICU: ${icuErr}`,
                    });
                    ghAnnotate("error", `locales/${locale}/${ns}.json`, `${key}: invalid ICU syntax`);
                    continue;
                }

                // Placeholder consistency
                const srcPH = extractPlaceholders(sourceValue);
                const tgtPH = extractPlaceholders(targetValue);

                for (const ph of srcPH) {
                    if (!tgtPH.has(ph)) {
                        issues.push({
                            type: "error",
                            locale,
                            namespace: ns,
                            key,
                            message: `Missing placeholder: ${ph}`,
                        });
                        ghAnnotate("error", `locales/${locale}/${ns}.json`, `${key}: missing placeholder ${ph}`);
                    }
                }
                for (const ph of tgtPH) {
                    if (!srcPH.has(ph)) {
                        issues.push({
                            type: "error",
                            locale,
                            namespace: ns,
                            key,
                            message: `Unknown placeholder: ${ph}`,
                        });
                        ghAnnotate("error", `locales/${locale}/${ns}.json`, `${key}: unknown placeholder ${ph}`);
                    }
                }
            }
        }

        coverage.set(locale, { total, translated });
    }

    // ── Report ───────────────────────────────────────────────────
    const errors = issues.filter((i) => i.type === "error");
    const warnings = issues.filter((i) => i.type === "warning");

    console.log(bold("\n  Translation Coverage\n"));
    console.log(`  ${"Locale".padEnd(10)} ${"Progress".padEnd(8)} ${"Bar".padEnd(22)} ${"Keys"}`);
    console.log(`  ${"-".repeat(10)} ${"-".repeat(8)} ${"-".repeat(22)} ${"-".repeat(12)}`);

    for (const [locale, { total, translated }] of coverage) {
        const pct = total > 0 ? Math.round((translated / total) * 100) : 0;
        const filled = Math.round(pct / 5);
        const bar = "\u2588".repeat(filled) + "\u2591".repeat(20 - filled);
        const color = pct === 100 ? green : pct >= 80 ? yellow : red;
        console.log(
            `  ${cyan(locale.padEnd(10))} ${color(`${pct}%`.padStart(5))}   ${dim(bar)} ${dim(`${translated}/${total}`)}`,
        );
    }

    if (errors.length > 0) {
        console.log(bold(red(`\n  ${errors.length} error(s):\n`)));
        for (const issue of errors) {
            console.log(red(`  x ${issue.locale}/${issue.namespace}.json : ${issue.key}`));
            console.log(`    ${issue.message}\n`);
        }
    }

    if (warnings.length > 0) {
        const missing = warnings.filter((w) => w.message === "Missing translation");
        const empty = warnings.filter((w) => w.message === "Empty value");

        console.log(bold(yellow(`\n  ${warnings.length} warning(s):\n`)));

        if (missing.length > 0) {
            console.log(yellow(`  ${missing.length} missing translation(s)`));
            for (const w of missing.slice(0, 10)) {
                console.log(dim(`    ${w.locale}/${w.namespace}.json : ${w.key}`));
            }
            if (missing.length > 10) {
                console.log(dim(`    ... and ${missing.length - 10} more`));
            }
        }
        if (empty.length > 0) {
            console.log(yellow(`  ${empty.length} empty value(s)`));
        }
    }

    if (errors.length === 0) {
        console.log(green(bold("\n  All checks passed.\n")));
    }

    process.exit(errors.length > 0 ? 1 : 0);
}

main();
