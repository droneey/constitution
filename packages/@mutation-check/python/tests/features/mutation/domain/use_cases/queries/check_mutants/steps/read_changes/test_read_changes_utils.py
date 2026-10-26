from pathlib import Path

from changes_fixtures import FILES
from workspace_fake import DIFF, PREFIX, UNTRACKED, WorkspaceFake

from droneey_mutation_check_python.features.mutation.domain.contracts import Completed
from droneey_mutation_check_python.features.mutation.domain.use_cases.queries.check_mutants.steps import (  # noqa: E501 -- the module's path alone passes the width
  read_changes,
)

# A diff of the whole repository, run from packages/shop/: a file of the unit changed in two
# hunks, the first reading like a diff's header; one added and committed; one moved into the unit
# from another folder, changing a line that reads like a new file's; one moved there unchanged; one
# new and not tracked, whose line reads like a move's; one whose name reads like a move's and
# holds a space; a binary one; and a file of another unit.
CHANGED = """diff --git a/packages/shop/src/shop/orders.py b/packages/shop/src/shop/orders.py
index 1111111..2222222 100644
--- a/packages/shop/src/shop/orders.py
+++ b/packages/shop/src/shop/orders.py
@@ -3 +3 @@ def total
-  return 0
+  return 'diff --git a b'
@@ -10,0 +11,3 @@ def total
+def discount() -> int:
+  return 2
+
@@ -20,2 +23,0 @@ def total
-LIMIT = 1
-RATE = 2
diff --git a/packages/shop/src/shop/kernel.py b/packages/shop/src/shop/kernel.py
new file mode 100644
--- /dev/null
+++ b/packages/shop/src/shop/kernel.py
@@ -0,0 +1,2 @@
+MONEY = 1
+RATE = 2
diff --git a/packages/old/basket.py b/packages/shop/src/shop/basket.py
similarity index 90%
rename from packages/old/basket.py
rename to packages/shop/src/shop/basket.py
index 3333333..4444444 100644
--- a/packages/old/basket.py
+++ b/packages/shop/src/shop/basket.py
@@ -4 +4 @@ class Basket
-  size = 0
+  size = 'new file mode 1'
diff --git a/packages/old/kept.py b/packages/shop/src/shop/kept.py
similarity index 100%
rename from packages/old/kept.py
rename to packages/shop/src/shop/kept.py
diff --git a/packages/shop/src/shop/fresh.py b/packages/shop/src/shop/fresh.py
new file mode 100644
index 0000000..5555555
--- /dev/null
+++ b/packages/shop/src/shop/fresh.py
@@ -0,0 +1 @@
+FRESH = 'rename from x'
diff --git a/packages/shop/src/shop/rename to x.py b/packages/shop/src/shop/rename to x.py
index 6666666..7777777 100644
--- a/packages/shop/src/shop/rename to x.py\t
+++ b/packages/shop/src/shop/rename to x.py\t
@@ -1 +1 @@
-X = 1
+X = 2
diff --git a/packages/shop/src/shop/logo.png b/packages/shop/src/shop/logo.png
index 8888888..9999999 100644
Binary files a/packages/shop/src/shop/logo.png and b/packages/shop/src/shop/logo.png differ
diff --git a/packages/other/src/other.py b/packages/other/src/other.py
index aaaaaaa..bbbbbbb 100644
--- a/packages/other/src/other.py
+++ b/packages/other/src/other.py
@@ -1 +1 @@
-OTHER = 1
+OTHER = 2
"""


def test_should_read_the_lines_each_file_adds_or_changes_and_the_files_git_does_not_track() -> None:
  # Arrange
  workspace = WorkspaceFake(
    answers={
      PREFIX: Completed(status=0, output='packages/shop/\n'),
      DIFF: Completed(status=0, output=CHANGED),
      UNTRACKED: Completed(
        status=0,
        output='src/shop/basket.py\nsrc/shop/fresh.py\nsrc/shop/kept.py\ntests/test_basket.py\n',
      ),
    },
    files=FILES,
  )

  # Act
  changes = read_changes(workspace)

  # Assert
  assert (changes.lines, changes.untracked, workspace.indexed) == (
    {
      Path('src/shop/orders.py'): (range(3, 4), range(11, 14)),
      Path('src/shop/kernel.py'): (range(1, 3),),
      Path('src/shop/basket.py'): (range(4, 5),),
      Path('src/shop/kept.py'): (),
      Path('src/shop/rename to x.py'): (range(1, 2),),
    },
    (Path('src/shop/fresh.py'), Path('tests/test_basket.py')),
    [('src/shop/basket.py', 'src/shop/fresh.py', 'src/shop/kept.py', 'tests/test_basket.py')],
  )
