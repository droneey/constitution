import type { Layer } from '#/kernel/constants';
import { LAYER_ARTICLE } from '#/shared/cli';

const ROOT = '<root>';

const aBlock = (layer: Layer): string => `${LAYER_ARTICLE[layer]} ${layer} block`;

const fieldOf = (field: string): string => (field === '' ? ROOT : field);

interface ListInput {
  readonly conjunction: string;
  readonly names: readonly string[];
}

const listOf = (input: ListInput): string =>
  input.names.length > 1
    ? `${input.names.slice(0, -1).join(', ')} ${input.conjunction} ${input.names.at(-1)}`
    : // Stryker disable next-line StringLiteral: one name or none needs no separator
      input.names.join('');

const blocksOf = (layers: readonly Layer[]): string =>
  listOf({
    conjunction: 'or',
    names: layers.map((layer) => `${layer} blocks`),
  });

export { aBlock, blocksOf, fieldOf, listOf };
