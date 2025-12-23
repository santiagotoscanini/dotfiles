"""Commit command handler - commit with pre-filled ticket ID."""

import re
import subprocess
from typing import Any, Optional

import gnureadline

from ..core import (
    dim,
    error,
    find_repo_root,
    header,
    info,
    label,
    success,
    warning,
)


class CommitCommand:
    """Handle the 'commit' command."""

    def execute(self, args: Any) -> int:
        """Execute the commit command."""
        print(header("\n=== Santree Commit ===\n"))

        # Check we're in a git repo
        repo_root = find_repo_root()
        if not repo_root:
            print(error("Error: Not inside a git repository"))
            return 1

        # Get current branch
        branch = self._get_current_branch()
        if not branch:
            print(error("Error: Could not determine current branch"))
            return 1

        print(f"{label('Branch:')} {info(branch)}\n")

        # Show git status
        print(label("Status:"))
        status_output = self._get_status()
        if not status_output.strip():
            print(dim("  No changes"))
            return 0
        print(status_output)

        # Check for unstaged changes and offer to stage all
        if self._has_unstaged_changes():
            try:
                with open("/dev/tty", "w") as tty_out, open("/dev/tty", "r") as tty_in:
                    tty_out.write(f"\n{label('Stage all changes?')} [y/N]: ")
                    tty_out.flush()
                    response = tty_in.readline().strip().lower()
            except (EOFError, KeyboardInterrupt, OSError):
                print(warning("\nCancelled"))
                return 1

            if response == "y":
                result = subprocess.run(
                    ["git", "add", "-A"],
                    cwd=repo_root,
                    capture_output=True,
                    text=True,
                )
                if result.returncode != 0:
                    print(error(f"Failed to stage changes: {result.stderr}"))
                    return 1
                print(success("  Staged all changes"))
                # Refresh status display
                print(f"\n{label('Updated status:')}")
                print(self._get_status())

        # Check if there are staged changes
        if not self._has_staged_changes():
            print(warning("\nNo staged changes to commit"))
            print(dim("Use 'git add <file>' to stage changes"))
            return 1

        # Show staged diff summary
        print(f"\n{label('Staged changes:')}")
        diff_stat = self._get_staged_diff_stat()
        if diff_stat:
            print(diff_stat)

        # Extract ticket ID from branch name
        ticket_id = self._extract_ticket_id(branch)
        prefix = f"[{ticket_id}] " if ticket_id else ""

        # Pre-fill commit message
        print(f"\n{label('Commit message:')}")
        if ticket_id:
            print(dim(f"  (pre-filled with [{ticket_id}])"))

        try:
            gnureadline.set_startup_hook(lambda: gnureadline.insert_text(prefix))
            message = input(f"  {info('>')} ")
            gnureadline.set_startup_hook()
        except (EOFError, KeyboardInterrupt):
            print(warning("\nCancelled"))
            return 1

        if not message.strip():
            print(warning("Empty commit message, cancelled"))
            return 1

        # Execute commit
        print()
        result = subprocess.run(
            ["git", "commit", "-m", message],
            cwd=repo_root,
            capture_output=True,
            text=True,
        )

        if result.returncode != 0:
            print(error(f"Commit failed: {result.stderr}"))
            return 1

        print(success("Committed successfully!"))
        print(dim(result.stdout.strip()))

        # Push to origin
        print(f"\n{dim('Pushing to origin...')}")
        push_result = subprocess.run(
            ["git", "push", "-u", "origin", branch],
            cwd=repo_root,
            capture_output=True,
            text=True,
        )

        if push_result.returncode != 0:
            print(error(f"Push failed: {push_result.stderr}"))
            return 1

        print(success("Pushed to origin!"))
        return 0

    def _get_current_branch(self) -> Optional[str]:
        """Get the current branch name."""
        result = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            capture_output=True,
            text=True,
        )
        if result.returncode == 0:
            return result.stdout.strip()
        return None

    def _get_status(self) -> str:
        """Get git status output."""
        result = subprocess.run(
            ["git", "status", "--short"],
            capture_output=True,
            text=True,
        )
        if result.returncode == 0:
            lines = result.stdout.strip().split("\n")
            colored_lines = []
            for line in lines:
                if line.startswith("A ") or line.startswith("M ") or line.startswith("D "):
                    colored_lines.append(f"  {success(line)}")
                elif line.startswith("??"):
                    colored_lines.append(f"  {dim(line)}")
                elif line.startswith(" M") or line.startswith(" D"):
                    colored_lines.append(f"  {warning(line)}")
                else:
                    colored_lines.append(f"  {line}")
            return "\n".join(colored_lines)
        return ""

    def _has_staged_changes(self) -> bool:
        """Check if there are staged changes."""
        result = subprocess.run(
            ["git", "diff", "--cached", "--quiet"],
            capture_output=True,
        )
        return result.returncode != 0

    def _has_unstaged_changes(self) -> bool:
        """Check if there are unstaged changes (modified or untracked files)."""
        # Check for modified files
        result = subprocess.run(
            ["git", "diff", "--quiet"],
            capture_output=True,
        )
        if result.returncode != 0:
            return True
        # Check for untracked files
        result = subprocess.run(
            ["git", "ls-files", "--others", "--exclude-standard"],
            capture_output=True,
            text=True,
        )
        return bool(result.stdout.strip())

    def _get_staged_diff_stat(self) -> str:
        """Get diff stat for staged changes."""
        result = subprocess.run(
            ["git", "diff", "--cached", "--stat"],
            capture_output=True,
            text=True,
        )
        if result.returncode == 0:
            lines = result.stdout.strip().split("\n")
            return "\n".join(f"  {dim(line)}" for line in lines)
        return ""

    def _extract_ticket_id(self, branch: str) -> Optional[str]:
        """Extract ticket ID from branch name (e.g., 'santito/msg-3052-fix' -> 'MSG-3052')."""
        # Match patterns like 'msg-3052', 'MSG-3052', 'team-123', etc.
        match = re.search(r"([a-zA-Z]+)-(\d+)", branch)
        if match:
            team = match.group(1).upper()
            number = match.group(2)
            return f"{team}-{number}"
        return None
