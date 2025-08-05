"""
Step 2: Scrape PWS (Public Water Systems) for each ZIP code.
"""
import asyncio
import pandas as pd
from pathlib import Path
import logging
from typing import List, Dict, Optional
from bs4 import BeautifulSoup
import json
from rich.console import Console
from rich.progress import track
import sys
sys.path.append(str(Path(__file__).parent.parent))

from utils import RetryableSession, ProgressTracker, create_progress_bar, ParallelProcessor

console = Console()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Paths
BRONZE_DIR = Path("data/bronze")
SILVER_DIR = Path("data/silver")
SILVER_DIR.mkdir(parents=True, exist_ok=True)

ZIP_CODES_FILE = BRONZE_DIR / "us_zip_codes.parquet"
PWS_BY_ZIP_FILE = SILVER_DIR / "pws_by_zip.parquet"
PWS_CHECKPOINT = "pws_by_zip"

# EWG URL pattern
EWG_SEARCH_URL = "https://www.ewg.org/tapwater/search-results.php?zip5={zip_code}"


async def parse_pws_from_html(html: str, zip_code: str) -> List[Dict]:
    """Parse PWS information from search results HTML."""
    soup = BeautifulSoup(html, 'lxml')
    pws_list = []
    
    # Look for both featured and regular utility tables
    tables = soup.find_all('table', class_=['featured-utility-table', 'search-results-table'])
    
    for table in tables:
        tbody = table.find('tbody')
        if not tbody:
            continue
            
        for row in tbody.find_all('tr'):
            try:
                cells = row.find_all('td')
                if len(cells) >= 3:
                    # Extract utility name and PWS ID from link
                    link = cells[0].find('a')
                    if link and 'href' in link.attrs:
                        href = link['href']
                        # Extract PWS ID from URL like /tapwater/system.php?pws=NJ0238001
                        if 'pws=' in href:
                            pws_id = href.split('pws=')[-1]
                            utility_name = link.get_text(strip=True)
                            
                            # Remove any icon/star from utility name
                            utility_name = utility_name.replace('⭐', '').strip()
                            
                            location = cells[1].get_text(strip=True)
                            people_served = cells[2].get_text(strip=True)
                            
                            # Clean people served number
                            people_served_clean = people_served.replace(',', '').replace('Population served: ', '')
                            try:
                                people_served_num = int(people_served_clean)
                            except:
                                people_served_num = None
                            
                            pws_info = {
                                'zip_code': zip_code,
                                'pws_id': pws_id,
                                'utility_name': utility_name,
                                'location': location,
                                'people_served': people_served_num,
                                'is_featured': 'featured' in table.get('class', [])
                            }
                            pws_list.append(pws_info)
            except Exception as e:
                logger.error(f"Error parsing row: {e}")
                continue
    
    return pws_list


async def scrape_zip_code(session: RetryableSession, zip_code: str) -> List[Dict]:
    """Scrape PWS data for a single ZIP code."""
    url = EWG_SEARCH_URL.format(zip_code=zip_code)
    
    try:
        html = await session.get(url)
        pws_list = await parse_pws_from_html(html, zip_code)
        return pws_list
    except Exception as e:
        logger.error(f"Error scraping ZIP {zip_code}: {e}")
        return []


async def process_zip_codes_batch(zip_codes: List[str], tracker: ProgressTracker) -> pd.DataFrame:
    """Process a batch of ZIP codes in parallel."""
    processor = ParallelProcessor(max_concurrent=20, rate_limit=10.0)
    all_pws = []
    
    async with RetryableSession() as session:
        with create_progress_bar("Scraping ZIP codes", len(zip_codes)) as progress:
            task = progress.add_task("Processing...", total=len(zip_codes))
            
            async def process_single(zip_code: str) -> List[Dict]:
                result = await scrape_zip_code(session, zip_code)
                progress.advance(task)
                
                # Update checkpoint after each successful scrape
                tracker.update_completed(PWS_CHECKPOINT, zip_code)
                
                return result
            
            results = await processor.process_batch(zip_codes, process_single)
            
            # Flatten results
            for pws_list in results:
                if pws_list:
                    all_pws.extend(pws_list)
    
    return pd.DataFrame(all_pws)


