#!/bin/bash

zip -r app.zip ../app/*

aws --profile alexpersonal s3 cp app.zip s3://worldbank-srilanka --acl public-read

