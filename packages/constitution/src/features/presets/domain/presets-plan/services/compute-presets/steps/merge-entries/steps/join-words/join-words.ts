import type { Contribution } from '../../../../../../../merged-file/entities';
import type { PresetValue } from '../../../../../../../setting/entities';
import { Joining, Setting, ValueKind } from '../../../../../../../setting/entities';

interface JoinWordsInput {
  readonly contributions: readonly Contribution[];
  readonly merged: Setting;
}

interface JoinedPath {
  readonly keyPath: readonly string[];
  readonly separator: string;
}

const WORD_SEPARATOR = ' ';
// Why: a list of commands runs as one command line, each after the one before it succeeds.
const COMMAND_SEPARATOR = ' && ';
const SEPARATORS = {
  [Joining.Commands]: COMMAND_SEPARATOR,
  [Joining.Words]: WORD_SEPARATOR,
} as const;

const joinedPathsOf = (contributions: readonly Contribution[]): readonly JoinedPath[] => {
  const joined = new Map<string, JoinedPath>();

  const walk = (given: PresetValue, keyPath: readonly string[]): void => {
    if (given.kind !== ValueKind.Map) {
      if (given.joining !== Joining.None) {
        joined.set(JSON.stringify(keyPath), {
          keyPath,
          separator: SEPARATORS[given.joining],
        });
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
    ...joined.values(),
  ];
};

const joinWords = (input: JoinWordsInput): Setting =>
  joinedPathsOf(input.contributions).reduce<Setting>((merged, { keyPath, separator }) => {
    const words = Setting.atKeysAsWritten(merged, keyPath);

    return Setting.isList(words)
      ? Setting.withAtKeysAsWritten({
          held: words
            .map((word) =>
              Setting.isList(word) ? word.map(String).join(WORD_SEPARATOR) : String(word),
            )
            .join(separator),
          keyPath,
          setting: merged,
        })
      : merged;
  }, input.merged);

export type { JoinWordsInput };
export { joinWords };
