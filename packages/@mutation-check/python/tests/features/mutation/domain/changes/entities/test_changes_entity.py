from changes_fixtures import changed, new, unit_relative_path

from droneey_mutation_check_python.features.mutation.domain.changes.entities import (
  Changes,
  python_source_files,
)


def test_should_keep_only_the_changed_files_that_are_python_sources() -> None:
  # Arrange
  orders = changed('src/shop/orders.py', range(1, 2))
  basket = new('src/shop/basket.py')
  changes = Changes(
    files=(
      changed('README.md', range(1, 2)),
      orders,
      new('tests/test_basket.py'),
      basket,
    ),
    python_source_paths=(
      unit_relative_path('src/shop/basket.py'),
      unit_relative_path('src/shop/money.py'),
      unit_relative_path('src/shop/orders.py'),
    ),
  )

  # Act
  files = python_source_files(changes)

  # Assert
  assert files == (orders, basket)
