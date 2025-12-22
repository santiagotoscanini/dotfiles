"""Shared color utilities for santree CLI output."""


class Colors:
    """ANSI color codes."""

    HEADER = "\033[95m"
    BLUE = "\033[94m"
    CYAN = "\033[96m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    BOLD = "\033[1m"
    DIM = "\033[2m"
    RESET = "\033[0m"


def header(text: str) -> str:
    """Format text as a header (bold cyan)."""
    return f"{Colors.BOLD}{Colors.CYAN}{text}{Colors.RESET}"


def success(text: str) -> str:
    """Format text as success (green)."""
    return f"{Colors.GREEN}{text}{Colors.RESET}"


def error(text: str) -> str:
    """Format text as error (red)."""
    return f"{Colors.RED}{text}{Colors.RESET}"


def warning(text: str) -> str:
    """Format text as warning (yellow)."""
    return f"{Colors.YELLOW}{text}{Colors.RESET}"


def info(text: str) -> str:
    """Format text as info (blue)."""
    return f"{Colors.BLUE}{text}{Colors.RESET}"


def dim(text: str) -> str:
    """Format text as dim/secondary."""
    return f"{Colors.DIM}{text}{Colors.RESET}"


def label(text: str) -> str:
    """Format text as a label (bold)."""
    return f"{Colors.BOLD}{text}{Colors.RESET}"
