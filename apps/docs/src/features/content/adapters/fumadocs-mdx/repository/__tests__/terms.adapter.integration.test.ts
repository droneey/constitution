import { afterEach, describe, expect, it } from 'bun:test';

import { Axis, TermKind } from '../../../../domain/entities';
import { termsOf } from '../terms.adapter';
import { enterRepository } from './repository.fixtures';

const BLOCKS = 'packages/constitution/blocks';

const repository = {
  leave: (): void => undefined,
};

afterEach(() => {
  repository.leave();
  repository.leave = (): void => undefined;
});

describe('termsOf', () => {
  it('should read each term with its owner, its axis, its sentence and the rule that defines it, by name', () => {
    // Arrange
    repository.leave = enterRepository({
      files: {
        [`${BLOCKS}/core/architecture/root.md`]: [
          '# Root',
          '',
          '> Governs the root.',
          '',
          '## Wiring',
          '',
          '### composition-root-wires-everything · MUST',
          '',
          'The **composition root** chooses every implementation.  It wires the program, its **graph**.',
          '',
          '#### An example',
          '',
          'It registers each **delivery  unit**.',
          '',
          '## Notes',
          '',
          '### Not a rule',
          '',
          'A **note** below a heading that is no rule.',
          '',
          '- **Wiring file.** The one file it writes, beside a [link](layout.md).',
          '',
        ].join('\n'),
        [`${BLOCKS}/implementations/bun/bun.md`]: [
          '---',
          'id: bun',
          'summary: Runs **Not a term**.',
          'governs: ["**/bunfig.toml"]',
          '---',
          '',
          '# Bun',
          '',
          '> **Bun** runs the program, and **`bunfig.toml`** holds its settings.',
          '',
          'Plain **emphasis `here`** defines nothing, nor do **`here` and there** or `**/root/**`.',
          '',
        ].join('\n'),
        [`${BLOCKS}/README.md`]: 'A **file of no block** defines no term.\n',
        [`${BLOCKS}/implementations/bun/foundation/notes.txt`]: '**Not a term**\n',
        [`${BLOCKS}/implementations/bun/foundation/runtime.md`]: [
          'An **early** term, before any heading.',
          '',
          '---',
          '',
          'A **thematic** term between two breaks.',
          '',
          '---',
          '',
          '## looks-like-a-rule · MUST',
          '',
          'A **section** term, below a heading above the rules.',
          '',
        ].join('\n'),
      },
    }).leave;

    // Act
    const terms = termsOf('/docs');

    // Assert
    expect(terms).toStrictEqual([
      {
        address: '/docs/implementations/bun',
        axis: Axis.Foundation,
        block: 'bun',
        kind: TermKind.Brand,
        name: 'Bun',
        sentence: '**Bun** runs the program, and **`bunfig.toml`** holds its settings.',
      },
      {
        address: '/docs/implementations/bun',
        axis: Axis.Foundation,
        block: 'bun',
        kind: TermKind.File,
        name: 'bunfig.toml',
        sentence: '**Bun** runs the program, and **`bunfig.toml`** holds its settings.',
      },
      {
        address: '/docs/core/architecture/root#composition-root-wires-everything',
        axis: Axis.Architecture,
        block: 'core',
        kind: TermKind.Concept,
        name: 'composition root',
        sentence: 'The **composition root** chooses every implementation.',
      },
      {
        address: '/docs/core/architecture/root#composition-root-wires-everything',
        axis: Axis.Architecture,
        block: 'core',
        kind: TermKind.Concept,
        name: 'delivery unit',
        sentence: 'It registers each **delivery  unit**.',
      },
      {
        address: '/docs/implementations/bun/foundation/runtime',
        axis: Axis.Foundation,
        block: 'bun',
        kind: TermKind.Concept,
        name: 'early',
        sentence: 'An **early** term, before any heading.',
      },
      {
        address: '/docs/core/architecture/root#composition-root-wires-everything',
        axis: Axis.Architecture,
        block: 'core',
        kind: TermKind.Concept,
        name: 'graph',
        sentence: 'It wires the program, its **graph**.',
      },
      {
        address: '/docs/core/architecture/root',
        axis: Axis.Architecture,
        block: 'core',
        kind: TermKind.Concept,
        name: 'note',
        sentence: 'A **note** below a heading that is no rule.',
      },
      {
        address: '/docs/implementations/bun/foundation/runtime',
        axis: Axis.Foundation,
        block: 'bun',
        kind: TermKind.Concept,
        name: 'section',
        sentence: 'A **section** term, below a heading above the rules.',
      },
      {
        address: '/docs/implementations/bun/foundation/runtime',
        axis: Axis.Foundation,
        block: 'bun',
        kind: TermKind.Concept,
        name: 'thematic',
        sentence: 'A **thematic** term between two breaks.',
      },
      {
        address: '/docs/core/architecture/root',
        axis: Axis.Architecture,
        block: 'core',
        kind: TermKind.Concept,
        name: 'wiring file',
        sentence: '**Wiring file.** The one file it writes, beside a [link](layout.md).',
      },
    ]);
  });
});
