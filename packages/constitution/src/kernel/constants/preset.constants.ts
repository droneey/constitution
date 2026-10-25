const PRESETS_FOLDER = 'presets';
const TEMPLATES_FOLDER = 'templates/project';

// The scope of the presets every project takes, beside one per language.
const COMMON_SCOPE = 'common';
// The part of a tool's own settings, and the part for what crosses a workspace's units.
const SELF_PART = 'self';
const WORKSPACE_PART = 'workspace';

// What a template writes in place of what the project's units and parts give it.
enum Placeholder {
  Parts = '<parts>',
  CopiedParts = '<copied parts>',
  ChainEnd = '<chain end>',
  UnitFolders = '<unit folders>',
  Package = '<package>',
}

export { COMMON_SCOPE, Placeholder, PRESETS_FOLDER, SELF_PART, TEMPLATES_FOLDER, WORKSPACE_PART };
