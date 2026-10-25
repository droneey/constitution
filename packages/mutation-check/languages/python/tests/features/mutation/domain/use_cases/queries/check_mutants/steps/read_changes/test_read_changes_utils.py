from pathlib import Path

from changes_fixtures import FILES
from workspace_fake import DIFF, UNTRACKED, WorkspaceFake

from droneey_mutation_check.features.mutation.domain.contracts import Completed
from droneey_mutation_check.features.mutation.domain.use_cases.queries.check_mutants.steps import (
  read_changes,
)

CHANGED = """diff --git a/src/shop/orders.py b/src/shop/orders.py
index 1111111..2222222 100644
--- a/src/shop/orders.py
+++ b/src/shop/orders.py
@@ -3 +3 @@ def total
-  return 0
+  return 1
@@ -10,0 +11,3 @@ def total
+def discount() -> int:
+  return 2
+
@@ -20,2 +23,0 @@ def total
-LIMIT = 1
-RATE = 2
diff --git a/src/shop/kernel.py b/src/shop/kernel.py
new file mode 100644
--- /dev/null
+++ b/src/shop/kernel.py
@@ -0,0 +1,2 @@
+MONEY = 1
+RATE = 2
"""


def test_should_read_the_lines_each_file_adds_or_changes_and_the_files_git_does_not_track() -> None:
  # Arrange
  workspace = WorkspaceFake(
    answers={
      DIFF: Completed(status=0, output=CHANGED),
      UNTRACKED: Completed(status=0, output='src/shop/basket.py\ntests/test_basket.py\n'),
    },
    files=FILES,
  )

  # Act
  changes = read_changes(workspace)

  # Assert
  assert (changes.lines, changes.untracked) == (
    {
      Path('src/shop/orders.py'): (range(3, 4), range(11, 14)),
      Path('src/shop/kernel.py'): (range(1, 3),),
    },
    (Path('src/shop/basket.py'), Path('tests/test_basket.py')),
  )
