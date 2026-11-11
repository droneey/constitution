---
name: amend
description: Add, change or remove an override in this repository's constitution.yaml — lower one Constitution rule from MUST to SHOULD, or set it to MAY, with the owner's reason and consent. Use when the owner wants to record, renew or drop a departure from a rule.
argument-hint: "[rule-slug]"
disable-model-invocation: true
---

# Amend an override

The repository's `constitution.yaml`:

!`cat "${CLAUDE_PROJECT_DIR}/constitution.yaml" 2>/dev/null || echo "(no constitution.yaml in the project folder)"`

The rule, when given: $ARGUMENTS

## What an override is

An override lowers one Constitution rule, for the files of one unit, and records why: the rule gate and `constitution rules` hand the rule at its new level, with the reason. It is the only way a repository departs from a rule, so it is written only with the owner's explicit consent in this chat, for this override, never implied from a reason, a request to proceed or consent to another override.

If there is no `constitution.yaml` above, look for it at the repository root, the folder going up from the project folder that holds `.git`. If there is none, stop and suggest `/constitution:ratify`.

## Steps

Handle one override at a time; for several, go through these steps for each, with its own yes.

### 1. The rule

Take the slug from the arguments above, or ask for it. Look for its heading, `### <slug> · <LEVEL>` or `### <slug> → <parent> · <LEVEL>`, in the release's blocks and in those of each pack `constitution.yaml` lists:

```bash
grep -rn "^### <slug> " "<repository root>/.droneey/constitution/blocks" <each pack's folder>/blocks
```

- Found: show the owner its block, its level and its statement, read from its file. An override lowers only the rule it names; the rules that tighten it, `### <their slug> → <slug> · <LEVEL>`, keep their levels, so name them to the owner.
- Not found: say so. When the owner describes the rule instead, search the headings for their words (`grep -rn '^### ' … | grep -i '<word>'`) and offer the matches. A rule of the project's own pack is changed in its block's file, not overridden.

### 2. Add, change or remove

Look for an override of this rule in the unit the owner means: the `overrides` of the root's `constitution.yaml`, or of a member's in its folder.

- **None there**: this adds one. Go on with steps 3 to 6.
- **One there**: show it and ask whether to change or remove it. To change it, ask only for the fields the owner wants changed. To remove it, go to step 7.

### 3. The level

A MUST rule is lowered to SHOULD, which then binds only where no stated reason sets it aside, or set to MAY, which only advises; a SHOULD rule is set to MAY.

### 4. The reason

Ask why the repository departs from the rule, and write the owner's reason, one line, in their words. Without a reason there is no override; never supply one yourself.

### 5. Until when

Ask whether the override ends on a date. It is optional; when given, it is a date from today on, written `YYYY-MM-DD`. From the day after it the override lowers nothing and the digest warns, so the owner renews or removes it.

### 6. The unit

Ask whether the override applies to the repository's own files or to one member of its workspace. Each `constitution.yaml` lowers the rule only for its unit's files: the root's for the files no member holds, a member's for the files under its folder. A rule lowered in several units is lowered in each one's file.

### 7. Show the change, then write

Show the exact lines you will add, change or remove in the unit's `constitution.yaml`, and ask for a yes for this override. Write only after that yes:

```yaml
overrides:
  - rule: data-view-shows-every-state
    level: SHOULD
    reason: "The admin screens show their state in the shared toolbar"
    until: 2026-12-31
```

- `level:`, `reason:` and `until:` sit two spaces deeper than the `-` of `- rule:`; omit `until:` when there is no date;
- the reason is double-quoted, a `"` or `\` inside it written `\"` or `\\`;
- `overrides: []` becomes `overrides:` with the entries below it, and `overrides: []` again when the file's last override goes;
- change nothing else in the file.

### 8. Apply the presets

Run `constitution presets apply` from the repository root. A rule an override lowers takes its settings out of the unit's configurations, and one whose override goes puts them back; show the owner what left or joined each file. Then run `constitution run check`.

### 9. Check it

Run the hook as a session start would, from the repository root:

```bash
printf '{"cwd":"%s","hook_event_name":"SessionStart","source":"startup"}\n' "$(pwd)" | constitution hook session-start
```

No line under `⚠️ Warnings` in the digest it prints names the override; one that does says what is wrong with the entry: fix it and show the owner. The change reaches the main branch through a pull request like any other, and git history keeps its record.
