# EWG Tap Water Database Scraper

A comprehensive web scraper for the Environmental Working Group's (EWG) Tap Water Database, built following the Medallion Architecture for data engineering.

## Features

- 🚀 **Parallel Processing**: Efficiently scrapes multiple ZIP codes and PWS simultaneously
- 🔄 **Automatic Retry**: Exponential backoff for failed requests
- 📊 **Progress Tracking**: Real-time progress bars and checkpoint system
- 💾 **Incremental Updates**: Resume from last checkpoint if interrupted
- 📁 **Medallion Architecture**: Bronze → Silver → Gold data layers
- 🗜️ **Parquet Storage**: Efficient columnar storage format

## Architecture

### Data Layers

1. **Bronze Layer** (`data/bronze/`)
   - Raw US ZIP codes data
   - Checkpoint files for resumability

2. **Silver Layer** (`data/silver/`)
   - Parsed PWS (Public Water System) data by ZIP code
   - Cleaned and structured data

3. **Gold Layer** (`data/gold/`)
   - Final consolidated water quality dataset
   - Contaminants reference table
   - ZIP code summaries
   - Statistical reports

### Data Schema

The final dataset includes:

- **PWS Information**
  - `pws_id`: Unique PWS identifier
  - `utility_name`: Water utility name
  - `location`: City and state
  - `source_water`: Water source type (Surface/Groundwater)
  - `people_served`: Population served
  - `compliance_status`: Federal compliance status

- **Contaminant Data**
  - `contaminant_name`: Chemical name
  - `potential_effect`: Health effects
  - `utility_level`: Detected level
  - `legal_limit`: Federal legal limit
  - `health_guideline`: EWG health guideline
  - `times_above_guideline`: Exceedance ratio
  - `pollution_sources`: Sources of contamination
  - `filter_options`: Recommended filters

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage

### Run Complete Pipeline

Execute all steps sequentially:

```bash
python run_scraper.py
```

### Run Individual Steps

You can also run steps individually:

```bash
# Step 1: Fetch ZIP codes
python scripts/01_fetch_zip_codes.py

# Step 2: Scrape PWS by ZIP
python scripts/02_scrape_pws_by_zip.py

# Step 3: Scrape PWS details
python scripts/03_scrape_pws_details.py

# Step 4: Consolidate data
python scripts/04_consolidate_data.py
```

## Output Files

### Gold Layer Outputs

1. **`ewg_water_quality_complete.parquet`**
   - Complete dataset with all water quality information
   - One row per contaminant per PWS

2. **`contaminants_reference.parquet`**
   - Reference table of all contaminants
   - Includes pollution sources and filter recommendations

3. **`zip_code_water_summary.parquet`**
   - Summary statistics by ZIP code
   - Compliance rates and average contaminant counts

4. **`pws_summary.parquet`**
   - Summary of each PWS without contaminant details

5. **`final_report.json`**
   - Overall statistics and summary metrics

## Configuration

### Rate Limiting

The scraper implements polite rate limiting:
- ZIP code scraping: 10 requests/second, 20 concurrent
- PWS detail scraping: 5 requests/second, 10 concurrent

Adjust in the respective scripts if needed.

### Checkpointing

Progress is automatically saved to allow resuming:
- ZIP codes: `data/bronze/checkpoints/pws_by_zip.json`
- PWS details: `data/bronze/checkpoints/pws_details.json`

## Performance

Expected runtime (varies by network):
- Step 1: < 1 minute
- Step 2: 2-4 hours (for ~40,000 ZIP codes)
- Step 3: 1-2 hours (for ~50,000 PWS)
- Step 4: < 1 minute

Total: 3-6 hours for complete US dataset

## Troubleshooting

### Memory Issues
If processing large datasets causes memory issues:
1. Reduce batch sizes in scripts
2. Process data in smaller chunks

### Network Errors
The scraper will automatically retry failed requests up to 5 times with exponential backoff.

### Resuming After Interruption
Simply run the script again - it will automatically resume from the last checkpoint.

## Data Quality Notes

- Some PWS may not have complete data
- Contaminant measurements are from 2021-2023 period
- Legal limits reflect federal standards (may differ from state standards)
- EWG health guidelines are often more stringent than legal limits

## License

This scraper is for educational and research purposes. Please respect EWG's terms of service and use the data responsibly.