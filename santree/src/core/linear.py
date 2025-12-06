"""Linear API client for fetching issue information."""

import json
from pathlib import Path
from typing import Optional
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError


class LinearClient:
    """Client for Linear GraphQL API."""

    GRAPHQL_URL = "https://api.linear.app/graphql"

    def __init__(self, api_key: str):
        self.api_key = api_key

    def get_issue_title(self, identifier: str) -> Optional[str]:
        """Fetch issue title by identifier (e.g., MSG-3021).

        Args:
            identifier: Issue identifier like "MSG-3021"

        Returns:
            Issue title or None if not found
        """
        query = """
        query GetIssue($id: String!) {
            issue(id: $id) {
                title
            }
        }
        """

        try:
            result = self._graphql_request(query, {"id": identifier})
            if result and "data" in result and result["data"]["issue"]:
                return result["data"]["issue"]["title"]
        except Exception:
            pass

        return None

    def _graphql_request(self, query: str, variables: dict) -> Optional[dict]:
        """Make a GraphQL request to Linear API."""
        headers = {
            "Authorization": self.api_key,
            "Content-Type": "application/json",
        }

        data = json.dumps({"query": query, "variables": variables}).encode("utf-8")

        request = Request(self.GRAPHQL_URL, data=data, headers=headers, method="POST")

        try:
            with urlopen(request, timeout=10) as response:
                return json.loads(response.read().decode("utf-8"))
        except (URLError, HTTPError):
            return None


def load_linear_config(santree_dir: Path) -> Optional[str]:
    """Load Linear API key from config file.

    Args:
        santree_dir: Path to .santree directory

    Returns:
        API key or None if not configured
    """
    config_file = santree_dir / "config.json"
    if not config_file.exists():
        return None

    try:
        config = json.loads(config_file.read_text())
        return config.get("linear_api_key")
    except (json.JSONDecodeError, KeyError):
        return None
