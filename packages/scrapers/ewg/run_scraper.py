#!/usr/bin/env python3
"""
Main runner for EWG Tap Water Database Scraper.
Executes all steps in sequence with proper error handling.
"""
import asyncio
import subprocess
import sys
from pathlib import Path
from rich.console import Console
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn
import time

console = Console()

SCRIPTS = [
    ("01_fetch_zip_codes.py", "Fetching US ZIP codes"),
    ("02_scrape_pws_by_zip.py", "Scraping PWS by ZIP code"),
    ("03_scrape_pws_details.py", "Scraping detailed water quality data"),
    ("04_consolidate_data.py", "Consolidating final datasets")
]


def run_script(script_path: Path) -> tuple[bool, str]:
    """Run a Python script and return success status and output."""
    try:
        result = subprocess.run(
            [sys.executable, str(script_path)],
            capture_output=True,
            text=True,
            check=True
        )
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        return False, f"Error: {e.stderr}"


async def main():
    """Run all scraper steps in sequence."""
    console.print(Panel.fit(
        "[bold blue]EWG Tap Water Database Scraper[/bold blue]\n"
        "Following Medallion Architecture\n"
        "Bronze → Silver → Gold",
        title="Water Quality Data Pipeline"
    ))
    
    scripts_dir = Path(__file__).parent / "scripts"
    
    start_time = time.time()
    
    for script_name, description in SCRIPTS:
        script_path = scripts_dir / script_name
        
        console.print(f"\n[cyan]Step {script_name[:2]}:[/cyan] {description}")
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console,
            transient=True
        ) as progress:
            task = progress.add_task(f"Running {script_name}...", total=None)
            
            success, output = await asyncio.get_event_loop().run_in_executor(
                None, run_script, script_path
            )
            
            progress.update(task, completed=True)
        
        if success:
            console.print(f"[green]✓ {script_name} completed successfully[/green]")
            # Print last few lines of output
            output_lines = output.strip().split('\n')
            if len(output_lines) > 5:
                console.print("[dim]" + '\n'.join(output_lines[-5:]) + "[/dim]")
        else:
            console.print(f"[red]✗ {script_name} failed[/red]")
            console.print(output)
            
            # Ask if user wants to continue
            if script_name != SCRIPTS[-1][0]:
                response = console.input("\n[yellow]Continue with next step? (y/n): [/yellow]")
                if response.lower() != 'y':
                    console.print("[red]Scraping aborted by user[/red]")
                    return
    
    elapsed_time = time.time() - start_time
    console.print(f"\n[bold green]Pipeline completed in {elapsed_time/60:.1f} minutes![/bold green]")
    
    # Display final results location
    gold_dir = Path("data/gold")
    if gold_dir.exists():
        console.print("\n[bold]Output files:[/bold]")
        for file in gold_dir.glob("*.parquet"):
            size_mb = file.stat().st_size / 1024 / 1024
            console.print(f"  • {file.name} ({size_mb:.1f} MB)")
        
        report_file = gold_dir / "final_report.json"
        if report_file.exists():
            console.print(f"\n[green]Final report: {report_file}[/green]")


if __name__ == "__main__":
    # Ensure we're in the correct directory
    script_dir = Path(__file__).parent
    import os
    os.chdir(script_dir)
    
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        console.print("\n[red]Scraping interrupted by user[/red]")
    except Exception as e:
        console.print(f"\n[bold red]Unexpected error: {e}[/bold red]")
        raise