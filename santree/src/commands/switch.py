"""Switch worktree command handler."""

from typing import Any

from ..core import (
    GitOperations,
    dim,
    error,
    find_main_repo_root,
    info,
)


class SwitchCommand:
    """Handle the 'switch' command."""

    def execute(self, args: Any) -> int:
        """Execute the switch command.

        Note: This command outputs a path with SANTREE_CD: prefix
        that the shell wrapper will use to cd into the worktree.
        """
        repo_root = find_main_repo_root()
        if not repo_root:
            print(error("Error: Not inside a git repository"))
            return 1

        git = GitOperations(repo_root)

        worktree_path = git.get_worktree_path(args.branch_name)
        if not worktree_path:
            print(error(f"Error: Worktree not found: {args.branch_name}"))
            print(dim("\nAvailable worktrees:"))
            worktrees = git.list_worktrees()
            for wt in worktrees:
                if wt.branch:
                    print(f"  {info(wt.branch)}")
            return 1

        # Output special prefix for shell wrapper to parse
        print(f"SANTREE_CD:{worktree_path}")
        return 0
