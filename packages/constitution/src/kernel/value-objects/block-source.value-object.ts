import { fieldsOf } from '../utils';
import { PackPath } from './pack-path.value-object';

enum SourceKind {
  Release = 'release',
  Pack = 'pack',
}

type BlockSource =
  | {
      readonly kind: SourceKind.Release;
    }
  | {
      readonly kind: SourceKind.Pack;
      readonly pack: PackPath;
    };

const create = (pack?: PackPath): BlockSource =>
  pack === undefined
    ? {
        kind: SourceKind.Release,
      }
    : {
        kind: SourceKind.Pack,
        pack,
      };

const equals = (left: BlockSource, right: BlockSource): boolean =>
  // Stryker disable next-line ConditionalExpression,LogicalOperator: the test only narrows the type; the release's absent pack never equals a pack's path
  left.kind === SourceKind.Pack && right.kind === SourceKind.Pack
    ? PackPath.equals(left.pack, right.pack)
    : left.kind === right.kind;

const is = (candidate: unknown): candidate is BlockSource => {
  const fields = fieldsOf(candidate);
  const kind = fields.get('kind');

  return (
    kind === SourceKind.Release || (kind === SourceKind.Pack && PackPath.is(fields.get('pack')))
  );
};

const BlockSource = {
  create,
  equals,
  is,
} as const;

export { BlockSource, SourceKind };
