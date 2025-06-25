#!/usr/bin/env python3

import argparse
import errno
import json
import os
import platform
import subprocess
import sys
import tempfile
from datetime import datetime
from enum import Enum
from pathlib import Path


# Constants
LOG_SEPARATOR = "=" * 80

# Only macOS is supported for now
class OS(Enum):
    MACOS = "macos"


class LogLevel(Enum):
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"
    HEADER = "header"


class PackageManager(Enum):
    BREW = "brew"
    BREW_CASK = "brew_cask"


class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'


def supports_color():
    """Check if terminal supports color output."""
    return sys.stdout.isatty() and os.environ.get('TERM') != 'dumb'


def get_log_path():
    """Get the log file path in the dotfiles directory."""
    dotfiles_dir = Path(os.environ.get("DOTFILES_DIR", os.path.dirname(os.path.abspath(__file__))))
    return str(dotfiles_dir / ".dotfiles-install.log")


def log_to_file(message, level):
    """Log messages to file for debugging."""
    log_path = get_log_path()
    with open(log_path, "a") as f:
        f.write(f"{datetime.now().isoformat()} [{level.value}] {message}\n")


def log_raw(message):
    """Log raw messages to file without level prefix."""
    log_path = get_log_path()
    with open(log_path, "a") as f:
        f.write(f"{datetime.now().isoformat()} [output] {message}\n")


def log_command_start():
    """Log the start of a command execution with separator."""
    log_path = get_log_path()
    with open(log_path, "a") as f:
        f.write("\n" + LOG_SEPARATOR + "\n")
        f.write(f"Command started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Command line: {' '.join(sys.argv)}\n")
        f.write(f"Working directory: {os.getcwd()}\n")
        f.write(LOG_SEPARATOR + "\n\n")


def print_status(message, level=LogLevel.INFO):
    color_map = {
        LogLevel.INFO: Colors.BLUE,
        LogLevel.SUCCESS: Colors.GREEN,
        LogLevel.WARNING: Colors.WARNING,
        LogLevel.ERROR: Colors.FAIL,
        LogLevel.HEADER: Colors.HEADER
    }
    
    # Log to file
    log_to_file(message, level)
    
    # Print to console with color if supported
    if supports_color():
        color = color_map.get(level, Colors.BLUE)
        print(f"{color}{message}{Colors.ENDC}")
    else:
        print(f"[{level.value.upper()}] {message}")


def detect_os():
    system = platform.system().lower()
    if system == "darwin":
        return OS.MACOS
    print_status(f"Unsupported operating system: {system}", LogLevel.ERROR)
    sys.exit(1)


def check_required_variables():
    required_vars = ["XDG_CONFIG_HOME", "HOME", "DOTFILES_DIR"]
    missing_vars = []
    
    for var in required_vars:
        if not os.environ.get(var):
            missing_vars.append(var)
    
    if missing_vars:
        print_status(f"Missing environment variables: {', '.join(missing_vars)}", LogLevel.ERROR)
        print_status("Please set these variables before running the installer.", LogLevel.INFO)
        
        # Suggest default values
        print("\nSuggested exports for your shell:")
        if "XDG_CONFIG_HOME" in missing_vars:
            print("export XDG_CONFIG_HOME=\"$HOME/.config\"")
        if "DOTFILES_DIR" in missing_vars:
            print("export DOTFILES_DIR=\"$HOME/dotfiles\"")
        sys.exit(1)
    
    detect_os()
    
    return {
        "XDG_CONFIG_HOME": os.environ["XDG_CONFIG_HOME"],
        "HOME": os.environ["HOME"],
        "DOTFILES_DIR": os.environ["DOTFILES_DIR"],
        "QMK_DIR": os.environ.get("QMK_DIR", "")
    }


