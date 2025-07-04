"""Backup utility for saving current system state to packages.json."""

import json
import subprocess
from pathlib import Path
from typing import List, Tuple


class BackupTool:
    """Tool for backing up current system state."""
    
    def get_brew_packages(self) -> Tuple[List[str], List[str]]:
        """Get currently installed brew formulas and casks.
        
        Returns:
            Tuple of (formulas, casks)
        """
        formulas = []
        casks = []
        
        try:
            # Get installed formulas (only top-level, not dependencies)
            result = subprocess.run(
                ["brew", "leaves"],
                capture_output=True,
                text=True,
                check=True
            )
            formulas = result.stdout.strip().split('\n') if result.stdout.strip() else []
            
            # Get installed casks
            result = subprocess.run(
                ["brew", "list", "--cask"],
                capture_output=True,
                text=True,
                check=True
            )
            casks = result.stdout.strip().split('\n') if result.stdout.strip() else []
            
        except subprocess.CalledProcessError as e:
            print(f"✗ Error getting brew packages: {e}")
        except FileNotFoundError:
            print("✗ Homebrew not found")
            
        return formulas, casks
    
    def _process_packages(self, packages: List[str], is_cask: bool, 
                         existing_packages: dict) -> List[str]:
        """Process a list of packages, adding to config as needed.
        
        Args:
            packages: List of package names
            is_cask: True if these are casks, False for formulas
            existing_packages: Dict of existing package configs
            
        Returns:
            List of new packages added
        """
        new = []
        
        for package in packages:
            if not package:
                continue
                
            if package not in existing_packages:
                # New package not in config
                new.append(package)
                existing_packages[package] = {
                    "description": f"{package} (auto-discovered)",
                    "macos": {
                        "brew_cask" if is_cask else "brew": package
                    }
                }
                
        return new
    
    def backup_brew_packages(self, config_path: Path) -> bool:
        """Backup current brew packages to packages.json.
        
        Args:
            config_path: Path to packages.json
            
        Returns:
            True if successful
        """
        print("🔍 Discovering installed packages...")
        
        # Get current packages
        formulas, casks = self.get_brew_packages()
        
        if not formulas and not casks:
            print("✗ No packages found to backup")
            return False
        
        print(f"→ Found {len(formulas)} formulas and {len(casks)} casks")
        
        # Load existing config
        try:
            with open(config_path, 'r') as f:
                data = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            print(f"✗ Error loading config: {e}")
            return False
        
        # Get existing packages
        existing_packages = data.get("packages", {})
        
        # Process formulas and casks
        new_formulas = self._process_packages(formulas, False, existing_packages)
        new_casks = self._process_packages(casks, True, existing_packages)
        
        new_packages = new_formulas + new_casks
        
        # Update and save
        data["packages"] = existing_packages
        
        try:
            with open(config_path, 'w') as f:
                json.dump(data, f, indent=2)
            
            print("\n✨ Backup completed!")
            if new_packages:
                print(f"→ Added {len(new_packages)} new packages to packages.json")
                print(f"→ New packages: {', '.join(sorted(new_packages))}")
            else:
                print("→ All installed packages are already in packages.json")
            
            return True
            
        except Exception as e:
            print(f"✗ Error saving config: {e}")
            return False
    
    def list_untracked_packages(self, config_path: Path) -> None:
        """List packages installed but not in any profile.
        
        Args:
            config_path: Path to packages.json
        """
        print("🔍 Checking for untracked packages...")
        
        # Get current packages
        formulas, casks = self.get_brew_packages()
        all_installed = set(formulas + casks)
        
        if not all_installed:
            print("✗ No packages found")
            return
        
        # Load config
        try:
            with open(config_path, 'r') as f:
                data = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            print(f"✗ Error loading config: {e}")
            return
        
        # Get all packages in all profiles
        all_tracked = set()
        profiles = data.get("profiles", {})
        
        for profile_data in profiles.values():
            all_tracked.update(profile_data.get("packages", []))
        
        # Find untracked
        untracked = all_installed - all_tracked
        
        if untracked:
            print(f"\n⚠️  Found {len(untracked)} untracked packages (not including dependencies):")
            for pkg in sorted(untracked):
                # Check if it's a formula or cask
                pkg_type = "formula" if pkg in formulas else "cask"
                print(f"  - {pkg} ({pkg_type})")
            
            print("\nTo add these to packages.json, run:")
            print("  python3 dotfile backup")
            print("\nThen manually add them to any profile by editing packages.json")
        else:
            print("✓ All installed packages are tracked in profiles")