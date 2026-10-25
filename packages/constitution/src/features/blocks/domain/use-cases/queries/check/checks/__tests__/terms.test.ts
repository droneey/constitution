import { describe, expect, it } from 'bun:test';

import { Axis } from '#/kernel/constants';
import type { FindingOf } from '#/kernel/types';
import { BlockId, coreBlockId } from '#/kernel/value-objects';

import type { Files } from '../../../../../../__tests__/constitution.fixtures';
import {
  checkInputOf,
  passportFile,
  rule,
  textOf,
} from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { TermKind } from '../../shared/terms';
import type { TermsDetails } from '../terms';
import { TermsCode, termsCheck } from '../terms';

const CORE = 'blocks/core/core.md';
const PRINCIPLES = 'blocks/core/foundation/principles.md';
const PORTS = 'blocks/core/architecture/ports.md';
const WORKFLOW = 'blocks/core/workflow/workflow.md';
const UI = 'blocks/domains/ui/ui.md';
const UI_CHAPTER = 'blocks/domains/ui/foundation/forms.md';
const LINGUI = 'blocks/implementations/lingui/lingui.md';

// Core's terms of the architecture and of the workflow, which the cases below use.
const withCoreTerms = (files: Files): Files => ({
  ...files,
  [PORTS]:
    '# Ports\n\nA **port** names a need; a **binding unit** binds it, in **`adapters/`**, in a file **`.port`**.\n',
  [WORKFLOW]: `# Workflow\n\nA **squash merge** lands **\`feature/\`** branches.\n\n## General\n\n${rule(
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
  term: string;
  termAxis: Axis;
}): TermsFinding => ({
  code: TermsCode.OffAxis,
  details: {
    axis: input.axis,
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
    files[LINGUI] = textOf({
      files,
      path: LINGUI,
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
          firstFile: 'blocks/implementations/biome/biome.md',
          term: 'Biome',
        },
        path: LINGUI,
      },
      outOfReach({
        owner: 'biome',
        path: LINGUI,
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
      name: 'a chapter of foundation uses a concept in the plural and in capitals',
      path: PRINCIPLES,
      text: '# Principles\n\nTwo Ports meet.\n',
    },
    {
      expected: [
        inFoundation('binding unit'),
      ],
      name: 'a line break splits a concept of two words',
      path: PRINCIPLES,
      text: '# Principles\n\nEach binding\nunit ships.\n',
    },
    {
      expected: [
        inFoundation('port'),
        inFoundation('adapters/'),
        inFoundation('.port'),
      ],
      name: 'a path holds a folder and a file name a suffix',
      path: PRINCIPLES,
      text: '# Principles\n\nCode lives in `src/adapters/http/x.port.go`.\n',
    },
    {
      expected: [
        offAxis({
          axis: Axis.Foundation,
          path: PRINCIPLES,
          term: 'squash merge',
          termAxis: Axis.Workflow,
        }),
        offAxis({
          axis: Axis.Foundation,
          path: PRINCIPLES,
          term: 'feature/',
          termAxis: Axis.Workflow,
        }),
      ],
      name: 'a chapter of foundation uses terms of the workflow',
      path: PRINCIPLES,
      text: '# Principles\n\nSquash merges land on feature/login.\n',
    },
    {
      expected: [
        offAxis({
          axis: Axis.Workflow,
          path: WORKFLOW,
          term: 'port',
          termAxis: Axis.Architecture,
        }),
      ],
      name: 'a workflow chapter uses a term of the architecture',
      path: WORKFLOW,
      text: '# Workflow\n\nA **squash merge** lands **`feature/`** and touches one port.\n',
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
        outOfReach({
          owner: 'typescript',
          path: UI_CHAPTER,
          term: '.ts',
        }),
        outOfReach({
          owner: 'typescript',
          path: UI_CHAPTER,
          term: 'index.ts',
        }),
      ],
      name: 'a domain names them in prose and in inline code',
      path: UI_CHAPTER,
      text: '# UI\n\nEach screen is one `index.ts` in TypeScript.\n',
    },
    {
      expected: [
        outOfReach({
          owner: '_react',
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
          owner: '_react',
          path: UI_CHAPTER,
          term: 'React',
        }),
        outOfReach({
          owner: 'react-dom',
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

  it('should report a folder and a suffix written in backticks without their mark', () => {
    // Act
    const findings = checked({
      path: PORTS,
      text: '# Ports\n\nA **port** names a need; a **binding unit** binds it, in **`adapters/`** — not `adapters` — in a file **`.port`**, not `port`; see `adapters/http`.\n',
    });

    // Assert
    expect(findings).toStrictEqual([
      {
        code: TermsCode.Misspelled,
        details: {
          kind: TermKind.Folder,
          owner: coreBlockId,
          term: 'adapters/',
          written: 'adapters',
        },
        path: PORTS,
      },
      {
        code: TermsCode.Misspelled,
        details: {
          kind: TermKind.Suffix,
          owner: coreBlockId,
          term: '.port',
          written: 'port',
        },
        path: PORTS,
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
      })}\n###### Binding units\n\n\`\`\`ts\nconst port = import("adapters/x.port");\n\`\`\`\n`,
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
      path: 'blocks/domains/ui/architecture/forms.md',
      text: '# UI\n\nEach port keeps its binding unit.\n',
    },
    {
      name: 'a with/ file named after the owner names its terms',
      path: 'blocks/contexts/platforms/browser/foundation/with/typescript.md',
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
