import { compareText } from '#/kernel/utils';
import { UnitRelativePath } from '#/kernel/value-objects';

import type { Lock, LockRecord } from '../../domain/lock/entities';
import { Lock as Locks, RecordKind } from '../../domain/lock/entities';
import type { LockRecordWire, LockWire } from './models';

const NEWLINE = '\n';
const INDENT = '  ';

const recordOfWire = (wire: LockRecordWire): LockRecord =>
  'whole' in wire
    ? Locks.wholeRecord
    : {
        addresses: wire.addresses ?? [],
        everMetDefaults: wire.defaults ?? [],
        ...(wire.format === undefined
          ? {}
          : {
              format: wire.format,
            }),
        isCreatedByApply: wire.created === true,
        kind: RecordKind.Settings,
        leaves: wire.leaves ?? [],
      };

const lockOfWire = (wire: LockWire): Lock =>
  Object.fromEntries(
    Object.entries(wire).map(([filePath, record]) => [
      UnitRelativePath.create(filePath),
      recordOfWire(record),
    ]),
  );

const wireOfRecord = (record: LockRecord): LockRecordWire => {
  if (record.kind === RecordKind.Whole) {
    return {
      whole: true,
    };
  }

  return {
    ...(record.leaves.length === 0
      ? {}
      : {
          leaves: [
            ...record.leaves,
          ],
        }),
    ...(record.addresses.length === 0
      ? {}
      : {
          addresses: [
            ...record.addresses,
          ],
        }),
    ...(record.everMetDefaults.length === 0
      ? {}
      : {
          defaults: [
            ...record.everMetDefaults,
          ],
        }),
    ...(record.isCreatedByApply
      ? {
          created: true,
        }
      : {}),
    // Stryker disable next-line ConditionalExpression: JSON writes no undefined format either
    ...(record.format === undefined
      ? {}
      : {
          format: record.format,
        }),
  };
};

// Why: one file to a line, in the order of their paths, so a change touches only its file's line.
const textOfLock = (lock: Lock): string => {
  const lines = Object.entries(lock)
    .toSorted(([left], [right]) => compareText(left, right))
    .map(
      ([filePath, record]) =>
        `${INDENT}${JSON.stringify(filePath)}: ${JSON.stringify(wireOfRecord(record))}`,
    );

  return lines.length === 0
    ? `{}${NEWLINE}`
    : `{${NEWLINE}${lines.join(`,${NEWLINE}`)}${NEWLINE}}${NEWLINE}`;
};

export { lockOfWire, textOfLock };
