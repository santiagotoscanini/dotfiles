"""Create worktree command handler."""

from typing import Any

from ..core import (
    GitOperations,
    ScriptRunner,
    dim,
    error,
    find_main_repo_root,
    header,
    info,
    label,
    success,
    warning,
)


class CreateCommand:
    """Handle the 'create' command."""

    def execute(self, args: Any) -> int:
        """Execute the create command."""
        print(header("\n=== Santree Create ===\n"))

        # Find main repo root
        repo_root = find_main_repo_root()
        if not repo_root:
            print(error("Error: Not inside a git repository"))
            return 1

        print(f"{label('Repository:')} {dim(str(repo_root))}")

        git = GitOperations(repo_root)
        script_runner = ScriptRunner(repo_root)

        # Get branch name (prompt if not provided)
        branch_name = args.branch_name
        if not branch_name:
            # Use /dev/tty for prompts to work when stdout is captured
            try:
                with open("/dev/tty", "w") as tty_out, open("/dev/tty", "r") as tty_in:
                    tty_out.write(f"{label('Enter branch name:')} ")
                    tty_out.flush()
                    branch_name = tty_in.readline().strip()
            except (EOFError, KeyboardInterrupt, OSError):
                print(warning("\nCancelled"))
                return 1
            if not branch_name:
                print(error("Error: Branch name is required"))
                return 1

        # Validate branch name
        if not self._validate_branch_name(branch_name):
            print(error(f"Error: Invalid branch name: {branch_name}"))
            return 1

        print(f"{label('Branch:')} {info(branch_name)}")

        # Detect or use specified base branch
        base_branch = args.base or git.detect_default_branch()
        print(f"{label('Base branch:')} {info(base_branch)}")

        # Pull latest unless --no-pull
        if not args.no_pull:
            print(dim(f"\nFetching latest changes for {base_branch}..."))
            pull_success, message = git.pull_latest(base_branch)
            if not pull_success:
                print(warning(f"Warning: {message}"))
                # Continue anyway - user might want to create from local state
            else:
                print(success("Fetched latest changes"))

        # Create the worktree
        print(dim("\nCreating worktree..."))
        create_success, result = git.create_worktree(branch_name, base_branch)
        if not create_success:
            print(error(f"Error: {result}"))
            return 1

        worktree_path = result
        print(success(f"Created worktree at: {worktree_path}"))

        # Run init script if it exists
        if script_runner.has_init_script():
            print(header("\n--- Running init script ---"))
            script_success, message = script_runner.run_init_script(worktree_path)
            if script_success:
                print(success(message))
            else:
                print(warning(f"Warning: {message}"))

        print(success("\nWorktree created successfully!"))

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
