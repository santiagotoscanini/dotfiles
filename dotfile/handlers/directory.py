"""Directory handler for creating directories."""

import os
from typing import Dict, Any

from ..core.handler import Status, CheckResult
from ..core.utils import expand_path


class DirectoryHandler:
    """Handler for creating directories."""
    
    def check(self, config: Dict[str, Any]) -> CheckResult:
        """Check if directory exists."""
        # Handle both single path and multiple paths
        paths = config.get("paths", [config.get("path")])
        if not isinstance(paths, list):
            paths = [paths]
        
        # Filter out None values
        paths = [p for p in paths if p]
        
        if not paths:
            return CheckResult(
                status=Status.ERROR,
                message="No paths specified"
            )
        
        # Check all paths
        missing = []
        errors = []
        
        for path_str in paths:
            path = expand_path(path_str)
            
            if path.exists():
                if not path.is_dir():
                    errors.append(f"{path} exists but is not a directory")
                # Check permissions if specified (only for single path)
                elif len(paths) == 1 and "mode" in config:
                    current_mode = oct(path.stat().st_mode)[-3:]
                    expected_mode = config["mode"].lstrip("0").zfill(3)
                    
                    if current_mode != expected_mode:
                        return CheckResult(
                            status=Status.MODIFIED,
                            message=f"Directory exists with wrong permissions: {path}"
                        )
            else:
                missing.append(str(path))
        
        if errors:
            return CheckResult(
                status=Status.ERROR,
                message="; ".join(errors)
            )
        elif missing:
            return CheckResult(
                status=Status.NOT_INSTALLED,
                message=f"Directories do not exist: {', '.join(missing)}"
            )
        else:
            return CheckResult(
                status=Status.INSTALLED,
                message="All directories exist"
            )
    
    def install(self, config: Dict[str, Any], dry_run: bool = False) -> bool:
        """Create directories."""
        # Handle both single path and multiple paths
        paths = config.get("paths", [config.get("path")])
        if not isinstance(paths, list):
            paths = [paths]
        
        # Filter out None values
        paths = [p for p in paths if p]
        
        if not paths:
            print("✗ No paths specified")
            return False
        
        if dry_run:
            print(f"Would create directories: {', '.join(paths)}")
            return True
        
        success = True
        permissions = config.get("permissions")
        parents = config.get("parents", True)
        
        for path_str in paths:
            path = expand_path(path_str)
            
            try:
                # Handle existing non-directory
                if path.exists() and not path.is_dir():
                    # Back up existing file
                    backup_num = 1
                    while True:
                        backup_path = path.parent / f"{path.name}.backup{backup_num}"
                        if not backup_path.exists():
                            break
                        backup_num += 1
                    
                    path.rename(backup_path)
                    print(f"  → Backed up existing file to {backup_path}")
                
                # Create directory
                path.mkdir(parents=parents, exist_ok=True)
                
                # Set permissions if specified
                if permissions:
                    try:
                        # Handle both "755" and "0755" formats
                        mode_str = permissions.lstrip("0")
                        mode_int = int(mode_str, 8)
                        os.chmod(path, mode_int)
                    except ValueError:
                        print(f"  ⚠️  Invalid permissions: {permissions}")
                
                print(f"✓ Created directory: {path}")
                
            except Exception as e:
                print(f"✗ Failed to create directory {path}: {e}")
                success = False
        
        return success
    
    def uninstall(self, config: Dict[str, Any], dry_run: bool = False) -> bool:
        """Remove directories if empty."""
        # Handle both single path and multiple paths
        paths = config.get("paths", [config.get("path")])
        if not isinstance(paths, list):
            paths = [paths]
        
        # Filter out None values
        paths = [p for p in paths if p]
        
        if dry_run:
            print(f"Would remove directories (if empty): {', '.join(paths)}")
            return True
        
        success = True
        
        # Process in reverse order (deepest first)
        for path_str in reversed(paths):
            path = expand_path(path_str)
            
            try:
                if path.exists() and path.is_dir():
                    # Only remove if empty
                    try:
                        path.rmdir()
                        print(f"✓ Removed empty directory: {path}")
                    except OSError:
                        print(f"⚠️  Directory not empty, keeping: {path}")
                else:
                    print(f"✓ Directory doesn't exist: {path}")
                
            except Exception as e:
                print(f"✗ Error removing directory {path}: {e}")
                success = False
        
        return success