"""Simple handler interface for dotfile manager."""

from dataclasses import dataclass
from enum import Enum


class Status(Enum):
    """Installation status."""
    NOT_INSTALLED = "not_installed"
    INSTALLED = "installed"
    MODIFIED = "modified"
    ERROR = "error"


@dataclass
class CheckResult:
    """Result of checking installation status."""
    status: Status
    message: str