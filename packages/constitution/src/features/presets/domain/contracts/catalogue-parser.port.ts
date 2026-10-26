import type { PresetValue } from '../entities';

enum CatalogueReadStatus {
  Parsed = 'parsed',
  Unparsed = 'unparsed',
}

type CatalogueRead =
  | {
      /** from 1; absent when the parser names none */
      readonly line?: number;
      readonly status: CatalogueReadStatus.Unparsed;
    }
  | {
      readonly status: CatalogueReadStatus.Parsed;
      /** an empty catalogue reads as a map without pairs */
      readonly value: PresetValue;
    };

interface CatalogueParser {
  /**
   * The value of a catalogue's text: its tags `!replace` and `!default` read as marks, which hold
   * no mark within them, nor does an item of a list.
   */
  readonly parse: (text: string) => CatalogueRead;
}

export type { CatalogueParser, CatalogueRead };
export { CatalogueReadStatus };
