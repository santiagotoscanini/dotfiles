"""Configuration and path utilities for santree."""

import subprocess
from pathlib import Path
from typing import Optional


def find_repo_root() -> Optional[Path]:
    """Find the git repository root from current directory."""
    result = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"],
        capture_output=True,
        text=True,
    )

    if result.returncode == 0:
        return Path(result.stdout.strip())
    return None


def get_santree_dir(repo_root: Path) -> Path:
    """Get the .santree directory path."""
    return repo_root / ".santree"


def get_worktrees_dir(repo_root: Path) -> Path:
    """Get the worktrees directory path."""
    return get_santree_dir(repo_root) / "worktrees"