def load_packages_config(packages_file="packages.json"):
    packages_path = Path(packages_file)
    if not packages_path.exists():
        print_status(f"Configuration file {packages_file} not found", LogLevel.ERROR)
        print_status("Please create a packages.json file with your configuration", LogLevel.INFO)
        sys.exit(1)
    
    try:
        with open(packages_path, 'r') as f:
            config = json.load(f)
            config.setdefault("version", "1.0.0")
            config.setdefault("packages", {})
            config.setdefault("profiles", {})
            config.setdefault("pre-install", {})
            return config
    except json.JSONDecodeError as e:
        print_status(f"Error parsing {packages_file}: {e}", LogLevel.ERROR)
        sys.exit(1)


def save_packages_config(config, packages_file="packages.json"):
    """Save configuration atomically to prevent corruption."""
    temp_fd, temp_path = tempfile.mkstemp(dir=os.path.dirname(packages_file), text=True)
    try:
        with os.fdopen(temp_fd, 'w') as f:
            json.dump(config, f, indent=2, sort_keys=True)
            f.write('\n')  # Add final newline
        
        # Atomic replace on POSIX systems
        os.replace(temp_path, packages_file)
        print_status(f"Saved configuration to {packages_file}", LogLevel.SUCCESS)
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        print_status(f"Failed to save configuration: {e}", LogLevel.ERROR)
        raise


def check_homebrew():
    """Check if Homebrew is installed and working."""
    try:
        result = subprocess.run(
            ["brew", "--version"], 
            capture_output=True, 
            text=True,
            check=False  # Don't raise on non-zero exit
        )
        return result.returncode == 0
    except (FileNotFoundError, OSError):
        return False


def get_brew_packages():
    """Get all installed brew packages, separated into formulae and casks."""
    packages = {"formulae": [], "casks": []}
    
    if not check_homebrew():
        print_status("Homebrew not found", LogLevel.WARNING)
        return packages
    
    try:
        # Get formulae (only leaves - packages installed explicitly, not dependencies)
        result = subprocess.run(["brew", "leaves"], capture_output=True, text=True, check=True)
        output = result.stdout.strip()
        packages["formulae"] = output.split('\n') if output else []

        # Get casks (casks are always explicitly installed)
        result = subprocess.run(["brew", "list", "--cask"], capture_output=True, text=True, check=True)
        output = result.stdout.strip()
        packages["casks"] = output.split('\n') if output else []
        
    except subprocess.CalledProcessError as e:
        print_status(f"Error getting brew packages: {e.stderr if e.stderr else str(e)}", LogLevel.ERROR)
    
    return packages


def install_preinstall_for_profiles(config, profiles, env_vars, dry_run=False):
    """Install pre-install items for the given profiles."""
    preinstall_items = config.get("pre-install", {})
    
    if not preinstall_items:
        return
    
    # Collect pre-install items from selected profiles
    items_to_install = []
    for profile in profiles:
        if profile in config["profiles"]:
            items_to_install.extend(config["profiles"][profile].get("pre-install", []))
        
    # Remove duplicates while preserving order
    items_to_install = list(dict.fromkeys(items_to_install))
    
    if not items_to_install:
        return
        
    print_status(f"Checking pre-install items for profiles: {', '.join(profiles)}...", LogLevel.HEADER)
    
    installed_items = []
    
    for item_name in items_to_install:
        if item_name not in preinstall_items:
            print_status(f"Pre-install item '{item_name}' not found in configuration", LogLevel.WARNING)
            continue
            
        item_info = preinstall_items[item_name]
        if OS.MACOS.value not in item_info:
            continue
            
        item_data = item_info[OS.MACOS.value]
        description = item_info.get("description", item_name)
        
        # Check if already installed
        check_cmd = item_data.get("check")
        already_installed = False
        if check_cmd:
            try:
                result = subprocess.run(
                    check_cmd, 
                    shell=True,  # SECURITY: This is safe only because we control the config
                    capture_output=True, 
                    text=True
                )
                if result.returncode == 0:
                    print_status(f"✓ {description} already installed", LogLevel.SUCCESS)
                    already_installed = True
                    installed_items.append(item_name)
            except subprocess.CalledProcessError:
                pass  # Check failed, will try to install
        
        if not already_installed:
            # Install pre-install item
            install_cmd = item_data.get("install")
            if not install_cmd:
                print_status(f"No installation command for {description}", LogLevel.WARNING)
                continue
                
            if dry_run:
                print_status(f"Would install: {description}", LogLevel.INFO)
                print(f"  Command: {install_cmd}")
            else:
                print_status(f"Installing {description}...", LogLevel.INFO)
                try:
                    # Use shell=True for complex install scripts
                    result = subprocess.run(
                        install_cmd,
                        shell=True,  # SECURITY: This is safe only because we control the config
                        check=True,
                        text=True
                    )
                    print_status(f"✓ {description} installed", LogLevel.SUCCESS)
                    installed_items.append(item_name)
                    
                    # Run post-install command if specified
                    post_install = item_data.get("post_install")
                    if post_install:
                        subprocess.run(post_install, shell=True, check=True)  # SECURITY: Safe only with trusted config
                        
                except subprocess.CalledProcessError as e:
                    print_status(f"✗ Failed to install {description}: {e}", LogLevel.ERROR)
                    print_status("This is a required pre-install item. Exiting.", LogLevel.ERROR)
                    sys.exit(1)
    
    # Create config symlinks for installed pre-install items
    if installed_items and not dry_run:
        create_preinstall_config_symlinks(config, installed_items, env_vars, dry_run)


