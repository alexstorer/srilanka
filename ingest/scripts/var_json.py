# Take the JSON and index by variable instead of by location

import json
from collections import defaultdict

f = open('data.json')


d = json.loads(f.read())
d_var = defaultdict(dict)

for k in d:    
    for var in d[k]:
        if len(k)==7:
            d_var[var+'_gnd'][k] = d[k][var]
        else:
            d_var[var][k] = d[k][var]

for k in d_var:
    print k
    json.dump(d_var[k],open('var_' + k + '.json','w'))
