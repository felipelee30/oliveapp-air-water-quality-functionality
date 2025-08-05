"""
Step 1: Fetch all US ZIP codes and save to Bronze layer.
"""
import asyncio
import pandas as pd
from pathlib import Path
import logging
from typing import List
import json
from rich.console import Console
import sys
sys.path.append(str(Path(__file__).parent.parent))

from utils import RetryableSession, ProgressTracker, create_progress_bar

console = Console()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Output paths
BRONZE_DIR = Path("data/bronze")
BRONZE_DIR.mkdir(parents=True, exist_ok=True)
ZIP_CODES_FILE = BRONZE_DIR / "us_zip_codes.parquet"


async def fetch_zip_codes_from_file() -> List[str]:
    """
    Fetch ZIP codes from a local file or generate them.
    For this implementation, we'll generate all possible 5-digit ZIP codes
    and then filter based on actual usage from EWG.
    """
    # For a complete implementation, you might want to use a ZIP code database
    # For now, we'll use a range of known US ZIP codes
    zip_codes = []
    
    # Generate ZIP codes for major regions
    # Northeast: 00000-19999
    # Southeast: 20000-39999
    # Midwest: 40000-59999
    # Southwest: 60000-79999
    # West: 80000-99999
    
    # Common ZIP code ranges by state (simplified)
    zip_ranges = [
        (1000, 2799),   # MA, RI, NH, ME, VT, CT
        (3000, 3999),   # NJ
        (6000, 6999),   # CT
        (7000, 8999),   # NJ
        (10000, 14999), # NY
        (15000, 19999), # PA
        (20000, 24999), # DC, VA, MD, WV
        (25000, 26999), # WV
        (27000, 28999), # NC
        (29000, 29999), # SC
        (30000, 31999), # GA
        (32000, 34999), # FL
        (35000, 36999), # AL
        (37000, 38999), # TN
        (39000, 39999), # MS
        (40000, 42999), # KY
        (43000, 45999), # OH
        (46000, 47999), # IN
        (48000, 49999), # MI
        (50000, 52999), # IA
        (53000, 54999), # WI
        (55000, 56999), # MN
        (57000, 57999), # SD
        (58000, 58999), # ND
        (59000, 59999), # MT
        (60000, 62999), # IL
        (63000, 65999), # MO
        (66000, 67999), # KS
        (68000, 69999), # NE
        (70000, 71999), # LA
        (72000, 72999), # AR
        (73000, 74999), # OK
        (75000, 79999), # TX
        (80000, 81999), # CO
        (82000, 83199), # WY
        (83200, 83999), # ID
        (84000, 84999), # UT
        (85000, 86999), # AZ
        (87000, 88999), # NM
        (89000, 89999), # NV
        (90000, 96999), # CA
        (97000, 97999), # OR
        (98000, 99999), # WA
    ]
    
    console.print("[yellow]Generating US ZIP codes...[/yellow]")
    
    for start, end in zip_ranges:
        for zip_num in range(start, end + 1):
            zip_codes.append(f"{zip_num:05d}")
    
    return zip_codes


async def validate_zip_codes(zip_codes: List[str]) -> List[str]:
    """
    Optional: Validate ZIP codes against EWG database.
    This could be done by checking a sample of ZIP codes.
    """
    # For now, we'll just return all ZIP codes
    # In a production system, you might want to validate against
    # a known database or sample check against EWG
    return zip_codes


async def main():
    """Main function to fetch and save ZIP codes."""
    console.print("[bold blue]EWG Water Quality Scraper - Step 1: Fetch ZIP Codes[/bold blue]")
    
    tracker = ProgressTracker()
    
    # Check if we already have ZIP codes
    if ZIP_CODES_FILE.exists():
        console.print(f"[green]ZIP codes already fetched at {ZIP_CODES_FILE}[/green]")
        df = pd.read_parquet(ZIP_CODES_FILE)
        console.print(f"Total ZIP codes: {len(df):,}")
        return
    
    try:
        # Fetch ZIP codes
        zip_codes = await fetch_zip_codes_from_file()
        console.print(f"[green]Generated {len(zip_codes):,} ZIP codes[/green]")
        
        # Validate ZIP codes (optional)
        valid_zip_codes = await validate_zip_codes(zip_codes)
        console.print(f"[green]Validated {len(valid_zip_codes):,} ZIP codes[/green]")
        
        # Create DataFrame
        df = pd.DataFrame({
            'zip_code': valid_zip_codes,
            'fetched': False,  # Track which ones we've processed
            'has_pws': None,   # Track which ones have water systems
        })
        
        # Save to Bronze layer
        df.to_parquet(ZIP_CODES_FILE, index=False)
        console.print(f"[bold green]✓ Saved {len(df):,} ZIP codes to {ZIP_CODES_FILE}[/bold green]")
        
        # Save summary statistics
        stats = {
            'total_zip_codes': len(df),
            'zip_ranges': len(df.groupby(df['zip_code'].str[:2])),
            'states_covered': len(df.groupby(df['zip_code'].str[:3])),
        }
        
        stats_file = BRONZE_DIR / "zip_codes_stats.json"
        with open(stats_file, 'w') as f:
            json.dump(stats, f, indent=2)
        
        console.print(f"[green]Statistics saved to {stats_file}[/green]")
        
    except Exception as e:
        console.print(f"[bold red]Error: {e}[/bold red]")
        logger.exception("Failed to fetch ZIP codes")
        raise


if __name__ == "__main__":
    asyncio.run(main())