def generate_packages_from_system(config):
    """Generate package list from currently installed brew packages."""
    if not check_homebrew():
        print_status("Homebrew not installed. Install it first with --install-prerequisites", LogLevel.ERROR)
        return config
        
    print_status("Scanning installed brew packages...", LogLevel.INFO)
    brew_packages = get_brew_packages()
    
    new_packages = 0
    for formula in brew_packages["formulae"]:
        if formula and formula not in config["packages"]:
            config["packages"][formula] = {
                OS.MACOS.value: {PackageManager.BREW.value: formula},
                "description": ""  # Empty description, to be filled manually
            }
            new_packages += 1
    
    for cask in brew_packages["casks"]:
        if cask and cask not in config["packages"]:
            config["packages"][cask] = {
                OS.MACOS.value: {PackageManager.BREW_CASK.value: cask},
                "description": ""  # Empty description, to be filled manually
            }
            new_packages += 1
    
    print_status(f"Found {new_packages} new packages", LogLevel.SUCCESS)
    print_status(f"Total packages: {len(config['packages'])}", LogLevel.INFO)
    
    return config


def validate_config(config):
    """Validate configuration structure and references."""
    all_packages = set(config["packages"].keys())
    for profile_name, profile_data in config["profiles"].items():
        if not isinstance(profile_data, dict):
            print_status(f"Profile '{profile_name}' has invalid format. Expected dict with 'pre-install' and 'packages'", LogLevel.ERROR)
            sys.exit(1)
            
        profile_packages = profile_data.get("packages", [])
        missing = set(profile_packages) - all_packages
        if missing:
            print_status(f"Profile '{profile_name}' references non-existent packages: {', '.join(missing)}", LogLevel.ERROR)
            sys.exit(1)
    
    # Check profiles reference valid pre-install items
    if "pre-install" in config:
        all_preinstall = set(config["pre-install"].keys())
        for profile_name, profile_data in config["profiles"].items():
            if "pre-install" in profile_data:
                missing = set(profile_data["pre-install"]) - all_preinstall
                if missing:
                    print_status(f"Profile '{profile_name}' references non-existent pre-install items: {', '.join(missing)}", LogLevel.ERROR)
                    sys.exit(1)


