"""Work command handler - launch Claude to work on current ticket."""

import json
import re
import subprocess
from pathlib import Path
from typing import Any, Optional

from jinja2 import Environment, FileSystemLoader

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


class WorkCommand:
    """Handle the 'work' command."""

    def __init__(self):
        # Load templates from the templates directory
        templates_dir = Path(__file__).parent.parent / "templates"
        self.env = Environment(loader=FileSystemLoader(templates_dir))

    def execute(self, args: Any) -> int:
        """Execute the work command."""
        print(header("\n=== Santree Work ===\n"))

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

        print(f"{label('Branch:')} {info(branch)}")

        # Extract ticket ID from branch name
        ticket_id = self._extract_ticket_id(branch)
        if not ticket_id:
            print(error("Error: Could not extract ticket ID from branch name"))
            print(f"  Expected format: user/TEAM-123-description or TEAM-123-description")
            return 1

        print(f"{label('Ticket:')} {info(ticket_id)}")

        # Select template and mode based on flags
        template_name = self._get_template_name(args)
        mode = self._get_mode(args)
        print(f"{label('Mode:')} {info(mode)}")

        # Build template context
        context = {"ticket_id": ticket_id, "branch": branch}

        # For fix-pr mode, fetch PR comments
        if getattr(args, "fix_pr", False):
            print(dim("\nFetching PR comments..."))
            pr_comments = self._get_pr_comments(branch)
            if not pr_comments:
                print(warning("No PR comments found or PR doesn't exist"))
                return 1
            context["pr_comments"] = pr_comments
            print(success(f"Found PR comments"))

        # Render prompt with Jinja2
        template = self.env.get_template(template_name)
        prompt = template.render(**context)

        print(f"\n{success('Launching Claude...')}\n")

        # Launch Claude with the prompt
        # Try common claude locations (alias not available in subprocess)
        claude_paths = [
            Path.home() / ".claude" / "local" / "claude",
            Path("/usr/local/bin/claude"),
            Path.home() / ".local" / "bin" / "claude",
        ]

        claude_bin = None
        for path in claude_paths:
            if path.exists():
                claude_bin = str(path)
                break

        if not claude_bin:
            # Fall back to hoping it's in PATH
            claude_bin = "claude"

        result = subprocess.run([claude_bin, prompt])
        return result.returncode

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

    def _extract_ticket_id(self, branch: str) -> Optional[str]:
        """Extract ticket ID from branch name (e.g., 'santito/msg-3052-fix' -> 'MSG-3052')."""
        # Match patterns like 'msg-3052', 'MSG-3052', 'team-123', etc.
        match = re.search(r"([a-zA-Z]+)-(\d+)", branch)
        if match:
            team = match.group(1).upper()
            number = match.group(2)
            return f"{team}-{number}"
        return None

    def _get_template_name(self, args) -> str:
        """Get the template name based on args flags."""
        if getattr(args, "fix_pr", False):
            return "fix-pr.j2"
        elif getattr(args, "review", False):
            return "review.j2"
        elif getattr(args, "plan", False):
            return "plan.j2"
        return "implement.j2"

    def _get_mode(self, args) -> str:
        """Get the mode string based on args flags."""
        if getattr(args, "fix_pr", False):
            return "fix-pr"
        elif getattr(args, "review", False):
            return "review"
        elif getattr(args, "plan", False):
            return "plan"
        return "implement"

    def _get_pr_comments(self, branch: str) -> Optional[str]:
        """Fetch PR review comments using gh CLI."""
        # First get PR number for this branch
        result = subprocess.run(
            ["gh", "pr", "view", branch, "--json", "number,url,title,reviews,comments"],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            return None

        try:
            pr_data = json.loads(result.stdout)
        except json.JSONDecodeError:
            return None

        comments_text = []
        pr_number = pr_data.get("number", "")
        pr_title = pr_data.get("title", "")
        pr_url = pr_data.get("url", "")

        comments_text.append(f"PR #{pr_number}: {pr_title}")
        comments_text.append(f"URL: {pr_url}")
        comments_text.append("")

        # Add review comments
        reviews = pr_data.get("reviews", [])
        for review in reviews:
            author = review.get("author", {}).get("login", "unknown")
            state = review.get("state", "")
            body = review.get("body", "").strip()
            if body:
                comments_text.append(f"### Review by @{author} ({state})")
                comments_text.append(body)
                comments_text.append("")

        # Add general comments
        comments = pr_data.get("comments", [])
        for comment in comments:
            author = comment.get("author", {}).get("login", "unknown")
            body = comment.get("body", "").strip()
            if body:
                comments_text.append(f"### Comment by @{author}")
                comments_text.append(body)
                comments_text.append("")

        # Also fetch review thread comments (inline comments on code)
        review_comments = self._get_review_thread_comments(pr_number)
        if review_comments:
            comments_text.append("### Inline Code Review Comments")
            comments_text.append(review_comments)

        return "\n".join(comments_text) if len(comments_text) > 3 else None

    def _get_review_thread_comments(self, pr_number: str) -> Optional[str]:
        """Fetch inline review comments on code."""
        result = subprocess.run(
            ["gh", "api", f"repos/{{owner}}/{{repo}}/pulls/{pr_number}/comments"],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            return None

        try:
            comments = json.loads(result.stdout)
        except json.JSONDecodeError:
            return None

        if not comments:
            return None

        comments_text = []
        for comment in comments:
            author = comment.get("user", {}).get("login", "unknown")
            path = comment.get("path", "")
            line = comment.get("line") or comment.get("original_line", "")
            body = comment.get("body", "").strip()
            if body:
                comments_text.append(f"**{path}:{line}** (@{author})")
                comments_text.append(body)
                comments_text.append("")

        return "\n".join(comments_text) if comments_text else None
