import type { Contribution, PresetValue } from '../../../../../entities';
import { Setting, ValueKind } from '../../../../../entities';

interface JoinWordsInput {
  readonly contributions: readonly Contribution[];
  readonly merged: Setting;
}

const wordsPathsOf = (contributions: readonly Contribution[]): readonly (readonly string[])[] => {
  const paths = new Map<string, readonly string[]>();

  const walk = (given: PresetValue, path: readonly string[]): void => {
    if (given.kind !== ValueKind.Map) {
      if (given.isWords === true) {
        paths.set(JSON.stringify(path), path);
      }

      return;
    }

    for (const pair of given.pairs) {
      walk(pair.value, [
        ...path,
        pair.key,
      ]);
    }
  };

  for (const contribution of contributions) {
    walk(contribution.value, []);
  }

  return [
    ...paths.values(),
  ];
};

const joinWords = (input: JoinWordsInput): Setting =>
  wordsPathsOf(input.contributions).reduce<Setting>((merged, path) => {
    const words = Setting.at(merged, path);

    return Setting.isList(words)
      ? Setting.withAt({
          path,
          setting: merged,
          value: words.map(String).join(' '),
        })
      : merged;
  }, input.merged);

export type { JoinWordsInput };
export { joinWords };
