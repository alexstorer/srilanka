import json
import csv

dr = csv.DictReader(open('../data/CSV/tables.csv','rU'))

out = {}

for d in dr:
    print d
    out[d['number']] = d

json.dump(out,open('tables.json','w'))
