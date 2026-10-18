# Glossary

> The words the Constitution uses in one meaning each.

| Term | Means |
|---|---|
| **Block** | a folder of rules about one thing a project may have: core, a domain, a platform, a language, a library or a tool |
| **Layer** | core, domains, contexts or implementations: the folder a block sits in, from the widest to the narrowest |
| **Axis** | the base, `architecture` or `workflow`: where a rule sits in its block; a project always follows the base and chooses the others |
| **Card** | a block's `<id>.md`: its front matter, its summary and the rules of its main chapter |
| **Chapter** | a file of a block, named for what its rules govern |
| **Seam** | a `with/<other>.md` file: the rules that hold only when two blocks meet |
| **Rule** | a heading with a slug and a level, a statement, its Why and its tags |
| **Level** | `MUST`, `SHOULD` or `MAY`: how hard a rule binds |
| **Lens** | a tag on a rule, for a review of one concern across every block |
| **Active set** | the blocks a project follows: core, the blocks it lists, and the bases they extend |
| **Unit** | a path under `packages:` whose files follow blocks of their own |
| **Override** | a project's recorded lowering of one rule, with a reason |
| **Pack** | a folder of blocks beside the Constitution's, shaped like it, that a project lists under `packs:` |
| **Release** | a tagged version of the Constitution, installed by mise into `.droneey/constitution/` |
| **Preset** | the configuration of one tool that holds rules, split into parts |
| **Part** | one file of a preset, named after the block its settings need |
| **Binding** | an entry of `bindings.yaml`: which setting of which part holds which rule |
| **Digest** | what the plugin gives an agent at the start of a session: the release, the warnings and the active blocks |
| **Check** | the one command that runs every tool, named by `check:` |
| **Owned word** | a brand, a language or a file name that only its block and the blocks that depend on it may write |
