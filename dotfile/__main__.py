#!/usr/bin/env python3
"""Main entry point for dotfile manager when run as a module."""

import sys
from pathlib import Path

# Add parent directory to path so imports work
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotfile.cli import main

if __name__ == "__main__":
    sys.exit(main())