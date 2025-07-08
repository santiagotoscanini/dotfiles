"""Runner for executing installations and uninstallations."""


from .handler import Status
from .config import Config
from ..handlers import BrewHandler, SymlinkHandler, DefaultsHandler, ScriptHandler, DirectoryHandler


class Runner:
    """Execute installations and uninstallations."""
    
    def __init__(self):
        """Initialize runner with handlers."""
        self.brew_handler = BrewHandler()
        self.symlink_handler = SymlinkHandler()
        self.defaults_handler = DefaultsHandler()
        self.script_handler = ScriptHandler()
        self.directory_handler = DirectoryHandler()
    
    def run_pre_install(self, config: Config, profile_name: str, dry_run: bool = False) -> bool:
        """Run pre-install tasks for a profile.
        
        Args:
            config: Configuration object
            profile_name: Name of profile
            dry_run: If True, simulate without making changes
            
        Returns:
            True if all tasks succeeded
        """
        print("\n🔧 Running pre-install tasks...")
        success = True
        
        # Get pre-install items for this profile
        pre_install_names = config.get_profile_pre_install(profile_name)
        
        for item_name in pre_install_names:
            item = config.get_pre_install_item(item_name)
            if not item:
                print(f"⚠️  Unknown pre-install item: {item_name}")
                continue
            
            provider = item.get("provider")
            description = item.get("description", item_name)
            
            # Route to appropriate handler based on provider
            if provider == "script" or "check" in item:
                handler = self.script_handler
            elif provider == "directory":
                handler = self.directory_handler
            elif provider == "defaults":
                handler = self.defaults_handler
            else:
                # No provider means it's a script task
                handler = self.script_handler
            
            # Check current status
            check = handler.check(item)
            
            if check.status == Status.INSTALLED:
                print(f"✓ {description} already configured")
                continue
            elif check.status == Status.ERROR:
                print(f"⚠️  {description}: {check.message}")
                continue
            
            # Install
            print(f"→ {description}...")
            if handler.install(item, dry_run):
                if not dry_run:
                    print(f"✓ {description} completed")
                    
                # If pre-install item has config (symlinks), create them
                if item.get("config") and success:
                    symlink_config = item["config"]
                    source = symlink_config.get("source")
                    destination = symlink_config.get("destination")
                    
                    if source and destination:
                        print(f"  → Creating config symlink for {item_name}...")
                        symlink_data = {
                            "source": source,
                            "destination": destination,
                        }
                        
                        check = self.symlink_handler.check(symlink_data)
                        if check.status == Status.INSTALLED:
                            print("  ✓ Config symlink already exists")
                        elif check.status != Status.ERROR:
                            if not self.symlink_handler.install(symlink_data, dry_run):
                                success = False
            else:
                success = False
                break
        
        return success
    
    def install_profile(self, config: Config, profile_name: str, dry_run: bool = False) -> bool:
        """Install all packages in a profile.
        
        Args:
            config: Configuration object
            profile_name: Name of profile to install
            dry_run: If True, simulate without making changes
            
        Returns:
            True if all packages installed successfully
        """
        print(f"\n📦 Installing profile: {profile_name}")
        
        # Check if profile exists
        if profile_name not in config.profiles:
            print(f"✗ Profile not found: {profile_name}")
            print(f"Available profiles: {', '.join(config.profiles.keys())}")
            return False
        
        # Get packages for this profile
        packages = config.get_profile_packages(profile_name)
        
        print(f"→ Found {len(packages)} packages to install")
        success = True
        
        # Install packages
        for pkg_name in sorted(packages):
            pkg_config = config.get_package(pkg_name)
            if not pkg_config:
                print(f"⚠️  No configuration for package: {pkg_name}")
                continue
            
            # Check and install with brew handler
            check = self.brew_handler.check(pkg_config)
            
            if check.status == Status.INSTALLED:
                print(f"✓ {pkg_name} already installed")
            elif check.status == Status.ERROR:
                print(f"⚠️  {pkg_name}: {check.message}")
                continue
            else:
                print(f"→ Installing {pkg_name}...")
                if not self.brew_handler.install(pkg_config, dry_run):
                    success = False
                    if not dry_run:
                        break
            
            # If package has config (symlinks), create them
            if pkg_config.get("config") and success:
                symlink_config = pkg_config["config"]
                source = symlink_config.get("source")
                destination = symlink_config.get("destination")
                
                if source and destination:
                    print(f"  → Creating config symlink for {pkg_name}...")
                    symlink_data = {
                        "source": source,
                        "destination": destination,
                    }
                    
                    check = self.symlink_handler.check(symlink_data)
                    if check.status == Status.INSTALLED:
                        print("  ✓ Config symlink already exists")
                    elif check.status != Status.ERROR:
                        if not self.symlink_handler.install(symlink_data, dry_run):
                            success = False
                            if not dry_run:
                                break
        
        return success
    
    def check_all(self, config: Config) -> None:
        """Check status of all items without making changes.
        
        Args:
            config: Configuration object
        """
        print("\n🔍 Checking installation status...")
        
        # Check pre-install items
        print("\nPre-install tasks:")
        for name, item_data in sorted(config.pre_install.items()):
            item = config.get_pre_install_item(name)
            if not item:
                continue
                
            provider = item.get("provider")
            description = item.get("description", name)
            
            # Route to appropriate handler
            if provider == "script" or "check" in item:
                check = self.script_handler.check(item)
            elif provider == "directory":
                check = self.directory_handler.check(item)
            elif provider == "defaults":
                check = self.defaults_handler.check(item)
            else:
                check = self.script_handler.check(item)
            
            status_icon = {
                Status.INSTALLED: "✓",
                Status.NOT_INSTALLED: "✗",
                Status.MODIFIED: "⚠️",
                Status.ERROR: "❌"
            }.get(check.status, "?")
            
            status_msg = f"{description}: {check.message}"
            
            # Also check symlinks if pre-install item has config
            if item.get("config"):
                symlink_config = item["config"]
                symlink_data = {
                    "source": symlink_config.get("source"),
                    "destination": symlink_config.get("destination")
                }
                if symlink_data["source"] and symlink_data["destination"]:
                    symlink_check = self.symlink_handler.check(symlink_data)
                    status_msg += f" (config: {symlink_check.message})"
            
            print(f"  {status_icon} {status_msg}")
        
        # Check packages
        print("\nPackages:")
        for name in sorted(config.packages.keys()):
            pkg_config = config.get_package(name)
            if not pkg_config:
                continue
                
            check = self.brew_handler.check(pkg_config)
            
            status_icon = {
                Status.INSTALLED: "✓",
                Status.NOT_INSTALLED: "✗",
                Status.MODIFIED: "⚠️",
                Status.ERROR: "❌"
            }.get(check.status, "?")
            
            status_msg = f"{name}: {check.message}"
            
            # Also check symlinks if package has config
            if pkg_config.get("config"):
                symlink_config = pkg_config["config"]
                symlink_data = {
                    "source": symlink_config.get("source"),
                    "destination": symlink_config.get("destination")
                }
                if symlink_data["source"] and symlink_data["destination"]:
                    symlink_check = self.symlink_handler.check(symlink_data)
                    # Always show config status, not just when there's an issue
                    status_msg += f" (config: {symlink_check.message})"
            
            print(f"  {status_icon} {status_msg}")
    
    def uninstall_profile(self, config: Config, profile_name: str, dry_run: bool = False) -> bool:
        """Uninstall all packages in a profile.
        
        Args:
            config: Configuration object
            profile_name: Name of profile to uninstall
            dry_run: If True, simulate without making changes
            
        Returns:
            True if all packages uninstalled successfully
        """
        print(f"\n🗑️  Uninstalling profile: {profile_name}")
        
        # Check if profile exists
        if profile_name not in config.profiles:
            print(f"✗ Profile not found: {profile_name}")
            print(f"Available profiles: {', '.join(config.profiles.keys())}")
            return False
        
        # Get packages for this profile
        packages = config.get_profile_packages(profile_name)
        
        print(f"→ Found {len(packages)} packages to uninstall")
        success = True
        
        # Uninstall in reverse order
        for pkg_name in reversed(sorted(packages)):
            pkg_config = config.get_package(pkg_name)
            if not pkg_config:
                continue
            
            # First remove symlinks if package has config
            if pkg_config.get("config"):
                symlink_config = pkg_config["config"]
                symlink_data = {
                    "source": symlink_config.get("source"),
                    "destination": symlink_config.get("destination")
                }
                
                if symlink_data["source"] and symlink_data["destination"]:
                    check = self.symlink_handler.check(symlink_data)
                    if check.status != Status.NOT_INSTALLED:
                        print(f"  → Removing config symlink for {pkg_name}...")
                        self.symlink_handler.uninstall(symlink_data, dry_run)
            
            # Then uninstall package
            check = self.brew_handler.check(pkg_config)
            if check.status == Status.NOT_INSTALLED:
                print(f"✓ {pkg_name} not installed")
                continue
            
            print(f"→ Uninstalling {pkg_name}...")
            if not self.brew_handler.uninstall(pkg_config, dry_run):
                success = False
                if not dry_run:
                    break
        
        return success