def check_unused_packages(config):
    """Check for packages that aren't used in any profile and show a warning."""
    all_packages = set(config.get("packages", {}).keys())
    used_packages = set()
    
    # Collect all packages used in profiles
    for profile_name, profile_data in config.get("profiles", {}).items():
        if isinstance(profile_data, dict):
            used_packages.update(profile_data.get("packages", []))
    
    # Find unused packages
    unused_packages = all_packages - used_packages
    
    if unused_packages:
        print_status("\nWarning: The following packages are not used in any profile:", LogLevel.WARNING)
        for package in sorted(unused_packages):
            description = config["packages"][package].get("description", "")
            if description:
                msg = f"  - {package}: {description}"
            else:
                msg = f"  - {package}"
            print(msg)
            log_raw(msg)
        print_status("Consider adding them to a profile or removing them from packages.json\n", LogLevel.INFO)




def install_packages_for_profile(config, profiles, env_vars, dry_run=False):
    """Install packages for the given profiles and create their configs."""
    packages_to_install = []
    invalid_profiles = []
    
    # Collect all packages from selected profiles
    for profile in profiles:
        if profile in config["profiles"]:
            profile_data = config["profiles"][profile]
            packages_to_install.extend(profile_data.get("packages", []))
        else:
            invalid_profiles.append(profile)
    
    if invalid_profiles:
        available = ", ".join(sorted(config["profiles"].keys()))
        print_status(f"Invalid profile(s): {', '.join(invalid_profiles)}", LogLevel.ERROR)
        print_status(f"Available profiles: {available}", LogLevel.INFO)
        if not packages_to_install:
            sys.exit(1)
    
    # Remove duplicates while preserving order
    packages_to_install = list(dict.fromkeys(packages_to_install))
    
    if not packages_to_install:
        print_status("No packages to install", LogLevel.INFO)
        return
    
    print_status(f"Installing {len(packages_to_install)} packages for profiles: {', '.join(profiles)}", LogLevel.HEADER)
    
    # Get already installed packages
    installed = get_brew_packages()
    
    # Track installation statistics
    installed_count = 0
    skipped_count = 0
    failed_count = 0
    already_installed = []
    
    for package_name in sorted(packages_to_install):
        if package_name not in config["packages"]:
            print_status(f"Package '{package_name}' not found in configuration", LogLevel.WARNING)
            continue
        
        package_info = config["packages"][package_name]
        
        # Show description if available
        description = package_info.get("description", "")
        if description:
            print_status(f"\n{package_name}: {description}", LogLevel.INFO)
        
        if OS.MACOS.value not in package_info:
            print_status(f"Package '{package_name}' not available for macOS", LogLevel.WARNING)
            continue
        
        install_info = package_info[OS.MACOS.value]
        
        # Check if already installed
        if PackageManager.BREW.value in install_info and package_name in installed["formulae"]:
            print_status(f"✓ {package_name} (formula) already installed", LogLevel.SUCCESS)
            skipped_count += 1
            already_installed.append(package_name)
            continue
        elif PackageManager.BREW_CASK.value in install_info and package_name in installed["casks"]:
            print_status(f"✓ {package_name} (cask) already installed", LogLevel.SUCCESS)
            skipped_count += 1
            already_installed.append(package_name)
            continue
        
        # Install the package
        if dry_run:
            print_status(f"Would install: {package_name}", LogLevel.INFO)
        else:
            if PackageManager.BREW.value in install_info:
                cmd = ["brew", "install", install_info[PackageManager.BREW.value]]
            elif PackageManager.BREW_CASK.value in install_info:
                cmd = ["brew", "install", "--cask", install_info[PackageManager.BREW_CASK.value]]
            else:
                continue
            
            print_status(f"Installing {package_name}...", LogLevel.INFO)
            try:
                subprocess.run(cmd, check=True)
                print_status(f"✓ {package_name} installed", LogLevel.SUCCESS)
                installed_count += 1
                already_installed.append(package_name)
            except subprocess.CalledProcessError as e:
                error_msg = e.stderr.strip() if e.stderr else "Check logs for details"
                print_status(f"✗ Failed to install {package_name}: {error_msg}", LogLevel.ERROR)
                failed_count += 1
    
    # Print summary
    print_status(f"\nSummary: {installed_count} installed, {skipped_count} already installed, {failed_count} failed", LogLevel.INFO)
    
    # Create config symlinks for all installed packages
    if already_installed and not dry_run:
        print_status("\nCreating configuration symlinks...", LogLevel.HEADER)
        create_config_symlinks(config, already_installed, env_vars, dry_run)


