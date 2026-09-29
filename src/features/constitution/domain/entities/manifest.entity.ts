interface FieldIssue {
  field: string;
  message: string;
}

interface PluginManifest {
  name: string;
  repository: string | undefined;
  skills: readonly string[];
}

// A source that is no GitHub repository has neither.
interface MarketplacePlugin {
  name: string;
  ref: string | undefined;
  repo: string | undefined;
}

interface MarketplaceManifest {
  plugins: readonly MarketplacePlugin[];
}

interface HooksManifest {
  commands: readonly string[];
}

type ManifestRead<T> =
  | {
      status: 'parsed';
      value: T;
    }
  | {
      reason: string;
      status: 'not-json';
    }
  | {
      issues: readonly FieldIssue[];
      status: 'mismatched';
    };

export type {
  FieldIssue,
  HooksManifest,
  ManifestRead,
  MarketplaceManifest,
  MarketplacePlugin,
  PluginManifest,
};
