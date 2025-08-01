Envirofacts Data Service API
View the documentation for v1 of the Envirofacts REST Data Service.

Envirofacts provides a single point of access to U.S. EPA environmental data contained in U.S. EPA databases.

Envirofacts provides a single point of access to U.S. EPA environmental data contained in U.S. EPA databases. Interested parties from State and local governments, EPA or other Federal agencies, or individuals can search for information about environmental activities that may affect air, water, and land anywhere in the United States. The following topic-specific resources offer direct access to key data models, documentation, and tools:

    Greenhouse Gas Reporting Subparts: Data Tables and Visual Overview.

Envirofacts makes it easy to find information using geographic information (i.e., by address, ZIP Code, city, county, water body, or other geographic designation) from all sources or within specific environmental subject areas (e.g., Waste, Water, Toxics, Air, Radiation, and Land). Experienced users can use more sophisticated capabilities, such as maps or customized reporting.

Envirofacts gathers and aggregates data based on activities that impact the environment from a wide variety of sources. These sources are ICIS-AIR, Biennial Reporting (BR), Superfund Enterprise Management System (SEMS), Enforcement and Compliance History Online (ECHO/IDEA), Cleanups in My Community, Next Generation Grants System (NGGS), RadNet database, Resource Conservation and Recovery Act Information (RCRAInfo), Safe Drinking Water Information System (SDWIS), Toxics Release Inventory (TRI), and UV Index.

Envirofacts also provides access to data registries, including the Facility Registry Service (FRS), the Locational Reference Tables database (LRT), and the Substance Registry Services (SRS).

To help users visualize this information and link it to geographical features and landmarks, Envirofacts uses geospatial datasets from a variety of sources, including EPA, the U.S. Census Bureau, and the U.S. Geological Survey (USGS).

With access to nearly 20 EPA data sources, a wide range of search and reporting tools, web widgets, geographic integration and analysis tools, and extensive online documentation of the source data sets, Envirofacts helps EPA meet its Open Government Initiative objectives. In providing as much access as possible to EPA data systems, Envirofacts provides a data service API for custom searches for many of these databases.
Overview

Envirofacts has developed a RESTful data service API for all its internal data holdings. This functionality provides a user of Envirofacts with the ability to query any table via an URL. The default output is in JSON. Additional output options of CSV, Excel, HTML, JSONP, Parquet, PDF, and XML can be requested in the URL. The entire Envirofacts database metadata is available online, with all tables and columns within Envirofacts documented. Having the table structures available in this manner makes most of Envirofacts data easily available through the service.
Strengths and Limitations of the DMAP REST Service

The Envirofacts REST Service is simple and easy to use to access multiple data sources within EPA. The resulting output formats can be easily used with desktop applications such as Excel or used in other custom applications.

The service currently limits requests to being completed in under 15 minutes. If more data is needed than this, users can page through the data, requesting the next set of records in the table.
Constructing a Search

To build a search, users create a URL with a specific set of parameters. This is done by creating a string using the following format:
https://data.epa.gov/efservice/[table]/[column][operator][value]/[join]/[first]:[last]/[sort]/[format]

Table

    Required. At least one table name is required. When inserting multiple tables into the URL, they must share an ID or common column, so that the tables can be joined or linked. To retrieve an accurate output, it is best to use tables that share an ID column. For example, within the RCRAInfo tables, they often share an ID column called handler_id.

    The table name must match the format [program].[table]. The program is the schema or acronym to which the table belongs, e.g., SEMS, RCRA, GHG, TRI. The table is the name of the table in the database. As an example, to query the table "ogd_vw_ef_base" in the NGGS program, the table entry would be nggs.ogd_vw_ef_base.

Filter

    To filter the records returned in the query, one or more filters can be applied to a query. The filter must be in format: [column][operator][value]. The column attribute is the table column that will be compared in the filter. The operator is a symbol that will be the basis for the comparison, e.g., equals, not equals, greater than, etc. The list of operators with descriptions is available below. The value attribute is what the column will be compared against. Operators can be combined using the /and/, which requires both filters to be met, and /or/, which requires either one of the filter's criteria to be met.

    As an example, to restrict a query of the NEI facilities in the 2017 summary data to those in Houston, TX, this filter would work: state_code/equals/TX/and/city_name/equals/Houston. When filter operations are performed on text fields, the comparison is case-insensitive.

