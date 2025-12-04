"""Create worktree command handler."""

from typing import Any

from ..core import find_repo_root, GitOperations, ScriptRunner


class CreateCommand:
    """Handle the 'create' command."""

    def execute(self, args: Any) -> int:
        """Execute the create command."""
        # Find repo root
        repo_root = find_repo_root()
        if not repo_root:
            print("Error: Not inside a git repository")
            return 1

        git = GitOperations(repo_root)
        script_runner = ScriptRunner(repo_root)

        # Get branch name (prompt if not provided)
        branch_name = args.branch_name
        if not branch_name:
            # Use /dev/tty for prompts to work when stdout is captured
            try:
                with open("/dev/tty", "w") as tty_out, open("/dev/tty", "r") as tty_in:
                    tty_out.write("Enter branch name: ")
                    tty_out.flush()
                    branch_name = tty_in.readline().strip()
            except (EOFError, KeyboardInterrupt, OSError):
                print("\nCancelled")
                return 1
            if not branch_name:
                print("Error: Branch name is required")
                return 1

        # Validate branch name
        if not self._validate_branch_name(branch_name):
            print(f"Error: Invalid branch name: {branch_name}")
            return 1

        # Detect or use specified base branch
        base_branch = args.base or git.detect_default_branch()
        print(f"Creating worktree '{branch_name}' from '{base_branch}'...")

        # Pull latest unless --no-pull
        if not args.no_pull:
            print(f"Fetching latest changes for {base_branch}...")
            success, message = git.pull_latest(base_branch)
            if not success:
                print(f"Warning: {message}")
                # Continue anyway - user might want to create from local state

        # Create the worktree
        success, result = git.create_worktree(branch_name, base_branch)
        if not success:
            print(f"Error: {result}")
            return 1

        worktree_path = result
        print(f"Created worktree at: {worktree_path}")

        # Run init script if it exists
        if script_runner.has_init_script():
            print("\nRunning init script...")
            success, message = script_runner.run_init_script(worktree_path)
            if success:
                print(message)
            else:
                print(f"Warning: {message}")

        # Output special prefix for shell wrapper to cd into the new worktree
        print(f"SANTREE_CD:{worktree_path}")
        return 0

    def _validate_branch_name(self, name: str) -> bool:
        """Validate branch name follows git conventions."""
        if not name:
            return False
        # Basic validation - no spaces, no .., etc
        invalid_patterns = [" ", "..", "~", "^", ":", "\\", "*", "?", "[", "@{"]
        return not any(pattern in name for pattern in invalid_patterns)
