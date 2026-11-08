import { BlockFormat, Layer, PATH_SEPARATOR } from '#/kernel/constants';
import type { FindingOf, ProblemOf } from '#/kernel/types';
import { BlockId } from '#/kernel/value-objects';

import type { BlockFile } from '../../../../block/entities';
import { Block, BlockFileRole } from '../../../../block/entities';
import { BlockGraph } from '../../../../block-graph/entities';
import { LANGUAGE_NAMES, WORLD_NAMES } from '../../../constants';
import { findingsAt, proseOf } from '../../../utils';
import type { Check, CheckInput } from '../check.types';

enum NamesCode {
  CoreNamesProduct = 'core-names-product',
  ProductOutOfReach = 'product-out-of-reach',
  ProductOfNoBlock = 'product-of-no-block',
  ParentNamesChild = 'parent-names-child-product',
}

interface NamesDetails {
  readonly [NamesCode.CoreNamesProduct]: {
    readonly name: string;
  };
  readonly [NamesCode.ProductOutOfReach]: {
    readonly name: string;
    readonly owner: BlockId;
  };
  readonly [NamesCode.ProductOfNoBlock]: {
    readonly name: string;
  };
  readonly [NamesCode.ParentNamesChild]: {
    readonly child: BlockId;
    readonly name: string;
  };
}

type NamesFinding = FindingOf<NamesDetails>;

type NamesProblem = ProblemOf<NamesDetails>;

interface Named {
  readonly name: string;
  readonly owner?: BlockId;
}

const TITLE_MARK = '# ';
const KIND_TITLE = / [a-z]\S*$/;
const NAME_BEFORE = '(?<![\\w.@/-])';
const NAME_AFTER = '(?![\\w])';
// Why: a name followed by another capitalised word is part of a longer proper name, as a standard
// named after its vendor is.
const LONGER_NAME = /^ [A-Z]/;

const titleOf = (block: Block): string | undefined =>
  block.passport.body
    .split('\n')
    .find((line) => line.startsWith(TITLE_MARK))
    ?.slice(TITLE_MARK.length)
    .trim();

// Why: a title whose last word opens in lower case, such as "Task runner", names a kind of tool,
// which no project installs by that name.
const isProductTitle = (title: string): boolean => !KIND_TITLE.test(title);

const languageNamesOf = (blocks: readonly Block[]): readonly Named[] => {
  const mapped = LANGUAGE_NAMES.map(({ language, name }) => ({
    name,
    owner: BlockId.create(language),
  }));
  const owners = new Set(mapped.map(({ owner }) => owner));

  return [
    ...mapped,
    ...blocks
      .filter((block) => block.layer === Layer.Language && !owners.has(block.id))
      .flatMap((block) => {
        const title = titleOf(block);

        return title === undefined
          ? []
          : [
              {
                name: title,
                owner: block.id,
              },
            ];
      }),
  ];
};

const productNamesOf = (blocks: readonly Block[]): readonly Named[] =>
  blocks
    .filter((block) => block.layer === Layer.Implementation)
    .flatMap((block) => {
      const title = titleOf(block);

      return title === undefined || !isProductTitle(title)
        ? []
        : [
            {
              name: title,
              owner: block.id,
            },
          ];
    });

const productRegistryOf = (blocks: readonly Block[]): readonly Named[] => [
  ...WORLD_NAMES.map((name) => ({
    name,
  })),
  ...productNamesOf(blocks),
];

// Why: a domain or an implementation names a language as the format it reads or writes, which a
// word cannot tell from a rule on the language itself; core names none, and a context names
// another's only within reach.
const languageCheckedLayers: ReadonlySet<Layer> = new Set([
  Layer.Core,
  Layer.Language,
  Layer.Platform,
]);

const matcherOf = (registry: readonly Named[]): ((text: string) => readonly Named[]) => {
  const names = registry
    .map(({ name }) => name)
    .toSorted((left, right) => right.length - left.length);
  const pattern = new RegExp(
    `${NAME_BEFORE}(?:${names.map((name) => RegExp.escape(name)).join('|')})${NAME_AFTER}`,
    'g',
  );

  return (text: string): readonly Named[] => {
    const found = new Set(
      [
        ...text.matchAll(pattern),
      ]
        .filter((match) => !LONGER_NAME.test(text.slice(match.index + match[0].length)))
        .map((match) => match[0]),
    );

    return registry.filter(({ name }) => found.has(name));
  };
};

const isUnder = (child: BlockId, parent: BlockId): boolean =>
  child.startsWith(`${parent}${PATH_SEPARATOR}`);

const problemOf = (input: {
  block: Block;
  named: Named;
  reached: ReadonlySet<BlockId>;
}): NamesProblem | undefined => {
  const { name, owner } = input.named;

  if (input.block.layer === Layer.Core) {
    return {
      code: NamesCode.CoreNamesProduct,
      details: {
        name,
      },
    };
  }

  if (owner === undefined) {
    return {
      code: NamesCode.ProductOfNoBlock,
      details: {
        name,
      },
    };
  }

  if (input.reached.has(owner)) {
    return undefined;
  }

  return isUnder(owner, input.block.id)
    ? {
        code: NamesCode.ParentNamesChild,
        details: {
          child: owner,
          name,
        },
      }
    : {
        code: NamesCode.ProductOutOfReach,
        details: {
          name,
          owner,
        },
      };
};

interface Matchers {
  readonly languages: (text: string) => readonly Named[];
  readonly products: (text: string) => readonly Named[];
}

const fileFindings = (input: {
  block: Block;
  file: BlockFile;
  graph: BlockGraph;
  matchers: Matchers;
}): readonly NamesFinding[] => {
  const { block, file } = input;

  if (block.layer === Layer.Core && file.role === BlockFileRole.Passport) {
    return [];
  }

  const reached = BlockGraph.reachableFrom(input.graph, Block.placeOf(block, file));

  const text = proseOf(file.body);
  const named = [
    ...input.matchers.products(text),
    ...(languageCheckedLayers.has(block.layer) ? input.matchers.languages(text) : []),
  ];

  return findingsAt(
    file.path,
    named.map((one) =>
      problemOf({
        block,
        named: one,
        reached,
      }),
    ),
  );
};

const namesCheck: Check<NamesFinding> = ({
  constitution,
  graph,
}: CheckInput): readonly NamesFinding[] => {
  if (constitution.format !== BlockFormat.Nested) {
    return [];
  }

  const matchers: Matchers = {
    languages: matcherOf(languageNamesOf(constitution.blocks)),
    products: matcherOf(productRegistryOf(constitution.blocks)),
  };

  return constitution.blocks.flatMap((block) =>
    Block.filesOf(block).flatMap((file) =>
      fileFindings({
        block,
        file,
        graph,
        matchers,
      }),
    ),
  );
};

export type { NamesDetails };
export { NamesCode, namesCheck };
