"""NPM handler for managing global packages."""

import subprocess
from typing import Dict, Any

from ..core.handler import Status, CheckResult
from ..core.utils import command_exists


class NpmHandler:
    """Handler for NPM global packages."""
    
    def check(self, config: Dict[str, Any]) -> CheckResult:
        """Check if package is installed globally via NPM."""
        name = config.get("name", "Package")
        package = config.get("npm", "")
        
        if not package:
            return CheckResult(
                status=Status.ERROR,
                message=f"{name} has no npm configuration"
            )
        
        if not command_exists("npm"):
            return CheckResult(
                status=Status.ERROR,
                message="NPM is not installed"
            )
        
        try:
            # Check if installed globally
            cmd = ["npm", "list", "-g", "--depth=0", package]
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0 and package in result.stdout:
                return CheckResult(
                    status=Status.INSTALLED,
                    message=f"{name} is installed globally"
                )
            else:
                return CheckResult(
                    status=Status.NOT_INSTALLED,
                    message=f"{name} is not installed globally"
                )
                
        except Exception as e:
            return CheckResult(
                status=Status.ERROR,
                message=f"Error checking {name}: {e}"
            )
    
    def install(self, config: Dict[str, Any], dry_run: bool = False) -> bool:
        """Install package globally via NPM."""
        name = config.get("name", "Package")
        package = config.get("npm", "")
        
        if not command_exists("npm"):
            print("✗ NPM is not installed")
            return False
        
        if dry_run:
            print(f"Would install {name} (npm install -g {package})")
            return True
        
        try:
            # Build install command
            cmd = ["npm", "install", "-g", package]
            
            # Add any extra options
            if "options" in config:
                cmd.extend(config["options"])
            
            # Run installation
            print(f"  → Running: {' '.join(cmd)}")
            subprocess.run(cmd, check=True)
            return True
            
        except subprocess.CalledProcessError:
            return False
    
    def uninstall(self, config: Dict[str, Any], dry_run: bool = False) -> bool:
        """Uninstall package globally via NPM."""
        name = config.get("name", "Package")
        package = config.get("npm", "")
        
        if not command_exists("npm"):
            return False
        
        if dry_run:
            print(f"Would uninstall {name} (npm uninstall -g {package})")
            return True
        
        try:
            # Build uninstall command
            cmd = ["npm", "uninstall", "-g", package]
            
            # Run uninstallation
            print(f"  → Running: {' '.join(cmd)}")
            subprocess.run(cmd, check=True)
            return True
            
        except subprocess.CalledProcessError:
            return False