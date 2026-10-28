import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, normalize } from 'node:path';

import { z } from 'zod';

import { appliedUnit } from './applied-unit.fixtures';
import { linkRelease, nodeBinary, release, toolEnvironment, writeFiles } from './package.fixtures';
import { loadOf, widestAppliedUnit } from './preset-load.fixtures';

const diagnostic = z.object({
  category: z.string(),
  location: z.object({
    path: z.string(),
  }),
  message: z.string(),
});

const report = z.object({
  diagnostics: z.array(diagnostic),
});

type BiomeDiagnostic = z.infer<typeof diagnostic>;

const plugins = z.array(
  z.union([
    z.string(),
    z.object({
      includes: z.array(z.string()),
      path: z.string(),
    }),
  ]),
);

const rules = z.record(
  z.string(),
  z.union([
    z.string(),
    z.record(
      z.string(),
      z.union([
        z.string(),
        z.object({
          level: z.string(),
        }),
      ]),
    ),
  ]),
);

const linter = z.object({
  rules: rules.optional(),
});

const preset = z.object({
  linter: linter.optional(),
  overrides: z
    .array(
      z.object({
        linter: linter.optional(),
      }),
    )
    .optional(),
  plugins: plugins.optional(),
});

const biome = nodeBinary('biome');
const blocks = join(release, 'blocks');
const CONFIG = 'biome.jsonc';
const PRESETS = 'presets';
const SOURCE = 'src/order.ts';
const WARN = 'warn';

/** What Biome reports when it lints the whole tree of the folder, version control aside. */
const biomeDiagnostics = async (folder: string): Promise<readonly BiomeDiagnostic[]> => {
  const linting = Bun.spawn(
    [
      biome,
      'lint',
      '--reporter=json',
      '--max-diagnostics=none',
      '--vcs-enabled=false',
      '.',
    ],
    {
      cwd: folder,
      env: toolEnvironment(),
      stderr: 'ignore',
    },
  );

  return report.parse(JSON.parse(await new Response(linting.stdout).text())).diagnostics;
};

const widestConfig = (): z.infer<typeof preset> =>
  preset.parse(Bun.JSONC.parse(readFileSync(join(widestAppliedUnit('biome'), CONFIG), 'utf8')));

/**
 * Biome's status on the widest configuration where it checks a file that keeps every rule: it fails
 * on a key, a rule or a plugin it does not know, and on a warning.
 */
const widestStatus = async (): Promise<number> =>
  (
    await loadOf('biome', {
      command: [
        biome,
        'check',
        '--error-on-warnings',
        '--vcs-enabled=false',
        SOURCE,
      ],
      files: {
        [SOURCE]: "export const ORDER_KIND = 'order';\n",
      },
    })
  ).status;

const presetPlugins = (): z.infer<typeof plugins> => widestConfig().plugins ?? [];

/**
 * The plugin paths the widest configuration declares in more than one entry: Biome 2.6 runs every
 * entry of one path over the union of their includes, so an entry that narrows another narrows
 * nothing.
 */
const repeatedPluginPaths = (): readonly string[] => {
  const paths = presetPlugins().map((plugin) =>
    normalize(typeof plugin === 'string' ? plugin : plugin.path),
  );

  return paths.filter((path, index) => paths.indexOf(path) !== index);
};

// What the blocks write as code — in backticks, or in a block's `governs`.
const blockCode = (): readonly string[] =>
  readdirSync(blocks, {
    recursive: true,
  })
    .map(String)
    .filter((path) => path.endsWith('.md'))
    .map((path) => readFileSync(join(blocks, path), 'utf8'))
    .flatMap((text) => [
      ...text.matchAll(/`([^`\n]+)`|"([^"\n]+)"/g),
    ])
    .map(([, code, quoted]) => code ?? quoted ?? '');

/** The folders, files and suffixes the plugins' includes name that no block writes as code. */
const unwrittenPresetWords = (): readonly string[] => {
  const code = blockCode();
  const words = presetPlugins()
    .flatMap((plugin) => (typeof plugin === 'string' ? [] : plugin.includes))
    .flatMap((glob) => glob.replace(/^!/, '').split('/'))
    .filter((segment) => segment !== '**')
    .map((segment) => segment.replace(/^\*/, ''));

  return [
    ...new Set(words),
  ].filter((word) => !code.some((written) => written.includes(word)));
};

/** The rules the widest configuration sets at warn, in its linter and in its overrides. */
const warnedRules = (): readonly string[] => {
  const config = widestConfig();

  return [
    config.linter,
    ...(config.overrides ?? []).map((override) => override.linter),
  ]
    .flatMap((settings) => Object.entries(settings?.rules ?? {}))
    .flatMap(([group, groupRules]) =>
      typeof groupRules === 'string'
        ? []
        : Object.entries(groupRules).map(([rule, setting]) => ({
            level: typeof setting === 'string' ? setting : setting.level,
            rule: `${group}/${rule}`,
          })),
    )
    .filter(({ level }) => level === WARN)
    .map(({ rule }) => rule);
};

/**
 * The codes Biome reports when it lints the whole tree of a unit of the base alone, holding the
 * files given; the presets are linked in, as a project's release is, so a file can lie beside them.
 */
const codesOfWholeTree = async (
  files: Readonly<Record<string, string>>,
): Promise<readonly string[]> => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-biome-'));

  try {
    linkRelease(folder, PRESETS);
    writeFiles({
      files: {
        ...files,
        [CONFIG]: readFileSync(
          join(
            appliedUnit({
              axes: [],
              implementations: [
                'biome',
              ],
              languages: [
                'typescript',
              ],
            }),
            CONFIG,
          ),
          'utf8',
        ),
      },
      folder,
    });

    return (await biomeDiagnostics(folder)).map(({ category }) => category);
  } finally {
    rmSync(folder, {
      force: true,
      recursive: true,
    });
  }
};

export type { BiomeDiagnostic };
export {
  biomeDiagnostics,
  codesOfWholeTree,
  repeatedPluginPaths,
  unwrittenPresetWords,
  warnedRules,
  widestStatus,
};
