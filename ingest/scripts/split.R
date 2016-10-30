library(sp)
library(maptools)

sourcedir = "../data/shape/"

fname = paste0(sourcedir,"Districts/Districts.shp")
print("Processing Districts...")
Districts <-readShapePoly(fname)

fileprefix <- paste0(sourcedir,"Districts/Districts_")
filesuffix <- ".shp"

for (i in unique(Districts$prov_c)) {
    foo <- Districts[Districts$prov_c==i,]   
    writePolyShape(foo,paste0(fileprefix,i))
}

print("Processing DS Divisions...")

fname = paste0(sourcedir,"DSDivisions/DSDivisions.shp")
DSDs <-readShapePoly(fname)

fileprefix <- paste0(sourcedir,"DSDivisions/DS_")

for (i in unique(DSDs$dis_c)) {
    foo <- DSDs[DSDs$dis_c==i,]   
    writePolyShape(foo,paste0(fileprefix,i))
}

print("Processing GN Divisions...")

GNDs <-readShapePoly(paste0(sourcedir,"GNDivisions/GNDivisions.shp"))

if ('code' %in% names(GNDs)) {
    print("Renaming GN Divisions...")
    GNDs$gnd_n <- GNDs$name    
    GNDs$prov_c <- substr(GNDs$code,0,1)
    GNDs$dis_c <- substr(GNDs$code,0,2)
    GNDs$dsd_c <- substr(GNDs$code,0,4)
    GNDs$gnd_c <- GNDs$code
}

fileprefix <- paste0(sourcedir,"GNDivisions/GN_")

for (i in unique(GNDs$dsd_c)) {
    foo <- GNDs[GNDs$dsd_c==i,]   
    writePolyShape(foo,paste0(fileprefix,i))
}
