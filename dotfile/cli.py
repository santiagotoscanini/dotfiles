#!/usr/bin/env python3
"""Command-line interface for dotfile manager."""

import argparse
import sys
import os
from pathlib import Path
from textwrap import dedent

from .core import load_config, Runner, BackupTool
from .core.logging import setup_logging


def get_epilog():
    """Get the help epilog text."""
    return dedent("""\
    Examples:
      %(prog)s install                    # Install default profile (personal)
      %(prog)s install --profile work     # Install work profile
      %(prog)s install --dry-run          # Preview installation

      %(prog)s check                      # Check installation status

      %(prog)s backup                     # Save current brew packages to packages.json

      %(prog)s untracked                  # List packages not in any profile

      %(prog)s uninstall                  # Uninstall default profile
      %(prog)s uninstall --profile work   # Uninstall specific profile
      %(prog)s uninstall --dry-run        # Preview uninstallation

    Environment Variables:
      DOTFILES_DIR    Path to your dotfiles directory (default: current directory)
      HOME            User's home directory

    Configuration:
      Uses packages.json in your dotfiles directory with:
      - packages: Applications with installation and config info
      - pre-install: Setup tasks (Homebrew, directories, defaults)
      - profiles: Named sets of packages and pre-install tasks

    Packages can include their own config (symlinks) that will be
    automatically created when the package is installed.
    
    Logging:
      All output is automatically saved to .dotfiles-install.log
    """)


def create_parser() -> argparse.ArgumentParser:
    """Create the command-line argument parser."""
    parser = argparse.ArgumentParser(
        prog="dotfile",
        description="Clean and simple dotfile manager",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=get_epilog()
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # Install command
    install_parser = subparsers.add_parser(
        "install",
        help="Install profile (runs pre-install tasks, then packages)"
    )
    install_parser.add_argument(
        "--profile",
        default="personal",
        help="Profile to install (default: personal)"
    )
    install_parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview changes without making them"
    )
    
    # Check command
    subparsers.add_parser(
        "check",
        help="Check installation status"
    )
    
    # Backup command
    subparsers.add_parser(
        "backup",
        help="Backup current brew packages to packages.json"
    )
    
    # List untracked command
    subparsers.add_parser(
        "untracked",
        help="List installed packages not in any profile"
    )
    
    # Uninstall command
    uninstall_parser = subparsers.add_parser(
        "uninstall",
        help="Uninstall packages and remove symlinks"
    )
    uninstall_parser.add_argument(
        "--profile",
        default="personal",
        help="Profile to uninstall (default: personal)"
    )
    uninstall_parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview changes without making them"
    )
    
    return parser


def main():
    """Main entry point."""
    parser = create_parser()
    args = parser.parse_args()
    
    # Show help if no command
    if not args.command:
        parser.print_help()
        return 1
    
    # Set DOTFILES_DIR if not already set
    if "DOTFILES_DIR" not in os.environ:
        # When run as a module, use the parent of the dotfile package
        module_dir = Path(__file__).parent.parent
        os.environ["DOTFILES_DIR"] = str(module_dir)
    
    # Setup logging to file
    log_path = Path(os.environ["DOTFILES_DIR"]) / ".dotfiles-install.log"
    
    with setup_logging(log_path):
        try:
            # Load configuration from packages.json
            config_path = Path(os.environ["DOTFILES_DIR"]) / "packages.json"
            config = load_config(config_path)
            
            # Create runner
            runner = Runner()
            
            # Execute command
            if args.command == "install":
                print("📦 Installing dotfiles...")
                
                # Run pre-install tasks first
                success = runner.run_pre_install(config, args.profile, dry_run=args.dry_run)
                
                # Then install packages
                if success:
                    success = runner.install_profile(config, args.profile, dry_run=args.dry_run)
                
                if success:
                    print("\n✨ Installation completed successfully!")
                else:
                    print("\n❌ Installation failed")
                    return 1
                    
            elif args.command == "check":
                runner.check_all(config)
                
            elif args.command == "backup":
                print("💾 Backing up installed packages...")
                backup = BackupTool()
                if backup.backup_brew_packages(config_path):
                    print("\n✨ Backup completed successfully!")
                    print("\nNew packages have been added to packages.json")
                    print("You can manually add them to any profile by editing packages.json")
                else:
                    print("\n❌ Backup failed")
                    return 1
                    
            elif args.command == "untracked":
                backup = BackupTool()
                backup.list_untracked_packages(config_path)
                
            elif args.command == "uninstall":
                print("🗑️  Uninstalling dotfiles...")
                success = runner.uninstall_profile(config, args.profile, dry_run=args.dry_run)
                if success:
                    print("\n✨ Uninstall completed successfully!")
                else:
                    print("\n❌ Uninstall failed")
                    return 1
            
            return 0
            
        except FileNotFoundError as e:
            print(f"❌ Configuration file not found: {e}")
            print("Create a packages.json file in your dotfiles directory")
            return 1
        except Exception as e:
            print(f"❌ Error: {e}")
            return 1


if __name__ == "__main__":
    sys.exit(main())