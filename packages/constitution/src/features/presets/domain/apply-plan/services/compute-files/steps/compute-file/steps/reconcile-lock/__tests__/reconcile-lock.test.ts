import { describe, expect, it } from 'bun:test';

import { Lock } from '../../../../../../../../lock/entities';
import { Leaf } from '../../../../../../../../setting/entities';
import { recordOf } from '../reconcile-lock';

describe('recordOf', () => {
  it('should keep no address field when the file held every leaf of ours first', () => {
    // Arrange
    const ours = {
      'rules[name=size]': {
        level: 'error',
      },
    };

    // Act
    const record = recordOf({
      everMetDefaults: [],
      fields: [
        'name',
      ],
      heldBefore: new Set(Leaf.leavesOf(ours).map(Leaf.keyOf)),
      isCreatedByApply: false,
      lock: Lock.emptyRecord,
      ours,
    });

    // Assert
    expect(record.addresses).toStrictEqual([]);
  });
});
