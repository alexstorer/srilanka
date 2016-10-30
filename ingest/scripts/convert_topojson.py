# Import the os module, for the os.walk function
import os
 
# Set the directory you want to start from
rootDir = '../data/shape'
destination = '../../app/shape'

for dirName, subdirList, fileList in os.walk(rootDir):
    for fname in fileList:
        #if '_' in fname and 'shp' in fname:
        if '.shp' in fname:
            print('\t%s' % fname)
            forig = fname.split('.')[0]
            thisfile = '{}/{}.shp'.format(dirName,forig)
            outputfile = '{}/{}.json'.format(destination,forig)
            os.system('topojson {} -p > {}'.format(thisfile,outputfile))
