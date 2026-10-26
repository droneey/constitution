import type { Setting } from '../../domain/entities';

/** The text parses in its format. */
interface SettingsText {
  readonly settings: Setting;
  readonly text: string;
}

export type { SettingsText };
