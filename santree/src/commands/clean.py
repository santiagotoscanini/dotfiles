"""Clean command handler - remove worktrees with merged/closed PRs."""

import json
import subprocess
from typing import Any, Optional

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


class CleanCommand:
    """Handle the 'clean' command."""

    def execute(self, args: Any) -> int:
        """Execute the clean command."""
        print(header("\n=== Santree Clean ===\n"))

        # Find main repo root
        repo_root = find_main_repo_root()
        if not repo_root:
            print(error("Error: Not inside a git repository"))
            return 1

        git = GitOperations(repo_root)
        worktrees = git.list_worktrees()

        # Find worktrees with merged/closed PRs
        stale_worktrees = []
        print(dim("Checking worktrees for merged/closed PRs...\n"))

        for wt in worktrees:
            # Skip main repo
            if ".santree/worktrees" not in str(wt.path):
                continue

            if not wt.branch:
                continue

            pr_info = self._get_pr_info(wt.branch)
            if pr_info:
                pr_num, pr_state = pr_info
                if pr_state in ("MERGED", "CLOSED"):
                    stale_worktrees.append({
                        "branch": wt.branch,
                        "path": wt.path,
                        "pr_num": pr_num,
                        "pr_state": pr_state,
                    })

        if not stale_worktrees:
            print(success("No stale worktrees found"))
            print(dim("All worktrees have open PRs or no PRs"))
            return 0

        # Display stale worktrees
        print(f"\nFound {warning(str(len(stale_worktrees)))} stale worktree(s):\n")

        for wt in stale_worktrees:
            state_str = success("merged") if wt["pr_state"] == "MERGED" else warning("closed")
            print(f"  {info(wt['branch'])}")
            print(f"    PR #{wt['pr_num']} ({state_str})")
            print(f"    {dim(str(wt['path']))}")
            print()

        # Dry run - just show what would be removed
        if args.dry_run:
            print(dim("Dry run - no changes made"))
            return 0

        # Confirm removal
        if not args.force:
            # Build confirmation message with worktree list
            worktree_list = ", ".join(info(wt["branch"]) for wt in stale_worktrees)
            try:
                with open("/dev/tty", "w") as tty_out, open("/dev/tty", "r") as tty_in:
                    tty_out.write(f"{label('Remove')} {worktree_list}? [y/N]: ")
                    tty_out.flush()
                    confirm = tty_in.readline().strip().lower()
            except (EOFError, KeyboardInterrupt, OSError):
                print(warning("\nCancelled"))
                return 1

            if confirm != "y":
                print(warning("Cancelled"))
                return 0

        # Remove stale worktrees
        print(header("\n--- Removing worktrees ---\n"))

        removed = 0
        failed = 0

        for wt in stale_worktrees:
            print(f"Removing {info(wt['branch'])}...")
            remove_success, message = git.remove_worktree(wt["branch"], force=True)

            if remove_success:
                print(success(f"  {message}"))
                removed += 1
            else:
                print(error(f"  Error: {message}"))
                failed += 1

        print()
        if removed > 0:
            print(success(f"Removed {removed} worktree(s)"))
        if failed > 0:
            print(error(f"Failed to remove {failed} worktree(s)"))

        return 0 if failed == 0 else 1

    def _get_pr_info(self, branch_name: str) -> Optional[tuple[str, str]]:
        """Get PR number and state for a branch."""
        result = subprocess.run(
            ["gh", "pr", "view", branch_name, "--json", "number,state"],
            capture_output=True,
            text=True,
        )
        if result.returncode == 0:
            try:
                data = json.loads(result.stdout)
                return str(data.get("number", "")), data.get("state", "OPEN")
            except json.JSONDecodeError:
                return None
        return None
