"""List worktrees command handler."""

from typing import Any

from ..core import find_repo_root, GitOperations


class ListCommand:
    """Handle the 'list' command."""

    def execute(self, args: Any) -> int:
        """Execute the list command."""
        # Find repo root
        repo_root = find_repo_root()
        if not repo_root:
            print("Error: Not inside a git repository")
            return 1

        git = GitOperations(repo_root)
        worktrees = git.list_worktrees()

        if not worktrees:
            print("No worktrees found")
            return 0

        # Find max lengths for formatting
        max_branch = max(len(wt.branch or "(detached)") for wt in worktrees)
        max_branch = max(max_branch, 6)  # minimum "Branch" header

        # Print header
        print(f"{'Branch':<{max_branch}}  {'Commit':<8}  Path")
        print(f"{'-' * max_branch}  {'-' * 8}  {'-' * 40}")

        # Print worktrees
        for wt in worktrees:
            branch = wt.branch or "(detached)"
            commit = wt.commit[:8] if wt.commit else "--------"

            # Mark if it's in .santree/worktrees
            is_santree = ".santree/worktrees" in str(wt.path)
            marker = "" if is_santree else " (main)"

            print(f"{branch:<{max_branch}}  {commit:<8}  {wt.path}{marker}")

        return 0
