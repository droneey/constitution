const editingTools: ReadonlySet<string> = new Set([
  'Edit',
  'MultiEdit',
  'NotebookEdit',
  'Write',
]);
const READ_TOOL = 'Read';
const SHELL_TOOL = 'Bash';
// Why: Claude Code named its subagent tool Task before it named it Agent.
const spawningTools: ReadonlySet<string> = new Set([
  'Agent',
  'Task',
]);
const MCP_TOOL_PREFIX = 'mcp__';

enum ToolKind {
  Editing = 'editing',
  Reading = 'reading',
  Shell = 'shell',
  Spawning = 'spawning',
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

  if (spawningTools.has(name)) {
    return ToolKind.Spawning;
  }

  return name.startsWith(MCP_TOOL_PREFIX) ? ToolKind.Mcp : ToolKind.Ungated;
};

export { ToolKind, toolKindOf };
