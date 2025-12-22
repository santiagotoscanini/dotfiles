"""Setup command handler - runs init script in current worktree."""

from pathlib import Path
from typing import Any

from ..core import (
    ScriptRunner,
    dim,
    error,
    find_main_repo_root,
    header,
    info,
    label,
    success,
)


class SetupCommand:
    """Handle the 'setup' command."""

    def execute(self, _args: Any) -> int:
        """Execute the setup command."""
        print(header("\n=== Santree Setup ===\n"))

        # Find main repo root (where .santree/init.sh lives)
        main_repo = find_main_repo_root()
        if not main_repo:
            print(error("Error: Not inside a git repository"))
            return 1

        # Script lives in main repo
        script_runner = ScriptRunner(main_repo)

        # Check if init script exists
        if not script_runner.has_init_script():
            print(error(f"Error: No init script found at {script_runner.init_script}"))
            print(dim("\nCreate one with:"))
            print(dim(f"  mkdir -p {main_repo}/.santree"))
            print(dim(f"  touch {main_repo}/.santree/init.sh"))
            print(dim(f"  chmod +x {main_repo}/.santree/init.sh"))
            return 1

        # Check if executable
        if not script_runner.is_executable():
            print(error(f"Error: Init script is not executable: {script_runner.init_script}"))
            print(dim(f"\nRun: chmod +x {script_runner.init_script}"))
            return 1

        # Run in current directory (must be inside a worktree)
        worktree_path = Path.cwd()

        # Validate we're inside a .santree/worktrees directory
        if ".santree/worktrees" not in str(worktree_path):
            print(error("Error: Not inside a santree worktree"))
            print(f"{label('Current directory:')} {dim(str(worktree_path))}")
            print(dim("\nUse 'santree switch <branch>' to switch to a worktree first"))
            return 1

        print(f"{label('Worktree:')} {info(str(worktree_path))}")
        print(f"{label('Script:')} {dim(str(script_runner.init_script))}")
        print(header("\n--- Running init script ---\n"))

        run_success, message = script_runner.run_init_script(worktree_path)

        print()  # Add newline after script output
        if run_success:
            print(success(message))
            return 0
        else:
            print(error(f"Error: {message}"))
            return 1
