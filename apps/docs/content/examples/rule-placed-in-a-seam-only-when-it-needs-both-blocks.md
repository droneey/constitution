```text title="Avoid"
implementations/tailwind/foundation/
├── utilities.md
└── with/
    ├── design-system.md   transition-all-never-used
    └── ui.md              a seam with ui, which tailwind requires
```

```text title="Prefer"
implementations/tailwind/foundation/
├── utilities.md           transition-all-never-used
└── with/
    └── design-system.md   class-names-only-semantic-colors
```
