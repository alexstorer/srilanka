# Split each GND into a single JSON and put all other data in its own json

import json
from collections import defaultdict

f = open('data.json')


d = json.loads(f.read())
d_gnd = defaultdict(dict)
d_other = {}

for k in d:
    if len(k)==7:
        d_gnd[k[0:4]][k] = d[k]
    else:
        d_other[k] = d[k]
        #json.dump(d[k],open('data_'+k+'.json','w'))

for k in d_gnd:
    json.dump(d_gnd[k],open('data_' + k + '.json','w'))
json.dump(d_other,open('data_other.json','w'))
