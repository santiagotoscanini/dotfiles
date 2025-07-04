"""Homebrew handler for managing packages."""

import subprocess
from typing import Dict, Any

from ..core.handler import Status, CheckResult
from ..core.utils import command_exists


class BrewHandler:
    """Handler for Homebrew packages."""
    
    def _get_package_name(self, config: Dict[str, Any]) -> str:
        """Get the actual package name from config."""
        return config.get("brew") or config.get("brew_cask", "")
    
    def _is_cask(self, config: Dict[str, Any]) -> bool:
        """Check if this is a cask package."""
        return "brew_cask" in config
    
    def check(self, config: Dict[str, Any]) -> CheckResult:
        """Check if package is installed via Homebrew."""
        name = config.get("name", "Package")
        package = self._get_package_name(config)
        
        if not package:
            return CheckResult(
                status=Status.ERROR,
                message=f"{name} has no brew configuration"
            )
        
        if not command_exists("brew"):
            return CheckResult(
                status=Status.ERROR,
                message="Homebrew is not installed"
            )
        
        try:
            # Check if installed
            cmd = ["brew", "list", "--cask" if self._is_cask(config) else "--formula", package]
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                return CheckResult(
                    status=Status.INSTALLED,
                    message=f"{name} is installed"
                )
            else:
                return CheckResult(
                    status=Status.NOT_INSTALLED,
                    message=f"{name} is not installed"
                )
                
        except Exception as e:
            return CheckResult(
                status=Status.ERROR,
                message=f"Error checking {name}: {e}"
            )
    
    def install(self, config: Dict[str, Any], dry_run: bool = False) -> bool:
        """Install package via Homebrew."""
        name = config.get("name", "Package")
        package = self._get_package_name(config)
        
        if not command_exists("brew"):
            print("✗ Homebrew is not installed")
            return False
        
        if dry_run:
            cmd_type = "brew install --cask" if self._is_cask(config) else "brew install"
            print(f"Would install {name} ({cmd_type} {package})")
            return True
        
        try:
            # Add tap if specified
            if "tap" in config:
                print(f"  → Adding tap {config['tap']}...")
                subprocess.run(["brew", "tap", config["tap"]], check=True)
            
            # Build install command
            cmd = ["brew", "install"]
            if self._is_cask(config):
                cmd.append("--cask")
            cmd.append(package)
            
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
        """Uninstall package via Homebrew."""
        name = config.get("name", "Package")
        package = self._get_package_name(config)
        
        if not command_exists("brew"):
            return False
        
        if dry_run:
            cmd_type = "brew uninstall --cask" if self._is_cask(config) else "brew uninstall"
            print(f"Would uninstall {name} ({cmd_type} {package})")
            return True
        
        try:
            # Build uninstall command
            cmd = ["brew", "uninstall"]
            if self._is_cask(config):
                cmd.append("--cask")
            cmd.append(package)
            
            # Run uninstallation
            print(f"  → Running: {' '.join(cmd)}")
            subprocess.run(cmd, check=True)
            return True
            
        except subprocess.CalledProcessError:
            return False