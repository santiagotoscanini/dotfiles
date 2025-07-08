"""Symlink handler for creating dotfile links."""

import os
from pathlib import Path
from typing import Dict, Any

from ..core.handler import Status, CheckResult
from ..core.utils import create_symlink


class SymlinkHandler:
    """Handler for creating symbolic links."""
    
    def _get_paths(self, config: Dict[str, Any]) -> tuple[Path, Path]:
        """Get absolute paths for source and destination."""
        source = config.get("source", "")
        destination = config.get("destination", "")
        
        dotfiles_dir = os.environ.get("DOTFILES_DIR", ".")
        source_path = (Path(dotfiles_dir) / source).resolve()
        
        # Handle XDG_CONFIG_HOME with default value if not set
        if "$XDG_CONFIG_HOME" in destination and "XDG_CONFIG_HOME" not in os.environ:
            # Set default XDG_CONFIG_HOME to ~/.config
            default_xdg_config = os.path.expanduser("~/.config")
            destination = destination.replace("$XDG_CONFIG_HOME", default_xdg_config)
        
        # Don't resolve the destination to avoid following symlinks
        expanded = os.path.expandvars(os.path.expanduser(destination))
        dest_path = Path(expanded)
        return source_path, dest_path
    
    def check(self, config: Dict[str, Any]) -> CheckResult:
        """Check if symlink exists and is correct."""
        source_path, dest_path = self._get_paths(config)
        
        # Check if source exists
        if not source_path.exists():
            return CheckResult(
                status=Status.ERROR,
                message=f"Source does not exist: {source_path}"
            )
        
        # Check destination
        if not dest_path.exists() and not dest_path.is_symlink():
            return CheckResult(
                status=Status.NOT_INSTALLED,
                message=f"Symlink does not exist: {dest_path}"
            )
        
        # Check if it's a symlink pointing to the right place
        if dest_path.is_symlink():
            try:
                # Read the symlink target directly (without resolving)
                link_target = Path(os.readlink(dest_path))
                # If the target is relative, resolve it relative to the symlink's directory
                if not link_target.is_absolute():
                    link_target = (dest_path.parent / link_target).resolve()
                
                if link_target == source_path:
                    return CheckResult(
                        status=Status.INSTALLED,
                        message=f"Symlink correctly configured: {dest_path} → {source_path}"
                    )
                else:
                    return CheckResult(
                        status=Status.MODIFIED,
                        message=f"Symlink points to wrong target: {link_target}"
                    )
            except Exception:
                return CheckResult(
                    status=Status.ERROR,
                    message=f"Broken symlink: {dest_path}"
                )
        else:
            # File exists but is not a symlink
            return CheckResult(
                status=Status.MODIFIED,
                message=f"File exists but is not a symlink: {dest_path}"
            )
    
    def install(self, config: Dict[str, Any], dry_run: bool = False) -> bool:
        """Create symlink."""
        source_path, dest_path = self._get_paths(config)
        
        # Validate source exists
        if not source_path.exists():
            print(f"✗ Source does not exist: {source_path}")
            return False
        
        if dry_run:
            print(f"Would create symlink: {dest_path} → {source_path}")
            return True
        
        # If destination exists and is not a symlink, back it up
        if dest_path.exists() and not dest_path.is_symlink():
            backup_num = 1
            while True:
                backup_path = dest_path.parent / f"{dest_path.name}.backup{backup_num}"
                if not backup_path.exists():
                    break
                backup_num += 1
            
            dest_path.rename(backup_path)
            print(f"  → Backed up existing file to {backup_path}")
        
        # Create symlink
        success, message = create_symlink(source_path, dest_path, force=True)
        
        if success:
            print(f"✓ {message}")
        else:
            print(f"✗ {message}")
            
        return success
    
    def uninstall(self, config: Dict[str, Any], dry_run: bool = False) -> bool:
        """Remove symlink."""
        source_path, dest_path = self._get_paths(config)
        
        if dry_run:
            print(f"Would remove symlink: {dest_path}")
            return True
        
        try:
            # Only remove if it's a symlink pointing to our source
            if dest_path.is_symlink():
                try:
                    # Read the symlink target directly (without resolving)
                    link_target = Path(os.readlink(dest_path))
                    # If the target is relative, resolve it relative to the symlink's directory
                    if not link_target.is_absolute():
                        link_target = (dest_path.parent / link_target).resolve()
                    
                    if link_target == source_path:
                        dest_path.unlink()
                        print(f"✓ Removed symlink: {dest_path}")
                        return True
                    else:
                        print(f"✗ Symlink points elsewhere, not removing: {dest_path}")
                        return False
                except Exception:
                    # Broken symlink, remove it
                    dest_path.unlink()
                    print(f"✓ Removed broken symlink: {dest_path}")
                    return True
            else:
                print(f"✗ Not a symlink: {dest_path}")
                return False
                
        except Exception as e:
            print(f"✗ Error removing symlink: {e}")
            return False