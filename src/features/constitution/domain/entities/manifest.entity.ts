interface FieldIssue {
  field: string;
  message: string;
}

interface PluginManifest {
  name: string;
  skills: readonly string[];
}

interface MarketplacePlugin {
  name: string;
  source: string;
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
