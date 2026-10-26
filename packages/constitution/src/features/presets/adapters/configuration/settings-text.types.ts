import type { LinesLayout, Setting } from '../../domain/entities';

/** The text parses in its format. */
interface SettingsText {
  readonly layout?: LinesLayout | undefined;
  readonly settings: Setting;
  /** the paths of the maps whose keys stand in their order as texts */
  readonly sorted: readonly (readonly string[])[];
  readonly text: string;
}

export type { SettingsText };
