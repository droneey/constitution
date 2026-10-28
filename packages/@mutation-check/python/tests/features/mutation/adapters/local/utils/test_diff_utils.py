from typing import TYPE_CHECKING, Final

import pytest
from changes_fixtures import changed, new, unit_relative_path
from hypothesis import example, given
from hypothesis import strategies as st

from droneey_mutation_check_python.features.mutation.adapters.local.utils import file_changes
from droneey_mutation_check_python.features.mutation.domain.errors import InvalidValueError

if TYPE_CHECKING:
  from droneey_mutation_check_python.features.mutation.domain.entities import FileChange
  from droneey_mutation_check_python.features.mutation.domain.value_objects import UnitRelativePath

CHANGED_IN_TWO_HUNKS = """\
diff --git a/packages/shop/src/shop/orders.py b/packages/shop/src/shop/orders.py
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
"""
ADDED_AND_COMMITTED = """\
diff --git a/packages/shop/src/shop/kernel.py b/packages/shop/src/shop/kernel.py
new file mode 100644
--- /dev/null
+++ b/packages/shop/src/shop/kernel.py
@@ -0,0 +1,2 @@
+MONEY = 1
+RATE = 2
"""
MOVED_AND_CHANGED = """\
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
"""
MOVED_UNCHANGED = """\
diff --git a/packages/old/kept.py b/packages/shop/src/shop/kept.py
similarity index 100%
rename from packages/old/kept.py
rename to packages/shop/src/shop/kept.py
"""
NEW = """\
diff --git a/packages/shop/src/shop/fresh.py b/packages/shop/src/shop/fresh.py
new file mode 100644
index 0000000..5555555
--- /dev/null
+++ b/packages/shop/src/shop/fresh.py
@@ -0,0 +1 @@
+FRESH = 'rename from x'
"""
NAMED_WITH_A_SPACE = """\
diff --git a/packages/shop/src/shop/rename to x.py b/packages/shop/src/shop/rename to x.py
index 6666666..7777777 100644
--- a/packages/shop/src/shop/rename to x.py\t
+++ b/packages/shop/src/shop/rename to x.py\t
@@ -1 +1 @@
-X = 1
+X = 2
"""
BINARY = """\
diff --git a/packages/shop/src/shop/logo.png b/packages/shop/src/shop/logo.png
index 8888888..9999999 100644
Binary files a/packages/shop/src/shop/logo.png and b/packages/shop/src/shop/logo.png differ
"""
OF_ANOTHER_UNIT = """\
diff --git a/packages/other/src/other.py b/packages/other/src/other.py
index aaaaaaa..bbbbbbb 100644
--- a/packages/other/src/other.py
+++ b/packages/other/src/other.py
@@ -1 +1 @@
-OTHER = 1
+OTHER = 2
"""


@pytest.mark.parametrize(
  ('diff_output', 'untracked_paths', 'files'),
  [
    pytest.param(
      CHANGED_IN_TWO_HUNKS,
      (),
      (changed('src/shop/orders.py', range(3, 4), range(11, 14)),),
      id='a file changed in hunks, one reading like a header and one only deleting',
    ),
    pytest.param(
      ADDED_AND_COMMITTED,
      (),
      (changed('src/shop/kernel.py', range(1, 3)),),
      id='a file added and committed',
    ),
    pytest.param(
      MOVED_AND_CHANGED,
      (unit_relative_path('src/shop/basket.py'),),
      (changed('src/shop/basket.py', range(4, 5)),),
      id="a file moved in from another folder, changing a line that reads like a new file's",
    ),
    pytest.param(
      MOVED_UNCHANGED,
      (unit_relative_path('src/shop/kept.py'),),
      (changed('src/shop/kept.py'),),
      id='a file moved in unchanged',
    ),
    pytest.param(
      NEW,
      (unit_relative_path('src/shop/fresh.py'),),
      (new('src/shop/fresh.py'),),
      id="a file git does not track, whose line reads like a move's",
    ),
    pytest.param(
      '',
      (unit_relative_path('tests/test_basket.py'),),
      (new('tests/test_basket.py'),),
      id='a file git does not track and the diff leaves out',
    ),
    pytest.param(
      NAMED_WITH_A_SPACE,
      (),
      (changed('src/shop/rename to x.py', range(1, 2)),),
      id="a file whose name holds a space and reads like a move's",
    ),
    pytest.param(BINARY, (), (), id='a binary file'),
    pytest.param(OF_ANOTHER_UNIT, (), (), id='a file of another unit'),
  ],
)
def test_should_read_the_files_of_the_unit_a_diff_changed(
  diff_output: str, untracked_paths: tuple[UnitRelativePath, ...], files: tuple[FileChange, ...]
) -> None:
  # Act
  read = file_changes(
    diff_with_untracked_added=diff_output,
    unit_prefix='packages/shop/',
    untracked_paths=untracked_paths,
  )

  # Assert
  assert read == files


DIFF_LINE_OPENINGS: Final = (
  'diff --git a/packages/shop/src/x.py b/',
  '+++ b/packages/shop/',
  'rename from packages/old/',
  'rename to packages/shop/',
  'new file mode 100644',
  '@@ -1 +',
  '@@ -0,0 +1,',
)
DIFF_LINES: Final = st.one_of(
  st.text(),
  st.sampled_from(DIFF_LINE_OPENINGS).flatmap(lambda opening: st.text().map(opening.__add__)),
)


@given(diff_output=st.lists(DIFF_LINES, max_size=12).map('\n'.join))
@example(diff_output='diff --git a/x b/x\n+++ b/packages/shop//etc/passwd\n')
@example(diff_output='diff --git a/x b/x\n+++ b/packages/shop/../outside.py\n')
def test_should_answer_the_files_or_refuse_a_path_out_of_the_unit_whatever_the_diff(
  diff_output: str,
) -> None:
  # Act
  try:
    answered = file_changes(
      diff_with_untracked_added=diff_output, unit_prefix='packages/shop/', untracked_paths=()
    )
  except InvalidValueError as error:
    answered = error

  # Assert
  assert isinstance(answered, tuple | InvalidValueError)
