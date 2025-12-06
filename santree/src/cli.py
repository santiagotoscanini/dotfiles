#!/usr/bin/env python3
"""Command-line interface for santree worktree manager."""

import argparse
import sys
from textwrap import dedent

from .commands import CreateCommand, ListCommand, PRCommand, RemoveCommand, SetupCommand, SwitchCommand


def get_epilog():
    """Get the help epilog text."""
    return dedent("""\
    Examples:
      %(prog)s create feature/new-thing    # Create worktree from default branch
      %(prog)s create -b develop my-fix    # Create from specific branch
      %(prog)s create                      # Prompt for branch name

      %(prog)s list                        # List all worktrees
      %(prog)s ls                          # Alias for list

      %(prog)s switch feature/new-thing    # Switch to worktree (cd)
      %(prog)s sw feature/new-thing        # Alias for switch

      %(prog)s remove feature/old          # Remove worktree and branch
      %(prog)s rm -f feature/old           # Force removal

      %(prog)s setup                       # Run init script in current directory

    Configuration:
      Worktrees are stored in .santree/worktrees/ inside each repo.

      Optional init script: .santree/init.sh
        - Must be executable (chmod +x)
        - Runs after worktree creation
        - Useful for installing dependencies
        - Environment variables available:
          - SANTREE_WORKTREE_PATH: Path to new worktree
          - SANTREE_REPO_ROOT: Path to main repository
    """)


def create_parser() -> argparse.ArgumentParser:
    """Create the command-line argument parser."""
    parser = argparse.ArgumentParser(
        prog="santree",
        description="Git worktree manager with init script support",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=get_epilog(),
    )

    subparsers = parser.add_subparsers(dest="command", help="Command to run")

    # Create command
    create_parser = subparsers.add_parser(
        "create",
        aliases=["c"],
        help="Create a new worktree",
    )
    create_parser.add_argument(
        "branch_name",
        nargs="?",
        default=None,
        help="Name for the new branch/worktree (prompted if not provided)",
    )
    create_parser.add_argument(
        "--base",
        "-b",
        default=None,
        help="Base branch to create from (defaults to main/master)",
    )
    create_parser.add_argument(
        "--no-pull",
        action="store_true",
        help="Skip fetching latest changes before creating",
    )

    # List command
    subparsers.add_parser(
        "list",
        aliases=["ls"],
        help="List all worktrees",
    )

    # Remove command
    remove_parser = subparsers.add_parser(
        "remove",
        aliases=["rm"],
        help="Remove a worktree",
    )
    remove_parser.add_argument(
        "branch_name",
        help="Name of the worktree to remove",
    )
    remove_parser.add_argument(
        "--force",
        "-f",
        action="store_true",
        help="Force removal even with uncommitted changes",
    )

    # Switch command
    switch_parser = subparsers.add_parser(
        "switch",
        aliases=["sw"],
        help="Switch to a worktree (cd into it)",
    )
    switch_parser.add_argument(
        "branch_name",
        help="Name of the worktree to switch to",
    )

    # Setup command
    subparsers.add_parser(
        "setup",
        help="Run init script in current directory",
    )

    # PR command
    pr_parser = subparsers.add_parser(
        "pr",
        help="Create a GitHub PR",
    )
    pr_parser.add_argument(
        "--draft",
        "-d",
        action="store_true",
        help="Create as draft PR",
    )

    return parser


def main() -> int:
    """Main entry point."""
    parser = create_parser()
    args = parser.parse_args()

    # Show help if no command
    if not args.command:
        parser.print_help()
        return 1

    # Route to appropriate command handler
    commands = {
        "create": CreateCommand,
        "c": CreateCommand,
        "list": ListCommand,
        "ls": ListCommand,
        "pr": PRCommand,
        "remove": RemoveCommand,
        "rm": RemoveCommand,
        "setup": SetupCommand,
        "switch": SwitchCommand,
        "sw": SwitchCommand,
    }

    try:
        command_class = commands.get(args.command)
        if command_class:
            return command_class().execute(args)
        return 1
    except KeyboardInterrupt:
        print("\nCancelled")
        return 130
    except Exception as e:
        print(f"Error: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
