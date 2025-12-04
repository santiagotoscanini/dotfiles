"""Script runner for post-worktree init scripts."""

import os
import stat
import subprocess
from pathlib import Path
from typing import Tuple

from santree.core.config import get_santree_dir


class ScriptRunner:
    """Run init scripts safely after worktree creation."""

    def __init__(self, repo_root: Path):
        self.repo_root = repo_root
        self.init_script = get_santree_dir(repo_root) / "init.sh"

    def has_init_script(self) -> bool:
        """Check if an init script exists."""
        return self.init_script.exists()

    def is_executable(self) -> bool:
        """Check if the init script is executable."""
        if not self.init_script.exists():
            return False

        # Check if file has executable bit
        mode = os.stat(self.init_script).st_mode
        return bool(mode & (stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH))

    def run_init_script(self, worktree_path: Path) -> Tuple[bool, str]:
        """Run the init script in the context of a worktree.

        Args:
            worktree_path: Path to the newly created worktree

        Returns:
            Tuple of (success, message)
        """
        if not self.has_init_script():
            return True, "No init script found"

        if not self.is_executable():
            return False, f"Init script exists but is not executable: {self.init_script}\nRun: chmod +x {self.init_script}"

        try:
            result = subprocess.run(
                [str(self.init_script)],
                cwd=worktree_path,
                env={
                    **os.environ,
                    "SANTREE_WORKTREE_PATH": str(worktree_path),
                    "SANTREE_REPO_ROOT": str(self.repo_root),
                },
            )

            if result.returncode == 0:
                return True, "Init script completed successfully"
            else:
                return False, f"Init script failed (exit code {result.returncode})"

        except Exception as e:
            return False, f"Error running init script: {e}"
