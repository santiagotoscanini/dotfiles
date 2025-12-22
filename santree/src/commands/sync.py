"""Sync command handler - rebase/merge current worktree onto base branch."""

import subprocess
from typing import Any

from ..core import (
    GitOperations,
    dim,
    error,
    find_main_repo_root,
    find_repo_root,
    header,
    info,
    label,
    success,
    warning,
)


class SyncCommand:
    """Handle the 'sync' command."""

    def execute(self, args: Any) -> int:
        """Execute the sync command."""
        print(header("\n=== Santree Sync ===\n"))

        # Find repos
        main_repo = find_main_repo_root()
        current_repo = find_repo_root()

        if not main_repo or not current_repo:
            print(error("Error: Not inside a git repository"))
            return 1

        # Validate we're in a worktree
        if ".santree/worktrees" not in str(current_repo):
            print(error("Error: Not inside a santree worktree"))
            print(f"{label('Current directory:')} {dim(str(current_repo))}")
            print(dim("\nUse 'santree switch <branch>' to switch to a worktree first"))
            return 1

        git = GitOperations(main_repo)

        # Get current branch
        branch_name = self._get_current_branch()
        if not branch_name:
            print(error("Error: Could not determine current branch"))
            return 1

        print(f"{label('Current branch:')} {info(branch_name)}")

        # Get base branch from metadata
        metadata = git.get_worktree_metadata(current_repo)
        if metadata and "base_branch" in metadata:
            base_branch = metadata["base_branch"]
            print(f"{label('Base branch:')} {info(base_branch)} {dim('(from metadata)')}")
        else:
            base_branch = git.detect_default_branch()
            print(f"{label('Base branch:')} {info(base_branch)} {warning('(auto-detected)')}")

        # Check for uncommitted changes
        if self._has_uncommitted_changes():
            print(error("\nError: You have uncommitted changes"))
            print(dim("Please commit or stash your changes before syncing"))
            return 1

        # Fetch latest from remote
        print(header("\n--- Fetching from remote ---"))
        print(dim("Running: git fetch origin"))
        result = subprocess.run(
            ["git", "fetch", "origin"],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            print(error("Error: Failed to fetch from remote"))
            print(dim(result.stderr))
            return 1
        print(success("Fetched successfully"))

        # Get commits behind
        commits_behind = self._get_commits_behind(base_branch)
        if commits_behind == 0:
            print(success(f"\nAlready up to date with origin/{base_branch}"))
            return 0

        print(f"\n{info(f'{commits_behind} commit(s)')} behind origin/{base_branch}")

        # Rebase or merge
        if args.merge:
            print(header("\n--- Merging ---"))
            print(dim(f"Running: git merge origin/{base_branch}"))
            result = subprocess.run(
                ["git", "merge", f"origin/{base_branch}"],
                capture_output=False,
            )
        else:
            print(header("\n--- Rebasing ---"))
            print(dim(f"Running: git rebase origin/{base_branch}"))
            result = subprocess.run(
                ["git", "rebase", f"origin/{base_branch}"],
                capture_output=False,
            )

        if result.returncode != 0:
            if args.merge:
                print(error("\nMerge failed - conflicts detected"))
                print(dim("Resolve conflicts and run: git commit"))
                print(dim("Or abort with: git merge --abort"))
            else:
                print(error("\nRebase failed - conflicts detected"))
                print(dim("Resolve conflicts and run: git rebase --continue"))
                print(dim("Or abort with: git rebase --abort"))
            return 1

        print(success(f"\nSuccessfully synced with origin/{base_branch}"))
        return 0

    def _get_current_branch(self) -> str | None:
        """Get the current git branch name."""
        result = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            capture_output=True,
            text=True,
        )
        if result.returncode == 0:
            return result.stdout.strip()
        return None

    def _has_uncommitted_changes(self) -> bool:
        """Check if there are uncommitted changes."""
        result = subprocess.run(
            ["git", "status", "--porcelain"],
            capture_output=True,
            text=True,
        )
        return bool(result.stdout.strip())

    def _get_commits_behind(self, base_branch: str) -> int:
        """Get number of commits behind origin/base_branch."""
        result = subprocess.run(
            ["git", "rev-list", "--count", f"HEAD..origin/{base_branch}"],
            capture_output=True,
            text=True,
        )
        if result.returncode == 0:
            try:
                return int(result.stdout.strip())
            except ValueError:
                return 0
        return 0