Join

    Combine results from two tables using the available join types. The format is like a table and filter combination: [join_type]/[table]/[comparison]. The join value is the appropriate join type. The table is the table that should be joined, matching the structure of the table value above. Finally, the (optional) comparison is structured the same as the filter above, just comparing two table columns.

    As an example, to include contaminants in a SEMS query of sites, /sems.envirofacts_site/left/sems.envirofacts_contaminants/site_id/equals/fk_site_id would perform a left join and include data from the envirofacts_contaminants table.

    In performing joins, the comparison can be excluded, and the service will attempt to calculate the join. In the join example above, the same join could be specified as /sems.envirofacts_site/left/envirofacts_contaminants. However, for tables that share many columns with the same name or if the column names between two tables don't match, it is better and more accurate to specify the columns to join on. The /and/ and /or/ operators can be used in join comparisons as well. When specifying the columns, the left side of the comparison should be for the first table, the right side of the comparison will be for the column on the newly joined table.

First

    The first record to retrieve, starts at 1.

Last

    The last record to retrieve.

Order

    Sort the fields in the results. The format for applying a sort is /sort/[column]:[direction]/. The column is the field that needs to be sort . The direction is optional and can either be asc or desc. "asc" means the field will be sorted in ascending order. "desc" means the field will be sorted in descending order. If no direction is supplied, "asc" will be used as the default sort direction.

    When specifying order, multiple fields can be specified by separating the fields with a comma (,).

    As an example, /sort/fk_ref_state_code will sort the results by the fk_ref_state_code column in ascending order and is equivalent to using /sort/fk_ref_state_code:asc. If multiple fields needed to be sorted, /sort/fk_ref_state_code:desc,media_name:asc would sort results first by the state_code column in descending order and then the city_name column in ascending order.

    Columns in a sort can also be specified in the [program].[table].[column] format, so the second sort example above would be /sort/sems.envirofacts_site.fk_ref_state_code:desc,sems.envirofacts_contaminants.media_name:asc. This lengthier syntax is helpful when used in conjunction with a join and wanting to order by columns in the joined tables.

Format

    The export format, e.g., JSON, JSONP, CSV, Excel, HTML, Parquet, PDF, and XML. The default format is JSON.

Example Query

https://data.epa.gov/efservice/nggs.ogd_vw_ef_base/zip/equals/77571/join/nggs.applicant_type_lk/1:10

In the above query, the ogd_vw_ef_base table in the NGGS program will be queried and be joined to the applicant_type_lk table in NGGS. The join will be computed by the service. Only records that have a zip code of 77571 will be returned. The records will be sorted by the project_title column in ascending order. Finally, only the first 10 records will be returned in the query. The results will be exported in the default format of JSON.
Operator Types

equals

    The database will only return rows where the column value is equal to the search value.

    Example:
    /sems.envirofacts_site/fk_ref_state_code/equals/CT

    Only returns records where the fk_ref_state_code field matches "CT".

notEquals

    The database will only return rows where the column value is NOT equal to the search value.

    Example:
    /sems.envirofacts_site/fk_ref_state_code/notEquals/CT

    Only returns records where the fk_ref_state_code field does not match "CT".

lessThan

    The database will only return rows where the column value is less than the search value.

    Example:
    /sems.envirofacts_site/fk_ref_state_code/lessThan/CT

    Only returns records where the fk_ref_state_code field is less than, or alphabetically before "CT".

lessThanEqual

    The database will only return rows where the column value is less than or equal to the search value.

    Example:
    /sems.envirofacts_site/fk_ref_state_code/lessThanEqual/CT

    Only returns records where the fk_ref_state_code field is less than, or alphabetically before, or equal to "CT".

