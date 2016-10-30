# The goal of this file is to make a master json file with
# all of the metadata for each region.

import json
import glob

files = glob.glob('../../app/shape/*.json')

allproperties = []

out = {}

for f in files:
    objects = json.load(open(f))['objects']
    for o_key in objects:
        for geom in objects[o_key]['geometries']:
            allproperties.append(geom['properties'])

# Do provinces first

for p in allproperties:
    if 'gnd_n' in p:
        out[p['gnd_c']] = p['gnd_n']
        
with open('gndLookup.json','w') as f:
    json.dump(out,f,separators=(',', ':'),sort_keys=True)
