---
name: amend
description: Add, change or remove an override in this repository's constitution.yaml — lower one Constitution rule to SHOULD or MAY, with the owner's reason and consent. Use when the owner wants to record, renew or drop a departure from a rule.
argument-hint: "[rule-slug]"
disable-model-invocation: true
---

# Amend an override

The repository's `constitution.yaml`:

!`cat "${CLAUDE_PROJECT_DIR}/constitution.yaml" 2>/dev/null || echo "(no constitution.yaml in the project folder)"`

The rule, when given: $ARGUMENTS

## What an override is

An override lowers one Constitution rule, for the whole repository or for one unit, and records why. Every session's digest shows it, and the reminders mark the rule with its new level. It is the only way a repository departs from a rule, so it is written with the owner's explicit consent in this chat, for this override — never implied from a reason, a request to proceed, or consent to another override.

If there is no `constitution.yaml` above, look for it at the repository root — the folder, going up from the project folder, that holds `.git`. If there is none, stop and suggest `/ratify`.

## Steps

Handle one override at a time. When the owner asks for several, go through these steps for each, with its own yes.

### 1. The rule

Take the slug from the arguments above, or ask for it. Look for its heading in the blocks of the release the project installed in `.droneey/constitution/` and of the packs `constitution.yaml` lists — `### <slug> · <LEVEL>`, or `### <slug> → <parent>` with its level after the parent or none:

```bash
grep -rn "^### <slug> " "<repository root>/.droneey/constitution/blocks" <each pack's folder>/blocks
```

- Found: show the owner its block, its current level and its statement, read from its file. Then find the rules that carry it out and state no level of their own — headings `### <their slug> → <slug>` with nothing after the parent — and theirs in turn: an override lowers them too, so name them to the owner.
- Not found: say so. When the owner describes the rule instead of naming it, search the headings for their words (`grep -rn '^### ' … | grep -i '<word>'`) and offer the matches. Only a rule of a block can be overridden; a rule of the project's own pack is changed in the block's own file instead.

### 2. Add, change or remove

Look for an override of this rule in the scope the owner means — the `overrides` of the root's `constitution.yaml`, or of a member's in its folder.

- **None there**: this adds one. Go on with steps 3 to 6.
- **One there**: show it and ask whether to change it or remove it. To change it, ask only for the fields the owner wants changed and keep the rest. To remove it, go to step 7.

### 3. The level

The new level is lower than the rule's current one: SHOULD or MAY below MUST, MAY below SHOULD. A MAY rule cannot be lowered — say so and stop.

### 4. The reason

Ask why the repository departs from the rule, and write the owner's reason, one line, in their words. A reason is required: without one there is no override. Do not supply one yourself.

### 5. Until when

Ask whether the override ends on a date. It is optional; when given, it is a date after today, written `YYYY-MM-DD`. From the day after it the override lowers nothing and the hook warns, so the owner renews or removes it.

### 6. The scope

Ask whether the override applies to the repository's own files or to one member of its workspace. Each `constitution.yaml` lowers the rule only for the files of its unit: the root's for the files no member holds, a member's for the files under its folder; nothing passes from one to another, so a rule lowered in several units is lowered in each one's file.

### 7. Show the change, then write

Show the exact lines you will add, change or remove in the unit's `constitution.yaml`, and ask for a yes for this override. Write only after that yes. An override has one shape in every unit's file:

```yaml
overrides:
  - rule: data-view-shows-every-state
    level: SHOULD
    reason: "The admin screens show their state in the shared toolbar"
    until: 2026-12-31
```

The hook reads a fixed subset of YAML, so keep this form exactly:

- `- rule:` opens an override, and `level:`, `reason:` and `until:` sit two spaces deeper than its `-`; omit `until:` when there is no date;
- the reason is double-quoted, with a `"` or `\` inside it written as `\"` or `\\`;
- `overrides: []` becomes `overrides:` with the entries below it; when the last override of the file goes, write `overrides: []` again;
- change nothing else in the file.

### 8. Check it

Run the hook as a session start would, from the repository root:

```bash
printf '{"cwd":"%s","hook_event_name":"SessionStart","source":"startup"}\n' "$(pwd)" | constitution hook session-start
```

The digest it prints lists the override under the overrides, and no warning names it. An `overrides` warning about it means the entry is wrong: fix it and show the owner. The change reaches the main branch through a pull request like any other, and git history keeps its record.
