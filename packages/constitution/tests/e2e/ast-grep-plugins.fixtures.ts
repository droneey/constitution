import { cpSync, existsSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { z } from 'zod';

import { compareText } from '#/kernel/utils';

import type { UnitFixture } from './applied-unit.fixtures';
import { readOnlyAppliedUnit } from './applied-unit.fixtures';
import { miseBinary } from './mise.fixtures';
import { release, toolEnvironment, writeFiles } from './package.fixtures';

interface PluginUnit {
  readonly axes?: readonly string[];
  readonly blocks: readonly string[];
}

interface Sample {
  readonly condition: string;
  readonly files: Readonly<Record<string, string>>;
  readonly unit?: PluginUnit;
}

interface PluginRow {
  readonly allowed?: readonly Sample[];
  readonly language: string;
  readonly reported: readonly Sample[];
  readonly slug: string;
  readonly unit?: PluginUnit;
}

interface PluginCase {
  readonly condition: string;
  readonly files: Readonly<Record<string, string>>;
  readonly language: string;
  readonly slug: string;
  readonly unit: PluginUnit;
}

const CONFIG = 'sgconfig.yaml';
const PYTHON = 'python';
const TYPESCRIPT = 'typescript';
const RULES_FOLDER = 'ast-grep.gen';
const UTILITIES_FOLDER = 'ast-grep-utils.gen';
const LANGUAGE_SUFFIX = /^\.[a-z]+$/;
const RULE_FILE_EXTENSION = '.yaml';
const PLUGIN_FILE = /\.yaml$/;
const LANGUAGE_COPY = /@[a-z]+$/;
const pluginsFolder = join(release, 'presets', 'ast-grep', 'plugins');
const astGrep = miseBinary('ast-grep');
const typescriptUnit: PluginUnit = {
  blocks: [
    'bun-test',
    'react/react-dom',
  ],
};

const findings = z.array(
  z.looseObject({
    file: z.string(),
    ruleId: z.string(),
  }),
);

// Why: a CSS rule's unit is a TypeScript one that adds the css block, as its rows name it.
const unitLanguageOf = (language: string): typeof PYTHON | typeof TYPESCRIPT =>
  language === PYTHON ? PYTHON : TYPESCRIPT;

const unitFixtureOf = (unit: PluginUnit, language: string): UnitFixture => ({
  ...(unit.axes === undefined
    ? {}
    : {
        axes: unit.axes,
      }),
  blocks: unit.blocks,
  implementations: [
    'ast-grep',
  ],
  languages: [
    unitLanguageOf(language),
  ],
});

// Why: a rule's id is its slug and its language, `<slug>@<language>`, so a finding names its rule by
// the slug alone.
const slugOf = (ruleId: string): string => ruleId.replace(LANGUAGE_COPY, '');

// Why: a rule's file is named after its slug, with its language before the extension where the
// slug holds rules of several languages.
const isRuleFileOf = (name: string, slug: string): boolean =>
  name.startsWith(slug) &&
  name.endsWith(RULE_FILE_EXTENSION) &&
  (name.length === slug.length + RULE_FILE_EXTENSION.length ||
    LANGUAGE_SUFFIX.test(name.slice(slug.length, -RULE_FILE_EXTENSION.length)));

// Why: a scan that hangs fails its own case, before the runner's limit of the case, instead of the
// whole run.
const SCAN_TIMEOUT_MS = 20_000;

const scan = async (folder: string): Promise<readonly string[]> => {
  const scanning = Bun.spawn(
    [
      astGrep,
      'scan',
      '--json=compact',
    ],
    {
      cwd: folder,
      env: toolEnvironment(),
      stderr: 'pipe',
      timeout: SCAN_TIMEOUT_MS,
    },
  );
  const output = await new Response(scanning.stdout).text();

  if ((await scanning.exited) !== 0 && output.trim() === '') {
    throw new Error(`ast-grep failed in ${folder}: ${await new Response(scanning.stderr).text()}`);
  }

  return [
    ...new Set(findings.parse(JSON.parse(output)).map(({ ruleId }) => slugOf(ruleId))),
  ].toSorted(compareText);
};

// Why: each case is a project of its own, so a rule's `files`, which match from the folder of
// `sgconfig.yaml`, read the case's paths as the case writes them.
const pluginsOf = async (pluginCase: PluginCase): Promise<readonly string[]> => {
  const applied = await readOnlyAppliedUnit(unitFixtureOf(pluginCase.unit, pluginCase.language));
  const folder = mkdtempSync(join(tmpdir(), 'constitution-ast-grep-plugins-'));

  try {
    cpSync(join(applied, CONFIG), join(folder, CONFIG));

    if (existsSync(join(applied, UTILITIES_FOLDER))) {
      cpSync(join(applied, UTILITIES_FOLDER), join(folder, UTILITIES_FOLDER), {
        recursive: true,
      });
    }

    // Why: a case asks only whether its own rule reports, and ast-grep loads every rule it is given
    // before it scans, so the case takes the files of its rule alone, one per language.
    for (const ruleFile of readdirSync(join(applied, RULES_FOLDER)).filter((name) =>
      isRuleFileOf(name, pluginCase.slug),
    )) {
      cpSync(join(applied, RULES_FOLDER, ruleFile), join(folder, RULES_FOLDER, ruleFile));
    }

    writeFiles({
      files: pluginCase.files,
      folder,
    });

    return await scan(folder);
  } finally {
    rmSync(folder, {
      force: true,
      recursive: true,
    });
  }
};

const casesOf =
  (pick: (row: PluginRow) => readonly Sample[]) =>
  (rows: readonly PluginRow[]): readonly PluginCase[] =>
    rows.flatMap((row) =>
      pick(row).map((sample) => ({
        condition: sample.condition,
        files: sample.files,
        language: row.language,
        slug: row.slug,
        unit: sample.unit ?? row.unit ?? typescriptUnit,
      })),
    );

const reportedCases = casesOf((row) => row.reported);
const allowedCases = casesOf((row) => row.allowed ?? []);

const pluginsWithNoRow = (rows: readonly PluginRow[]): readonly string[] =>
  readdirSync(pluginsFolder, {
    recursive: true,
  })
    .map(String)
    .filter((path) => PLUGIN_FILE.test(path))
    .filter((path) => !rows.some(({ language, slug }) => path === join(language, `${slug}.yaml`)));

export type { PluginRow };
export { allowedCases, pluginsOf, pluginsWithNoRow, reportedCases };