async def main():
    """Main function to scrape PWS data for all ZIP codes."""
    console.print("[bold blue]EWG Water Quality Scraper - Step 2: Scrape PWS by ZIP Code[/bold blue]")
    
    # Check if ZIP codes exist
    if not ZIP_CODES_FILE.exists():
        console.print("[bold red]Error: ZIP codes file not found. Run step 1 first.[/bold red]")
        return
    
    tracker = ProgressTracker()
    
    # Load ZIP codes
    zip_df = pd.read_parquet(ZIP_CODES_FILE)
    all_zip_codes = zip_df['zip_code'].tolist()
    console.print(f"[green]Loaded {len(all_zip_codes):,} ZIP codes[/green]")
    
    # Check for existing progress
    completed_zips = tracker.get_completed_items(PWS_CHECKPOINT)
    remaining_zips = [z for z in all_zip_codes if z not in completed_zips]
    
    if completed_zips:
        console.print(f"[yellow]Resuming from checkpoint. {len(completed_zips):,} already completed.[/yellow]")
    
    console.print(f"[cyan]Processing {len(remaining_zips):,} remaining ZIP codes...[/cyan]")
    
    # Process in batches to save progress periodically
    batch_size = 1000
    all_results = []
    
    # Load existing results if any
    if PWS_BY_ZIP_FILE.exists():
        existing_df = pd.read_parquet(PWS_BY_ZIP_FILE)
        all_results.append(existing_df)
        console.print(f"[green]Loaded {len(existing_df):,} existing PWS records[/green]")
    
    for i in range(0, len(remaining_zips), batch_size):
        batch = remaining_zips[i:i + batch_size]
        console.print(f"\n[cyan]Processing batch {i//batch_size + 1} ({len(batch)} ZIP codes)...[/cyan]")
        
        try:
            batch_df = await process_zip_codes_batch(batch, tracker)
            
            if not batch_df.empty:
                all_results.append(batch_df)
                
                # Save intermediate results
                combined_df = pd.concat(all_results, ignore_index=True)
                combined_df.to_parquet(PWS_BY_ZIP_FILE, index=False)
                console.print(f"[green]Saved {len(combined_df):,} total PWS records[/green]")
        
        except Exception as e:
            console.print(f"[red]Error processing batch: {e}[/red]")
            logger.exception("Batch processing error")
            # Continue with next batch
    
    # Final save and statistics
    if all_results:
        final_df = pd.concat(all_results, ignore_index=True)
        final_df.to_parquet(PWS_BY_ZIP_FILE, index=False)
        
        # Calculate statistics
        stats = {
            'total_pws': len(final_df),
            'unique_pws': final_df['pws_id'].nunique(),
            'zip_codes_with_pws': final_df['zip_code'].nunique(),
            'total_people_served': int(final_df['people_served'].sum()) if 'people_served' in final_df else 0,
            'featured_utilities': int(final_df['is_featured'].sum()) if 'is_featured' in final_df else 0,
        }
        
        stats_file = SILVER_DIR / "pws_stats.json"
        with open(stats_file, 'w') as f:
            json.dump(stats, f, indent=2)
        
        console.print("\n[bold green]✓ Scraping complete![/bold green]")
        console.print(f"Total PWS records: {stats['total_pws']:,}")
        console.print(f"Unique PWS: {stats['unique_pws']:,}")
        console.print(f"ZIP codes with PWS: {stats['zip_codes_with_pws']:,}")
        console.print(f"Total people served: {stats['total_people_served']:,}")
        
        # Update ZIP codes file with coverage info
        zip_df['has_pws'] = zip_df['zip_code'].isin(final_df['zip_code'])
        zip_df['fetched'] = zip_df['zip_code'].isin(completed_zips | set(remaining_zips))
        zip_df.to_parquet(ZIP_CODES_FILE, index=False)
        
    else:
        console.print("[yellow]No PWS data found[/yellow]")


if __name__ == "__main__":
    asyncio.run(main())