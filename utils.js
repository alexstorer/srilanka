// things I've used in the past that I don't need to load
function fillLookups() {
    for (l in maplayers['Province']._layers) {
        props = maplayers['Province']._layers[l]['feature']['properties'];
        adLookup[props['prov_c']] = props['prov_n'];        
    }
    for (l in maplayers['District']._layers) {
        props = maplayers['District']._layers[l]['feature']['properties'];
        adLookup[props['dis_c']] = props['dis_n'];        
    }
    for (l in maplayers['DSD']._layers) {
        props = maplayers['DSD']._layers[l]['feature']['properties'];
        adLookup[props['dsd_c']] = props['dsd_n'];        
    }    
}

