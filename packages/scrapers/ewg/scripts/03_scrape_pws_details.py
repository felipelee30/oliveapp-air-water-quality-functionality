"""
Step 3: Scrape detailed water quality data for each PWS.
"""
import asyncio
import pandas as pd
from pathlib import Path
import logging
from typing import List, Dict, Optional, Tuple
from bs4 import BeautifulSoup
import json
import re
from rich.console import Console
import sys
sys.path.append(str(Path(__file__).parent.parent))

from utils import RetryableSession, ProgressTracker, create_progress_bar, ParallelProcessor

console = Console()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Paths
SILVER_DIR = Path("data/silver")
GOLD_DIR = Path("data/gold")
GOLD_DIR.mkdir(parents=True, exist_ok=True)

PWS_BY_ZIP_FILE = SILVER_DIR / "pws_by_zip.parquet"
PWS_DETAILS_FILE = GOLD_DIR / "pws_water_quality.parquet"
PWS_DETAILS_CHECKPOINT = "pws_details"

# EWG URL pattern
EWG_PWS_URL = "https://www.ewg.org/tapwater/system.php?pws={pws_id}"


def parse_contaminant_info(contam_section) -> Dict:
    """Parse individual contaminant information."""
    try:
        # Extract contaminant name
        name_elem = contam_section.find('h3')
        name = name_elem.get_text(strip=True) if name_elem else "Unknown"
        
        # Extract potential effect
        effect_elem = contam_section.find('p', class_='potentital-effect')
        effect = effect_elem.get_text(strip=True).replace('Potential Effect: ', '') if effect_elem else ""
        
        # Extract measurements
        utility_elem = contam_section.find('p', class_='this-utility-text')
        utility_level = utility_elem.get_text(strip=True).replace('This Utility: ', '') if utility_elem else ""
        
        legal_elem = contam_section.find('p', class_='legal-limit-text')
        legal_limit = legal_elem.get_text(strip=True).replace('Legal Limit: ', '') if legal_elem else ""
        
        # Extract times above guideline
        times_elem = contam_section.find('p', class_='detect-times-greater-than')
        times_above = times_elem.get_text(strip=True).replace('x', '') if times_elem else ""
        
        # Extract health guideline
        guideline_elem = contam_section.find('p', class_='health-guideline-text')
        health_guideline = guideline_elem.get_text(strip=True).replace("EWG's Health Guideline: ", '') if guideline_elem else ""
        
        # Extract pollution sources and filter options from modal
        modal = contam_section.find('div', class_='contam-modal-wrapper')
        pollution_sources = []
        filter_options = []
        
        if modal:
            # Find pollution sources
            pollution_wrapper = modal.find('div', class_='pollution-sources-modal-wrapper')
            if pollution_wrapper:
                for source in pollution_wrapper.find_all('p'):
                    text = source.get_text(strip=True)
                    if text and text not in ['Pollution Sources', 'Filtering Options']:
                        if source.parent.parent.previous_sibling and 'Pollution Sources' in source.parent.parent.previous_sibling.get_text():
                            pollution_sources.append(text)
                        elif source.parent.parent.previous_sibling and 'Filtering Options' in source.parent.parent.previous_sibling.get_text():
                            filter_options.append(text)
        
        return {
            'name': name,
            'potential_effect': effect,
            'utility_level': utility_level,
            'legal_limit': legal_limit,
            'times_above_guideline': times_above,
            'health_guideline': health_guideline,
            'pollution_sources': pollution_sources,
            'filter_options': filter_options
        }
    
    except Exception as e:
        logger.error(f"Error parsing contaminant: {e}")
        return None


