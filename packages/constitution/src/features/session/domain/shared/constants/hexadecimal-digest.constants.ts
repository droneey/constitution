const SHORTEST_DIGEST_LENGTH = 16;
const LONGEST_DIGEST_LENGTH = 64;
const hexadecimalDigest = new RegExp(
  `^[0-9a-f]{${SHORTEST_DIGEST_LENGTH},${LONGEST_DIGEST_LENGTH}}$`,
);

export { hexadecimalDigest };
