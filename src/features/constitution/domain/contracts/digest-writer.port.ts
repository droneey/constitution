interface DigestWriter {
  write: (input: { path: string; text: string }) => void;
}

export type { DigestWriter };
