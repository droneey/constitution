from pathlib import Path

from mutmut_check.changes import changed_lines

DIFF = """diff --git a/src/shop/orders.py b/src/shop/orders.py
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


def test_should_read_the_lines_each_file_adds_or_changes() -> None:
  # Arrange
  diff = DIFF

  # Act
  lines = changed_lines(diff)

  # Assert
  assert lines == {
    Path('src/shop/orders.py'): (range(3, 4), range(11, 14)),
    Path('src/shop/kernel.py'): (range(1, 3),),
  }