greaterThan

    The database will only return rows where the column value is greater than the search value.

    Example:
    /sems.envirofacts_site/fk_ref_state_code/greaterThan/CT

    Only returns records where the fk_ref_state_code field is greater than, or alphabetically after "CT".

greaterThanEqual

    The database will only return rows where the column value is greater than the search value.

    Example:
    /sems.envirofacts_site/fk_ref_state_code/greaterThanEqual/CT

    Only returns records where the fk_ref_state_code field is greater than, or alphabetically after, or equal to "CT".

beginsWith

    The database will only return rows where the start of column value is equal to the search value. A comparison is done, character by character, up to the last character entered for the search value.

    Example:
    /sems.envirofacts_site/city_name/beginsWith/North

    Only returns records where the city_name field begins with "North".

endsWith

    The database will only return rows where the end of column value is equal to the search value. A comparison is done, character by character, up to the last character entered for the search value.

    Example:
    /sems.envirofacts_site/city_name/endsWith/Juan

    Only returns records where the city_name field ends with "Juan".

contains

    For character fields only. The database will only return rows where the search value is contained within the column value. As an example, if the search value entered is "ABC" and the column value is "CCABCDD" then the row will be accepted. Using the same search value of "ABC" if the column value was "AABBCC" then the row will be rejected.

    Example:
    /sems.envirofacts_site/city_name/contains/Boro

    Only returns records where the city_name field contains "Boro".

excludes

    For character fields only. The database will only return rows where the search value is not contained within the column value. As an example, if the search value entered is "ABC" and the column value is "CCABCDD" then the row will not be accepted. Using the same search value of "ABC" if the column value was "AABBCC" then the row will be accepted.

    Example:
    /sems.envirofacts_site/city_name/excludes/Boro

    Only returns records where the city_name field does not include "Boro".

like

    For character fields only. The database will return rows where the column value matches the pattern in the search value. A @ character can be used as a wildcard. As an example, if the search value is "North@" on a state name field, "North Carolina" will be a match, but "South Carolina" will not be a match.

    Example:
    /sems.envirofacts_site/city_name/like/k@g

    Only returns records where the city_name will contain characters between "k" and "g". In this case it will match "Kingstowne".

notLike

    For character fields only. The database will return rows where the column value does not match the pattern in the search value. A @ character can be used as a wildcard. As an example, if the search value is "North@" on a state name field, "South Carolina" will be a match, but "North Carolina" will not be a match.

    Example:
    /sems.envirofacts_site/city_name/notLike/k@g

    Only returns records where the city_name does match the pattern of having "k", any characters, and "g".

in

    The database will return rows where the column value is within the list of supplied values. The supplied values should be separated by a comma (,) character. As an example, if the search value is "1,2,3", a column value of "2" will be a match, but a column value of "4" will not be a match.

    Example:
    /sems.envirofacts_site/fk_ref_state_code/in/AR,LA,MS

    Only returns records where the fk_ref_state_code is in the list of "AR", "LA", "MS". This is the equivalent of /sems.envirofacts_site/fk_ref_state_code/equals/AR/or/fk_ref_state_code/equals/LA/or/fk_ref_state_code/equals/MS (or fk_ref_state_code equals "AR", "MS", or "LA").

notIn

    The database will return rows where the column value is not in the list of supplied values. The supplied values should be separated by a comma (,) character. As an example, if the search value is "1,2,3", a column value of "4" will be a match, but a column value of "2" will not be a match.

    Example:
    /sems.envirofacts_site/fk_ref_state_code/notIn/AR,LA,MS

    Only returns records where the fk_ref_state_code is not in the list of "AR", "LA", "MS". This is the equivalent of /sems.envirofacts_site/fk_ref_state_code/notEquals/AR/and/fk_ref_state_code/notEquals/LA/and/fk_ref_state_code/notEquals/MS (or fk_ref_state_code does not equal "AR", "MS", and "LA").

Joins

join

    The basic join, with only records from both tables being included in the results.

cross

    Performs a cartesian join between the two tables.

full_outer

    Results from both tables are combined, including rows that do not match.

