"""PR command handler - create GitHub PR with Linear integration."""

import json
import re
import subprocess
from pathlib import Path
from typing import Any, Optional, Tuple

from ..core import (
    GitOperations,
    dim,
    error,
    find_main_repo_root,
    find_repo_root,
    get_santree_dir,
    header,
    info,
    label,
    success,
    warning,
)
from ..core.linear import LinearClient, load_linear_config


class PRCommand:
    """Handle the 'pr' command."""

    # Pattern: <author>/<team>-<number>-<description>
    BRANCH_PATTERN = re.compile(r"^[^/]+/([a-zA-Z]+)-(\d+)-(.+)$")

    def execute(self, args: Any) -> int:
        """Execute the pr command."""
        print(header("\n=== Santree PR ===\n"))

        # Find repos
        main_repo = find_main_repo_root()
        current_repo = find_repo_root()

        if not main_repo or not current_repo:
            print(error("Error: Not inside a git repository"))
            return 1

        print(f"{label('Main repo:')} {dim(str(main_repo))}")
        print(f"{label('Current repo:')} {dim(str(current_repo))}")

        # Validate we're in a worktree
        if ".santree/worktrees" not in str(current_repo):
            print(error("\nError: Not inside a santree worktree"))
            print(dim("\nUse 'santree switch <branch>' to switch to a worktree first"))
            return 1

        git = GitOperations(main_repo)

        # Get current branch
        branch_name = self._get_current_branch()
        if not branch_name:
            print(error("Error: Could not determine current branch"))
            return 1

        print(f"{label('Current branch:')} {info(branch_name)}")

        # Check for uncommitted changes
        print(header("\n--- Checking working tree ---"))
        has_uncommitted, uncommitted_msg = self._check_uncommitted_changes()
        if has_uncommitted:
            print(error("Error: You have uncommitted changes"))
            print(warning(uncommitted_msg))
            print(dim("\nPlease commit your changes before creating a PR:"))
            print(dim("  git add -A && git commit -m \"Your message\""))
            return 1
        print(success("Working tree is clean"))

        # Check for commits ahead of base
        metadata = git.get_worktree_metadata(current_repo)
        if metadata and "base_branch" in metadata:
            base_branch = metadata["base_branch"]
        else:
            base_branch = git.detect_default_branch()

        commits_ahead = self._get_commits_ahead(base_branch)
        if commits_ahead == 0:
            print(error(f"Error: No commits ahead of {base_branch}"))
            print(dim("\nYou need to make commits before creating a PR"))
            return 1
        print(success(f"{commits_ahead} commit(s) ahead of {base_branch}"))

        # Check if remote branch exists and if we need to push
        remote_exists = self._remote_branch_exists(branch_name)
        unpushed = self._get_unpushed_commits(branch_name)

        if not remote_exists:
            print(warning("Remote branch does not exist"))
            print(dim("Pushing to remote..."))
            if not self._push_branch(branch_name):
                print(error("Error: Failed to push branch to remote"))
                return 1
            print(success("Pushed successfully"))
        elif unpushed > 0:
            print(warning(f"{unpushed} commit(s) not pushed to remote"))
            print(dim("Pushing to remote..."))
            if not self._push_branch(branch_name):
                print(error("Error: Failed to push branch to remote"))
                return 1
            print(success("Pushed successfully"))
        else:
            print(success("Remote branch is up to date"))

        # Check if PR already exists
        existing_pr = self._get_existing_pr(branch_name)
        if existing_pr:
            pr_url, pr_state = existing_pr
            print(warning(f"\nA PR already exists for this branch ({pr_state})"))
            print(info(f"  {pr_url}"))
            print(dim("\nOpening existing PR in browser..."))
            subprocess.run(["open", pr_url])
            return 0

        # Parse team/issue from branch name
        print(header("\n--- Parsing branch name ---"))
        parsed = self._parse_branch_name(branch_name)
        if not parsed:
            print(warning(f"Could not parse issue from branch: {branch_name}"))
            print(dim("Expected format: <author>/<team>-<number>-<description>"))
            issue_id = None
            fallback_title = None
        else:
            team, number, description = parsed
            issue_id = f"{team.upper()}-{number}"
            fallback_title = description.replace("-", " ").title()
            print(f"{label('Team:')} {info(team)}")
            print(f"{label('Issue number:')} {info(number)}")
            print(f"{label('Description:')} {dim(description)}")
            print(f"{label('Issue ID:')} {success(issue_id)}")
            print(f"{label('Fallback title:')} {dim(fallback_title)}")

        # Get base branch from metadata
        print(header("\n--- Reading worktree metadata ---"))
        if metadata and "base_branch" in metadata:
            print(f"{label('Base branch:')} {info(base_branch)} {dim('(from metadata)')}")
        else:
            print(f"{label('Base branch:')} {info(base_branch)} {warning('(auto-detected)')}")

        # Try to get title from Linear
        print(header("\n--- Fetching title from Linear ---"))
        linear_title = None
        if issue_id:
            linear_title = self._get_title_from_linear(main_repo, issue_id)
            if linear_title:
                print(f"{label('Linear title:')} {success(linear_title)}")
            else:
                print(warning("Could not fetch title from Linear"))
        else:
            print(dim("No issue ID, skipping Linear lookup"))

        # Determine final title
        print(header("\n--- Building PR title ---"))
        if linear_title:
            title = linear_title
            print(f"{label('Source:')} {success('Linear API')}")
        elif fallback_title:
            title = fallback_title
            print(f"{label('Source:')} {warning('Branch name (fallback)')}")
        else:
            title = None
            print(warning("No title available"))

        # Build PR title with issue prefix
        if issue_id and title:
            pr_title = f"[{issue_id}] {title}"
        elif title:
            pr_title = title
        else:
            pr_title = ""

        print(f"{label('Final PR title:')} {info(pr_title)}")

        # Show summary and allow editing
        print(header("\n" + "=" * 50))
        print(f"  {label('Base branch:')} {info(base_branch)}")
        print(f"  {label('PR Title:')}    {info(pr_title)}")
        print(f"  {label('Draft:')}       {info(str(args.draft))}")
        print(header("=" * 50 + "\n"))

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
                pr_title = input(f"{label('PR Title:')} ")
            finally:
                readline.set_pre_input_hook(None)
        except (EOFError, KeyboardInterrupt):
            print(warning("\nCancelled"))
            return 1

        if not pr_title:
            print(error("Error: PR title is required"))
            return 1

        # Check if gh CLI is available
        if not self._check_gh_cli():
            print(error("Error: GitHub CLI (gh) is not installed"))
            print(dim("Install it with: brew install gh"))
            return 1

        # Create PR
        print(header("\n--- Creating PR ---"))
        print(f"{label('Title:')} {info(pr_title)}")
        print(f"{label('Base:')} {info(base_branch)}")
        print(f"{label('Draft:')} {info(str(args.draft))}")
        print(dim(f"Command: gh pr create --title \"{pr_title}\" --base {base_branch}" + (" --draft" if args.draft else "")))
        print()

        result = self._create_pr(pr_title, base_branch, args.draft)
        if result == 0:
            print(success("\nOpened PR creation page in browser"))
        else:
            print(error("\nFailed to open browser"))
        return result

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

    def _check_uncommitted_changes(self) -> Tuple[bool, str]:
        """Check if there are uncommitted changes.

        Returns:
            Tuple of (has_changes, message describing changes)
        """
        # Check for staged and unstaged changes
        result = subprocess.run(
            ["git", "status", "--porcelain"],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            return True, "Could not check git status"

        output = result.stdout.strip()
        if not output:
            return False, ""

        # Count different types of changes
        lines = output.split("\n")
        staged = sum(1 for l in lines if l[0] in "MADRC")
        unstaged = sum(1 for l in lines if l[1] in "MADRC")
        untracked = sum(1 for l in lines if l.startswith("??"))

        parts = []
        if staged:
            parts.append(f"{staged} staged")
        if unstaged:
            parts.append(f"{unstaged} unstaged")
        if untracked:
            parts.append(f"{untracked} untracked")

        return True, ", ".join(parts) + " file(s)"

    def _get_commits_ahead(self, base_branch: str) -> int:
        """Get number of commits ahead of base branch."""
        result = subprocess.run(
            ["git", "rev-list", "--count", f"{base_branch}..HEAD"],
            capture_output=True,
            text=True,
        )
        if result.returncode == 0:
            try:
                return int(result.stdout.strip())
            except ValueError:
                return 0
        return 0

    def _get_unpushed_commits(self, branch_name: str) -> int:
        """Get number of commits not pushed to remote."""
        # Check if remote tracking branch exists
        result = subprocess.run(
            ["git", "rev-parse", "--verify", f"origin/{branch_name}"],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            # No remote branch, all local commits are unpushed
            result = subprocess.run(
                ["git", "rev-list", "--count", "HEAD"],
                capture_output=True,
                text=True,
            )
            if result.returncode == 0:
                try:
                    return int(result.stdout.strip())
                except ValueError:
                    return 1
            return 1

        # Count commits ahead of remote
        result = subprocess.run(
            ["git", "rev-list", "--count", f"origin/{branch_name}..HEAD"],
            capture_output=True,
            text=True,
        )
        if result.returncode == 0:
            try:
                return int(result.stdout.strip())
            except ValueError:
                return 0
        return 0

    def _push_branch(self, branch_name: str, force: bool = False) -> bool:
        """Push branch to remote."""
        cmd = ["git", "push", "-u", "origin", branch_name]
        if force:
            cmd.insert(2, "--force-with-lease")
        result = subprocess.run(
            cmd,
            capture_output=False,
        )
        return result.returncode == 0

    def _remote_branch_exists(self, branch_name: str) -> bool:
        """Check if remote branch actually exists on the server."""
        result = subprocess.run(
            ["git", "ls-remote", "--heads", "origin", branch_name],
            capture_output=True,
            text=True,
        )
        return result.returncode == 0 and branch_name in result.stdout

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
        santree_dir = get_santree_dir(main_repo)
        api_key = load_linear_config(santree_dir)

        if not api_key:
            print(warning("No Linear API key configured"))
            print(dim(f"To configure, add to {santree_dir}/config.json:"))
            print(dim('  {"linear_api_key": "lin_api_..."}'))
            return None

        print(f"{dim(f'Fetching issue {issue_id} from Linear API...')}")
        client = LinearClient(api_key)
        title = client.get_issue_title(issue_id)
        if title:
            print(success(f"Fetched: {title}"))
        else:
            print(warning("Linear API returned no title (issue not found or API error)"))
        return title

    def _check_gh_cli(self) -> bool:
        """Check if GitHub CLI is installed."""
        result = subprocess.run(
            ["which", "gh"],
            capture_output=True,
        )
        return result.returncode == 0

    def _get_existing_pr(self, branch_name: str) -> Optional[Tuple[str, str]]:
        """Check if a PR already exists for this branch.

        Returns:
            Tuple of (pr_url, state) or None if no PR exists
        """
        result = subprocess.run(
            ["gh", "pr", "view", branch_name, "--json", "url,state"],
            capture_output=True,
            text=True,
        )
        if result.returncode == 0:
            try:
                data = json.loads(result.stdout)
                return data.get("url"), data.get("state", "OPEN")
            except json.JSONDecodeError:
                return None
        return None

    def _create_pr(self, title: str, base_branch: str, draft: bool) -> int:
        """Create the PR using gh CLI."""
        # Get current branch for --head flag
        branch = self._get_current_branch()

        cmd = [
            "gh", "pr", "create",
            "--title", title,
            "--base", base_branch,
            "--head", branch,  # Push to same repo, not a fork
            "--web",  # Open in browser to use PR template
        ]

        if draft:
            cmd.append("--draft")

        result = subprocess.run(cmd)
        return result.returncode
