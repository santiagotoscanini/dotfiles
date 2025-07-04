"""Utility functions for the dotfile manager."""

import os
import shutil
import subprocess
from pathlib import Path
from typing import Optional, Dict, Tuple


def expand_path(path: str) -> Path:
    """Expand ~ and environment variables in a path.
    
    Args:
        path: Path string that may contain ~ or $VAR
        
    Returns:
        Resolved Path object
        
    Example:
        >>> expand_path("~/.config/$USER")
        Path("/home/john/.config/john")
    """
    expanded = os.path.expandvars(os.path.expanduser(path))
    return Path(expanded).resolve()


def run_command(cmd: str, check: bool = True, capture_output: bool = True) -> subprocess.CompletedProcess:
    """Run a shell command safely.
    
    Args:
        cmd: Command to run
        check: Whether to raise on non-zero exit
        capture_output: Whether to capture stdout/stderr
        
    Returns:
        CompletedProcess with result
        
    Raises:
        subprocess.CalledProcessError: If check=True and command fails
    """
    return subprocess.run(
        cmd,
        shell=True,
        check=check,
        capture_output=capture_output,
        text=True
    )


def command_exists(command: str) -> bool:
    """Check if a command exists in PATH.
    
    Args:
        command: Command name to check
        
    Returns:
        True if command exists
    """
    return shutil.which(command) is not None


def backup_file(file_path: Path) -> Optional[Path]:
    """Create a backup of a file if it exists.
    
    Args:
        file_path: Path to file to backup
        
    Returns:
        Path to backup file or None if original doesn't exist
    """
    if not file_path.exists():
        return None
    
    # Find a unique backup name
    backup_num = 1
    while True:
        backup_path = file_path.parent / f"{file_path.name}.backup{backup_num}"
        if not backup_path.exists():
            break
        backup_num += 1
    
    shutil.copy2(file_path, backup_path)
    return backup_path


def create_symlink(source: Path, target: Path, force: bool = False) -> Tuple[bool, str]:
    """Create a symbolic link safely.
    
    Args:
        source: Source file/directory
        target: Target location for symlink
        force: Whether to overwrite existing target
        
    Returns:
        Tuple of (success, message)
    """
    # Ensure source exists
    if not source.exists():
        return False, f"Source does not exist: {source}"
    
    # Handle existing target
    if target.exists() or target.is_symlink():
        if not force:
            return False, f"Target already exists: {target}"
        
        # Backup existing file if it's not a symlink
        if not target.is_symlink():
            backup_path = backup_file(target)
            if backup_path:
                print(f"  → Backed up to {backup_path}")
        
        # Remove existing target
        if target.is_symlink():
            target.unlink()
        elif target.is_dir():
            shutil.rmtree(target)
        else:
            target.unlink()
    
    # Ensure parent directory exists
    target.parent.mkdir(parents=True, exist_ok=True)
    
    # Create symlink
    try:
        target.symlink_to(source, target_is_directory=source.is_dir())
        return True, f"Created symlink: {target} → {source}"
    except Exception as e:
        return False, f"Failed to create symlink: {e}"


def get_macos_version() -> Optional[Tuple[int, int]]:
    """Get macOS version as tuple of (major, minor).
    
    Returns:
        Tuple of (major, minor) or None if not on macOS
    """
    try:
        result = run_command("sw_vers -productVersion", capture_output=True)
        version_str = result.stdout.strip()
        parts = version_str.split(".")
        if len(parts) >= 2:
            return (int(parts[0]), int(parts[1]))
    except Exception:
        pass
    return None


def is_macos() -> bool:
    """Check if running on macOS.
    
    Returns:
        True if on macOS
    """
    return os.uname().sysname == "Darwin"


def substitute_vars(text: str, variables: Dict[str, str]) -> str:
    """Substitute variables in text.
    
    Args:
        text: Text containing $VAR or ${VAR} patterns
        variables: Dictionary of variable values
        
    Returns:
        Text with variables substituted
    """
    result = text
    for key, value in variables.items():
        result = result.replace(f"${{{key}}}", value)
        result = result.replace(f"${key}", value)
    return result


__all__ = [
    "expand_path",
    "run_command",
    "command_exists",
    "backup_file",
    "create_symlink",
    "get_macos_version",
    "is_macos",
    "substitute_vars",
]