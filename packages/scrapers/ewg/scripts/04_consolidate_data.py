"""
Step 4: Consolidate and process final data into Gold layer.
"""
import pandas as pd
from pathlib import Path
import json
from rich.console import Console
from rich.table import Table
import sys
sys.path.append(str(Path(__file__).parent.parent))

console = Console()

# Paths
SILVER_DIR = Path("data/silver")
GOLD_DIR = Path("data/gold")

PWS_BY_ZIP_FILE = SILVER_DIR / "pws_by_zip.parquet"
PWS_DETAILS_FILE = GOLD_DIR / "pws_water_quality.parquet"
FINAL_DATASET_FILE = GOLD_DIR / "ewg_water_quality_complete.parquet"
CONTAMINANTS_REFERENCE_FILE = GOLD_DIR / "contaminants_reference.parquet"
ZIP_CODE_SUMMARY_FILE = GOLD_DIR / "zip_code_water_summary.parquet"


def create_contaminants_reference(details_df: pd.DataFrame) -> pd.DataFrame:
    """Create a reference table of all contaminants with their properties."""
    contaminants = []
    
    # Get unique contaminants with their properties
    contam_df = details_df[details_df['contaminant_name'].notna()].copy()
    
    for contam_name in contam_df['contaminant_name'].unique():
        contam_data = contam_df[contam_df['contaminant_name'] == contam_name].iloc[0]
        
        # Get all unique pollution sources and filter options
        all_sources = set()
        all_filters = set()
        
        contam_rows = contam_df[contam_df['contaminant_name'] == contam_name]
        for _, row in contam_rows.iterrows():
            if pd.notna(row['pollution_sources']):
                all_sources.update(row['pollution_sources'].split('|'))
            if pd.notna(row['filter_options']):
                all_filters.update(row['filter_options'].split('|'))
        
        contaminants.append({
            'contaminant_name': contam_name,
            'potential_effects': contam_data['potential_effect'],
            'pollution_sources': list(all_sources),
            'filter_options': list(all_filters),
            'systems_affected': len(contam_rows['pws_id'].unique()),
            'people_affected': contam_rows.groupby('pws_id')['people_served'].first().sum()
        })
    
    return pd.DataFrame(contaminants)


def create_zip_code_summary(pws_zip_df: pd.DataFrame, details_df: pd.DataFrame) -> pd.DataFrame:
    """Create summary statistics by ZIP code."""
    # Merge PWS and details data
    pws_summary = details_df.groupby('pws_id').agg({
        'compliance_status': 'first',
        'people_served': 'first',
        'source_water': 'first',
        'num_contaminants_exceed': 'first',
        'num_contaminants_other': 'first'
    }).reset_index()
    
    merged = pws_zip_df.merge(pws_summary, on='pws_id', how='left')
    
    # Aggregate by ZIP code
    zip_summary = merged.groupby('zip_code').agg({
        'pws_id': 'count',
        'people_served': 'sum',
        'compliance_status': lambda x: (x == True).sum(),
        'num_contaminants_exceed': 'mean',
        'num_contaminants_other': 'mean'
    }).reset_index()
    
    zip_summary.columns = [
        'zip_code', 
        'num_pws', 
        'total_people_served',
        'compliant_systems',
        'avg_contaminants_exceed',
        'avg_contaminants_other'
    ]
    
    zip_summary['compliance_rate'] = zip_summary['compliant_systems'] / zip_summary['num_pws']
    
    return zip_summary


