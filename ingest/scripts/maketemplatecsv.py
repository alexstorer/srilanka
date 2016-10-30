import json
import csv

fp = open('template.csv','w')
dw = csv.DictWriter(fp,fieldnames=['Filename','Title','Variable','Label','Omit'])
dw.writeheader()
tables = json.load(open('tables_0504.json'))
fields = json.load(open('fields_0504.json'))

for t in sorted(tables.keys(),key=int):
    for k in sorted(fields[t].keys(),key=int):
        d = {'Filename':tables[t]['Filename'],
             'Title':tables[t]['Title'],
             'Variable':fields[t][k],
             'Label':''}
        if 'Total' not in d['Title'] and 'Total' in d['Variable']:
            d['Omit'] = True
        
        dw.writerow(d)
fp.close()
