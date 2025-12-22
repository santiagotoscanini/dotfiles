"""List worktrees command handler."""

import json
import subprocess
from pathlib import Path
from typing import Any, Optional

from ..core import (
    GitOperations,
    dim,
    error,
    find_main_repo_root,
    header,
    info,
    success,
    warning,
)


class ListCommand:
    """Handle the 'list' command."""

    def execute(self, args: Any) -> int:
        """Execute the list command."""
        print(header("\n=== Santree List ===\n"))

        # Find main repo root
        repo_root = find_main_repo_root()
        if not repo_root:
            print(error("Error: Not inside a git repository"))
            return 1

        git = GitOperations(repo_root)
        worktrees = git.list_worktrees()

        if not worktrees:
            print(warning("No worktrees found"))
            return 0

        # Gather additional info for each worktree
        wt_info = []
        for wt in worktrees:
            branch = wt.branch or "(detached)"
            is_main = ".santree/worktrees" not in str(wt.path)

            # Get metadata for base branch
            base = "-"
            ahead = "-"
            if not is_main:
                metadata = git.get_worktree_metadata(wt.path)
                if metadata and "base_branch" in metadata:
                    base = metadata["base_branch"]
                    # Get commits ahead
                    ahead_count = self._get_commits_ahead(wt.path, base)
                    ahead = str(ahead_count) if ahead_count >= 0 else "-"

            # Get PR info
            pr_info = "-"
            if not is_main and wt.branch:
                pr = self._get_pr_info(wt.branch)
                if pr:
                    pr_num, pr_state = pr
                    if pr_state == "MERGED":
                        pr_info = f"#{pr_num} (merged)"
                    elif pr_state == "CLOSED":
                        pr_info = f"#{pr_num} (closed)"
                    else:
                        pr_info = f"#{pr_num}"

            # Get dirty status
            status = "-"
            if not is_main:
                is_dirty = self._is_dirty(wt.path)
                status = "dirty" if is_dirty else "clean"

            wt_info.append({
                "branch": branch,
                "base": base,
                "ahead": ahead,
                "pr": pr_info,
                "status": status,
                "path": str(wt.path),
                "is_main": is_main,
            })

        # Calculate column widths
        max_branch = max(len(w["branch"]) for w in wt_info)
        max_branch = max(max_branch, 6)
        max_base = max(len(w["base"]) for w in wt_info)
        max_base = max(max_base, 4)
        max_ahead = max(len(w["ahead"]) for w in wt_info)
        max_ahead = max(max_ahead, 5)
        max_pr = max(len(w["pr"]) for w in wt_info)
        max_pr = max(max_pr, 2)
        max_status = max(len(w["status"]) for w in wt_info)
        max_status = max(max_status, 6)

        # Print header
        hdr = f"{'Branch':<{max_branch}}  {'Base':<{max_base}}  {'Ahead':<{max_ahead}}  {'PR':<{max_pr}}  {'Status':<{max_status}}  Path"
        print(dim(hdr))
        print(dim(f"{'-' * max_branch}  {'-' * max_base}  {'-' * max_ahead}  {'-' * max_pr}  {'-' * max_status}  {'-' * 30}"))

        # Print worktrees
        for w in wt_info:
            branch_str = info(w["branch"]) if not w["is_main"] else dim(w["branch"])
            base_str = dim(w["base"])
            ahead_str = success(w["ahead"]) if w["ahead"] not in ["-", "0"] else dim(w["ahead"])

            # Color PR based on state
            if "merged" in w["pr"]:
                pr_str = success(w["pr"])
            elif "closed" in w["pr"]:
                pr_str = warning(w["pr"])
            elif w["pr"] != "-":
                pr_str = info(w["pr"])
            else:
                pr_str = dim(w["pr"])

            # Color status
            if w["status"] == "dirty":
                status_str = warning(w["status"])
            elif w["status"] == "clean":
                status_str = success(w["status"])
            else:
                status_str = dim(w["status"])

            path_str = dim(w["path"]) + (dim(" (main)") if w["is_main"] else "")

            # Need to pad with actual string lengths, not colored lengths
            print(f"{branch_str:<{max_branch + len(branch_str) - len(w['branch'])}}  "
                  f"{base_str:<{max_base + len(base_str) - len(w['base'])}}  "
                  f"{ahead_str:<{max_ahead + len(ahead_str) - len(w['ahead'])}}  "
                  f"{pr_str:<{max_pr + len(pr_str) - len(w['pr'])}}  "
                  f"{status_str:<{max_status + len(status_str) - len(w['status'])}}  "
                  f"{path_str}")

        return 0

    def _get_commits_ahead(self, worktree_path: Path, base_branch: str) -> int:
        """Get number of commits ahead of base branch."""
        result = subprocess.run(
            ["git", "-C", str(worktree_path), "rev-list", "--count", f"{base_branch}..HEAD"],
            capture_output=True,
            text=True,
        )
        if result.returncode == 0:
            try:
                return int(result.stdout.strip())
            except ValueError:
                return -1
        return -1

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

    def _is_dirty(self, worktree_path: Path) -> bool:
        """Check if worktree has uncommitted changes."""
        result = subprocess.run(
            ["git", "-C", str(worktree_path), "status", "--porcelain"],
            capture_output=True,
            text=True,
        )
        return bool(result.stdout.strip())