def substitute_env_vars(path, env_vars):
    """Substitute environment variables in path."""
    if not path:
        return path
        
    result = path
    for var_name, var_value in env_vars.items():
        if var_value:  # Only substitute non-empty values
            result = result.replace(f"${var_name}", var_value)
    return result


def force_symlink(src, dst):
    """Create a symlink, removing existing file/link if necessary."""
    # Remove existing file/link/directory if it exists
    if os.path.exists(dst) or os.path.islink(dst):
        if os.path.islink(dst) or os.path.isfile(dst):
            os.remove(dst)
        elif os.path.isdir(dst):
            import shutil
            shutil.rmtree(dst)
    
    # Create the symlink
    os.symlink(src, dst, target_is_directory=os.path.isdir(src)
)


def get_packages_with_configs(config, profiles):
    """Get all packages with configs from the selected profiles."""
    packages_with_configs = set()
    
    # Collect all packages from selected profiles
    config_profiles = config.get("profiles", {})
    config_packages = config.get("packages", {})
    for profile in profiles:
        if profile in config_profiles:
            profile_data = config_profiles[profile]
            packages = profile_data.get("packages", [])
            
            # Filter to only packages that have configs
            for package_name in packages:
                if package_name in config_packages and "config" in config_packages[package_name]:
                    packages_with_configs.add(package_name)
    
    return list(packages_with_configs)


def install_dotfiles_for_profiles(config, profiles, env_vars, dry_run=False):
    """Create dotfile symlinks for packages in the given profiles."""
    packages_with_configs = get_packages_with_configs(config, profiles)
    
    if not packages_with_configs:
        print_status("No dotfile configurations to install", LogLevel.INFO)
        return
    
    print_status(f"Creating dotfile symlinks for profiles: {', '.join(profiles)}", LogLevel.HEADER)
    create_config_symlinks(config, packages_with_configs, env_vars, dry_run)


def check_symlink_status(src, dst, name, suffix=""):
    """Check the status of a symlink and print the result."""
    if os.path.exists(dst):
        if os.path.islink(dst):
            link_target = os.readlink(dst)
            if link_target == src:
                msg = f"    ✓ {name}{suffix} (correct symlink)"
            else:
                msg = f"    ⚠ {name}{suffix} (symlink points to {link_target})"
        else:
            msg = f"    ⚠ {name}{suffix} (exists but not a symlink)"
    else:
        msg = f"    ✗ {name}{suffix} (not installed)"
    print(msg)
    log_raw(msg)


def check_preinstall_item(item_name, item_info, item_data):
    """Check if a pre-install item is installed."""
    description = item_info.get("description", item_name)
    check_cmd = item_data.get("check")
    
    if check_cmd:
        try:
            result = subprocess.run(check_cmd, shell=True, capture_output=True)  # SECURITY: Safe only with trusted config
            if result.returncode == 0:
                msg = f"    ✓ {description}"
            else:
                msg = f"    ✗ {description} (not installed)"
        except (subprocess.SubprocessError, OSError) as e:
            msg = f"    ? {description} (check failed: {type(e).__name__})"
        print(msg)
        log_raw(msg)


