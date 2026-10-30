import type { Contribution, PresetValue } from '../../../../../../entities';
import { Setting, ValueKind } from '../../../../../../entities';

interface JoinWordsInput {
  readonly contributions: readonly Contribution[];
  readonly merged: Setting;
}

const wordsPathsOf = (contributions: readonly Contribution[]): readonly (readonly string[])[] => {
  const keyPaths = new Map<string, readonly string[]>();

  const walk = (given: PresetValue, keyPath: readonly string[]): void => {
    if (given.kind !== ValueKind.Map) {
      if (given.isWords) {
        keyPaths.set(JSON.stringify(keyPath), keyPath);
      }

      return;
    }

    for (const pair of given.pairs) {
      walk(pair.value, [
        ...keyPath,
        pair.key,
      ]);
    }
  };

  for (const contribution of contributions) {
    walk(contribution.value, []);
  }

  return [
    ...keyPaths.values(),
  ];
};

const joinWords = (input: JoinWordsInput): Setting =>
  wordsPathsOf(input.contributions).reduce<Setting>((merged, keyPath) => {
    const words = Setting.atKeysAsWritten(merged, keyPath);

    return Setting.isList(words)
      ? Setting.withAtKeysAsWritten({
          held: words.map(String).join(' '),
          keyPath,
          setting: merged,
        })
      : merged;
  }, input.merged);

export type { JoinWordsInput };
export { joinWords };
