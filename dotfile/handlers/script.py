"""Script handler for running shell commands."""

import subprocess
import os
from typing import Dict, Any

from ..core.handler import Status, CheckResult


class ScriptHandler:
    """Handler for running shell scripts/commands."""
    
    def _run_command(self, command: str, config: Dict[str, Any]) -> subprocess.CompletedProcess:
        """Run a command with the given configuration."""
        shell = config.get("shell", "/bin/bash")
        env = os.environ.copy()
        if "env" in config:
            env.update(config["env"])
        
        return subprocess.run(
            command,
            shell=True,
            executable=shell,
            capture_output=True,
            text=True,
            env=env,
            cwd=config.get("working_dir")
        )
    
    def check(self, config: Dict[str, Any]) -> CheckResult:
        """Check if script needs to be run."""
        name = config.get("name", config.get("description", "Script"))
        check_cmd = config.get("check")
        
        if not check_cmd:
            return CheckResult(
                status=Status.NOT_INSTALLED,
                message=f"{name} has no check command"
            )
        
        try:
            result = self._run_command(check_cmd, config)
            
            if result.returncode == 0:
                return CheckResult(
                    status=Status.INSTALLED,
                    message=f"{name} check passed"
                )
            else:
                return CheckResult(
                    status=Status.NOT_INSTALLED,
                    message=f"{name} check failed"
                )
                
        except Exception as e:
            return CheckResult(
                status=Status.ERROR,
                message=f"Error checking {name}: {e}"
            )
    
    def install(self, config: Dict[str, Any], dry_run: bool = False) -> bool:
        """Run the script/command."""
        name = config.get("name", config.get("description", "Script"))
        command = config.get("command") or config.get("run") or config.get("install")
        
        if not command:
            print(f"✗ No command specified for {name}")
            return False
        
        if dry_run:
            cmd_preview = command[:50] + "..." if len(command) > 50 else command
            print(f"Would run: {cmd_preview}")
            return True
        
        try:
            print(f"→ Running {name}...")
            
            # Show command preview
            if len(command) <= 80:
                print(f"  {command}")
            else:
                print(f"  {command[:77]}...")
            
            result = self._run_command(command, config)
            
            # Show output if there is any
            if result.stdout and result.stdout.strip():
                lines = result.stdout.strip().split('\n')
                for line in lines[:5]:  # Show first 5 lines
                    print(f"  {line}")
                if len(lines) > 5:
                    print("  ...")
            
            if result.returncode == 0:
                print(f"✓ Successfully ran {name}")
                # Run post_install if specified
                if "post_install" in config:
                    print("  → Running post-install...")
                    post_result = self._run_command(config["post_install"], config)
                    if post_result.returncode != 0:
                        print("  ⚠️  Post-install failed")
                return True
            else:
                error_msg = result.stderr.strip() if result.stderr else f"Exit code: {result.returncode}"
                print(f"✗ Command failed: {error_msg}")
                return False
                
        except Exception as e:
            print(f"✗ Error running command: {e}")
            return False
    
    def uninstall(self, config: Dict[str, Any], dry_run: bool = False) -> bool:
        """Scripts cannot be uninstalled."""
        name = config.get("name", config.get("description", "Script"))
        print(f"⚠️  Cannot uninstall script: {name}")
        return True  # Return True so it doesn't block other uninstalls