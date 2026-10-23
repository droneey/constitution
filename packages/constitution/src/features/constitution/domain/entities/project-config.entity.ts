// A place in constitution.yaml: a key of the repository, its app '', or of one of its packages.
interface ConfigPlace {
  readonly app: string;
  readonly key: string;
}

interface ConfigItem extends ConfigPlace {
  readonly text: string;
}

// The fields of an override as written, each '' when it is left out.
interface ConfigOverride {
  readonly app: string;
  readonly level: string;
  readonly line: number;
  readonly reason: string;
  readonly rule: string;
  readonly until: string;
}

// constitution.yaml as the fixed subset of YAML its grammar allows reads it, in the order it is written.
interface ProjectConfig {
  readonly apps: readonly string[];
  // the value of check, absent when it is left out or empty
  readonly check?: string;
  // the lists left empty, and packages when it holds no package
  readonly empties: readonly ConfigPlace[];
  readonly items: readonly ConfigItem[];
  // every top-level key, those the grammar does not know included
  readonly keys: readonly string[];
  readonly lists: readonly ConfigPlace[];
  readonly overrides: readonly ConfigOverride[];
}

enum ConfigReadStatus {
  Parsed = 'parsed',
  Unparsed = 'unparsed',
}

type ConfigRead =
  | {
      readonly config: ProjectConfig;
      readonly status: ConfigReadStatus.Parsed;
    }
  | {
      // the line, from 1, the grammar stops at
      readonly line: number;
      readonly status: ConfigReadStatus.Unparsed;
    };

export type { ConfigItem, ConfigOverride, ConfigPlace, ConfigRead, ProjectConfig };
export { ConfigReadStatus };
