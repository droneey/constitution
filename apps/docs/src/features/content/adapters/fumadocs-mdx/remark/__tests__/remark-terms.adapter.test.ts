import { describe, expect, it } from 'bun:test';

import { goldenText } from '#/__tests__/golden.fixtures';

import { Axis, Term, TermKind } from '../../../../domain/entities';
import { remarkTerms } from '../remark-terms.adapter';
import type { MarkdownVariant } from './html.fixtures';
import { htmlOfVariants } from './html.fixtures';

const bun = Term.create({
  address: '/docs/implementations/bun',
  axis: Axis.Foundation,
  blockId: 'bun',
  kind: TermKind.Brand,
  name: 'Bun',
  sentence: '**Bun**{#runtime} runs the program, as [its docs](https://bun.sh) say.',
});

const widgets = Term.create({
  address: '/docs/domains/ui/architecture/components',
  axis: Axis.Architecture,
  blockId: 'ui',
  kind: TermKind.Folder,
  name: 'widgets/',
  sentence: '### The **widgets/** folder',
});

const bindingUnit = Term.create({
  address: '/docs/core/architecture/layout',
  axis: Axis.Architecture,
  blockId: 'core',
  kind: TermKind.Concept,
  name: 'binding unit',
  sentence: 'A binding unit binds.',
});

const viewSuffix = Term.create({
  address: '/docs/domains/ui/architecture/screens',
  axis: Axis.Architecture,
  blockId: 'ui',
  kind: TermKind.Suffix,
  name: '.view',
  sentence: '',
});

describe('remarkTerms', () => {
  it('should set the table of terms the golden file shows where a page holds the block of terms, and leave other code', async () => {
    // Arrange
    const variants = {
      'terms defined in prose, in a heading and nowhere, beside other code': {
        markdown: '# Terms\n\n```terms\nThe table.\n```\n\n```ts\nconst terms = 1;\n```\n',
        plugins: [
          [
            remarkTerms,
            {
              terms: [
                bun,
                widgets,
                bindingUnit,
                viewSuffix,
              ],
            },
          ],
        ],
      },
    } satisfies Readonly<Record<string, MarkdownVariant>>;

    // Act
    const html = htmlOfVariants(variants);

    // Assert
    expect(html).toBe(
      await goldenText(new URL('remark-terms.adapter.golden.html', import.meta.url), html),
    );
  });
});
