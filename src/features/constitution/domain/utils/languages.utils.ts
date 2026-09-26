import { compareText } from '#/kernel';

import type { Rule } from '../entities';
import type { BlocksById } from './closure.utils';
import { closureOf } from './closure.utils';

// A block's languages are the language blocks among itself and its closure;
// none means the block's rules hold for every language.
const languagesOf = (input: {
  blockId: string;
  byId: BlocksById;
}): readonly string[] =>
  [
    input.blockId,
    ...closureOf(input),
  ]
    .filter((id) => input.byId.get(id)?.layer === 'language')
    .toSorted(compareText);

// A rule of a with/ file holds only where both blocks do, so it takes the
// languages of both.
const ruleLanguagesOf = (input: {
  byId: BlocksById;
  rule: Rule;
}): readonly string[] => {
  const { rule } = input;
  const blockIds =
    // Stryker disable next-line ConditionalExpression: no block has the id undefined
    rule.with === undefined
      ? [
          rule.block,
        ]
      : [
          rule.block,
          rule.with,
        ];

  return [
    ...new Set(
      blockIds.flatMap((blockId) =>
        languagesOf({
          blockId,
          byId: input.byId,
        }),
      ),
    ),
  ].toSorted(compareText);
};

export { languagesOf, ruleLanguagesOf };