left

    All the tables in the left-side of the join are included. Only tables that satisfy the match on the right-side of the join are included in the results.

right

    All the tables in the right-side of the join are included. Only tables that satisfy the match on the left-side of the join are included in the results.

Note:

When two tables are joined and the two tables have columns with the same names, the column from the joined table will be listed in the format schema.table.column so all data is represented.
Conjunctions

and

    The filters must be satisfied in data to return results.

    Example:
    /sems/envirofacts/site/fk_ref_state_code/equals/NC/and/city_name/Charlotte

    Only returns records in which the state code equals "NC" and the city name equals "Charlotte".

or

    Any of the filters must be satisfied in data to return results.

    Example:
    /sems/envirofacts/site/fk_ref_state_code/equals/NC/or/fk_ref_state_code/GA

    Only returns records in which the state code equals "NC" or the state code equals "GA".

Using Envirofacts Metadata to Construct a Search

The tables and columns within a program can be seen on the Envirofacts model page, which will model the relationships between tables within a program. Tables and columns searched on the Envirofacts Data Element Search can also be examined to see what tables and columns are available to query.
Examples

    https://data.epa.gov/efservice/lookups.mv_new_geo_best_picks/state_code/equals/VA/499:504 returns result set records 499 to 504 from the mv_new_geo_best_picks table where state_code = "VA".
    https://data.epa.gov/efservice/icis.icis_comp_monitor/comp_monitor_category_code/equals/ALT/sort/created_date/1:100000 returns the first 100,000 records from ICIS icis_comp_monitor table where the comp_monitor_category_code = "ALT". The records will be sorted by the created_date field in ascending order.
    https://data.epa.gov/efservice/saferchoice.t_design_for_environment/1:20/csv returns the first 20 records from Safer Choice t_design_for_environment table as a CSV output.
    https://data.epa.gov/efservice/lookups.mv_new_geo_best_picks/state_code/equals/HI/join/frs.frs_program_facility/sort/frs.frs_program_facility.city_name:desc returns results from the mv_new_geo_best_picks and frs_program_facility tables where state_code = "HI" in the lookups.mv_new_geo_best_picks table. The results will be sorted by the frs.frs_program_facility.city_name column in descending order.
    https://data.epa.gov/efservice/lookups.mv_new_geo_best_picks/postal_code/beginsWith/60085/json returns results from the lookups.mv_new_geo_best_picks table where postal_code "Begins With" "60085" in a JSON format.
    https://data.epa.gov/efservice/lookups.mv_new_geo_best_picks/state_code/equals/VA/excel returns results from the lookups.mv_new_geo_best_picks table where state_code = "VA" in an Excel format.
    https://data.epa.gov/efservice/lookups.mv_new_geo_best_picks/state_code/equals/HI/and/county_name/equals/Honolulu/sort/rcrainfo:asc/ returns results from the lookups.mv_new_geo_best_picks table where state_code = "HI" and county_name = "Honolulu". Results will be sorted by the rcrainfo column in ascending order.
    https://data.epa.gov/efservice/lookups.mv_new_geo_best_picks/state_code/equals/HI/join/frs.frs_program_facility/pgm_sys_acrnm/equals/ICIS returns results from the mv_new_geo_best_picks and frs_program_facility tables where state_code = "HI" in the lookups.mv_new_geo_best_picks table and the pgm_sys_acrnm value is "ICIS" in the frs.frs_program_facility table.
    https://data.epa.gov/efservice/lookups.mv_new_geo_best_picks/state_code/equals/HI/join/frs.frs_program_facility/registry_id/equals/registry_id/pgm_sys_acrnm/equals/ICIS same as the query above, but the join criteria between the two tables is explicitly specified instead of relying on the service to calculate the join criteria. This can help when needing to modify the default join criteria or wanting to ensure that the join is optimized for performance.

     Envirofacts Data Service API (V1)

Home | Multisystem Search | Topic Searches | System Data Searches | About the Data | Data Downloads | Widgets | Services | Mobile | Other Datasets

