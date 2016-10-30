# Rename the fields, mark the omissions and move to the right location
import csv, json

tablenum = 0
fieldnum = 0

nameswap = {'Province':'Province',
            'District':'Districts',
            'DSD':'DSDivisions',
            'GND':'GNDivisions'}

f = open('../data/template_cutpoints.csv','rU')
dr = csv.DictReader(f)
out = {}

fp = open('fields.json','r')
fields = json.load(fp)
fp.close()

fp = open('tables.json','r')
tables = json.load(fp)
fp.close()

fnamelookup = {tables[i]['Filename']:i for i in tables}

cutpoints = {}
for table in fields:
    cutpoints[table] = {}
    for field in fields[table]:
        print field
        cutpoints[table][field] = {'Province':{},'Districts':{},'DSDivisions':{},'GNDivisions':{}}

for d in dr:    
    table = tables[fnamelookup[d['Filename']]]
    tfields = fields[table['number']]
    variablelookup = {tfields[k]:k for k in tfields}
    fieldindex = variablelookup[d['Variable']]    
    if d['Omit']:
        #fieldindex = variablelookup[d['Variable']]
        if 'Omit' in tables[fnamelookup[d['Filename']]]:
            tables[fnamelookup[d['Filename']]]['Omit'].append(fieldindex)
        else:
            tables[fnamelookup[d['Filename']]]['Omit'] = [fieldindex]
    if d['Label']:
        print d        
        fields[fnamelookup[d['Filename']]][fieldindex] = d['Label']
    for cutlevel in ['Province','District','DSD','GND']:
        if d[cutlevel]:
            cutpoints[fnamelookup[d['Filename']]][fieldindex][nameswap[cutlevel]] = eval(d[cutlevel])
        
json.dump(tables,open('tables.json','w'))
json.dump(fields,open('fields.json','w'))
json.dump(cutpoints,open('cutpoints.json','w'))
