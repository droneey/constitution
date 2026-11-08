import { describe, expect, it } from 'bun:test';

import { Axis } from '#/kernel/constants';
import type { FindingOf } from '#/kernel/types';
import { BlockId, coreBlockId, RuleSlug } from '#/kernel/value-objects';

import type { Files } from '../../../../../../__tests__/constitution.fixtures';
import { passportFile, rule, textOf } from '../../../../../../__tests__/constitution.fixtures';
import { nestedFiles } from '../../../../../../__tests__/nested-files.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { checkInputOf } from '../../../../../../application/use-cases/queries/check/__tests__/check.fixtures';
import type { TermsDetails } from '../terms';
import { TermsCode, termsCheck } from '../terms';

const CORE = 'blocks/core/core.md';
const PRINCIPLES = 'blocks/core/@foundation/principles.md';
const PORTS = 'blocks/core/@architecture/ports.md';
const WORKFLOW = 'blocks/core/@workflow/workflow.md';
const UI = 'blocks/domains/ui/ui.md';
const UI_CHAPTER = 'blocks/domains/ui/@foundation/forms.md';
const CATALOGS = 'blocks/implementations/lingui/@foundation/catalogs.md';
const CHECKS = 'blocks/implementations/biome/@foundation/checks.md';
const PORTALS = 'blocks/implementations/react/react-dom/@workflow/portals.md';

const withCoreTerms = (files: Files): Files => ({
  ...files,
  [PORTS]:
    '# Ports\n\nA **port** names a need; a **binding unit** binds it, in **`adapters/`**{#adapter}, in a file **`.port`**{#port-file}. One binding unit binds one port.\n',
  [WORKFLOW]: `# Workflow\n\nA **squash merge** lands **\`feature/\`**{#feature-branch} branches, one squash merge a branch.\n\n## General\n\n${rule(
    {
      slug: 'rules-bind',
    },
  )}`,
});

type TermsFinding = FindingOf<TermsDetails>;

const checked = (input: { path: string; text: string }): readonly TermsFinding[] => {
  const files = withCoreTerms(validFiles());

  files[input.path] = input.text;

  return termsCheck(checkInputOf(files));
};

const offAxis = (input: {
  axis: Axis;
  path: string;
  slug?: string;
  term: string;
  termAxis: Axis;
}): TermsFinding => ({
  code: TermsCode.OffAxis,
  details: {
    axis: input.axis,
    slug: RuleSlug.create(input.slug ?? 'ports-stay'),
    term: input.term,
    termAxis: input.termAxis,
  },
  path: input.path,
});

const inFoundation = (term: string): TermsFinding =>
  offAxis({
    axis: Axis.Foundation,
    path: PRINCIPLES,
    term,
    termAxis: Axis.Architecture,
  });

const principlesWith = (statement: string): string =>
  `# Principles\n\n## General\n\n${rule({
    slug: 'ports-stay',
    statement,
  })}`;

const outOfReach = (input: { owner: string; path: string; term: string }): TermsFinding => ({
  code: TermsCode.OutOfReach,
  details: {
    owner: BlockId.create(input.owner),
    term: input.term,
  },
  path: input.path,
});

