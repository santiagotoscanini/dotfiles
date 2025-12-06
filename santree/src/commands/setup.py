"""Setup command handler - runs init script in current worktree."""

from pathlib import Path
from typing import Any

from ..core import find_main_repo_root, ScriptRunner


class SetupCommand:
    """Handle the 'setup' command."""

    def execute(self, _args: Any) -> int:
        """Execute the setup command."""
        # Find main repo root (where .santree/init.sh lives)
        main_repo = find_main_repo_root()
        if not main_repo:
            print("Error: Not inside a git repository")
            return 1

        # Script lives in main repo
        script_runner = ScriptRunner(main_repo)

        # Check if init script exists
        if not script_runner.has_init_script():
            print(f"Error: No init script found at {script_runner.init_script}")
            print("\nCreate one with:")
            print(f"  mkdir -p {main_repo}/.santree")
            print(f"  touch {main_repo}/.santree/init.sh")
            print(f"  chmod +x {main_repo}/.santree/init.sh")
            return 1

        # Check if executable
        if not script_runner.is_executable():
            print(f"Error: Init script is not executable: {script_runner.init_script}")
            print(f"\nRun: chmod +x {script_runner.init_script}")
            return 1

        # Run in current directory (must be inside a worktree)
        worktree_path = Path.cwd()

        # Validate we're inside a .santree/worktrees directory
        if ".santree/worktrees" not in str(worktree_path):
            print("Error: Not inside a santree worktree")
            print(f"Current directory: {worktree_path}")
            print("\nUse 'santree switch <branch>' to switch to a worktree first")
            return 1

        print(f"Running init script in: {worktree_path}\n")
        success, message = script_runner.run_init_script(worktree_path)

        print()  # Add newline after script output
        if success:
            print(message)
            return 0
        else:
            print(f"Error: {message}")
            return 1
