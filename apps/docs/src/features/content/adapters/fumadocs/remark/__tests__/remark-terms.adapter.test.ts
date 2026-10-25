import { describe, expect, it } from 'bun:test';

import type { PhrasingContent, TableCell, TableRow } from 'mdast';

import { Term, TermKind } from '../../../../domain/entities';
import { remarkTerms } from '../remark-terms.adapter';
import { inlineCode, link, text, treeOf, withoutPositions } from './mdast.fixtures';

const cell = (children: PhrasingContent[]): TableCell => ({
  children,
  type: 'tableCell',
});

const row = (cells: PhrasingContent[][]): TableRow => ({
  children: cells.map(cell),
  type: 'tableRow',
});

const bun = Term.create({
  address: '/docs/implementations/bun',
  axis: 'foundation',
  block: 'bun',
  kind: TermKind.Brand,
  name: 'Bun',
  sentence: '**Bun** runs the program, as [its docs](https://bun.sh) say.',
});

const widgets = Term.create({
  address: '/docs/domains/ui/architecture/components',
  axis: 'architecture',
  block: 'ui',
  kind: TermKind.Folder,
  name: 'widgets/',
  sentence: '',
});

const bindingUnit = Term.create({
  address: '/docs/core/architecture/layout',
  axis: 'architecture',
  block: 'core',
  kind: TermKind.Concept,
  name: 'binding unit',
  sentence: 'A binding unit binds.',
});

describe('remarkTerms', () => {
  it('should set the table of terms where a page holds the block of terms, and leave other code', () => {
    // Arrange
    const tree = treeOf('# Terms\n\n```terms\nThe table.\n```\n\n```ts\nconst terms = 1;\n```\n');

    // Act
    remarkTerms({
      terms: [
        bun,
        widgets,
        bindingUnit,
      ],
    })(tree);

    // Assert
    expect(withoutPositions(tree)).toStrictEqual({
      children: [
        ...treeOf('# Terms').children,
        {
          align: [
            null,
            null,
            null,
            null,
            null,
          ],
          children: [
            row([
              [
                text('Term'),
              ],
              [
                text('Kind'),
              ],
              [
                text('Block'),
              ],
              [
                text('Axis'),
              ],
              [
                text('Definition'),
              ],
            ]),
            row([
              [
                link(bun.address, [
                  text('Bun'),
                ]),
              ],
              [
                text('brand'),
              ],
              [
                text('bun'),
              ],
              [
                text('foundation'),
              ],
              [
                {
                  children: [
                    text('Bun'),
                  ],
                  type: 'strong',
                },
                text(' runs the program, as '),
                text('its docs'),
                text(' say.'),
              ],
            ]),
            row([
              [
                link(widgets.address, [
                  inlineCode('widgets/'),
                ]),
              ],
              [
                text('folder'),
              ],
              [
                text('ui'),
              ],
              [
                text('architecture'),
              ],
              [
                text(''),
              ],
            ]),
            row([
              [
                link(bindingUnit.address, [
                  text('binding unit'),
                ]),
              ],
              [
                text('concept'),
              ],
              [
                text('core'),
              ],
              [
                text('architecture'),
              ],
              [
                text('A binding unit binds.'),
              ],
            ]),
          ],
          type: 'table',
        },
        ...treeOf('```ts\nconst terms = 1;\n```').children,
      ],
      type: 'root',
    });
  });
});
