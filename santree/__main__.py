#!/usr/bin/env python3
"""Entry point for running santree as a module."""

import sys
from .cli import main

if __name__ == "__main__":
    sys.exit(main())
