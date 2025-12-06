"""PR command handler - create GitHub PR with Linear integration."""

import re
import subprocess
import sys
from pathlib import Path
from typing import Any, Optional, Tuple

from ..core import find_main_repo_root, find_repo_root, GitOperations
from ..core.linear import LinearClient, load_linear_config


class PRCommand:
    """Handle the 'pr' command."""

    # Pattern: <author>/<team>-<number>-<description>
    BRANCH_PATTERN = re.compile(r"^[^/]+/([a-zA-Z]+)-(\d+)-(.+)$")

    def execute(self, args: Any) -> int:
        """Execute the pr command."""
        print("=== Santree PR ===\n")

        # Find repos
        main_repo = find_main_repo_root()
        current_repo = find_repo_root()

        if not main_repo or not current_repo:
            print("Error: Not inside a git repository")
            return 1

        print(f"Main repo: {main_repo}")
        print(f"Current repo: {current_repo}")

        # Validate we're in a worktree
        if ".santree/worktrees" not in str(current_repo):
            print("\nError: Not inside a santree worktree")
            print("\nUse 'santree switch <branch>' to switch to a worktree first")
            return 1

        git = GitOperations(main_repo)

        # Get current branch
        branch_name = self._get_current_branch()
        if not branch_name:
            print("Error: Could not determine current branch")
            return 1

        print(f"Current branch: {branch_name}")

        # Parse team/issue from branch name
        print("\n--- Parsing branch name ---")
        parsed = self._parse_branch_name(branch_name)
        if not parsed:
            print(f"Could not parse issue from branch: {branch_name}")
            print("Expected format: <author>/<team>-<number>-<description>")
            issue_id = None
            fallback_title = None
        else:
            team, number, description = parsed
            issue_id = f"{team.upper()}-{number}"
            fallback_title = description.replace("-", " ").title()
            print(f"Parsed team: {team}")
            print(f"Parsed number: {number}")
            print(f"Parsed description: {description}")
            print(f"Issue ID: {issue_id}")
            print(f"Fallback title (from branch): {fallback_title}")

        # Get base branch from metadata
        print("\n--- Reading worktree metadata ---")
        metadata = git.get_worktree_metadata(current_repo)
        if metadata and "base_branch" in metadata:
            base_branch = metadata["base_branch"]
            print(f"Base branch (from metadata): {base_branch}")
        else:
            base_branch = git.detect_default_branch()
            print(f"No metadata found, detected base branch: {base_branch}")

        # Try to get title from Linear
        print("\n--- Fetching title from Linear ---")
        linear_title = None
        if issue_id:
            linear_title = self._get_title_from_linear(main_repo, issue_id)
            if linear_title:
                print(f"Linear title: {linear_title}")
            else:
                print("Could not fetch title from Linear")
        else:
            print("No issue ID, skipping Linear lookup")

        # Determine final title
        print("\n--- Building PR title ---")
        if linear_title:
            title = linear_title
            print(f"Using Linear title: {title}")
        elif fallback_title:
            title = fallback_title
            print(f"Using fallback title (from branch): {title}")
        else:
            title = None
            print("No title available")

        # Build PR title with issue prefix
        if issue_id and title:
            pr_title = f"[{issue_id}] {title}"
        elif title:
            pr_title = title
        else:
            pr_title = ""

        print(f"Final PR title: {pr_title}")

        # Show summary and allow editing
        print("\n" + "=" * 40)
        print(f"Base branch: {base_branch}")
        print(f"PR Title: {pr_title}")
        print(f"Draft: {args.draft}")
        print("=" * 40 + "\n")

        try:
            # Use gnureadline if available (works better on macOS), fallback to readline
            try:
                import gnureadline as readline
            except ImportError:
                import readline

            def prefill_hook():
                readline.insert_text(pr_title)
                readline.redisplay()

            readline.set_pre_input_hook(prefill_hook)

            try:
                pr_title = input("PR Title: ")
            finally:
                readline.set_pre_input_hook(None)
        except (EOFError, KeyboardInterrupt):
            print("\nCancelled")
            return 1

        if not pr_title:
            print("Error: PR title is required")
            return 1

        # Check if gh CLI is available
        if not self._check_gh_cli():
            print("Error: GitHub CLI (gh) is not installed")
            print("Install it with: brew install gh")
            return 1

        # Create PR
        print(f"\nCreating PR: {pr_title}")
        print(f"Command: gh pr create --title \"{pr_title}\" --base {base_branch}" + (" --draft" if args.draft else ""))
        return self._create_pr(pr_title, base_branch, args.draft)

    def _get_current_branch(self) -> Optional[str]:
        """Get the current git branch name."""
        result = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            capture_output=True,
            text=True,
        )
        if result.returncode == 0:
            return result.stdout.strip()
        return None

    def _parse_branch_name(self, branch: str) -> Optional[Tuple[str, str, str]]:
        """Parse branch name to extract team, number, description.

        Returns:
            Tuple of (team, number, description) or None
        """
        match = self.BRANCH_PATTERN.match(branch)
        if match:
            return match.group(1), match.group(2), match.group(3)
        return None

    def _get_title_from_linear(self, main_repo: Path, issue_id: str) -> Optional[str]:
        """Try to fetch issue title from Linear API."""
        from ..core.config import get_santree_dir

        santree_dir = get_santree_dir(main_repo)
        api_key = load_linear_config(santree_dir)

        if not api_key:
            print("No Linear API key configured")
            print(f"To configure, add to {santree_dir}/config.json:")
            print('  {"linear_api_key": "lin_api_..."}')
            return None

        print(f"Fetching issue {issue_id} from Linear API...")
        client = LinearClient(api_key)
        title = client.get_issue_title(issue_id)
        if title:
            print(f"Successfully fetched: {title}")
        else:
            print("Linear API returned no title (issue not found or API error)")
        return title

    def _check_gh_cli(self) -> bool:
        """Check if GitHub CLI is installed."""
        result = subprocess.run(
            ["which", "gh"],
            capture_output=True,
        )
        return result.returncode == 0

    def _create_pr(self, title: str, base_branch: str, draft: bool) -> int:
        """Create the PR using gh CLI."""
        cmd = ["gh", "pr", "create", "--title", title, "--base", base_branch]

        if draft:
            cmd.append("--draft")

        # Add empty body (user can edit in browser)
        cmd.extend(["--body", ""])

        result = subprocess.run(cmd)
        return result.returncode