async def parse_pws_details(html: str, pws_id: str) -> Dict:
    """Parse detailed PWS information from HTML."""
    soup = BeautifulSoup(html, 'lxml')
    
    details = {
        'pws_id': pws_id,
        'location': None,
        'source_water': None,
        'people_served': None,
        'compliance_status': None,
        'contaminants_exceed_guidelines': [],
        'contaminants_other_detected': [],
        'last_updated': None
    }
    
    try:
        # Extract location
        location_section = soup.find('section', class_='details-hero-sub-content')
        if location_section:
            location_h4 = location_section.find('h4', string=re.compile('location', re.I))
            if location_h4:
                location_h2 = location_h4.find_next_sibling('h2')
                if location_h2:
                    details['location'] = location_h2.get_text(strip=True)
        
        # Extract source water
        source_sections = soup.find_all('section', class_='details-hero-sub-content')
        for section in source_sections:
            h4 = section.find('h4', string=re.compile('source', re.I))
            if h4:
                h2 = h4.find_next_sibling('h2')
                if h2:
                    details['source_water'] = h2.get_text(strip=True)
                    break
        
        # Extract people served
        for section in source_sections:
            h4 = section.find('h4', string=re.compile('served', re.I))
            if h4:
                h2 = h4.find_next_sibling('h2')
                if h2:
                    served_text = h2.get_text(strip=True).replace(',', '')
                    try:
                        details['people_served'] = int(served_text)
                    except:
                        pass
                    break
        
        # Extract compliance status
        compliance_text = soup.find(string=re.compile('compliance with federal health-based', re.I))
        if compliance_text:
            details['compliance_status'] = True
        else:
            # Check for non-compliance text
            non_compliance = soup.find(string=re.compile('does not meet.*federal', re.I))
            if non_compliance:
                details['compliance_status'] = False
        
        # Extract contaminants that exceed guidelines
        exceed_section = soup.find('div', id='contams_above_hbl')
        if exceed_section:
            contam_items = exceed_section.find_all('div', class_='contaminant-grid-item')
            for item in contam_items:
                contam_data = item.find('section', class_='contaminant-data')
                if contam_data:
                    contam_info = parse_contaminant_info(contam_data)
                    if contam_info:
                        details['contaminants_exceed_guidelines'].append(contam_info)
        
        # Extract other detected contaminants
        other_section = soup.find('div', id='contams_other_detected')
        if other_section:
            contam_items = other_section.find_all('div', class_='contaminant-grid-item')
            for item in contam_items:
                contam_data = item.find('section', class_='contaminant-data')
                if contam_data:
                    contam_info = parse_contaminant_info(contam_data)
                    if contam_info:
                        details['contaminants_other_detected'].append(contam_info)
        
        # Try to find last updated date
        date_pattern = re.compile(r'\b(20\d{2})\b')
        date_matches = date_pattern.findall(str(soup))
        if date_matches:
            details['last_updated'] = max(date_matches)
    
    except Exception as e:
        logger.error(f"Error parsing PWS details for {pws_id}: {e}")
    
    return details


async def scrape_pws_details(session: RetryableSession, pws_id: str) -> Dict:
    """Scrape detailed data for a single PWS."""
    url = EWG_PWS_URL.format(pws_id=pws_id)
    
    try:
        html = await session.get(url)
        details = await parse_pws_details(html, pws_id)
        return details
    except Exception as e:
        logger.error(f"Error scraping PWS {pws_id}: {e}")
        return {'pws_id': pws_id, 'error': str(e)}


async def process_pws_batch(pws_ids: List[str], tracker: ProgressTracker) -> List[Dict]:
    """Process a batch of PWS IDs in parallel."""
    processor = ParallelProcessor(max_concurrent=10, rate_limit=5.0)
    
    async with RetryableSession() as session:
        with create_progress_bar("Scraping PWS details", len(pws_ids)) as progress:
            task = progress.add_task("Processing...", total=len(pws_ids))
            
            async def process_single(pws_id: str) -> Dict:
                result = await scrape_pws_details(session, pws_id)
                progress.advance(task)
                
                # Update checkpoint
                tracker.update_completed(PWS_DETAILS_CHECKPOINT, pws_id)
                
                return result
            
            results = await processor.process_batch(pws_ids, process_single)
    
    return results


def flatten_pws_data(pws_details: List[Dict]) -> pd.DataFrame:
    """Flatten PWS data for saving to parquet."""
    flattened_data = []
    
    for pws in pws_details:
        if 'error' in pws:
            continue
            
        base_info = {
            'pws_id': pws['pws_id'],
            'location': pws['location'],
            'source_water': pws['source_water'],
            'people_served': pws['people_served'],
            'compliance_status': pws['compliance_status'],
            'last_updated': pws['last_updated'],
            'num_contaminants_exceed': len(pws['contaminants_exceed_guidelines']),
            'num_contaminants_other': len(pws['contaminants_other_detected'])
        }
        
        # Create a row for each contaminant
        all_contaminants = []
        
        for contam in pws['contaminants_exceed_guidelines']:
            contam_row = base_info.copy()
            contam_row.update({
                'exceeds_guidelines': True,
                'contaminant_name': contam['name'],
                'potential_effect': contam['potential_effect'],
                'utility_level': contam['utility_level'],
                'legal_limit': contam['legal_limit'],
                'times_above_guideline': contam['times_above_guideline'],
                'health_guideline': contam['health_guideline'],
                'pollution_sources': '|'.join(contam['pollution_sources']),
                'filter_options': '|'.join(contam['filter_options'])
            })
            all_contaminants.append(contam_row)
        
        for contam in pws['contaminants_other_detected']:
            contam_row = base_info.copy()
            contam_row.update({
                'exceeds_guidelines': False,
                'contaminant_name': contam['name'],
                'potential_effect': contam['potential_effect'],
                'utility_level': contam['utility_level'],
                'legal_limit': contam['legal_limit'],
                'times_above_guideline': contam['times_above_guideline'],
                'health_guideline': contam['health_guideline'],
                'pollution_sources': '|'.join(contam['pollution_sources']),
                'filter_options': '|'.join(contam['filter_options'])
            })
            all_contaminants.append(contam_row)
        
        # If no contaminants, still add base info
        if not all_contaminants:
            all_contaminants.append(base_info)
        
        flattened_data.extend(all_contaminants)
    
    return pd.DataFrame(flattened_data)


