import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const TEMPLATES = join(import.meta.dir, '..', '..', '..', '..', 'templates');
const PLACEHOLDER = /<[^>\n]+>/;
const RULE_HEADING = /^## \S+ · /m;
const PARAGLIDE_DIR = 'blocks/implementations/paraglide';

// What /ratify writes for Paraglide, a library the constitution has no block for.
const PARAGLIDE: ReadonlyArray<
  readonly [
    string,
    string,
  ]
> = [
  [
    '<id>',
    'paraglide',
  ],
  [
    '<One sentence of at most 70 characters.>',
    'Paraglide messages, compiled per locale.',
  ],
  [
    'requires: []',
    'requires: [i18n, typescript]',
  ],
  [
    'dictionary: []',
    'dictionary: [Paraglide]',
  ],
  [
    '<Name>',
    'Paraglide',
  ],
  [
    '<What the library does in this repository, in one or two sentences.>',
    'Paraglide compiles the messages of each locale into typed functions.',
  ],
  [
    '<requirement>',
    'i18n-plurals-by-cldr',
  ],
  [
    '<how the library meets it, and the workaround where it falls short>',
    'a variant per CLDR plural category',
  ],
  [
    '<yes, partly or no>',
    'yes',
  ],
  [
    '<rule-slug>',
    'paraglide-messages-by-function',
  ],
  [
    '<The rule, in one or two sentences.>',
    'A message is read through its compiled function, never by its key.',
  ],
  [
    '<the reason>',
    'the compiler checks a function call, and a key is only a string.',
  ],
  [
    '<tool/role, test or review>',
    'tool/types',
  ],
  [
    '[<lens>, <lens>]',
    '[errors]',
  ],
];

const paraglideFromTemplate = (): string => {
  const filled = PARAGLIDE.reduce(
    (text, [placeholder, filling]) => text.replaceAll(placeholder, filling),
    readFileSync(join(TEMPLATES, 'block.md'), 'utf8'),
  );
  const left = PLACEHOLDER.exec(filled)?.[0];

  if (left !== undefined) {
    throw new Error(`templates/block.md has a placeholder no fill covers: ${left}`);
  }

  return filled;
};

const paraglideOnAxes = (): Readonly<Record<string, string>> => {
  const filled = paraglideFromTemplate();
  const at = filled.search(RULE_HEADING);

  if (at === -1) {
    throw new Error('templates/block.md has no rule');
  }

  return {
    [`${PARAGLIDE_DIR}/foundation/paraglide.md`]: `# Paraglide\n\n${filled.slice(at)}`,
    [`${PARAGLIDE_DIR}/paraglide.md`]: filled.slice(0, at),
  };
};

export { paraglideOnAxes };
