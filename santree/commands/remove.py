"""Remove worktree command handler."""

from typing import Any

from ..core import find_main_repo_root, GitOperations


class RemoveCommand:
    """Handle the 'remove' command."""

    def execute(self, args: Any) -> int:
        """Execute the remove command."""
        # Find main repo root
        repo_root = find_main_repo_root()
        if not repo_root:
            print("Error: Not inside a git repository")
            return 1

        git = GitOperations(repo_root)
        branch_name = args.branch_name

        # Check if worktree exists
        worktree_path = git.get_worktree_path(branch_name)
        if not worktree_path:
            print(f"Error: Worktree not found: {branch_name}")
            print("\nAvailable worktrees:")
            worktrees = git.list_worktrees()
            for wt in worktrees:
                if wt.branch:
                    print(f"  - {wt.branch}")
            return 1

        # Confirm removal
        if not args.force:
            # Use /dev/tty for prompts to work when stdout is captured
            try:
                with open("/dev/tty", "w") as tty_out, open("/dev/tty", "r") as tty_in:
                    tty_out.write(f"About to remove worktree: {branch_name}\n")
                    tty_out.write(f"Path: {worktree_path}\n")
                    tty_out.write("This will also delete the branch.\n")
                    tty_out.write("\nProceed? [y/N]: ")
                    tty_out.flush()
                    confirm = tty_in.readline().strip().lower()
            except (EOFError, KeyboardInterrupt, OSError):
                print("\nCancelled")
                return 1
            if confirm != "y":
                print("Cancelled")
                return 0

        # Remove the worktree
        print(f"Removing worktree: {branch_name}...")
        success, message = git.remove_worktree(branch_name, force=args.force)

        if success:
            print(message)
            return 0
        else:
            print(f"Error: {message}")
            if not args.force:
                print("\nTip: Use --force to force removal")
            return 1
