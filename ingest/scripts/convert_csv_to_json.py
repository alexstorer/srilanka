import glob
import csv
import json
import os.path
from collections import OrderedDict

sourcedir = '../data/CSV'

files = glob.glob(sourcedir+'/CPH*.csv')

databyid = {}
fieldsbytable = {}

skipfields = ['a1p','a1','a3','a4','id']

for fname in files:
    print fname
    # 'CPH2012_GNT_101.csv' ==> "01" ==> 1    
    table = int(os.path.basename(fname)[13:15])
    tablename = fname.split('/')[-1]
    lines  = open(fname).read().split('\n')
    header = lines[3]
    fields = header.strip().split(',')
    fields[4] = 'id'
    lookup = {}
    i = 0
    for f in fields:        
        if f not in skipfields:
            lookup[i] = f
            i+=1
    
    dr = csv.DictReader(open(fname),fieldnames=fields)
    # skip the header rows
    for i in range(4):
        dr.next()        
    for d in dr:
        if d['a1']=='':
            break
        if d['a4']!='0':
            thisid = d['a4']
        elif d['a3']!='0':
            thisid = d['a3']
        elif d['a1']!='0':
            thisid = d['a1']
        else:
            thisid = d['a1p']
        if thisid not in databyid:
            databyid[thisid] = {}
        od = OrderedDict()
        i = 0
        for f in fields:            
            if f not in skipfields:                
                if d[f]=='':
                    od[i] = 0
                else:
                    try:
                        od[i] = int(d[f])
                    except:
                        od[i] = d[f]
                i+=1
        databyid[thisid][table] = od
        fieldsbytable[table] = lookup
        fieldsbytable[tablename] = lookup
        

json.dump(databyid,open('data.json','w'),separators= (',', ':'))
json.dump(fieldsbytable,open('fields.json','w'))