Envirofacts provides a single point of access to U.S. EPA environmental data contained in U.S. EPA databases. Interested parties from State and local governments, EPA or other Federal agencies, or individuals can search for information about environmental activities that may affect air, water, and land anywhere in the United States.

Envirofacts makes it easy to find information using geographic information (i.e., by address, ZIP Code, city, county, water body, or other geographic designation) from all sources or within specific environmental subject areas (e.g., Waste, Water, Toxics, Air, Radiation, and Land). Experienced users can use more sophisticated capabilities, such as maps or customized reporting.

Envirofacts gathers and aggregates data based on activities that impact the environment from a wide variety of sources. These sources are ICIS-AIR, Biennial Reporting (BR), Superfund Enterprise Management System (SEMS), Enforcement and Compliance History Online (ECHO/IDEA), Cleanups in My Community, Next Generation Grants System (NGGS), RadNet database, Resource Conservation and Recovery Act Information (RCRAInfo), Safe Drinking Water Information System (SDWIS), Toxics Release Inventory (TRI), and UV Index.

Envirofacts also provides access to data registries, including the Facility Registry Service (FRS), the Locational Reference Tables database (LRT), and the Substance Registry Services (SRS).

To help users visualize this information and link it to geographical features and landmarks, Envirofacts uses geospatial datasets from a variety of sources, including EPA, the U.S. Census Bureau, and the U.S. Geological Survey (USGS).

With access to nearly 20 EPA data sources, a wide range of search and reporting tools, web widgets, geographic integration and analysis tools, and extensive online documentation of the source data sets, Envirofacts helps EPA meet its Open Government Initiative objectives. In providing as much access as possible to EPA data systems, Envirofacts provides a data service API for custom searches for many of these databases.
EF Data Service API (v1)

Envirofacts developed a RESTful data service API to all its internal data holdings. This functionality provides a user of Envirofacts with the ability to query any table using a URL. The default output is in XML, which can be utilized in other applications, as well as tools such as Microsoft Excel or Access. Output options of CSV and Excel can be requested in the URL. The entire Envirofacts database metadata is available online, so that all tables and columns within Envirofacts are documented. Having the table structures available in this manner makes most of Envirofacts data easily available through the service.
Strengths and Limitations of the Envirofacts RESTful Service

This is a simple to use, well-documented way to access multiple data sources without the need of user database connections. The resulting output can be easily used with desktop applications such as Excel or Access, or used in creating Web mashups.

The service currently limits requests to being completed in under 15 minutes. If more data is needed than this, users can page through the data, requesting the next set of records in the table.
Constructing a Search

