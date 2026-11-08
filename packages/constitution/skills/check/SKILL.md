---
name: check
description: Run the project's check, then have one fresh reviewer judge the change against the rules that govern its files, route its findings, and report to the person. Use before handing work back, when the hand-back gate asks for the check or the review, or when the person asks for a review.
argument-hint: "[edits|all]"
---

# Check the work against the rules

Arguments: $ARGUMENTS — a scope, `edits` (the default) or `all`.

Run every command below from the project root, the folder that holds `constitution.yaml`.

## 1. Run the check

Run `constitution run check`, exactly as written, and read its output whole.

- It fails: fix the failures, as `check-never-weakened-to-pass` asks, and run it again. The review waits for a passing check.
- It passes: go on. The hand-back gate records the pass on this tree.

## 2. Gather the change

`edits`: the change is what differs from `HEAD`, new files included.

```bash
git diff HEAD
git ls-files --others --exclude-standard
```

The diff is the first command's output, with each new file the second lists added whole. The files of the change are the paths both name.

`all`: the files of the change are every file `git ls-files` lists, given whole in place of a diff, in batches of at most one hundred files, one review each.

## 3. Gather the rules

```bash
constitution rules --for <every file of the change> --why
```

It prints the vocabulary of each chapter that governs those files, then each rule's statement at the level that binds where the file lies, MUST before SHOULD, with a lowered rule's override and reason and the rule's Why under it. It fails, naming why, when the project's Constitution cannot be read: fix that first.

The overrides are the `overrides` entries of `constitution.yaml`, at the root and in each unit the change touches, each with its rule, level and reason.

## 4. Review

Dispatch the `constitution:reviewer` agent once, through the Agent tool, with exactly these and nothing more:

- the project root;
- the diff;
- the output of `constitution rules --why`, whole;
- the overrides.

Give it nothing of this conversation: no summary of the work, no intent and no reading of a rule. It judges the change as a stranger would. It returns one finding per line, `<path>:<line> — <slug> · <LEVEL> — <confidence> — <what is wrong> — <the fix>`, or `no findings`; when it finishes, a hook records the review on this tree.

## 5. Route the findings

Take each finding by what it says:

- **A clear breach**, of confidence `high`, whose fix fits the task, MUST or SHOULD: fix it.
- **An uncertain finding**, of confidence `low`: answer it `fixed`, with the fix made, or `disagree, because …`, with the reason the code gives. A finding you disagree with goes, with your answer, to a second review: the reviewer dispatched again with the diff, the rules, the overrides and the disputed findings with their answers, and its verdict settles it.
- **A SHOULD you keep:** leave it only with its reason, and give that reason in your report.
- **A question for the person:** ask only where the rules give no answer, because they are silent, two of them clash, or the fix needs a decision outside the task, such as a new dependency, a project-wide logger, a change to a stored format or who may perform an action. A finding with `none` as its rule is such a question.

Fixes are reviewed by running this skill again, for as many rounds as `agent-review-stops-after-three-rounds` allows; what the last round still finds goes to the person, as `review-left-open-goes-to-the-person` asks. A finding against a rule the person does not want in this repository is a case for `/amend`, never for a silent exception.

## 6. Report

Hand back the change with a report that gives:

- what was done, and what was run, the check and the review among them, with their outcomes;
- what was not verified, and why;
- the questions you would have asked the person;
- the decisions the rules could not make, each with the choice taken;
- the SHOULD findings left aside, each with its reason.