describe('termsCheck', () => {
  it('should find nothing when every term is defined once and used where its owner is reached', () => {
    // Arrange
    const input = checkInputOf(withCoreTerms(validFiles()));

    // Act
    const findings = termsCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report each later definition of a term when two files define it', () => {
    // Arrange
    const files = withCoreTerms(validFiles());

    files[PRINCIPLES] = '# Principles\n\nEach **squash merge** is reviewed.\n';
    files[CATALOGS] = textOf({
      files,
      path: CATALOGS,
    }).replace('**Lingui** compiles', '**Lingui** and **Biome** compile');

    // Act
    const findings = termsCheck(checkInputOf(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        code: TermsCode.DefinedTwice,
        details: {
          firstBlock: coreBlockId,
          firstFile: PRINCIPLES,
          term: 'squash merge',
        },
        path: WORKFLOW,
      },
      {
        code: TermsCode.DefinedTwice,
        details: {
          firstBlock: BlockId.create('biome'),
          firstFile: CHECKS,
          term: 'Biome',
        },
        path: CATALOGS,
      },
      outOfReach({
        owner: 'biome',
        path: CATALOGS,
        term: 'Biome',
      }),
    ]);
  });

  it('should report bold that is neither plain words nor one code span', () => {
    // Act
    const findings = checked({
      path: PRINCIPLES,
      text: '# Principles\n\nRead **the `x` folder**.\n',
    });

    // Assert
    expect(findings).toStrictEqual([
      {
        code: TermsCode.Misshapen,
        details: {
          written: 'the `x` folder',
        },
        path: PRINCIPLES,
      },
    ]);
  });

  it.each<{
    expected: readonly TermsFinding[];
    name: string;
    path: string;
    text: string;
  }>([
    {
      expected: [
        inFoundation('port'),
      ],
      name: 'a rule of foundation uses a concept in the plural and in capitals',
      path: PRINCIPLES,
      text: principlesWith('Two Ports meet.'),
    },
    {
      expected: [
        inFoundation('binding unit'),
      ],
      name: 'a line break splits a concept of two words',
      path: PRINCIPLES,
      text: principlesWith('Each binding\nunit ships.'),
    },
    {
      expected: [
        offAxis({
          axis: Axis.Foundation,
          path: PRINCIPLES,
          term: 'squash merge',
          termAxis: Axis.Workflow,
        }),
      ],
      name: 'a rule of foundation uses terms of the workflow',
      path: PRINCIPLES,
      text: principlesWith('Squash merges land on feature/login.'),
    },
    {
      expected: [
        offAxis({
          axis: Axis.Workflow,
          path: WORKFLOW,
          slug: 'rules-bind',
          term: 'port',
          termAxis: Axis.Architecture,
        }),
      ],
      name: 'a workflow rule uses a term of the architecture',
      path: WORKFLOW,
      text: `# Workflow\n\nA **squash merge** lands **\`feature/\`**{#feature-branch}, one squash merge a branch.\n\n## General\n\n${rule(
        {
          slug: 'rules-bind',
          statement: 'Every change touches one port.',
        },
      )}`,
    },
    {
      expected: [
        inFoundation('binding unit'),
      ],
      name: 'a statement uses one after a dash, and only its Why uses another',
      path: PRINCIPLES,
      text: `# Principles\n\n${rule({
        slug: 'ports-stay',
        statement: 'It holds — for a binding unit.',
        why: 'it breaks when code moves — the stable port principle.',
      })}`,
    },
  ])('should report each term off its axis when $name', ({ expected, path, text }) => {
    // Act
    const findings = checked({
      path,
      text,
    });

    // Assert
    expect(findings).toStrictEqual(expected);
  });

  it.each<{
    expected: readonly TermsFinding[];
    name: string;
    path: string;
    text: string;
  }>([
    {
      expected: [
        outOfReach({
          owner: 'typescript',
          path: UI_CHAPTER,
          term: 'TypeScript',
        }),
      ],
      name: 'a domain names one in prose and others in inline code',
      path: UI_CHAPTER,
      text: '# UI\n\nEach screen is one `index.ts` in TypeScript.\n',
    },
    {
      expected: [
        outOfReach({
          owner: 'react',
          path: UI,
          term: 'React',
        }),
      ],
      name: 'the summary of a domain names one',
      path: UI,
      text: passportFile({
        body: '# UI\n',
        id: 'ui',
        summary: 'Screens written in React.',
      }),
    },
    {
      expected: [
        outOfReach({
          owner: 'react',
          path: UI_CHAPTER,
          term: 'React',
        }),
        outOfReach({
          owner: 'react/react-dom',
          path: UI_CHAPTER,
          term: 'React DOM',
        }),
      ],
      name: 'a line break splits one',
      path: UI_CHAPTER,
      text: '# UI\n\n- Screens render with React\n  DOM.\n',
    },
  ])('should report each term out of reach when $name', ({ expected, path, text }) => {
    // Act
    const findings = checked({
      path,
      text,
    });

    // Assert
    expect(findings).toStrictEqual(expected);
  });

  it.each([
    {
      name: 'a path in code holds a folder and a file name a suffix',
      text: '# Principles\n\nCode lives in `src/adapters/http/x.port.go`.\n',
    },
    {
      name: 'a term of the architecture appears only in a block path or a term id',
      text: '# Principles\n\nSee contracts/port/rest and **`x/`**{#port}.\n',
    },
  ])('should report nothing on the axis when $name', ({ text }) => {
    // Act
    const findings = checked({
      path: PRINCIPLES,
      text,
    });

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report nothing for a folder and a suffix written in backticks without their mark', () => {
    // Act
    const findings = checked({
      path: PORTS,
      text: '# Ports\n\nA **port** names a need; a **binding unit** binds it, in **`adapters/`**{#adapter} — not `adapters` — in a file **`.port`**{#port-file}, not `port`; see `adapters/http`. One binding unit binds one port.\n',
    });

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it.each<{
    expected: readonly TermsFinding[];
    name: string;
    text: string;
  }>([
    {
      expected: [
        {
          code: TermsCode.WithoutId,
          details: {
            term: 'specs/',
          },
          path: PRINCIPLES,
        },
        {
          code: TermsCode.WithoutId,
          details: {
            term: '.spec',
          },
          path: PRINCIPLES,
        },
      ],
      name: 'a folder and a suffix carry none, nor a concept or a file, which need none',
      text: '# Principles\n\nA **spec** in **`specs/`** {#spec-folder} ends in **`.spec`**, beside **`spec.json`**.\n',
    },
    {
      expected: [
        {
          code: TermsCode.IdMisshapen,
          details: {
            id: 'Specs',
            term: 'specs/',
          },
          path: PRINCIPLES,
        },
        {
          code: TermsCode.IdMisshapen,
          details: {
            id: 'spec_file',
            term: '.spec',
          },
          path: PRINCIPLES,
        },
        {
          code: TermsCode.IdMisshapen,
          details: {
            id: '',
            term: 'fakes/',
          },
          path: PRINCIPLES,
        },
      ],
      name: 'an id opens with a capital, holds an underscore or is empty',
      text: '# Principles\n\nSpecs sit in **`specs/`**{#Specs}, end in **`.spec`**{#spec_file}, fakes in **`fakes/`**{#}.\n',
    },
    {
      expected: [
        {
          code: TermsCode.IdRepeated,
          details: {
            firstFile: PRINCIPLES,
            firstTerm: 'specs/',
            id: 'spec',
            term: '.spec',
          },
          path: PRINCIPLES,
        },
      ],
      name: 'a folder and a suffix spelt alike share an id',
      text: '# Principles\n\nSpecs sit in **`specs/`**{#spec} and end in **`.spec`**{#spec}; a **suite**{#suite} runs them.\n',
    },
  ])('should report the ids of terms when $name', ({ expected, text }) => {
    // Act
    const findings = checked({
      path: PRINCIPLES,
      text,
    });

    // Assert
    expect(findings).toStrictEqual(expected);
  });

  it('should let a block that builds on the owner of an id spell its term its own way', () => {
    // Arrange
    const files = withCoreTerms(validFiles());

    files[CHECKS] = textOf({
      files,
      path: CHECKS,
    }).replace('every `.ts` file.', 'every **`.mts`**{#typescript-source} file.');

    // Act
    const findings = termsCheck(checkInputOf(files));

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should let a block read before the owner of an id it builds on spell its term its own way', () => {
    // Arrange
    const files = withCoreTerms(validFiles());
    const biome = 'blocks/implementations/biome/biome.md';

    files[biome] = textOf({
      files,
      path: biome,
    }).replace('requires: ["typescript"]', 'requires: ["typescript", "lingui"]');
    files[CHECKS] = textOf({
      files,
      path: CHECKS,
    }).replace('every `.ts` file.', 'every **`.mts`**{#catalog} file.');
    files[CATALOGS] = textOf({
      files,
      path: CATALOGS,
    }).replace('compiles its catalogs.', 'compiles its **`.po`**{#catalog} catalogs.');

    // Act
    const findings = termsCheck(checkInputOf(files));

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report an id a block repeats that it does not build on', () => {
    // Arrange
    const files = withCoreTerms(validFiles());
    const render = 'blocks/contexts/platforms/browser/@architecture/render.md';

    files[render] = textOf({
      files,
      path: render,
    }).replace('# Render', '# Render\n\nA module ends in **`.mts`**{#typescript-source}.');

    // Act
    const findings = termsCheck(checkInputOf(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        code: TermsCode.IdRepeated,
        details: {
          firstFile: render,
          firstTerm: '.mts',
          id: 'typescript-source',
          term: '.ts',
        },
        path: 'blocks/contexts/languages/typescript/@foundation/types.md',
      },
    ]);
  });

  it.each([
    {
      name: 'only headings and a fenced sample use terms of another axis',
      path: PRINCIPLES,
      text: `# Ports\n\n${rule({
        slug: 'ports-behind-adapters',
        statement: 'It holds.',
      })}\n## Binding units\n\n\`\`\`ts\nconst port = import("adapters/x.port");\n\`\`\`\n`,
    },
    {
      name: 'a passport uses terms of every axis',
      path: CORE,
      text: textOf({
        files: validFiles(),
        path: CORE,
      }).replace(
        '## Its chapters',
        'Every port has adapters/ and lands by squash merge.\n\n## Its chapters',
      ),
    },
    {
      name: "a domain uses core's terms on their axis",
      path: 'blocks/domains/ui/@architecture/forms.md',
      text: '# UI\n\nEach port keeps its binding unit.\n',
    },
    {
      name: 'a with/ file named after the owner names its terms',
      path: 'blocks/contexts/platforms/browser/@foundation/with/typescript.md',
      text: '# Browser with TypeScript\n\nEach `index.ts` runs in the tab.\n',
    },
    {
      name: "a block that cannot reach a suffix's owner writes its stem",
      path: UI_CHAPTER,
      text: '# UI\n\nA fence names its language, `ts`.\n',
    },
    {
      name: 'a longer word begins with a brand, or a dotted name ends with one',
      path: UI_CHAPTER,
      text: '# UI\n\nThe Reactive stream reads `module.React` lazily.\n',
    },
  ])('should find nothing when $name', ({ path, text }) => {
    // Act
    const findings = checked({
      path,
      text,
    });

    // Assert
    expect(findings).toStrictEqual([]);
  });
});

