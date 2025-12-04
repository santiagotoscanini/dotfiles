"""Configuration and path utilities for santree."""

import subprocess
from pathlib import Path
from typing import Optional


def find_repo_root() -> Optional[Path]:
    """Find the git repository root from current directory (may be a worktree)."""
    result = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"],
        capture_output=True,
        text=True,
    )

    if result.returncode == 0:
        return Path(result.stdout.strip())
    return None


def find_main_repo_root() -> Optional[Path]:
    """Find the main repository root (not a worktree).

    Uses git's --git-common-dir to find the shared git directory,
    which is always in the main repo.
    """
    result = subprocess.run(
        ["git", "rev-parse", "--git-common-dir"],
        capture_output=True,
        text=True,
    )

    if result.returncode == 0:
        git_common_dir = Path(result.stdout.strip()).resolve()
        # The common dir is .git in the main repo, so parent is repo root
        return git_common_dir.parent
    return None


def get_santree_dir(repo_root: Path) -> Path:
    """Get the .santree directory path."""
    return repo_root / ".santree"


def get_worktrees_dir(repo_root: Path) -> Path:
    """Get the worktrees directory path."""
    return get_santree_dir(repo_root) / "worktrees"
