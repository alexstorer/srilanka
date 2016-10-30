Sri Lanka Map
-------------

An interactive map of the Sri Lanka census data.

Made by Alex Storer on behalf of the World Bank.

https://github.com/alexstorer/

## Directories

* app
* deploy
* ingest

## App

This contains the final code, data and libraries, ready to be uploaded to your desired server.

To run locally, make sure you run the `server.py` file with Python version 2.7.  This will create a local webserver that you can use to preview the app by going to the following directory:

    file:///Users/astorer/Dropbox/Work/sl/app/choropleth-example.html

You will need to change the `/Users/astorer/Dropbox...` portion to the path on your local machine.

## Deploy

    deploy/deploy.sh

My simple script for deploying the app.  Presently, the app is being deployed to my personal S3 space on Amazon, which is publicly accessible here:

http://s3-us-west-2.amazonaws.com/worldbank-srilanka/choropleth-example.html

    deploy/deploy_zip.sh

This script will zip the app up and copy it to s3.  It is located here:

http://s3-us-west-2.amazonaws.com/worldbank-srilanka/app.zip

## Ingest

To ingest all of the source files and build the necessary resources for the app, run this script

    ingest/ingest.sh

This directory is where we will put the shapefiles, data and scripts to process the data in the right way for the app.

### Data

We need the following data in order to build the app:

* CSV files (in `CSV` directory)
* `template_cutpoints.csv`
* Shapefiles

#### CSV Files

For the CSV files, we expect the following format:

    ,,,,Census of Population and Housing - 2012,,,
    ,,,,Table 104: Population by Province/ District/ DS Division/ GN Division and Sex,,,
    ,,,,Province/ District/ DS Division/ GN Division,,Sex,
    a1p,a1,a3,a4,,Total Population,Male,Female
    0,0,0,0,Sri Lanka,20359439,9856633,10502806
    1,0,0,0,1,5851130,2848649,3002481
    2,0,0,0,2,2571557,1229795,1341762
    3,0,0,0,3,2477285,1194540,1282745

Any variation from this format will lead to unexpected errors.

#### Cutpoints

We also require a list of the cutpoints for each variable in each table, as well as whether to omit it.  This file should take the following form:

    Filename,Title,Variable,Label,Omit,Province,District,DSD,GND
    CPH2012_GNT_100.csv,Total Population,Total Population,,,"{""min"":1000000,""max"":6000000,""categories"":5}","{""min"":0,""max"":2500000,""categories"":10}","{""min"":0,""max"":350000,""categories"":7}","{""min"":0,""max"":30000,""categories"":6}"
    CPH2012_GNT_101.csv,Ethnicity of Population,Total Population,,True,,,,
    CPH2012_GNT_101.csv,Ethnicity of Population,Sinhalese,,,"{""min"":0,""max"":100,""categories"":10}","{""min"":0,""max"":100,""categories"":10}","{""min"":0,""max"":100,""categories"":10}","{""min"":0,""max"":100,""categories"":10}"

#### Shapefiles

For shapefiles, we need the following directories in the `data/shape` directory:

    DSDivisions/
    Districts/
    GNDivisions/
    Provinces/

In each of these, we expect files labeled like:

    Provinces.dbf	Provinces.prj	Provinces.shp
    Provinces.qpj	Provinces.shx

If they are named differently, as in, `Provinces_2016_new.shp`, the script will break.

### Scripts

The following scripts are present in the scripts directory, and are called by the `ingest.sh` script, in this order.

1.  `split.R` -- split the .shp files using R
2.  `convert_topojson.py` -- convert the .shp files to topojson and move them
3.  `convert_csv_to_json.py` -- make sure you change the source of the directory containing the CSV files
    * Outputs data.json and fields.json
4.  `var_json.py` -- splits the data.json into variables
5.  `convert_table_list.py` -- converts tables.csv (table ordering) to tables.json
6.  `convert_fields.py` -- adds cutpoints, changes field labels.  make sure you change the output directory.  it puts tables, fields and cutpoints in the output directory.
7.  `split_json.py` -- splits the data.json into smaller components for faster loading
8.  `make_summary_gnd.py` -- summarize the GNDs so it's easy to display names

This is the contents of the `ingest.sh` script.

        RScript split.R; python convert_topojson.py; python convert_csv_to_json.py; python var_json.py; python convert_table_list.py; python convert_fields.py; python split_json.py; python make_summary_gnd.py; mv *.json ../app/data
