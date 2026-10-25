/** A configuration's settings as its format holds them, a date as its text and no null. */
type Setting =
  | boolean
  | number
  | string
  | readonly Setting[]
  | {
      readonly [key: string]: Setting;
    };

interface ConfigurationText {
  readonly path: string;
  readonly text: string;
}

interface ConfigurationParser {
  /** the settings of a JSON, JSONC, TOML or YAML text; undefined when it does not parse, or its format is none of those */
  readonly parse: (input: ConfigurationText) => Setting | undefined;
}

export type { ConfigurationParser, ConfigurationText, Setting };
