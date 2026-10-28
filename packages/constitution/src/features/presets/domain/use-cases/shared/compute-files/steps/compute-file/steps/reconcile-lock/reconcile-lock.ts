import type { Setting, SettingsRecord } from '../../../../../../../entities';
import { Leaf, Lock } from '../../../../../../../entities';

interface RemoveStaleInput {
  readonly fields: readonly string[];
  readonly fileSetting: Setting;
  readonly lock: SettingsRecord;
  readonly ours: Setting;
}

interface StaleRemoved {
  readonly removed: readonly Leaf[];
  readonly value: Setting;
}

/**
 * The file without what an earlier apply wrote and no entry gives any longer: a leaf the lock names
 * that ours lacks, its emptied maps, lists and elements gone with it; a value the user wrote stays.
 */
const removeStale = (input: RemoveStaleInput): StaleRemoved => {
  const locked = new Set(input.lock.leaves);
  const kept = new Set(Leaf.leavesOf(input.ours).map(Leaf.keyOf));
  const removed: Leaf[] = [];
  let left = input.fileSetting;

  for (const leaf of Leaf.fileLeavesOf(input.fileSetting, input.fields)) {
    const key = Leaf.keyOf(leaf);
    const without = locked.has(key) && !kept.has(key) ? Leaf.removedFrom(left, leaf) : undefined;

    if (without !== undefined) {
      removed.push(leaf);
      left = without;
    }
  }

  return {
    removed,
    value: left,
  };
};

interface RecordInput {
  readonly defaults: readonly string[];
  readonly fields: readonly string[];
  /** the keys of our leaves the file held before the apply */
  readonly heldBefore: ReadonlySet<string>;
  readonly isCreated: boolean;
  readonly lock: SettingsRecord;
  readonly ours: Setting;
}

/**
 * What the lock keeps of a file: our leaves the apply wrote, or that the lock held already, never
 * one the user's file held first; the address fields while any leaf is ours; the defaults met.
 */
const recordOf = (input: RecordInput): SettingsRecord => {
  const locked = new Set(input.lock.leaves);
  const leaves = Leaf.leavesOf(input.ours)
    .map(Leaf.keyOf)
    .filter((key) => locked.has(key) || !input.heldBefore.has(key));

  return {
    ...Lock.emptyRecord,
    addresses: leaves.length === 0 ? [] : input.fields,
    defaults: input.defaults,
    isCreated: input.isCreated,
    leaves,
  };
};

export type { RecordInput, RemoveStaleInput, StaleRemoved };
export { recordOf, removeStale };
