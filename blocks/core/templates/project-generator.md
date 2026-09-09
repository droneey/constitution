# Generator for `PROJECT.md`

> This is **not** `PROJECT.md`. It is the instruction an agent follows to **generate** a project's `PROJECT.md` by interviewing the human. `PROJECT.md` is unique per project and cannot be templated by content — so this templates the *process* instead. The shape of the result is `PROJECT.md` in this folder.

---

## What `PROJECT.md` is (and is not)

`PROJECT.md` is the **stable, high-level context of the product** — what it is, who it's for, its domains, its core entities, its boundaries — plus the pin of the constitution version and the assembly. It gives any agent or human the context of the whole so changes fit the product, not just the task.

It is **not**:
- a feature list, roadmap or backlog — those live in a tracker; they change weekly and rot in a repository document;
- a restatement of the constitution — it describes *what the product is*, never *how to build it*.

---

## How to run this generator

1. **Conduct an interview, don't dump a form.** Ask **one or two questions at a time**, in the section order of the template. Use the human's answers to ask sharper follow-ups.
2. **Never invent.** If the human doesn't know or hasn't decided, write `TODO:` in that spot and move on. A `PROJECT.md` with honest gaps beats a fabricated one.
3. **Use the business's own language** — this seeds the Ubiquitous Language. Mirror the terms the human uses.
4. **Keep it high-level.** If an answer drifts into a specific feature's mechanics or into "how to build it", note the essence and steer back — detail belongs in a feature brief or a chapter, not here.
5. **Pin the constitution.** Ask which assembly governs the project (one name under `assemblies/`, or one per application in a repository with several) and write the constitution tag in use.
6. **Confirm before writing.** When the sections are covered, summarise back briefly, let the human correct, then write the file.
7. **Write the result as `PROJECT.md` at the root of the repository,** and `DECISIONS.md` beside it from its template if it does not exist. Do not overwrite an existing `PROJECT.md` without confirmation.

---

## The questions, by section

- **One-liner.** In one sentence, what is this product and who is it for?
- **Context & users.** Who uses it, and what problem does it solve for them? Are there distinct user types or roles?
- **Domains.** What are the main areas of the product?
- **Core entities & relationships.** What are the main business objects, and how do they relate?
- **Boundaries.** What is explicitly out of scope? What will this product never do?
- **Non-functional notes.** Any hard constraints on scale, offline, devices, compliance, performance, or integrations the product depends on? Omit the section entirely if there are none.

---

## Quality bar before writing the file

- The file opens with the front matter pin, then the exact `# Project Context` title and blockquote of the template, verbatim.
- Every section is either filled from the human's answers or honestly marked `TODO:`.
- No feature backlog, no build or how-to content.
- High-level throughout — a newcomer should grasp *what the product is* in two minutes.
- Terms match the business language the human used.
