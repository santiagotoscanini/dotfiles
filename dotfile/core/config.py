"""Configuration management for the dotfile manager."""

import json
from pathlib import Path
from typing import Dict, Any, List, Optional


class Config:
    """Main configuration container for packages.json."""
    
    def __init__(self, data: Dict[str, Any]):
        """Initialize configuration from loaded data."""
        self.packages = data.get("packages", {})
        self.pre_install = data.get("pre-install", {})
        self.profiles = data.get("profiles", {})
    
    def get_profile_packages(self, profile_name: str) -> List[str]:
        """Get list of packages for a profile, resolving base profiles.
        
        Args:
            profile_name: Name of the profile
            
        Returns:
            List of all packages including those from base profiles
        """
        return self._resolve_profile_items(profile_name, "packages")
    
    def get_profile_pre_install(self, profile_name: str) -> List[str]:
        """Get list of pre-install items for a profile, resolving base profiles.
        
        Args:
            profile_name: Name of the profile
            
        Returns:
            List of all pre-install items including those from base profiles
        """
        return self._resolve_profile_items(profile_name, "pre-install")
    
    def get_package(self, name: str) -> Optional[Dict[str, Any]]:
        """Get package configuration with platform-specific data."""
        package = self.packages.get(name)
        if not package:
            return None
        
        # Extract platform-specific configuration
        result = {
            "name": name,
            "description": package.get("description", name),
            "config": package.get("config"),  # Symlink configuration
        }
        
        # Add macOS-specific installation info
        if "macos" in package:
            macos = package["macos"]
            if "brew" in macos:
                result["brew"] = macos["brew"]
            elif "brew_cask" in macos:
                result["brew_cask"] = macos["brew_cask"]
        
        return result
    
    def get_pre_install_item(self, name: str) -> Optional[Dict[str, Any]]:
        """Get pre-install item configuration."""
        item = self.pre_install.get(name)
        if not item:
            return None
        
        # Include all fields from the item
        result = {
            "name": name,
            "description": item.get("description", name),
            "provider": item.get("provider"),  # Handler type
            "config": item.get("config"),  # Symlink configuration
        }
        
        # Add platform-specific data
        if "macos" in item:
            result.update(item["macos"])
        
        return result
    
    def _resolve_profile_items(self, profile_name: str, item_type: str, 
                              visited: Optional[set] = None) -> List[str]:
        """Recursively resolve profile items including base profiles.
        
        Args:
            profile_name: Name of the profile
            item_type: Type of items to get ("packages" or "pre-install")
            visited: Set of already visited profiles to prevent cycles
            
        Returns:
            List of all items including those from base profiles
        """
        if visited is None:
            visited = set()
        
        # Prevent infinite recursion
        if profile_name in visited:
            return []
        visited.add(profile_name)
        
        profile = self.profiles.get(profile_name, {})
        if not profile:
            return []
        
        # Start with base profile items if specified
        items = []
        base = profile.get("base")
        if base:
            # Handle both string and list of bases
            bases = [base] if isinstance(base, str) else base
            for base_name in bases:
                if base_name.startswith("@"):
                    base_name = base_name[1:]  # Remove @ prefix
                items.extend(self._resolve_profile_items(base_name, item_type, visited))
        
        # Add this profile's items
        profile_items = profile.get(item_type, [])
        for item in profile_items:
            if item not in items:  # Avoid duplicates
                items.append(item)
        
        return items


def load_config(config_path: Optional[Path] = None) -> Config:
    """Load configuration from JSON file.
    
    Args:
        config_path: Path to config file (defaults to ./packages.json)
        
    Returns:
        Loaded configuration
        
    Raises:
        FileNotFoundError: If config file doesn't exist
        json.JSONDecodeError: If config file is invalid JSON
    """
    if config_path is None:
        config_path = Path("packages.json")
    
    if not config_path.exists():
        raise FileNotFoundError(f"Configuration file not found: {config_path}")
    
    with open(config_path, "r") as f:
        data = json.load(f)
    
    return Config(data)