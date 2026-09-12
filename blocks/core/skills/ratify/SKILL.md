---
name: ratify
description: Bring a repository under the constitution — write its PROJECT.md and DECISIONS.md by interviewing the human. Never invents; asks, and leaves out what stays unanswered.
argument-hint: "[assembly]"
disable-model-invocation: true
---

# Ratify the constitution in this repository

Installed constitution:

!`sed -n 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "${CLAUDE_PLUGIN_ROOT}/package.json"`

Assemblies to choose from:

!`ls "${CLAUDE_PLUGIN_ROOT}/assemblies" | sed 's/\.yml$//'`

Already at the root of this repository:

!`ls PROJECT.md DECISIONS.md 2>/dev/null || true`

## What `PROJECT.md` is (and is not)

`PROJECT.md` is the **stable, high-level context of the product** — what it is, who it's for, its domains, its core entities, its boundaries — plus the pin of the constitution version and the assembly. It gives any agent or human the context of the whole so changes fit the product, not just the task.

It is **not**:
- a feature list, roadmap, backlog or list of open questions — those live in a tracker; they change weekly and rot in a repository document;
- a restatement of the constitution — it describes *what the product is*, never *how to build it*.

## How to run the interview

1. **Conduct an interview, don't dump a form.** Ask **one or two questions at a time**, in the section order of the template. Use the human's answers to ask sharper follow-ups. In a repository that already has code, read it first and propose answers the human confirms or corrects.
2. **Never invent.** Ask about what you do not know and let the human answer, confirm or correct. What stays unanswered is left out: `PROJECT.md` is the stable description of the product, so nothing in it is marked `TODO:` or points at the future, and a section with nothing to say is dropped. A shorter file that is true beats a complete one that is not.
3. **Use the business's own language** — this seeds the Ubiquitous Language. Mirror the terms the human uses.
4. **Keep it high-level.** If an answer drifts into a specific feature's mechanics or into "how to build it", note the essence and steer back — detail belongs in a feature brief or a chapter, not here.
5. **Pin the constitution.** The assembly is `$ARGUMENTS` when given, otherwise ask, offering the list above; a repository with several applications maps each application path to its assembly. The version is the installed one above.
6. **Confirm before writing.** When the sections are covered, summarise back briefly, let the human correct, then write.
7. **Write the files.** `PROJECT.md` at the root, in the exact shape of `${CLAUDE_PLUGIN_ROOT}/templates/PROJECT.md`; `DECISIONS.md` beside it from `${CLAUDE_PLUGIN_ROOT}/templates/DECISIONS.md` when it does not exist. Never overwrite an existing file without confirmation.
8. **Say what follows.** The repository needs the `check` script the `workflow` chapter asks for and tests per the `testing` chapter; every departure from a block is an entry in `DECISIONS.md` with a `Deviates:` line. The files reach `main` through a pull request like any change.

## The questions, by section

- **One-liner.** In one sentence, what is this product and who is it for?
- **Context & users.** Who uses it, and what problem does it solve for them? Are there distinct user types or roles?
- **Domains.** What are the main areas of the product?
- **Core entities & relationships.** What are the main business objects, and how do they relate?
- **Boundaries.** What is explicitly out of scope? What will this product never do?
- **Non-functional notes.** Any hard constraints on scale, offline, devices, compliance, performance, or integrations the product depends on? Omit the section entirely if there are none.

## Quality bar before writing

- The file opens with the front matter pin, then the exact `# Project Context` title and blockquote of the template, verbatim.
- Every section is filled from the code and the human's answers, or dropped; nothing is marked `TODO:` or deferred.
- No feature backlog, no build or how-to content.
- High-level throughout — a newcomer should grasp *what the product is* in two minutes.
- Terms match the business language the human used.
