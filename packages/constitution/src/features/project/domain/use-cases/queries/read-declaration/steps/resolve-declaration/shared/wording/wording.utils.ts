import type { BlockId } from '#/kernel/value-objects';
import { UnitPath } from '#/kernel/value-objects';

/** The heirs a warning offers in place of an abstract block: "a, b or c", or one of them unnamed. */
const heirsText = (heirs: readonly BlockId[]): string =>
  heirs.length === 0
    ? 'one of its heirs'
    : heirs
        .map((heir, index) => {
          if (index === 0) {
            return heir;
          }

          return `${index === heirs.length - 1 ? ' or ' : ', '}${heir}`;
        })
        .join('');

/** " in <unit>" for a member, as a warning names where it holds; nothing for the repository. */
const whereText = (unit: UnitPath): string => (UnitPath.isRepository(unit) ? '' : ` in ${unit}`);

export { heirsText, whereText };
