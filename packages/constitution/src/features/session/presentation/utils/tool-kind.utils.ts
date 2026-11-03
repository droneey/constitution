const editingTools: ReadonlySet<string> = new Set([
  'Edit',
  'MultiEdit',
  'NotebookEdit',
  'Write',
]);
const READ_TOOL = 'Read';
const SHELL_TOOL = 'Bash';
const MCP_TOOL_PREFIX = 'mcp__';

enum ToolKind {
  Editing = 'editing',
  Reading = 'reading',
  Shell = 'shell',
  Mcp = 'mcp',
  Ungated = 'ungated',
}

const toolKindOf = (name: string): ToolKind => {
  if (editingTools.has(name)) {
    return ToolKind.Editing;
  }

  if (name === READ_TOOL) {
    return ToolKind.Reading;
  }

  if (name === SHELL_TOOL) {
    return ToolKind.Shell;
  }

  return name.startsWith(MCP_TOOL_PREFIX) ? ToolKind.Mcp : ToolKind.Ungated;
};

export { ToolKind, toolKindOf };