def check_installation_status(config, env_vars):
    """Check and report installation status without making changes."""
    print_status("\nChecking installation status...", LogLevel.HEADER)
    
    # Check pre-install items by profile
    print_status("\nPre-install items by profile:", LogLevel.INFO)
    preinstall_items = config.get("pre-install", {})
    
    for profile_name, profile_data in config["profiles"].items():
        if "pre-install" in profile_data:
            msg = f"\n  Profile: {profile_name}"
            print(msg)
            log_raw(msg)
            for item_name in profile_data["pre-install"]:
                if item_name not in preinstall_items:
                    continue
                item_info = preinstall_items[item_name]
                if OS.MACOS.value not in item_info:
                    continue
                    
                item_data = item_info[OS.MACOS.value]
                check_preinstall_item(item_name, item_info, item_data)
    
    # Check brew packages
    print_status("\nBrew packages:", LogLevel.INFO)
    if check_homebrew():
        installed = get_brew_packages()
        all_formulae = set(installed["formulae"])
        all_casks = set(installed["casks"])
        
        for package_name, package_info in sorted(config["packages"].items()):
            if OS.MACOS.value in package_info:
                install_info = package_info[OS.MACOS.value]
                if PackageManager.BREW.value in install_info:
                    if package_name in all_formulae:
                        msg = f"  ✓ {package_name} (formula)"
                    else:
                        msg = f"  ✗ {package_name} (formula - not installed)"
                    print(msg)
                    log_raw(msg)
                elif PackageManager.BREW_CASK.value in install_info:
                    if package_name in all_casks:
                        msg = f"  ✓ {package_name} (cask)"
                    else:
                        msg = f"  ✗ {package_name} (cask - not installed)"
                    print(msg)
                    log_raw(msg)
    else:
        msg = "  Homebrew not installed - cannot check packages"
        print(msg)
        log_raw(msg)
    
    # Check dotfile symlinks by profile
    print_status("\nDotfile symlinks by profile:", LogLevel.INFO)
    
    for profile_name, profile_data in config["profiles"].items():
        msg = f"\n  Profile: {profile_name}"
        print(msg)
        log_raw(msg)
        
        # Check pre-install configs
        preinstall_items = config.get("pre-install", {})
        profile_preinstall = profile_data.get("pre-install", [])
        
        for item_name in profile_preinstall:
            if item_name in preinstall_items and "config" in preinstall_items[item_name]:
                item_info = preinstall_items[item_name]
                config_info = item_info["config"]
                
                # Skip optional configs if their env var is not set
                if config_info.get("optional", False):
                    dest = substitute_env_vars(config_info["destination"], env_vars)
                    if "$" in dest:  # Still has unsubstituted vars
                        continue
                
                src = str(Path(env_vars["DOTFILES_DIR"]) / config_info["source"])
                dst = substitute_env_vars(config_info["destination"], env_vars)
                
                check_symlink_status(src, dst, item_name, " [pre-install]")
        
        # Check package configs
        packages_with_configs = get_packages_with_configs(config, [profile_name])
        
        for package_name in packages_with_configs:
            package_info = config["packages"][package_name]
            config_info = package_info.get("config", {})
            
            # Skip optional configs if their env var is not set
            if config_info.get("optional", False):
                dest = substitute_env_vars(config_info["destination"], env_vars)
                if "$" in dest:  # Still has unsubstituted vars
                    continue
            
            src = str(Path(env_vars["DOTFILES_DIR"]) / config_info["source"])
            dst = substitute_env_vars(config_info["destination"], env_vars)
            
            check_symlink_status(src, dst, package_name)


def create_preinstall_config_symlinks(config, installed_items, env_vars, dry_run=False):
    """Create symlinks for configurations of installed pre-install items."""
    preinstall_items = config.get("pre-install", {})
    configs_to_create = []
    
    for item_name in installed_items:
        if item_name in preinstall_items and "config" in preinstall_items[item_name]:
            configs_to_create.append((item_name, preinstall_items[item_name]))
    
    if configs_to_create:
        print_status("\nCreating pre-install configuration symlinks...", LogLevel.HEADER)
        _create_symlinks(configs_to_create, env_vars, dry_run, "pre-install")


def create_config_symlinks(config, installed_packages, env_vars, dry_run=False):
    """Create symlinks for configurations of installed packages."""
    packages = config.get("packages", {})
    configs_to_create = []
    
    for package_name in installed_packages:
        if package_name in packages and "config" in packages[package_name]:
            configs_to_create.append((package_name, packages[package_name]))
    
    if configs_to_create:
        _create_symlinks(configs_to_create, env_vars, dry_run, "package")