async def main():
    """Main function to scrape detailed PWS data."""
    console.print("[bold blue]EWG Water Quality Scraper - Step 3: Scrape PWS Details[/bold blue]")
    
    # Check if PWS list exists
    if not PWS_BY_ZIP_FILE.exists():
        console.print("[bold red]Error: PWS by ZIP file not found. Run step 2 first.[/bold red]")
        return
    
    tracker = ProgressTracker()
    
    # Load unique PWS IDs
    pws_df = pd.read_parquet(PWS_BY_ZIP_FILE)
    unique_pws_ids = pws_df['pws_id'].unique().tolist()
    console.print(f"[green]Found {len(unique_pws_ids):,} unique PWS to process[/green]")
    
    # Check for existing progress
    completed_pws = tracker.get_completed_items(PWS_DETAILS_CHECKPOINT)
    remaining_pws = [p for p in unique_pws_ids if p not in completed_pws]
    
    if completed_pws:
        console.print(f"[yellow]Resuming from checkpoint. {len(completed_pws):,} already completed.[/yellow]")
    
    console.print(f"[cyan]Processing {len(remaining_pws):,} remaining PWS...[/cyan]")
    
    # Process in batches
    batch_size = 100
    all_results = []
    
    # Load existing results if any
    if PWS_DETAILS_FILE.exists():
        existing_df = pd.read_parquet(PWS_DETAILS_FILE)
        console.print(f"[green]Loaded {len(existing_df):,} existing records[/green]")
    
    for i in range(0, len(remaining_pws), batch_size):
        batch = remaining_pws[i:i + batch_size]
        console.print(f"\n[cyan]Processing batch {i//batch_size + 1} ({len(batch)} PWS)...[/cyan]")
        
        try:
            batch_results = await process_pws_batch(batch, tracker)
            
            if batch_results:
                all_results.extend(batch_results)
                
                # Save intermediate results
                if all_results:
                    flattened_df = flatten_pws_data(all_results)
                    
                    # Combine with existing data if any
                    if PWS_DETAILS_FILE.exists():
                        existing_df = pd.read_parquet(PWS_DETAILS_FILE)
                        # Remove duplicates based on pws_id from existing data
                        existing_df = existing_df[~existing_df['pws_id'].isin(flattened_df['pws_id'].unique())]
                        flattened_df = pd.concat([existing_df, flattened_df], ignore_index=True)
                    
                    flattened_df.to_parquet(PWS_DETAILS_FILE, index=False)
                    console.print(f"[green]Saved {len(flattened_df):,} total records[/green]")
        
        except Exception as e:
            console.print(f"[red]Error processing batch: {e}[/red]")
            logger.exception("Batch processing error")
    
    # Final statistics
    if PWS_DETAILS_FILE.exists():
        final_df = pd.read_parquet(PWS_DETAILS_FILE)
        
        # Calculate statistics
        stats = {
            'total_pws': final_df['pws_id'].nunique(),
            'total_records': len(final_df),
            'pws_in_compliance': int(final_df[final_df['compliance_status'] == True]['pws_id'].nunique()),
            'pws_not_in_compliance': int(final_df[final_df['compliance_status'] == False]['pws_id'].nunique()),
            'total_people_served': int(final_df.groupby('pws_id')['people_served'].first().sum()),
            'unique_contaminants': final_df['contaminant_name'].nunique(),
            'contaminants_exceeding': final_df[final_df['exceeds_guidelines'] == True]['contaminant_name'].nunique(),
            'surface_water_systems': final_df[final_df['source_water'] == 'Surface water']['pws_id'].nunique(),
            'groundwater_systems': final_df[final_df['source_water'] == 'Groundwater']['pws_id'].nunique(),
        }
        
        # Save statistics
        stats_file = GOLD_DIR / "water_quality_stats.json"
        with open(stats_file, 'w') as f:
            json.dump(stats, f, indent=2)
        
        console.print("\n[bold green]✓ Scraping complete![/bold green]")
        console.print(f"Total PWS processed: {stats['total_pws']:,}")
        console.print(f"Total records: {stats['total_records']:,}")
        console.print(f"PWS in compliance: {stats['pws_in_compliance']:,}")
        console.print(f"PWS not in compliance: {stats['pws_not_in_compliance']:,}")
        console.print(f"Total people served: {stats['total_people_served']:,}")
        console.print(f"Unique contaminants found: {stats['unique_contaminants']:,}")
        
        # Create summary report
        summary_df = final_df.groupby('pws_id').agg({
            'location': 'first',
            'source_water': 'first',
            'people_served': 'first',
            'compliance_status': 'first',
            'num_contaminants_exceed': 'first',
            'num_contaminants_other': 'first'
        }).reset_index()
        
        summary_file = GOLD_DIR / "pws_summary.parquet"
        summary_df.to_parquet(summary_file, index=False)
        console.print(f"\n[green]Summary saved to {summary_file}[/green]")


if __name__ == "__main__":
    asyncio.run(main())