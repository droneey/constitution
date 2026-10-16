enum DocumentPath {
  Decisions = 'DECISIONS.md',
  DigestCore = 'digests/core.md',
  DigestFormat = 'digests/format',
  DigestIndex = 'digests/index.tsv',
  Hooks = 'hooks/hooks.json',
  Marketplace = '.claude-plugin/marketplace.json',
  Plugin = '.claude-plugin/plugin.json',
  Readme = 'README.md',
  Vocabulary = 'vocabulary.yaml',
}

// The form of the digests the hooks read, raised whenever a hook of the
// previous form would misread them; the hooks read this one and the one
// before it.
const DIGEST_FORMAT = 1;

export { DIGEST_FORMAT, DocumentPath };
