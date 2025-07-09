"""Mac App Store handler for managing applications."""

import subprocess
from typing import Dict, Any

from ..core.handler import Status, CheckResult
from ..core.utils import command_exists


class MasHandler:
    """Handler for Mac App Store applications."""
    
    def _get_app_id(self, config: Dict[str, Any]) -> str:
        """Get the app ID from config."""
        # App ID is numeric, but we need it as string for command line
        app_id = config.get("mas", "")
        return str(app_id) if app_id else ""
    
    def check(self, config: Dict[str, Any]) -> CheckResult:
        """Check if app is installed via Mac App Store."""
        name = config.get("name", "App")
        app_id = self._get_app_id(config)
        
        if not app_id:
            return CheckResult(
                status=Status.ERROR,
                message=f"{name} has no mas configuration"
            )
        
        if not command_exists("mas"):
            return CheckResult(
                status=Status.ERROR,
                message="mas CLI is not installed"
            )
        
        try:
            # Check if installed
            result = subprocess.run(
                ["mas", "list"],
                capture_output=True,
                text=True,
                check=True
            )
            
            # Check if app ID appears in the list
            for line in result.stdout.strip().split('\n'):
                if line and app_id in line.split()[0]:
                    return CheckResult(
                        status=Status.INSTALLED,
                        message=f"{name} is installed"
                    )
            
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
        """Install app via Mac App Store."""
        name = config.get("name", "App")
        app_id = self._get_app_id(config)
        
        if not command_exists("mas"):
            print("✗ mas CLI is not installed")
            return False
        
        if dry_run:
            print(f"Would install {name} (mas install {app_id})")
            return True
        
        try:
            # Try to install the app directly
            print(f"  → Installing {name}...")
            install_result = subprocess.run(
                ["mas", "install", app_id],
                capture_output=True,
                text=True
            )
            
            if install_result.returncode == 0:
                return True
            
            # Check if the error indicates the app needs to be purchased
            error_output = install_result.stderr.lower()
            if "purchase" in error_output or "buy" in error_output or "not purchased" in error_output:
                print(f"  → App not purchased, attempting to purchase {name}...")
                
                # Try to purchase the app
                purchase_result = subprocess.run(
                    ["mas", "purchase", app_id],
                    capture_output=True,
                    text=True
                )
                
                if purchase_result.returncode != 0:
                    print(f"✗ Failed to purchase {name}")
                    print(f"  → {purchase_result.stderr}")
                    return False
                
                # Try to install again after purchase
                print(f"  → Installing {name} after purchase...")
                install_result = subprocess.run(
                    ["mas", "install", app_id],
                    capture_output=True,
                    text=True
                )
                
                if install_result.returncode == 0:
                    return True
                else:
                    print(f"✗ Failed to install {name} after purchase")
                    print(f"  → {install_result.stderr}")
                    return False
            else:
                # Some other error occurred
                print(f"✗ Failed to install {name}")
                print(f"  → {install_result.stderr}")
                return False
            
        except subprocess.CalledProcessError as e:
            print(f"✗ Error installing {name}: {e}")
            return False
        except Exception as e:
            print(f"✗ Unexpected error: {e}")
            return False
    
    def uninstall(self, config: Dict[str, Any], dry_run: bool = False) -> bool:
        """Uninstall app via mas uninstall."""
        name = config.get("name", "App")
        app_id = self._get_app_id(config)
        
        if not command_exists("mas"):
            print("✗ mas CLI is not installed")
            return False
        
        if dry_run:
            print(f"Would uninstall {name} (mas uninstall {app_id})")
            return True
        
        try:
            # Uninstall the app
            print(f"  → Uninstalling {name}...")
            result = subprocess.run(
                ["mas", "uninstall", app_id],
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                return True
            else:
                print(f"✗ Failed to uninstall {name}")
                print(f"  → {result.stderr}")
                return False
                
        except subprocess.CalledProcessError as e:
            print(f"✗ Error uninstalling {name}: {e}")
            return False
        except Exception as e:
            print(f"✗ Unexpected error: {e}")
            return False