import type { PresetValue } from '../entities';

enum PresetFileReadStatus {
  Parsed = 'parsed',
  Unparsed = 'unparsed',
}

type PresetFileRead =
  | {
      /** from 1; absent when the parser names none */
      readonly line?: number;
      readonly status: PresetFileReadStatus.Unparsed;
    }
  | {
      readonly status: PresetFileReadStatus.Parsed;
      /** an empty preset file reads as a map without pairs */
      readonly value: PresetValue;
    };

interface PresetFileParser {
  /**
   * The value of a preset file's text: its tags `!replace` and `!default` read as marks, which hold
   * no mark within them, nor does an item of a list; `!sorted` marks a map, whatever it holds, and
   * `!words` a list.
   */
  readonly parse: (text: string) => PresetFileRead;
}

export type { PresetFileParser, PresetFileRead };
export { PresetFileReadStatus };
