import { describe, expect, it } from 'bun:test';

import { UnitRelativePath } from '#/kernel/value-objects';

import { LineRange } from '../../../value-objects';
import { MutationTarget } from '../mutation-target.entity.ts';

const cartPath = UnitRelativePath.create('src/cart.utils.ts');
const taxPath = UnitRelativePath.create('src/tax.utils.ts');
const feePath = UnitRelativePath.create('src/fee.utils.ts');
const couponPath = UnitRelativePath.create('src/coupon.utils.ts');
const readmePath = UnitRelativePath.create('README.md');

const thirdLine = LineRange.create({
  endLine: 3,
  startLine: 3,
});
const lastLines = LineRange.create({
  endLine: 9,
  startLine: 7,
});

describe('MutationTarget.targetsOf', () => {
  it('should target each new file mutated whole, then each line range of a mutated file whose code changed', () => {
    // Act
    const targets = MutationTarget.targetsOf({
      changedFiles: [
        {
          filePath: cartPath,
          lineRanges: [
            thirdLine,
            lastLines,
          ],
        },
        {
          filePath: taxPath,
          lineRanges: [
            thirdLine,
          ],
        },
        {
          filePath: readmePath,
          lineRanges: [
            thirdLine,
          ],
        },
      ],
      codeChangedPaths: new Set([
        cartPath,
        readmePath,
      ]),
      mutatedPaths: new Set([
        cartPath,
        taxPath,
        couponPath,
      ]),
      newFilePaths: [
        feePath,
        couponPath,
      ],
    });

    // Assert
    expect(targets).toStrictEqual([
      {
        filePath: couponPath,
      },
      {
        filePath: cartPath,
        lineRange: thirdLine,
      },
      {
        filePath: cartPath,
        lineRange: lastLines,
      },
    ]);
  });

  it('should target nothing when the branch changed no file it mutates', () => {
    // Act
    const targets = MutationTarget.targetsOf({
      changedFiles: [
        {
          filePath: readmePath,
          lineRanges: [
            thirdLine,
          ],
        },
      ],
      codeChangedPaths: new Set(),
      mutatedPaths: new Set(),
      newFilePaths: [
        feePath,
      ],
    });

    // Assert
    expect(targets).toStrictEqual([]);
  });
});
