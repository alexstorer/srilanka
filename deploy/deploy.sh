#!/bin/bash

aws --profile alexpersonal s3 sync ../../srilanka/multilevel/ s3://worldbank-srilanka --acl public-read
