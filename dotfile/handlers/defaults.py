"""macOS defaults handler for system preferences."""

import subprocess
from typing import Dict, Any

from ..core.handler import Status, CheckResult
from ..core.utils import is_macos


class DefaultsHandler:
    """Handler for macOS defaults settings."""
    
    def _get_type_flag(self, value: Any, type_hint: str = None) -> str:
        """Get the type flag for defaults write command."""
        if type_hint:
            type_map = {
                "string": "-string",
                "int": "-int",
                "integer": "-int", 
                "float": "-float",
                "bool": "-bool",
                "boolean": "-bool",
                "dict": "-dict",
                "array": "-array"
            }
            return type_map.get(type_hint.lower(), "-string")
        
        # Auto-detect type
        if isinstance(value, bool):
            return "-bool"
        elif isinstance(value, int):
            return "-int"
        elif isinstance(value, float):
            return "-float"
        elif isinstance(value, dict):
            return "-dict"
        elif isinstance(value, list):
            return "-array"
        else:
            return "-string"
    
    def check(self, config: Dict[str, Any]) -> CheckResult:
        """Check current value of the default."""
        if not is_macos():
            return CheckResult(
                status=Status.ERROR,
                message="macOS defaults only available on macOS"
            )
        
        domain = config["domain"]
        key = config["key"]
        expected_value = config["value"]
        
        try:
            # Read current value
            result = subprocess.run(
                ["defaults", "read", domain, key],
                capture_output=True,
                text=True,
                check=True
            )
            
            current_value = result.stdout.strip()
            
            # Compare values (simplified - just string comparison)
            if isinstance(expected_value, bool):
                # defaults returns 0/1 for booleans
                current_bool = current_value == "1"
                if current_bool == expected_value:
                    return CheckResult(
                        status=Status.INSTALLED,
                        message=f"{config.get('name', key)} is set correctly"
                    )
            elif str(current_value) == str(expected_value):
                return CheckResult(
                    status=Status.INSTALLED,
                    message=f"{config.get('name', key)} is set correctly"
                )
            
            return CheckResult(
                status=Status.MODIFIED,
                message=f"{config.get('name', key)} has different value"
            )
                
        except subprocess.CalledProcessError:
            # Key doesn't exist
            return CheckResult(
                status=Status.NOT_INSTALLED,
                message=f"{config.get('name', key)} is not set"
            )
    
    def install(self, config: Dict[str, Any], dry_run: bool = False) -> bool:
        """Set the macOS default value."""
        if not is_macos():
            print("✗ macOS defaults only available on macOS")
            return False
        
        domain = config["domain"]
        key = config["key"]
        value = config["value"]
        name = config.get("name", key)
        
        if dry_run:
            print(f"Would set {name} to {value}")
            return True
        
        # Build command
        cmd = ["defaults", "write", domain, key]
        
        type_flag = self._get_type_flag(value, config.get("type"))
        if type_flag:
            cmd.append(type_flag)
        
        # Handle value based on type
        if isinstance(value, bool):
            cmd.append("YES" if value else "NO")
        elif isinstance(value, (dict, list)):
            # For complex types, we need to format them properly
            if isinstance(value, dict):
                # Convert dict to pairs for defaults command
                for k, v in value.items():
                    cmd.extend([str(k), str(v)])
            else:  # list
                cmd.extend(str(v) for v in value)
        else:
            cmd.append(str(value))
        
        try:
            subprocess.run(cmd, check=True, capture_output=True)
            print(f"✓ Set {name} to {value}")
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"✗ Failed to set {name}: {e}")
            return False
    
    def uninstall(self, config: Dict[str, Any], dry_run: bool = False) -> bool:
        """Remove the macOS default value."""
        if not is_macos():
            return False
        
        domain = config["domain"]
        key = config["key"]
        name = config.get("name", key)
        
        if dry_run:
            print(f"Would remove {name}")
            return True
        
        try:
            subprocess.run(
                ["defaults", "delete", domain, key],
                check=True,
                capture_output=True
            )
            print(f"✓ Removed {name}")
            return True
        except subprocess.CalledProcessError:
            # Key might not exist, that's ok
            print(f"✓ {name} was not set")
            return True