const SCREENS = 'blocks/domains/presentation/@foundation/screens.md';

const uiRule = (statement: string): string =>
  `# UI\n\n## General\n\n${rule({
    slug: 'forms-hold',
    statement,
  })}`;

describe('termsCheck on the axis and the reach of a rule', () => {
  it.each<{
    expected: readonly TermsFinding[];
    name: string;
    path: string;
    text: string;
  }>([
    {
      expected: [
        offAxis({
          axis: Axis.Foundation,
          path: UI_CHAPTER,
          slug: 'forms-hold',
          term: 'port',
          termAxis: Axis.Architecture,
        }),
      ],
      name: 'a rule of a domain on foundation uses a term of core on architecture',
      path: UI_CHAPTER,
      text: uiRule('Every form is one port.'),
    },
    {
      expected: [],
      name: 'a rule on architecture uses a term of architecture',
      path: PORTS,
      text: `# Ports\n\nA **port** names a need; a **binding unit** binds it, in **\`adapters/\`**{#adapter}, in a file **\`.port\`**{#port-file}. One binding unit binds one port.\n\n## General\n\n${rule(
        {
          slug: 'ports-named',
          statement: 'Every port is named by its need.',
        },
      )}`,
    },
    {
      expected: [
        outOfReach({
          owner: 'react/react-dom',
          path: UI_CHAPTER,
          term: 'portal',
        }),
      ],
      name: 'a rule uses a term of another axis that its block does not reach',
      path: UI_CHAPTER,
      text: uiRule('Every form opens a portal.'),
    },
    {
      expected: [],
      name: 'a rule writes in prose a folder of a block it does not reach',
      path: UI_CHAPTER,
      text: uiRule('Every form keeps overlays/ apart.'),
    },
  ])('should report as placement says when $name', ({ expected, path, text }) => {
    // Arrange
    const files = withCoreTerms(validFiles());

    files[PORTALS] =
      `# Portals\n\nA **portal** renders elsewhere, in **\`overlays/\`**{#overlay-folder}.\n\n## General\n\n${rule(
        {
          slug: 'portals-for-overlays',
        },
      )}`;
    files[path] = text;

    // Act
    const findings = termsCheck(checkInputOf(files));

    // Assert
    expect(findings).toStrictEqual(expected);
  });
});

