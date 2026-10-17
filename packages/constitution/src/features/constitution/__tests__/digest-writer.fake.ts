import type { DigestWriter } from '../domain/contracts';

interface FakeDigestWriter extends DigestWriter {
  written: Record<string, string>;
}

const createFakeDigestWriter = (): FakeDigestWriter => {
  const written: Record<string, string> = {};

  return {
    write: ({ path, text }: { path: string; text: string }): void => {
      written[path] = text;
    },
    written,
  };
};

export { createFakeDigestWriter };
