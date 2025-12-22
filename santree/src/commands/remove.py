"""Remove worktree command handler."""

from typing import Any

from ..core import (
    GitOperations,
    dim,
    error,
    find_main_repo_root,
    header,
    info,
    label,
    success,
    warning,
)


class RemoveCommand:
    """Handle the 'remove' command."""

    def execute(self, args: Any) -> int:
        """Execute the remove command."""
        print(header("\n=== Santree Remove ===\n"))

        # Find main repo root
        repo_root = find_main_repo_root()
        if not repo_root:
            print(error("Error: Not inside a git repository"))
            return 1

        git = GitOperations(repo_root)
        branch_name = args.branch_name

        print(f"{label('Branch:')} {info(branch_name)}")

        # Check if worktree exists
        worktree_path = git.get_worktree_path(branch_name)
        if not worktree_path:
            print(error(f"\nError: Worktree not found: {branch_name}"))
            print(dim("\nAvailable worktrees:"))
            worktrees = git.list_worktrees()
            for wt in worktrees:
                if wt.branch:
                    print(f"  {info(wt.branch)}")
            return 1

        print(f"{label('Path:')} {dim(str(worktree_path))}")

        # Confirm removal
        if not args.force:
            print(warning("\nThis will remove the worktree and delete the branch."))
            # Use /dev/tty for prompts to work when stdout is captured
            try:
                with open("/dev/tty", "w") as tty_out, open("/dev/tty", "r") as tty_in:
                    tty_out.write(f"{label('Proceed?')} [y/N]: ")
                    tty_out.flush()
                    confirm = tty_in.readline().strip().lower()
            except (EOFError, KeyboardInterrupt, OSError):
                print(warning("\nCancelled"))
                return 1
            if confirm != "y":
                print(warning("Cancelled"))
                return 0

        # Remove the worktree
        print(dim("\nRemoving worktree..."))
        remove_success, message = git.remove_worktree(branch_name, force=args.force)

        if remove_success:
            print(success(f"\n{message}"))
            return 0
        else:
            print(error(f"\nError: {message}"))
            if not args.force:
                print(dim("\nTip: Use --force to force removal"))
            return 1
