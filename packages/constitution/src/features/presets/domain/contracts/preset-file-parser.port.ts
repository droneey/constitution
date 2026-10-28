import type { PresetValue } from '../entities';

enum PresetFileReadStatus {
  Parsed = 'parsed',
  Unparsed = 'unparsed',
}

type PresetFileRead =
  | {
      readonly line?: number;
      readonly status: PresetFileReadStatus.Unparsed;
    }
  | {
      readonly status: PresetFileReadStatus.Parsed;
      readonly value: PresetValue;
    };

interface PresetFileParser {
  readonly parse: (text: string) => PresetFileRead;
}

export type { PresetFileParser, PresetFileRead };
export { PresetFileReadStatus };
