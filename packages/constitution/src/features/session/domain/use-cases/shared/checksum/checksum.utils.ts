import type { WorkingTree } from '#/kernel/contracts';
import { TreeStateStatus } from '#/kernel/contracts';

// The checksum POSIX cksum prints: a CRC-32 of the bytes, MSB first, then of their length.
const POLYNOMIAL = 0x04_c1_1d_b7;
const BYTE_BITS = 8;
const BYTE_MASK = 0xff;
const TOP_SHIFT = 24;
const TABLE_SIZE = 256;
const HIGH_BIT = 0x80_00_00_00;

const crcTable: readonly number[] = Array.from(
  {
    length: TABLE_SIZE,
  },
  (_, index) => {
    let crc = index << TOP_SHIFT;

    for (let bit = 0; bit < BYTE_BITS; bit += 1) {
      crc = (crc & HIGH_BIT) === 0 ? crc << 1 : (crc << 1) ^ POLYNOMIAL;
    }

    return crc >>> 0;
  },
);

const step = (input: { byte: number; crc: number }): number =>
  ((input.crc << BYTE_BITS) ^
    (crcTable[((input.crc >>> TOP_SHIFT) ^ input.byte) & BYTE_MASK] ?? 0)) >>>
  0;

const checksumOf = (bytes: Uint8Array): string => {
  let crc = 0;

  for (const byte of bytes) {
    crc = step({
      byte,
      crc,
    });
  }

  for (let length = bytes.length; length > 0; length = Math.floor(length / TABLE_SIZE)) {
    crc = step({
      byte: length & BYTE_MASK,
      crc,
    });
  }

  return String(~crc >>> 0);
};

const noBytes = new Uint8Array();

interface FingerprintInput {
  readonly project: string;
  readonly workingTree: WorkingTree;
}

/** The tree's fingerprint; a tree git cannot report reads as the empty one. */
const fingerprintOf = (input: FingerprintInput): string => {
  const state = input.workingTree.stateOf(input.project);

  return checksumOf(state.status === TreeStateStatus.Read ? state.bytes : noBytes);
};

export { fingerprintOf };
