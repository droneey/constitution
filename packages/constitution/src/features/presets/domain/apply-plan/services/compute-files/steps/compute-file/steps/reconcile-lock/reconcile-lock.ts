import type { SettingsRecord } from '../../../../../../../lock/entities';
import { Lock } from '../../../../../../../lock/entities';
import type { Setting } from '../../../../../../../setting/entities';
import { Leaf } from '../../../../../../../setting/entities';
import type { FileFormat } from '../../../../../../../shared/value-objects';

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
  readonly everMetDefaults: readonly string[];
  readonly fields: readonly string[];
  readonly format?: FileFormat;
  readonly heldBefore: ReadonlySet<string>;
  readonly isCreatedByApply: boolean;
  readonly lock: SettingsRecord;
  readonly ours: Setting;
}

const recordOf = (input: RecordInput): SettingsRecord => {
  const locked = new Set(input.lock.leaves);
  const leaves = Leaf.leavesOf(input.ours)
    .map(Leaf.keyOf)
    .filter((key) => locked.has(key) || !input.heldBefore.has(key));

  return {
    ...Lock.emptyRecord,
    addresses: leaves.length === 0 ? [] : input.fields,
    everMetDefaults: input.everMetDefaults,
    // Why: the format a file was written in reads it again once no entry writes it, and only a
    // file that holds what an apply wrote needs reading again.
    ...(leaves.length === 0 || input.format === undefined
      ? {}
      : {
          format: input.format,
        }),
    isCreatedByApply: input.isCreatedByApply,
    leaves,
  };
};

export type { RecordInput, RemoveStaleInput, StaleRemoved };
export { recordOf, removeStale };