describe('termsCheck on a nested tree', () => {
  it.each<{
    expected: readonly TermsFinding[];
    name: string;
    statement: string;
  }>([
    {
      expected: [
        {
          code: TermsCode.Unused,
          details: {
            term: 'wizard',
          },
          path: SCREENS,
        },
      ],
      name: 'no rule or definition uses a term',
      statement: 'Every screen shows one task.',
    },
    {
      expected: [],
      name: 'a rule uses a term in the plural',
      statement: 'Every screen shows one task, and wizards show one step.',
    },
  ])('should advise as needed when $name', ({ expected, statement }) => {
    // Arrange
    const files = nestedFiles();

    files[SCREENS] =
      `# Screens\n\n> Governs screens.\n\n## Vocabulary\n\nA **wizard** walks a user through steps.\n\n## General\n\n${rule(
        {
          slug: 'screen-shows-one-task',
          statement,
        },
      )}`;

    // Act
    const findings = termsCheck(checkInputOf(files));

    // Assert
    expect(findings).toStrictEqual(expected);
  });
});

describe('termsCheck on the terms no rule uses', () => {
  it.each<{
    expected: string[];
    name: string;
    vocabulary: string;
  }>([
    {
      expected: [
        'wizard',
      ],
      name: 'a term of a lead-in is set in bold with a capital',
      vocabulary: '**Wizard:** a guide through steps.',
    },
    {
      expected: [
        'one guided step flow',
      ],
      name: 'a term holds four words',
      vocabulary: 'A **one guided step flow** walks a user.',
    },
    {
      expected: [],
      name: 'a term holds five words',
      vocabulary: 'A **one more guided step flow** walks a user.',
    },
    {
      expected: [],
      name: 'a term is a name, not a concept',
      vocabulary: 'The **Acme Cloud** hosts the screens.',
    },
    {
      expected: [],
      name: 'a term ending in s is used in its plural',
      vocabulary: 'A **status** is where a task stands.',
    },
  ])('should advise on exactly the unused terms when $name', ({ expected, vocabulary }) => {
    // Arrange
    const files = nestedFiles();

    files[SCREENS] =
      `# Screens\n\n> Governs screens.\n\n## Vocabulary\n\n${vocabulary}\n\n## General\n\n${rule({
        slug: 'screen-shows-one-task',
        statement: 'Every screen shows the statuses of one task.',
      })}`;

    // Act
    const findings = termsCheck(checkInputOf(files));

    // Assert
    expect(
      findings.map((finding) =>
        finding.code === TermsCode.Unused ? finding.details.term : finding.code,
      ),
    ).toStrictEqual(expected);
  });
});

describe('termsCheck on rules with examples', () => {
  it('should advise on a term only an example uses, reading no example as a use', () => {
    // Arrange
    const files = nestedFiles();

    files[SCREENS] =
      `# Screens\n\n> Governs screens.\n\n## Vocabulary\n\nA **wizard** is a guide through steps.\n\n## General\n\n${rule(
        {
          examples: '```text title="Prefer"\nwizard wizard\n```',
          slug: 'screen-shows-one-task',
          statement: 'Every screen shows one task.',
        },
      )}`;

    // Act
    const findings = termsCheck(checkInputOf(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        code: TermsCode.Unused,
        details: {
          term: 'wizard',
        },
        path: SCREENS,
      },
    ]);
  });
});
