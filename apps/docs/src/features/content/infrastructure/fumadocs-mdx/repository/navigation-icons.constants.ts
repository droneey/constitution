const ICONS_BY_ADDRESS: Readonly<Record<string, string>> = {
  '': 'BookOpenText',
  '/core#precedence': 'Layers',
  '/core/foundation/placement': 'MapPin',
  '/decisions': 'Scale',
  '/glossary': 'BookA',
  '/guides/check-in-ci': 'GitPullRequest',
  '/guides/choose-blocks': 'Blocks',
  '/guides/override-a-rule': 'ChevronsDown',
  '/guides/upgrade': 'CircleArrowUp',
  '/guides/wire-the-tools': 'SlidersHorizontal',
  '/guides/write-a-pack': 'Package',
  '/how-it-works': 'Workflow',
  '/quick-start': 'SquareTerminal',
  '/reference/block-format': 'FileText',
  '/reference/constitution-yaml': 'FileCode',
  '/reference/plugin': 'Plug',
  '/reference/presets': 'Settings2',
  '/reference/skills': 'SquareSlash',
  '/reference/templates': 'Files',
  '/reference/terms': 'Tags',
} as const;

export { ICONS_BY_ADDRESS };
