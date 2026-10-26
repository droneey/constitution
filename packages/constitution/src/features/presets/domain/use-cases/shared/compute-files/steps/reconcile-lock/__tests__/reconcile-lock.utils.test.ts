import { describe, expect, it } from 'bun:test';

import { Leaf, Lock } from '../../../../../../entities';
import { recordOf } from '../reconcile-lock.utils';

const ours = {
  'rules[name=size]': {
    level: 'error',
  },
};

describe('recordOf', () => {
  it.each<{
    addresses: readonly string[];
    condition: string;
    heldBefore: readonly string[];
  }>([
    {
      addresses: [
        'name',
      ],
      condition: 'a leaf of ours is the apply’s',
      heldBefore: [],
    },
    {
      addresses: [],
      condition: 'the file held every leaf of ours first',
      heldBefore: Leaf.leavesOf(ours).map(Leaf.keyOf),
    },
  ])(
    'should keep the address fields only while a leaf is ours when $condition',
    ({ addresses, heldBefore }) => {
      // Act
      const record = recordOf({
        defaults: [],
        fields: [
          'name',
        ],
        heldBefore: new Set(heldBefore),
        isCreated: false,
        lock: Lock.emptyRecord,
        ours,
      });

      // Assert
      expect(record.addresses).toStrictEqual(addresses);
    },
  );
});
