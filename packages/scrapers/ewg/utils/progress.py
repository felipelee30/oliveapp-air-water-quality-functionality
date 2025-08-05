"""Progress tracking utilities for scraping operations."""
import json
import os
from typing import Set, Optional, Dict, Any
from pathlib import Path
import pandas as pd
from rich.progress import Progress, SpinnerColumn, TimeElapsedColumn, MofNCompleteColumn
from rich.console import Console

console = Console()


class ProgressTracker:
    """Track and persist scraping progress."""
    
    def __init__(self, checkpoint_dir: str = "data/bronze/checkpoints"):
        self.checkpoint_dir = Path(checkpoint_dir)
        self.checkpoint_dir.mkdir(parents=True, exist_ok=True)
        
    def save_checkpoint(self, name: str, data: Dict[str, Any]):
        """Save checkpoint data to file."""
        checkpoint_file = self.checkpoint_dir / f"{name}.json"
        with open(checkpoint_file, 'w') as f:
            json.dump(data, f, indent=2)
            
    def load_checkpoint(self, name: str) -> Optional[Dict[str, Any]]:
        """Load checkpoint data if exists."""
        checkpoint_file = self.checkpoint_dir / f"{name}.json"
        if checkpoint_file.exists():
            with open(checkpoint_file, 'r') as f:
                return json.load(f)
        return None
        
    def get_completed_items(self, name: str) -> Set[str]:
        """Get set of completed items from checkpoint."""
        checkpoint = self.load_checkpoint(name)
        if checkpoint:
            return set(checkpoint.get('completed', []))
        return set()
        
    def update_completed(self, name: str, item: str):
        """Add item to completed set in checkpoint."""
        checkpoint = self.load_checkpoint(name) or {'completed': []}
        completed = set(checkpoint.get('completed', []))
        completed.add(item)
        checkpoint['completed'] = list(completed)
        self.save_checkpoint(name, checkpoint)


def create_progress_bar(description: str, total: int) -> Progress:
    """Create a rich progress bar."""
    return Progress(
        SpinnerColumn(),
        *Progress.get_default_columns(),
        TimeElapsedColumn(),
        MofNCompleteColumn(),
        console=console,
        transient=False
    )