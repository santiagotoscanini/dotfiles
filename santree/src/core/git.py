"""Git operations for worktree management."""

import json
import subprocess
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Tuple

from .config import get_santree_dir, get_worktrees_dir


@dataclass
class Worktree:
    """Represents a git worktree."""

    path: Path
    branch: str = ""
    commit: str = ""
    is_bare: bool = False
    is_main: bool = False


class GitOperations:
    """Handle all git worktree operations."""

    def __init__(self, repo_root: Path):
        self.repo_root = repo_root
        self.santree_dir = get_santree_dir(repo_root)
        self.worktrees_dir = get_worktrees_dir(repo_root)

    def detect_default_branch(self) -> str:
        """Detect the default branch (main or master)."""
        # Try remote HEAD first
        result = self._run_git("symbolic-ref", "refs/remotes/origin/HEAD")
        if result.returncode == 0:
            ref = result.stdout.strip()
            return ref.replace("refs/remotes/origin/", "")

        # Fall back to checking if main/master exists
        for branch in ["main", "master"]:
            result = self._run_git("rev-parse", "--verify", f"refs/heads/{branch}")
            if result.returncode == 0:
                return branch

        return "main"  # Default assumption

    def pull_latest(self, branch: str) -> Tuple[bool, str]:
        """Pull latest changes for a branch."""
        # Fetch first
        fetch_result = self._run_git("fetch", "origin", branch)
        if fetch_result.returncode != 0:
            return False, f"Failed to fetch: {fetch_result.stderr}"

        return True, "Successfully fetched latest changes"

    def create_worktree(self, branch_name: str, base_branch: str) -> Tuple[bool, str]:
        """Create a new worktree, with new or existing branch."""
        # Transform slashes to avoid creating subdirectories
        dir_name = branch_name.replace("/", "__")
        worktree_path = self.worktrees_dir / dir_name

        # Check if worktree already exists
        if worktree_path.exists():
            return False, f"Worktree already exists at {worktree_path}"

        # Ensure .santree/worktrees directory exists
        self.worktrees_dir.mkdir(parents=True, exist_ok=True)

        # Check if branch already exists
        result = self._run_git("rev-parse", "--verify", f"refs/heads/{branch_name}")
        branch_exists = result.returncode == 0

        if branch_exists:
            # Create worktree from existing branch
            result = self._run_git(
                "worktree",
                "add",
                str(worktree_path),
                branch_name,
            )
        else:
            # Create worktree with new branch
            result = self._run_git(
                "worktree",
                "add",
                "-b",
                branch_name,
                str(worktree_path),
                base_branch,
            )

        if result.returncode != 0:
            return False, f"Failed to create worktree: {result.stderr}"

        # Save metadata for PR creation
        self._save_worktree_metadata(worktree_path, branch_name, base_branch)

        return True, str(worktree_path)

    def _save_worktree_metadata(self, worktree_path: Path, branch_name: str, base_branch: str) -> None:
        """Save worktree metadata for later use (e.g., PR creation)."""
        metadata = {
            "branch_name": branch_name,
            "base_branch": base_branch,
            "created_at": datetime.now().isoformat(),
        }
        metadata_file = worktree_path / ".santree_metadata.json"
        metadata_file.write_text(json.dumps(metadata, indent=2))

    def get_worktree_metadata(self, worktree_path: Path) -> Optional[dict]:
        """Read worktree metadata if it exists."""
        metadata_file = worktree_path / ".santree_metadata.json"
        if metadata_file.exists():
            return json.loads(metadata_file.read_text())
        return None

    def list_worktrees(self) -> List[Worktree]:
        """List all worktrees."""
        result = self._run_git("worktree", "list", "--porcelain")
        if result.returncode != 0:
            return []

        worktrees = []
        current_wt: dict = {}

        for line in result.stdout.strip().split("\n"):
            if line.startswith("worktree "):
                current_wt = {"path": Path(line.replace("worktree ", ""))}
            elif line.startswith("HEAD "):
                current_wt["commit"] = line.replace("HEAD ", "")[:8]
            elif line.startswith("branch "):
                current_wt["branch"] = line.replace("branch refs/heads/", "")
            elif line == "bare":
                current_wt["is_bare"] = True
            elif line == "" and current_wt:
                worktrees.append(Worktree(**current_wt))
                current_wt = {}

        if current_wt:
            worktrees.append(Worktree(**current_wt))

        return worktrees

    def remove_worktree(self, branch_name: str, force: bool = False) -> Tuple[bool, str]:
        """Remove a worktree."""
        # Transform slashes to match how worktrees are created
        dir_name = branch_name.replace("/", "__")
        worktree_path = self.worktrees_dir / dir_name

        if not worktree_path.exists():
            return False, f"Worktree not found: {branch_name}"

        args = ["worktree", "remove"]
        if force:
            args.append("--force")
        args.append(str(worktree_path))

        result = self._run_git(*args)
        if result.returncode != 0:
            return False, f"Failed to remove worktree: {result.stderr}"

        # Delete the branch too
        delete_flag = "-D" if force else "-d"
        branch_result = self._run_git("branch", delete_flag, branch_name)
        if branch_result.returncode != 0:
            # Don't fail if branch deletion fails, just warn
            return True, f"Removed worktree but could not delete branch: {branch_result.stderr}"

        return True, f"Removed worktree and branch: {branch_name}"

    def get_worktree_path(self, branch_name: str) -> Optional[Path]:
        """Get path to a specific worktree by branch name."""
        # Search through all worktrees
        for wt in self.list_worktrees():
            if wt.branch == branch_name:
                return wt.path
        return None

    def _run_git(self, *args) -> subprocess.CompletedProcess:
        """Run a git command in the repo root."""
        return subprocess.run(
            ["git", *args],
            cwd=self.repo_root,
            capture_output=True,
            text=True,
        )
