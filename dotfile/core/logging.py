"""Logging setup for dotfile manager."""

import sys
from pathlib import Path
from datetime import datetime
from typing import Optional, TextIO


class TeeOutput:
    """Tee output to both a file and original stream."""
    
    def __init__(self, stream: TextIO, log_file: TextIO):
        self.stream = stream
        self.log_file = log_file
        self.encoding = getattr(stream, 'encoding', 'utf-8')
    
    def write(self, data: str) -> int:
        """Write to both streams."""
        self.stream.write(data)
        self.stream.flush()  # Ensure immediate output
        self.log_file.write(data)
        self.log_file.flush()  # Ensure it's written to disk
        return len(data)
    
    def flush(self) -> None:
        """Flush both streams."""
        self.stream.flush()
        self.log_file.flush()
    
    def __getattr__(self, name):
        """Delegate other attributes to the original stream."""
        return getattr(self.stream, name)


class LoggingContext:
    """Context manager for logging stdout/stderr to a file."""
    
    def __init__(self, log_path: Optional[Path] = None):
        """Initialize logging context.
        
        Args:
            log_path: Path to log file (defaults to .dotfiles-install.log)
        """
        if log_path is None:
            log_path = Path.cwd() / ".dotfiles-install.log"
        self.log_path = log_path
        self.log_file = None
        self.original_stdout = None
        self.original_stderr = None
    
    def __enter__(self):
        """Start logging."""
        # Open log file in append mode
        self.log_file = open(self.log_path, 'a', encoding='utf-8')
        
        # Write header
        self.log_file.write("\n" + "="*60 + "\n")
        self.log_file.write(f"Dotfile manager started at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        self.log_file.write(f"Command: {' '.join(sys.argv)}\n")
        self.log_file.write("="*60 + "\n\n")
        self.log_file.flush()
        
        # Save original streams
        self.original_stdout = sys.stdout
        self.original_stderr = sys.stderr
        
        # Replace with tee streams
        sys.stdout = TeeOutput(self.original_stdout, self.log_file)
        sys.stderr = TeeOutput(self.original_stderr, self.log_file)
        
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Stop logging and restore original streams."""
        # Write footer
        if self.log_file and not self.log_file.closed:
            self.log_file.write(f"\nDotfile manager finished at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            if exc_type:
                self.log_file.write(f"Exit with error: {exc_type.__name__}: {exc_val}\n")
            self.log_file.write("="*60 + "\n\n")
        
        # Restore original streams
        if self.original_stdout:
            sys.stdout = self.original_stdout
        if self.original_stderr:
            sys.stderr = self.original_stderr
        
        # Close log file
        if self.log_file:
            self.log_file.close()


def setup_logging(log_path: Optional[Path] = None) -> LoggingContext:
    """Setup logging to capture all output.
    
    Args:
        log_path: Path to log file (defaults to .dotfiles-install.log)
        
    Returns:
        LoggingContext that can be used as a context manager
    """
    return LoggingContext(log_path)