To build a search, users create a URL with a specific set of parameters. This is done by creating a string using the following format:
Data Service API URL

    Table Name – At least one table name is required. Up to three table names can be entered. When inserting multiple tables into the URL, they must share an ID or common column, so that the tables can be joined or linked. To retrieve an accurate output, it is best to use tables that share an ID column. For example, within the tables that make up the TRI Facility Information, they each share an ID column known as tri_facility_id. This can be visually seen within the Envirofacts model pages for various subject areas like TRI Facility Information. Please refer to the Envirofacts database metadata to locate tables that can be joined via ID columns within the RESTful data service.
    Column Name – This is an optional entry. Enter a column name and value to limit the results. Multiple columns may be used within the URL to limit the data from a table or tables. The column name is not case sensitive.
    Operator – This is an optional entry. This parameter allows users to pass in an operator with the query. Default output is "=" and does not require an operator, but users can enter "<", ">", "!=", "BEGINNING", "CONTAINING", operators as well via the URL. The "BEGINNING" operator will return rows where the start of a column value is equal to the search value, while the "CONTAINING" will return rows where the search value is contained within the column value.

    OPERATOR 	USAGE
    = 	The database will only return rows where the column value is equal to the search value.
    != 	The database will only return rows where the column value is NOT equal to the search value.
    < 	The database will only return rows where the column value is less than the search value.
    > 	The database will only return rows where the column value is greater than the search value.
    BEGINNING 	The database will only return rows where the start of column value is equal to the search value. A comparison is done, character by character, up to the last character entered for the search value.
    CONTAINING 	For Character fields only. The database will only return rows where the search value is contained within the column value. As an example if the search value entered is "ABC" and the column value is "CCABCDD" then the row will be accepted. Using the same search value of "ABC" if the column value was "AABBCC" then the row will be rejected.
    Column Value – This is an optional entry (except when using #2 - Column Name). The column value is queried against the database without modification, so this value is case-sensitive. Use the program system model and queries within Envirofacts to double check the case for the value.
    Rows – This is an optional entry. Specify the rows to display by entering 'rows/<first_row>:<last_row>'. Results numbering starts at 0. So, to get the first five hundred rows, enter rows/0:499 If rows are not specified, the default is the first 10,000 rows.
    Output Format – This is an optional entry. The default output is in XML; however, output options of JSON, CSV or Excel can be requested in the URL. The output format is not case sensitive.
    Count -This is an optional entry and is shown as #7 in the above URL image. Count shows the total number of records that will be returned for this search once the Count option is removed. When Count is used, Excel, CSV, or XML cannot be specified. The column name is not case sensitive.

For example:

    https://data.epa.gov/efservice/tri_facility/state_abbr/VA/rows/499:504
    returns result set records 500 to 505 from the tri_facility table where state_abbr = "VA".
    https://data.epa.gov/efservice/envirofacts_site/fk_ref_state_code/FL
    returns records from envirofacts_site table where the fk_ref_state_code = "FL".
    https://data.epa.gov/efservice/t_safer_choice_and_design_for_the_environment/rows/0:19/JSON
    returns the first 20 records from t_safer_choice_and_design_for_the_environment table as a JSON output.
    https://data.epa.gov/efservice/tri_facility/state_abbr/HI/tri_reporting_form
    returns results from the tri_facility and tri_reporting_form tables where state_abbr = "HI" in the tri_facility table.
    https://data.epa.gov/efservice/tri_facility/state_abbr/VA/tri_reporting_form/tri_chem_info/EXCEL
    returns results from the tri_facility, tri_reporting_form and tri_chem_info tables where state_abbr = "VA" in the tri_facility table in Excel format.
    https://data.epa.gov/efservice/tri_facility/zip_code/BEGINNING/600/JSON
    returns results from the tri_facility table where zip_code "Begins With" 600 in a JSON format.
    https://data.epa.gov/efservice/tri_facility/state_abbr/VA/CSV
    returns results from the tri_facility table where state_abbr = "VA" in a CSV format.
    https://data.epa.gov/efservice/tri_facility/state_abbr/HI/county_name/Honolulu
    returns results from the tri_facility table where state_abbr = "HI" and county_name = "Honolulu".
    https://data.epa.gov/efservice/tri_facility/state_abbr/VA/tri_reporting_form/reporting_year/2010/EXCEL
    returns results from the tri_facility table where state_abbr = "VA" and results from the tri_reporting_form table where reporting_year = 2010.
    https://data.epa.gov/efservice/tri_facility/COUNT
    returns results showing the total number of records in the tri_facility table.
    https://data.epa.gov/efservice/tri_facility/state_abbr/HI/COUNT
    returns results showing the total number of records in the tri_facility table where state_abbr = "HI".

Using Envirofacts Metadata to Construct a Search

The tables and columns within a program can be seen on the Envirofacts model page, which will model the relationships between tables within a program. Tables and columns searched on the Envirofacts Data Element Search can also be examined to see what tables and columns are available to query.
Working with the Output

The result set is XML that can be ported into an application or used as part of a Web mash-up. This is an example of what the output looks like with a return of two records from a search of the table tri_facility:

<?xml version="1.0" encoding="utf-8"?> <tri_facilityList> <tri_facility> <tri_facility_ID>00602BXTRF111CO</tri_facility_ID> <FACILITY_NAME>BAXTER HEALTHCARE CORP, FENWAL DIV</FACILITY_NAME> <STREET_ADDRESS>111 COLON ST</STREET_ADDRESS> <CITY_NAME>AGUADA</CITY_NAME> <COUNTY_NAME>AGUADA MUNICIPIO</COUNTY_NAME> <STATE_COUNTY_FIPS_CODE>72003</STATE_COUNTY_FIPS_CODE> <STATE_ABBR>PR</STATE_ABBR> <ZIP_CODE>00602</ZIP_CODE> <REGION>2</REGION> <FAC_CLOSED_IND>1</FAC_CLOSED_IND> <MAIL_NAME>BAXTER HEALTHCARE CORP, FENWAL DIV</MAIL_NAME> <MAIL_STREET_ADDRESS>111 COLON ST</MAIL_STREET_ADDRESS> <MAIL_CITY>AGUADA</MAIL_CITY> <MAIL_STATE_ABBR>PR</MAIL_STATE_ABBR> <MAIL_PROVINCE>None</MAIL_PROVINCE> <MAIL_COUNTRY>None</MAIL_COUNTRY> <MAIL_ZIP_CODE>00602</MAIL_ZIP_CODE> <ASGN_FEDERAL_IND>C</ASGN_FEDERAL_IND> <ASGN_AGENCY>None</ASGN_AGENCY> <FRS_ID>None</FRS_ID> <PARENT_CO_DB_NUM>080532250</PARENT_CO_DB_NUM> <PARENT_CO_NAME>BAXTER SALES CORP</PARENT_CO_NAME> <FAC_LATITUDE>182848</FAC_LATITUDE> <FAC_LONGITUDE>671106</FAC_LONGITUDE> <PREF_LATITUDE>18.480000</PREF_LATITUDE> <PREF_LONGITUDE>67.185000</PREF_LONGITUDE> <PREF_ACCURACY>11000.00</PREF_ACCURACY> <PREF_COLLECT_METH>UN</PREF_COLLECT_METH> <PREF_DESC_CATEGORY>UN</PREF_DESC_CATEGORY> <PREF_HORIZONTAL_DATUM>1</PREF_HORIZONTAL_DATUM> <PREF_SOURCE_SCALE>U</PREF_SOURCE_SCALE> <PREF_QA_CODE>0100</PREF_QA_CODE> <ASGN_PARTIAL_IND>0</ASGN_PARTIAL_IND> <ASGN_PUBLIC_CONTACT>MARIO LUCENA</ASGN_PUBLIC_CONTACT> <ASGN_PUBLIC_PHONE>8098383000</ASGN_PUBLIC_PHONE> <ASGN_PUBLIC_CONTACT_EMAIL>None</ASGN_PUBLIC_CONTACT_EMAIL> <BIA_CODE>None</BIA_CODE> <STANDARDIZED_PARENT_COMPANY>None</STANDARDIZED_PARENT_COMPANY> <ASGN_PUBLIC_PHONE_EXT>None</ASGN_PUBLIC_PHONE_EXT> <EPA_REGISTRY_ID>110002085207</EPA_REGISTRY_ID> <ASGN_TECHNICAL_CONTACT>None</ASGN_TECHNICAL_CONTACT> <ASGN_TECHNICAL_PHONE>None</ASGN_TECHNICAL_PHONE> <ASGN_TECHNICAL_PHONE_EXT>None</ASGN_TECHNICAL_PHONE_EXT> <MAIL>None</MAIL> <ASGN_TECHNICAL_CONTACT_EMAIL>None</ASGN_TECHNICAL_CONTACT_EMAIL> <FOREIGN_PARENT_CO_NAME>None</FOREIGN_PARENT_CO_NAME> <FOREIGN_PARENT_CO_DB_NUM>None</FOREIGN_PARENT_CO_DB_NUM> <STANDARDIZED_FOREIGN_PARENT_COMPANY>None</STANDARDIZED_FOREIGN_PARENT_COMPANY> </tri_facility> <tri_facility> <tri_facility_ID>00602BXTRHRD115</tri_facility_ID> <FACILITY_NAME>DADE DIAGNOSTICS OF PR INC</FACILITY_NAME> <STREET_ADDRESS>RD 115 KM 226</STREET_ADDRESS> <CITY_NAME>AGUADA</CITY_NAME> <COUNTY_NAME>AGUADA MUNICIPIO</COUNTY_NAME> <STATE_COUNTY_FIPS_CODE>72003</STATE_COUNTY_FIPS_CODE> <STATE_ABBR>PR</STATE_ABBR> <ZIP_CODE>00602</ZIP_CODE> <REGION>2</REGION> <FAC_CLOSED_IND>0</FAC_CLOSED_IND> <MAIL_NAME>DADE DIAGNOSTICS OF PR INC.</MAIL_NAME> <MAIL_STREET_ADDRESS>P.O. BOX 865</MAIL_STREET_ADDRESS> <MAIL_CITY>AGUADA</MAIL_CITY> <MAIL_STATE_ABBR>PR</MAIL_STATE_ABBR> <MAIL_PROVINCE>None</MAIL_PROVINCE> <MAIL_COUNTRY>None</MAIL_COUNTRY> <MAIL_ZIP_CODE>00602</MAIL_ZIP_CODE> <ASGN_FEDERAL_IND>C</ASGN_FEDERAL_IND> <ASGN_AGENCY>None</ASGN_AGENCY> <FRS_ID>None</FRS_ID> <PARENT_CO_DB_NUM>626532535</PARENT_CO_DB_NUM> <PARENT_CO_NAME>DADE INTERNATIONAL INC</PARENT_CO_NAME> <FAC_LATITUDE>182230</FAC_LATITUDE> <FAC_LONGITUDE>671230</FAC_LONGITUDE> <PREF_LATITUDE>18.391667</PREF_LATITUDE> <PREF_LONGITUDE>67.191667</PREF_LONGITUDE> <PREF_ACCURACY>11000.00</PREF_ACCURACY> <PREF_COLLECT_METH>UN</PREF_COLLECT_METH> <PREF_DESC_CATEGORY>UN</PREF_DESC_CATEGORY> <PREF_HORIZONTAL_DATUM>1</PREF_HORIZONTAL_DATUM> <PREF_SOURCE_SCALE>U</PREF_SOURCE_SCALE> <PREF_QA_CODE>0100</PREF_QA_CODE> <ASGN_PARTIAL_IND>0</ASGN_PARTIAL_IND> <ASGN_PUBLIC_CONTACT>ALEIDA HERNANDEZ</ASGN_PUBLIC_CONTACT> <ASGN_PUBLIC_PHONE>7878685500</ASGN_PUBLIC_PHONE> <ASGN_PUBLIC_CONTACT_EMAIL>None</ASGN_PUBLIC_CONTACT_EMAIL> <BIA_CODE>None</BIA_CODE> <STANDARDIZED_PARENT_COMPANY>None</STANDARDIZED_PARENT_COMPANY> <ASGN_PUBLIC_PHONE_EXT>None</ASGN_PUBLIC_PHONE_EXT> <EPA_REGISTRY_ID>110007807258</EPA_REGISTRY_ID> <ASGN_TECHNICAL_CONTACT>None</ASGN_TECHNICAL_CONTACT> <ASGN_TECHNICAL_PHONE>None</ASGN_TECHNICAL_PHONE> <ASGN_TECHNICAL_PHONE_EXT>None</ASGN_TECHNICAL_PHONE_EXT> <MAIL>None</MAIL> <ASGN_TECHNICAL_CONTACT_EMAIL>None</ASGN_TECHNICAL_CONTACT_EMAIL> <FOREIGN_PARENT_CO_NAME>None</FOREIGN_PARENT_CO_NAME> <FOREIGN_PARENT_CO_DB_NUM>None</FOREIGN_PARENT_CO_DB_NUM> <STANDARDIZED_FOREIGN_PARENT_COMPANY>None</STANDARDIZED_FOREIGN_PARENT_COMPANY> </tri_facility> </tri_facilityList>

After saving this as an XML file, it can be opened in Excel as an XML List, or in MS Access using the "Get External Data/Import" tool to create a table.