def _create_symlinks(items_with_config, env_vars, dry_run, item_type):
    """Internal function to create symlinks for items with config."""
    symlinks_created = 0
    
    for item_name, item_info in items_with_config:
        config_info = item_info["config"]
        
        # Skip optional configs if their env var is not set
        if config_info.get("optional", False):
            dest = substitute_env_vars(config_info["destination"], env_vars)
            if "$" in dest:  # Still has unsubstituted vars
                print_status(f"  Destination has unsubstituted vars, skipping: {dest}", LogLevel.WARNING)
                continue
                
        src = str(Path(env_vars["DOTFILES_DIR"]) / config_info["source"])
        dst = substitute_env_vars(config_info["destination"], env_vars)
        
        print_status(f"\n--- {item_name} configuration ---", LogLevel.INFO)
        print(f"  {item_type.capitalize()}: {item_name} - {item_info.get('description', '')}")
        source_msg = f"  Source: {src}"
        dest_msg = f"  Destination: {dst}"
        print(source_msg)
        print(dest_msg)
        log_raw(source_msg)
        log_raw(dest_msg)
        
        if dry_run:
            if not os.path.exists(src):
                print_status("  Source not found, would skip", LogLevel.WARNING)
                continue
            print_status("  Would create symlink", LogLevel.INFO)
        else:
            # Create parent directory if it doesn't exist
            try:
                os.makedirs(os.path.dirname(dst), exist_ok=True)
                
                # Check source exists right before creating symlink to minimize TOCTOU window
                if not os.path.exists(src):
                    print_status("  Source not found, skipping", LogLevel.WARNING)
                    continue
                    
                force_symlink(src, dst)
                print_status("  ✓ Symlink created", LogLevel.SUCCESS)
                symlinks_created += 1
            except OSError as e:
                print_status(f"  ✗ Failed to create symlink: {e}", LogLevel.ERROR)
    
    if symlinks_created > 0:
        print_status(f"\nCreated {symlinks_created} {item_type} configuration symlinks", LogLevel.SUCCESS)