def main():
    """Consolidate all data into final Gold layer datasets."""
    console.print("[bold blue]EWG Water Quality Scraper - Step 4: Consolidate Data[/bold blue]")
    
    # Check required files exist
    if not PWS_BY_ZIP_FILE.exists() or not PWS_DETAILS_FILE.exists():
        console.print("[bold red]Error: Required data files not found. Run previous steps first.[/bold red]")
        return
    
    # Load data
    console.print("[cyan]Loading data files...[/cyan]")
    pws_zip_df = pd.read_parquet(PWS_BY_ZIP_FILE)
    details_df = pd.read_parquet(PWS_DETAILS_FILE)
    
    console.print(f"Loaded {len(pws_zip_df):,} PWS-ZIP mappings")
    console.print(f"Loaded {len(details_df):,} water quality records")
    
    # Create complete dataset with all information
    console.print("\n[cyan]Creating complete dataset...[/cyan]")
    
    # Merge PWS info with details
    complete_df = pws_zip_df.merge(
        details_df,
        on='pws_id',
        how='inner'
    )
    
    # Save complete dataset
    complete_df.to_parquet(FINAL_DATASET_FILE, index=False)
    console.print(f"[green]✓ Saved complete dataset: {len(complete_df):,} records[/green]")
    
    # Create contaminants reference
    console.print("\n[cyan]Creating contaminants reference...[/cyan]")
    contaminants_ref = create_contaminants_reference(details_df)
    contaminants_ref.to_parquet(CONTAMINANTS_REFERENCE_FILE, index=False)
    console.print(f"[green]✓ Saved contaminants reference: {len(contaminants_ref):,} contaminants[/green]")
    
    # Create ZIP code summary
    console.print("\n[cyan]Creating ZIP code summary...[/cyan]")
    zip_summary = create_zip_code_summary(pws_zip_df, details_df)
    zip_summary.to_parquet(ZIP_CODE_SUMMARY_FILE, index=False)
    console.print(f"[green]✓ Saved ZIP code summary: {len(zip_summary):,} ZIP codes[/green]")
    
    # Display summary statistics
    console.print("\n[bold green]Final Dataset Statistics:[/bold green]")
    
    # Create summary table
    table = Table(title="Water Quality Summary")
    table.add_column("Metric", style="cyan")
    table.add_column("Value", style="green", justify="right")
    
    # Calculate metrics
    total_pws = complete_df['pws_id'].nunique()
    total_people = complete_df.groupby('pws_id')['people_served'].first().sum()
    total_zip_codes = complete_df['zip_code'].nunique()
    compliance_rate = (complete_df[complete_df['compliance_status'] == True]['pws_id'].nunique() / total_pws * 100)
    
    # Top contaminants
    top_contaminants = contaminants_ref.nlargest(5, 'systems_affected')[['contaminant_name', 'systems_affected']]
    
    table.add_row("Total Water Systems", f"{total_pws:,}")
    table.add_row("Total People Served", f"{int(total_people):,}")
    table.add_row("ZIP Codes Covered", f"{total_zip_codes:,}")
    table.add_row("Compliance Rate", f"{compliance_rate:.1f}%")
    table.add_row("Unique Contaminants", f"{len(contaminants_ref):,}")
    
    console.print(table)
    
    # Top contaminants table
    console.print("\n[bold]Top 5 Most Common Contaminants:[/bold]")
    contam_table = Table()
    contam_table.add_column("Contaminant", style="yellow")
    contam_table.add_column("Systems Affected", justify="right")
    contam_table.add_column("People Affected", justify="right")
    
    for _, row in contaminants_ref.nlargest(5, 'systems_affected').iterrows():
        contam_table.add_row(
            row['contaminant_name'],
            f"{row['systems_affected']:,}",
            f"{int(row['people_affected']):,}"
        )
    
    console.print(contam_table)
    
    # Save final report
    report = {
        'total_water_systems': int(total_pws),
        'total_people_served': int(total_people),
        'total_zip_codes': int(total_zip_codes),
        'compliance_rate': float(compliance_rate),
        'unique_contaminants': len(contaminants_ref),
        'total_records': len(complete_df),
        'top_contaminants': top_contaminants.to_dict('records'),
        'data_files': {
            'complete_dataset': str(FINAL_DATASET_FILE),
            'contaminants_reference': str(CONTAMINANTS_REFERENCE_FILE),
            'zip_code_summary': str(ZIP_CODE_SUMMARY_FILE)
        }
    }
    
    report_file = GOLD_DIR / "final_report.json"
    with open(report_file, 'w') as f:
        json.dump(report, f, indent=2)
    
    console.print(f"\n[bold green]✓ All data consolidated successfully![/bold green]")
    console.print(f"Final report saved to: {report_file}")


if __name__ == "__main__":
    main()