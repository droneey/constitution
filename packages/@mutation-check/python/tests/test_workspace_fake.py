from typing import TYPE_CHECKING

import pytest
from workspace_fake import WorkspaceFake
from workspace_suite import WorkspaceSuite

if TYPE_CHECKING:
  from workspace_suite import WorkspaceBuilder


class TestWorkspaceFake(WorkspaceSuite):
  @pytest.fixture
  def build_workspace(self) -> WorkspaceBuilder:
    return lambda texts_by_path: WorkspaceFake(texts_by_path=texts_by_path)