def create_argument_parser():
    """Create and configure the argument parser."""
    parser = argparse.ArgumentParser(
        description="Smart dotfiles installer with profile-based package management",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
EXAMPLES:
  Initial setup:
    %(prog)s --install-prerequisites        Install pre-install items (Homebrew, Oh My Zsh, and plugins, etc.)
    
  Generate package list from current system:
    %(prog)s --generate-packages            Scan installed os packages and add to packages.json
    
  Install everything (packages + dotfiles):
    %(prog)s --profile work                 Install work profile packages and create dotfile symlinks
    %(prog)s --profile personal             Install personal profile packages and dotfiles
    
  Install only packages or dotfiles:
    %(prog)s --install-packages --profile minimal    Install only packages from minimal profile
    %(prog)s --install-dotfiles --profile work       Create dotfile symlinks for work profile
    
  Combine profiles:
    %(prog)s --profile work,personal        Install packages from both work and personal profiles
    
  Preview changes:
    %(prog)s --profile work --dry-run       Show what would be installed without making changes
    %(prog)s --check-only                   Check installation status without making changes

PROFILES:
  Profiles are defined in packages.json and contain lists of packages to install.
  Default profiles:
    - minimal: Essential tools only (git, neovim, tmux, alacritty)
    - work: Development environment (adds docker, gh, slack, vscode, etc.)
    - personal: Personal setup (adds spotify, discord, obsidian, etc.)

PRE-INSTALL ITEMS:
  System-level tools that need to be installed before packages:
    - homebrew: Package manager for macOS (required)
    - oh-my-zsh: Zsh framework
    - typewritten: Minimalist Zsh theme
    - vi-mode: Vi mode for Zsh

ENVIRONMENT VARIABLES:
  Required:
    XDG_CONFIG_HOME   Base directory for user-specific configuration files
    HOME              User's home directory
    DOTFILES_DIR      Path to your dotfiles repository
    
  Optional:
    QMK_DIR          Path to QMK firmware directory (for keyboard configs)
    ZSH_CUSTOM       Custom directory for Oh My Zsh (defaults to ~/.oh-my-zsh/custom)

NOTES:
  - Currently only supports macOS
  - Package generation uses 'brew leaves' to track only explicitly installed packages
  - Existing dotfile symlinks will be replaced
  - packages.json is never overwritten when generating; new packages are added
  - Symlinks are configured in the 'config' property of each package
  - Environment variables in symlink paths are automatically substituted
  - All operations are logged to .dotfiles-install.log in the dotfiles directory
"""
    )
    
    # Profile selection
    parser.add_argument(
        "--profile", 
        help="Installation profile(s), comma-separated (default: minimal)", 
        default="minimal",
        metavar="PROFILE[,PROFILE...]"
    )
    
    # Package management
    parser.add_argument(
        "--generate-packages", 
        action="store_true", 
        help="Scan system and add installed brew packages to packages.json"
    )
    parser.add_argument(
        "--install-packages", 
        action="store_true",
        help="Install packages for the selected profile(s)"
    )
    
    # Configuration files
    parser.add_argument(
        "--packages-file", 
        default="packages.json",
        help="Path to packages configuration file (default: packages.json)",
        metavar="FILE"
    )
    
    # Dotfiles management
    parser.add_argument(
        "--install-dotfiles", 
        action="store_true",
        help="Create symlinks for dotfiles configuration (uses profile selection)"
    )
    
    # Special operations
    parser.add_argument(
        "--install-prerequisites",
        action="store_true",
        help="Install pre-install items (Homebrew, Oh My Zsh, etc.)"
    )
    parser.add_argument(
        "--check-only",
        action="store_true",
        help="Check installation status without making changes"
    )
    
    # Modifiers
    parser.add_argument(
        "--dry-run", 
        action="store_true",
        help="Preview changes without making any modifications"
    )
    
    return parser


def process_arguments(args):
    """Process parsed arguments and determine actions to take."""
    if not any([args.generate_packages, args.install_packages, args.install_dotfiles, 
                args.install_prerequisites, args.check_only]):
        args.install_packages = True
        args.install_dotfiles = True
    return args


def execute_command(args):
    """Execute the command based on parsed arguments."""
    env_vars = check_required_variables()
    
    # Load and validate configuration
    config = load_packages_config(args.packages_file)
    validate_config(config)
    check_unused_packages(config)
    
    # Check-only mode
    if args.check_only:
        check_installation_status(config, env_vars)
        return

    # Generate packages from system
    if args.generate_packages:
        config = generate_packages_from_system(config)
        save_packages_config(config, args.packages_file)
    
    # Install pre-install items if requested
    if args.install_prerequisites:
        profiles = args.profile.split(',')
        install_preinstall_for_profiles(config, profiles, env_vars, args.dry_run)
        return
    
    # Install packages
    if args.install_packages:
        profiles = args.profile.split(',')
        
        # Check and install pre-install items for selected profiles first
        if not args.dry_run:
            install_preinstall_for_profiles(config, profiles, env_vars, args.dry_run)
        
        install_packages_for_profile(config, profiles, env_vars, args.dry_run)
    
    # Install dotfiles
    if args.install_dotfiles:
        profiles = args.profile.split(',')
        install_dotfiles_for_profiles(config, profiles, env_vars, args.dry_run)


def main():
    """Main entry point for the installer."""
    parser = create_argument_parser()
    args = process_arguments(parser.parse_args())
    
    log_command_start()
    
    try:
        execute_command(args)
    except KeyboardInterrupt:
        print_status("\nInstallation interrupted by user", LogLevel.WARNING)
        sys.exit(1)
    except Exception as e:
        print_status(f"\nUnexpected error: {e}", LogLevel.ERROR)
        import traceback
        log_to_file(traceback.format_exc(), LogLevel.ERROR)
        sys.exit(1)


if __name__ == "__main__":
    main()