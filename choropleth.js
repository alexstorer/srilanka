// The future:
// https://github.com/MrMufflon/Leaflet.Coordinates
// 

/********************************************************
* Useful variables *
********************************************************/

if (window.location.href.search('cns.bu.edu')>0) {
    var serverpath = 'http://cns.bu.edu/~storer/srilanka/multilevel/';
} else {
    var serverpath = 'http://localhost:8000/';
}
var mapStatus = {level:"Province"};
var loadPortion = true;
var thisfeature = null;
var blockZoom = false;
var isLoading = {};
var orderedtables = {};
var thise = null;
var parente = null;
var focuscolor = 'purple';
var helpMessage = '';
var opacity_value = 0.6;
var clickedprops = null;
var adLookup = {};
var colorList = ['#660000','#800026','#BD0026','#E31A1C','#FC4E2A','#FD8D3C','#FEB24C','#FED976','#fFEDa0','#ffffcc'];
var edge_weight = 1.5;
/* Where will we hold the active layer? */
var topoLayer = {};
var maplayers = {};

/********************************************************
 * Add Controls *
 ********************************************************/

var legend = L.control({position: 'bottomright'});
var sidebar = L.control.sidebar('sidebar',{'position':'right'});
var info = L.control();
var loaderbox = L.control();
thisscale = L.control.scale();
thisscale.setPosition('topleft');

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function (props) {
    this._div.innerHTML = makeHeader(props);
};

/********************************************************
 * Functions for navigation between regions *
 ********************************************************/

/* Define what layers are above and below were we are */
function above(level) {
    if (level.substr(0,2)=='GN') {
        level = 'GND';
    }
    if (level.substr(0,2)=='DS') {
        level = 'DSD';
    }
    if (level.substr(0,2)=='Di') {
        level = 'District';
    }                
    switch (level) {
    case 'Province':
        return null;
        break;
    case 'District':
        return 'Province';
        break;
    case 'DSD':
        return 'District';
        break;
    case 'GND':
        return 'DSD';
        break;
    }
}

function below(level) {
    if (level.substr(0,2)=='GN') {
        level = 'GND';
    }
    if (level.substr(0,2)=='DS') {
        level = 'DSD';
    }
    if (level.substr(0,2)=='Di') {
        level = 'District';
    }    
    
    switch (level) {
    case 'Province':
        return 'District';
        break;
    case 'District':
        return 'DSD';
        break;
    case 'DSD':
        return 'GND';
        break;
    case 'GND':
        return null;
        break;
    }
}

function getLevelString() {
    level = mapStatus['level'];
    if (level.substr(0,2)=='GN') {
        level = 'GND';
    }
    if (level.substr(0,2)=='DS') {
        level = 'DSD';
    }
    if (level.substr(0,2)=='Di') {
        level = 'District';
    }                
    switch (level) {
    case 'Province':
        return 'Province';
        break;
    case 'District':
        return 'District';
        break;
    case 'DSD':
        return 'DS Division';
        break;
    case 'GND':
        return 'GN Division';
        break;
    }
}

function getFullLevel(level) {
    if (level.substr(0,2)=='GN') {
        level = 'GNDivisions';
    }
    if (level.substr(0,2)=='DS') {
        level = 'DSDivisions';
    }
    if (level.substr(0,2)=='Di') {
        level = 'Districts';
    }
    return level;
}


/* Mess with the sidebar */
function configureSidebar() {
    $('#sidebarbuttons').append('<li class="control"><a class="auplevel" href="#uplevel" role="tab"><i class="fa  fa-arrow-up"></i></a></li>');
    $('#sidebarbuttons').append('<li class="control"><a class="adownlevel" href="#downlevel" role="tab"><i class="fa  fa-arrow-down"></i></a></li>');
    $('#sidebarbuttons').append('<li class="control"><a class="increaseopacity" href="#increase" ><i class="fa fa-circle"></i></a></li>');
    $('#sidebarbuttons').append('<li class="control"><a class="decreaseopacity" href="#decrease" ><i class="fa fa-circle-o"></i></a></li>');
    $('#sidebarbuttons').append('<li class="control"><a class="tileSatellite" href="#" ><i class="fa fa-globe"></i></a></li>');
    $('#sidebarbuttons').append('<li class="control"><a class="tileStreet" href="#" ><i class="fa fa-road"></i></a></li>');
    $('#sidebarbuttons').append('<li class="control"><a class="tileNat" href="#" ><i class="fa fa-map"></i></a></li>');
    $('#sidebarbuttons').append('<li class="control liShowPart" hidden><a class="showPart" href="#" ><span class="fa-stack"><i class="fa mg map-lk fa-2x fa-stack-2x text-muted"></i><i class="fa fa-stack-1x fa-1x fa-puzzle-piece"></i></span></a></li>');
    $('#sidebarbuttons').append('<li class="control liShowWhole"><a class="showWhole" href="#" ><span class="fa-stack"><i class="fa mg map-lk fa-stack-2x"></i></span></a></li>');
    
    //$('#sidebarbuttons').append('<li class="control"><a class="allData" href="#settings" ><i class="fa fa-bar-chart"></i></a></li>');

    // Set up click handlers
    $('.increaseopacity').click(onClickHigherOpacity);
    $('.decreaseopacity').click(onClickLowerOpacity);
    $('.auplevel').click(onClickUpLevel);
    $('.adownlevel').click(onClickDownLevel);
    $('.tileSatellite').click(function () {setTile('Satellite');});
    $('.tileStreet').click(function () {setTile('Streets');});
    $('.tileNat').click(function () {setTile('National Geographic');});
    //$('.revertView').click(function () {revertView();});
    $('.allData').click(function () {getAllData();});
    $('.showWhole').click(function () {
        toggleWhole();        
    });
    $('.showPart').click(function () {
        togglePart();
    });
    
    // Set up message hovers
    $('.increaseopacity').hover(function () {setHelpMessage('<i class="fa fa-circle"></i>: Increase Opacity'); },
                                function () {setHelpMessage('');});
    $('.decreaseopacity').hover(function () {setHelpMessage('<i class="fa fa-circle-o"></i>: Decrease Opacity'); },
                                function () {setHelpMessage('');});
    $('.auplevel').hover(function () {setHelpMessage('<i class="fa fa-arrow-up"></i>: Go to more general administrative level'); },
                         function () {setHelpMessage('');});
    $('.adownlevel').hover(function () {setHelpMessage('<i class="fa fa-arrow-down"></i>: Go to more specific administrative level'); },
                           function () {setHelpMessage('');});
    $('.tileSatellite').hover(function () {setHelpMessage('<i class="fa fa-globe"></i>: Show satellite map'); },
                           function () {setHelpMessage('');});
    $('.tileStreet').hover(function () {setHelpMessage('<i class="fa fa-road"></i>: Show street map'); },
                           function () {setHelpMessage('');});
    $('.tileNat').hover(function () {setHelpMessage('<i class="fa fa-map"></i>: Show National Geographic map'); },
                        function () {setHelpMessage('');});
    $('.mainSidebar').hover(function () {setHelpMessage('<i class="fa fa-bars"></i>: Select a variable'); },
                        function () {setHelpMessage('');});
    $('.allData').hover(function () {setHelpMessage('<i class="fa fa-list-ol"></i>: Show all data for selected region'); },
                        function () {setHelpMessage('');});
    $('.showPart').hover(function () {setHelpMessage('<span class="fa-stack"><i class="fa mg map-lk fa-2x fa-stack-2x text-muted"></i><i class="fa fa-stack-1x fa-1x fa-puzzle-piece"></i></span>: Display only selected region.'); },
                        function () {setHelpMessage('');});
    $('.showWhole').hover(function () {setHelpMessage('<i class="mg map-lk"></i></span>: Display all regions.'); },
                         function () {setHelpMessage('');});
    
    
    
}


/*  */
function activateSidelink(linkclass) {
    link = $('a.'+linkclass);
    p = link.parent();
    p.removeClass('disabled');
    
}

/*  */
function deactivateSidelink(linkclass) {
    link = $('a.'+linkclass);
    p = link.parent();
    p.addClass('disabled');        
}


/* Revert the view */
function revertView() {
    map.setView(L.latLng(7.2,80),9);
}

/* How to display messages in our info box. */
function setHelpMessage(m) {
    helpMessage = m;
    info.update();
}

/* Controllers for Opacity */
function onClickHigherOpacity() {
    //var opacity_value = getMyOpacity();    
    if (opacity_value > 1) {
        return;
    } else {
        opacity_value+=0.2;
        refreshLayer();
        //setMyOpacity(opacity_value + 0.2);
    }

}

function onClickLowerOpacity() {
    if (opacity_value <= 0.0) {
        return;
    } else {        
        opacity_value = opacity_value - 0.2;
        refreshLayer();
    }    
}

/********************************************************
 * Functions to Load Data *
 ********************************************************/

function loadLayer(l) {
    console.log('Loading:'+l);
    showLoader();
    switch(l) {
    case 'DSD':
        // 1.3mb
        isLoading[l] = true;        
        $.getJSON(serverpath+'shape/DSDivisions.json')
            .done(function (data) {addTopoLayer(data,'DSD'); refreshLayer();});
        break;
    case 'DSDivisions':
        // 1.3mb
        isLoading[l] = true;        
        $.getJSON(serverpath+'shape/DSDivisions.json')
            .done(function (data) {addTopoLayer(data,'DSDivisions'); refreshLayer();});
        break;
    case 'GNDivisions':
        // 7.6mb
        isLoading[l] = true;        
        $.getJSON(serverpath+'shape/GNDivisions.json')
            .done(function (data) {addTopoLayer(data,'GNDivisions'); refreshLayer();});
        break;        
        
    case 'Districts':
        // 1.3mb
        isLoading[l] = true;        
        $.getJSON(serverpath+'shape/Districts.json')
            .done(function (data) {addTopoLayer(data,'Districts'); refreshLayer();});
        break;
        
    default:
        klayer = l;
        // console.log('>>>>>>> In loadlayer default:' + l)
        // if ('dsd_c' in clickedprops) {
        //     klayer = 'GN_'+clickedprops['dsd_c'];
        //     console.log('Loading GN');
        // } else if ('dis_c' in clickedprops) {
        //     klayer = 'DS_'+clickedprops['dis_c'];
        //     console.log('Loading DS');
        // } else if ('prov_c' in clickedprops) {
        //     klayer = 'Districts_'+clickedprops['prov_c'];
        //     console.log('Loading District');
        // }
        isLoading[klayer] = true;
        $.getJSON(serverpath+'shape/'+klayer+'.json')
            .done(function (data) {addTopoLayer(data,klayer); refreshLayer(); clearLoad(klayer);});
        break;
    }
}

// Load the data (maybe extend to not load all at once?)
function loadData(dstr) {
    console.log('Loading data');
    showLoader();
    isLoading[dstr] = true;
    switch(dstr) {
    case 'fields':    
    $.getJSON(serverpath+'data/'+dstr+'.json')
            .done(function (d) {eval(dstr + ' = d;'); clearLoad(dstr); populateTables(); refreshLayer(); info.update();});
        break;
    case 'tables':    
        $.getJSON(serverpath+'data/'+dstr+'.json')
            .done(function (d) {eval(dstr + ' = d;'); clearLoad(dstr); populateTables(); refreshLayer(); info.update();});
        break;
    case 'data':    
        $.getJSON(serverpath+'data/'+dstr+'.json')
            .done(function (d) {eval(dstr + ' = d;'); clearLoad(dstr); refreshLayer();});
        break;
    case 'data_full':
        console.log("Loading full data...");
        $.getJSON(serverpath+'data/'+dstr+'.json')
            .done(function (d) {eval('data = d;'); data['full'] = true; clearLoad(dstr); refreshLayer();});
        break;        
        
    default:
        dstr = dstr.toString();
        if (dstr.substr(0,3)=='GN_') {
            dstr = dstr.substr(3);}
        $.getJSON(serverpath+'data/data_'+dstr+'.json')
            .done(function (d) {console.log('>>>>>' + dstr); addGNData(d); clearLoad(dstr); refreshLayer();});
        break;
    }
}

/* Put the GNDs into our master data frame. */
function addGNData(d) {
    for (k in d) {
        data[k] = d[k];
    }
}

// Refresh the current layer

function refreshLayer() {
    try {
        layer = maplayers[mapStatus['level']];
        layer.setStyle(styleX);
        info.update();
    } catch(err) {
        console.log("Can't refresh layer");
    }
}

// Mark loading as complete and clear the loader if it's done
function clearLoad(d) {
    console.log(isLoading)
    console.log('done with '+d);
    delete isLoading[d];
    console.log(isLoading);
    if (_.size(isLoading)==0) {
        hideLoader();
    }
}


/* Load the Tile Layers */
var streets = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
    maxZoom: 13
});

var sat = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom:16
});

var natgeo = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
    maxZoom: 16
});

//var map = L.map('map', {center:[7.2,80],zoom:9,layers: [sat,streets,natgeo]});
var map = L.map('map', {center:[7.2,80],zoom:9,layers: [streets]});

var baseMaps = {
    "Satellite": sat,
    "National Geographic": natgeo,
    "Streets": streets,
};


/* How to change layers programmatically */

function setTile(t) {
    for (i in baseMaps) {map.removeLayer(baseMaps[i])};
    map.addLayer(baseMaps[t]);
}

//L.control.layers(baseMaps).addTo(map);


/********************************************************
 * Handling the loading box *
 ********************************************************/


function hideLoader() {
    $('.loaderbox').hide();
}

function showLoader() {
    $('.loaderbox').show();    
}

// initialize the loader box
function initLoader() {    
    loaderbox.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'loaderbox leaflet-control');
        this.update();
        return this._div;
    };
    loaderbox.update = function () {
        this._div.innerHTML = '<img src="images/loading.gif">';
    }    
    loaderbox.addTo(map);
    mw = $('#map').width();
    mwhalf = Math.round(mw/2);
    $(".loaderbox").css( { "margin-right" : mw });
}

/********************************************************
 * Map Initialization *
 ********************************************************/

initLoader();

var clat = '';
var clon = '';

configureSidebar();
thisscale.addTo(map);
sidebar.addTo(map);


/********************************************************
 * Get Information on clicked items
 ********************************************************/

// get the level of the unit of observation
function getInfo(props) {
    ret = Object();
    if ('dis_n' in props) {
        ret['name'] = props['dis_n'];
        ret['unit'] = 'District';
        ret['parents'] = '<b>Province:</b> ' + adLookup[props['prov_c']];
    }
    if ('prov_n' in props) {
        ret['name'] = props['prov_n'];
        ret['unit'] = 'Province';
    }
    if ('dsd_n' in props) {
        ret['name'] = props['dsd_n'];
        ret['unit'] = 'DS Division';
        ret['parents'] = '<b>Province:</b> ' + adLookup[props['prov_c']];
        ret['parents'] += '\n, <b>District:</b> ' + adLookup[props['dis_c']];
    }
    if ('gnd_n' in props) {
        ret['name'] = props['gnd_n'];
        ret['unit'] = 'GN Division';
        ret['parents'] = '<b>Province:</b> ' + adLookup[props['prov_c']];
        ret['parents'] += '\n, <b>District:</b> ' + adLookup[props['dis_c']];
        ret['parents'] += '\n, <b>DS Division:</b> ' + adLookup[props['dsd_c']];
    }
        
    return ret
};

// Take the properties and construct the header
function makeHeader(props) {
    //header = '<table>'    
    header = '<table>';
    header += '<tr><td><b>Level:</b></td><td>' + getLevelString() + '</td></tr>';
    header += '<tr><td><b>Variable:</b></td><td>' + $('#choosetable :selected').text() + '</td></tr>';
    header += '<tr><td><b>Value:</b></td><td>' + $('#choosefields :selected').text()  + '</td></tr></table><br>';

    pinfo = {};
    if (clickedprops != null) {
        pinfo = getInfo(clickedprops);
        header += '<h4>Selected ' + pinfo['unit'] + ': <b>' + pinfo['name'] + '</b></h4>';}
    else if (mapStatus['level'] != 'Province' && loadPortion) {
        // if nothing is clicked, still get the info to display
        // but only if we're not loading everything
        pinfo = getInfo(getAnyProperties());
    }
    if ('parents' in pinfo) {
        header += '<h5>' + pinfo['parents'] + '</h5>';
    }


    // if we have a message to display, display it
    if (helpMessage.length>0) {
        header += '<h5>' + helpMessage + '</h5>';
        return header;
    }        
    if (jQuery.isEmptyObject(props)) {
        if (clickedprops == null) {
            header += "<h4>Hover over a region</h4>";
        }
    } else {
        if (clickedprops == props && getInfo(props)['unit'] != "GN Division") {
            header += "<h4>Click to see " + below(level) + "s for " + getInfo(clickedprops)['name'] + "</h4>";
        }
        else {
            pinfo = getInfo(props);
            header += '<h4>Click to select ' + pinfo['unit'] + ': ' + pinfo['name'] + '</h4>';
            if ('parents' in pinfo) {
                //header += '<h5>' + pinfo['parents'] + '</h5>';
            }
        }
    }
    
    return header;
};

function getRange() {
    var plotrange = {};
    plotrange['max'] = -1;
    plotrange['min'] = Infinity;
    plotrange['maxraw'] = -1;
    plotrange['minraw'] = Infinity;        
    var currentlayer = maplayers[mapStatus['level']];
    var shapes = currentlayer.getLayers();
    for (l in shapes) {
        var retdata = getData(shapes[l].feature);
        if (retdata['pct']<plotrange['min']) {
            plotrange['min'] = retdata['pct'];
        }
        if (retdata['pct']>plotrange['max']) {
            plotrange['max'] = retdata['pct'];
        }
        if (retdata['raw']<plotrange['minraw']) {
            plotrange['minraw'] = retdata['raw'];
        }
        if (retdata['raw']>plotrange['maxraw']) {
            plotrange['maxraw'] = retdata['raw'];
        }                
    }

    // let's make our 9 break points
    var pctdistance = plotrange['max'] - plotrange['min'];
    var step = Number((pctdistance/10).toPrecision(2));
    if (step > 0) {
        var pctr = _.range(Number(plotrange['min'].toPrecision(2)),Number(plotrange['max'].toPrecision(2)),step);
    }
    var rawdistance = plotrange['maxraw'] - plotrange['minraw'];
    step = Number((rawdistance/10).toPrecision(2));
    if (step > 0) {
        var rawr = _.range(Number(plotrange['minraw'].toPrecision(2)),Number(plotrange['maxraw'].toPrecision(2)),step);
    }

    
    return plotrange;
}

function getAllData() {
    var propdata = {};
    
    if ('gnd_c' in clickedprops ) {
        propdata = data[clickedprops.gnd_c];
    }    
    else if ('dsd_c' in clickedprops ) {
        propdata = data[clickedprops.dsd_c];
    }
    else if ('dis_c' in clickedprops ) {
        propdata = data[clickedprops.dis_c];
    }
    else if ('prov_c' in clickedprops ) {
        propdata = data[clickedprops.prov_c];
    }
    pinfo = getInfo(clickedprops);
    $('#dataview').html('');
    $('#selectedregion').html(pinfo['unit'] + ': <b>' + pinfo['name'] + '</b>');
    $('#dataview').append('<h5><a id="downloadAll">Download all data</a></h5>');
    totalCSV = '';
    myorder = _.pluck(orderedtables,'number');
    for (m in myorder) {
        ind = myorder[m];
        console.log(ind);
        $('#dataview').append('<h4>' + tables[ind]['Title'] + ' <a id="dltable_'+ind+'"><i class="fa fa-download" aria-hidden="true"></i></a></h4>');
        $('#dataview').append('<table class="vtable_'+ind+' table table-bordered table-striped admindata">');
        
        csvContent = '';
        for (j in propdata[ind]) {
            myname = fields[ind][j];
            mydata = propdata[ind][j];
            $('.vtable_'+ind).append('<tr><td>'+myname+'</td><td>'+mydata+'</tr>');
            csvContent = csvContent + pinfo['unit'] + ',' + pinfo['name'] + ',' + tables[ind]['Title'] + ',' + myname + ',' + mydata + '\n';
        }
        $('#dltable_'+ind).attr("href",'data:attachment/csv,' +  encodeURIComponent(csvContent));
        $('#dltable_'+ind).attr("target",'_blank');
        fname = pinfo['unit'] + ' - ' + pinfo['name'] + ' (' + tables[ind]['Title'] + ').csv';
        $('#dltable_'+ind).attr("download",fname);
        totalCSV = totalCSV + csvContent;
        $('#dataview').append('</table>');
    }
    $('#downloadAll').attr("href",'data:attachment/csv,' +  encodeURIComponent(totalCSV));
    $('#downloadAll').attr("target",'_blank');
    fname = pinfo['unit'] + ' - ' + pinfo['name'] + '.csv';
    $('#downloadAll').attr("download",fname);

        
    
}

function getData(feature) {
    try {
        featdata = {};
        if ('gnd_c' in feature.properties ) {
            featdata = data[feature.properties.gnd_c];
        }    
        else if ('dsd_c' in feature.properties ) {
            featdata = data[feature.properties.dsd_c];
        }
        else if ('dis_c' in feature.properties ) {
            featdata = data[feature.properties.dis_c];
        }
        else if ('prov_c' in feature.properties ) {
            featdata = data[feature.properties.prov_c];
        }

        val = $('.selector :selected').attr('value');
        val = $('.selector :selected').attr('value');        
        // stored as 12-3
        //i = val.split('-')[0];
        //j = val.split('-')[1];
        i = $('.selector :selected').attr('value');
        j = $('.fieldselector :selected').attr('value');

        mysum = 0.0;
        mymin = 1/0;
        mymax = 0.0;
        for (featkey in featdata[i]) {
            myname = fields[i][featkey];
            // exclude the Total column
            if (!(myname.startsWith('Total'))) {
                mysum += featdata[i][featkey];
                if (featdata[i][featkey] < mymin) {
                    mymin = featdata[i][featkey] }
                if (featdata[i][featkey] > mymax) {
                    mymax = featdata[i][featkey] }
            }
        }
        retdata = {}
        retdata['sum'] = mysum;
        retdata['raw'] = featdata[i][j];
        retdata['pct'] = 100*(featdata[i][j]+0.0)/mysum;
        retdata['min'] = mymin;
        retdata['max'] = mymax;

        return(retdata); }
    catch(err) {
        console.log(err);
        //console.log('bad bad bad');
        return({});
    }
}


// get opacity depending on something else
function getOpacity(d) {
    return d > 0 ? 0.7 :
	0;
}

function toggleWhole() {
    if (getLevelString(mapStatus['level'])=="GN Division") {
        setHelpMessage('<div class="alert alert-warning" role="alert"><span class="glyphicon glyphicon-alert"></span> Only one group of GN Divisions can be rendered at a time.</div>');
        return;
    }
    $('.liShowWhole').hide(); $('.liShowPart').show(); loadPortion=false;    
    level = mapStatus['level'];
    mapStatus['lastlevel'] = level;
    map.removeLayer(maplayers[level]);
    blockZoom = true;
    console.log('Set block zoom to true');
    setLevel(level);
    refreshLayer();
}


function togglePart() {
    $('.liShowPart').hide(); $('.liShowWhole').show(); loadPortion=true;
    // are we on the same level?    
    level = mapStatus['level'];

    if (level=='Province') {
        return;
    }
    examples = {"Districts": "Districts_2",
                "DSDivisions": "DS_23",
                "GNDivisions":"GN_2312"}
    if (clickedprops != null) {
        // if we've clicked something, show that thing
//        if ('dsd_c' in clickedprops) {
//            klayer = 'GN_'+clickedprops['dsd_c'];
        //        }
        if ('dis_c' in clickedprops) {
            klayer = 'DS_'+clickedprops['dis_c'];
        } else if ('prov_c' in clickedprops) {
            klayer = 'Districts_'+clickedprops['prov_c'];
        }
        map.removeLayer(maplayers[level]);
        setLevel(klayer);
        return;
    }
    if (getFullLevel(level) != getFullLevel(mapStatus['lastlevel'])) {
        console.log('doomed!');
        mapStatus['lastlevel'] = examples[getFullLevel(level)];
    }
    //mapStatus['lastlevel'] = level;    
    map.removeLayer(maplayers[level]);
    setLevel(mapStatus['lastlevel']);
    refreshLayer();    
}


// move up a level
function onClickUpLevel() {
    level = mapStatus['level'];
    mapStatus['lastlevel'] = level;
    if (above(level) != null) {
        map.removeLayer(maplayers[level]);        
        setLevel(above(level));
        refocus = false;
    }
    refreshLayer();
    if (refocus & (parente != null)) {
        returnToFeature(parente);
    }
    info.update();
}

// move down a level
function onClickDownLevel() {
    level = mapStatus['level'];
    if (!loadPortion && below(level)=='GND') {
        setHelpMessage('<div class="alert alert-warning" role="alert"><span class="glyphicon glyphicon-alert"></span> Only one group of GN Divisions can be rendered at a time.  Please click <span class="fa-stack"><i class="fa mg map-lk fa-2x fa-stack-2x text-muted"></i><i class="fa fa-stack-1x fa-1x fa-puzzle-piece"></i></span></div>');        
        return;
    }    
    if (clickedprops==null && below(level)=='GND') {
        setHelpMessage('<div class="alert alert-warning" role="alert"><span class="glyphicon glyphicon-alert"></span> Click a DS Division before moving down a level.</div>');
        return;
    }
    if (clickedprops==null && below(level)=='DSD' && loadPortion) {
        setHelpMessage('<div class="alert alert-warning" role="alert"><span class="glyphicon glyphicon-alert"></span> Click a District before moving down a level.</div>');
        return;
    }

    if (clickedprops==null && below(level)=='District' && loadPortion) {
        setHelpMessage('<div class="alert alert-warning" role="alert"><span class="glyphicon glyphicon-alert"></span> Click a Province before moving down a level.</div>');
        return;
    }
    
    if (below(level) == null) {
        return;
    }
    parente = thise;    
    if (above(level) == null) {
        $('.up_level_control').fadeIn()
    }    
    if (below(level) != null) {
        map.removeLayer(maplayers[level]);
        mapStatus['lastlevel'] = level;        
        setLevel(below(level));
    }    
    refreshLayer();
    info.update();    
}

function setLevel(l) {    
    if (l == 'GND') {        
        currentDS = clickedprops['dsd_c'];
        sampleGN = currentDS.toString()+'000';
        k = 'GN_'+currentDS;
        l = k;
        if (!(sampleGN in data)) {
            loadData(currentDS);
        }
    }

    // We were at GN, and going back to DSD
    if (l == 'DSD' & mapStatus['level'].substring(0,2)=='GN') {
        currentDI = mapStatus['level'].substring(3,5);
        sampleDS = currentDI.toString()+'03';
        k = 'DS_'+currentDI;
        l = k;
        // this shouldn't ever happen?
        if (!(sampleDS in data)) {
            loadData(currentDI);
        }
    }

    // We were at District and going to DSD
    if (l == 'DSD' & mapStatus['level'].substring(0,2)=='Di') {
        if (clickedprops==null) {
            l = 'DSD';
        } else {            
            currentDI = clickedprops['dis_c'];
            sampleDS = currentDI.toString()+'03';
            k = 'DS_'+currentDI;
            l = k;
            // this shouldn't ever happen?        
            //if (!(sampleDS in data)) {
            //    loadData(currentDI);
            //}
        }
    }

    // We were at Province and going to District
    if (l == 'District' & mapStatus['level']=='Province') {
        if (clickedprops==null) {
            l = 'Districts';
        } else {
            currentProv = clickedprops['prov_c'];
            sample = currentProv.toString()+'1';
            k = 'Districts_'+currentProv;
            l = k;
        }
        // we should have loaded all of the district data
        // if (!(sampleDS in data)) {
        //     loadData(currentDI);
        // }
    }    

    // We were at DSD and going to District
    if (l == 'District' & mapStatus['level'].substr(0,2)=='DS') {
        currentProv = mapStatus['level'].substr(3,1);
        sample = currentProv.toString()+'1';
        k = 'Districts_'+currentProv;
        l = k;
        // we should have loaded all of the district data
        // if (!(sampleDS in data)) {
        //     loadData(currentDI);
        // }
    }    
    
    
    // Are we doing the whole map, or a single admin region?
    if (!loadPortion) {
        l = getFullLevel(l);
        if (!('full' in data) && l=='GNDivisions') {
            loadData('data_full');
        }

    }

    
    if (!(l in maplayers)) {
        loadLayer(l);
    } else {
        m = maplayers[l];
        m.addTo(map);
        topoLayer = maplayers[l];
    }    
    
    mapStatus['level'] = l;
    clickedprops = null;
    thisfeature = null;
    deactivateSidelink('allData');
    if (blockZoom) {
        console.log('blocking!');
        blockZoom = false;
    } else {
        zoomToCurrent();
    }
    //maplayers[l].eachLayer(handleLayer);
}


// get color depending on population density value
function getColor(thisdata) {
    d = thisdata['pct'];
    //console.log((thisdata['max']-thisdata['min'])/thisdata['sum']);
    return d > 90 ? '#660000' :
        d > 80 ? '#800026' :
	d > 70  ? '#BD0026' :
	d > 60  ? '#E31A1C' :
	d > 50  ? '#FC4E2A' :
	d > 40  ? '#FD8D3C' :
	d > 30  ? '#FEB24C' :
	d > 20  ? '#FED976' :
	d > 10  ? '#fFEDa0' :        
	'#ffffcc';
}



function styleX(feature) {
    //console.log('styleX on ' + feature.properties['gid']);
    console.log();
    var w;
    // ADD: treat the selected feature differently.
    if (clickedprops != null && feature.properties.gid==clickedprops.gid) {
        console.log('Clickedprops.id: ' + clickedprops.id);
        w = edge_weight*3;
    } else {
        w = edge_weight;
    }
    return {
	weight: w,
	opacity: 0.7,
	fillOpacity: opacity_value,        
	color: 'black',
	dashArray: '3',
	fillColor: getColor(getData(feature))
    };
}

/********************************************************
 * Interacting with features *
 ********************************************************/

// get the properties of an unclicked region
function getAnyProperties() {
    if (topoLayer.getLayer) {
        return topoLayer.getLayers()[0].feature.properties;
    }
}

function highlightFeature(e) {
    var layer = e.target;
    clat = e.latlng.lat.toString().substring(0,5);
    clon = e.latlng.lng.toString().substring(0,5);    

    layer.setStyle({
	weight: 5,
	color: '#666',
	dashArray: ''
	//fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera) {
	layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

function returnToFeature(e) {
    var layer = e.target;
    //clickedFeature(e);
    highlightFeature(e);
    layer.setStyle({
	weight: 5,
	color: focuscolor,
	dashArray: ''
	//fillOpacity: 0.7
    });
    map.fitBounds(e.target.getBounds(), {padding: [50, 50]});
    clickedprops = e.target.feature.properties;
    activateSidelink('allData');
    getAllData();
    thisfeature = e.target._leaflet_id;
    thise = e;
}


function resetHighlight(e) {
    topoLayer.resetStyle(e.target);    
    info.update();
}

function zoomToFeature(e) {
    //clat = e.latlng.lat;
    //clon = e.latlng.lng;
    map.fitBounds(e.target.getBounds());
    map.zoomOut()
}

function zoomToCurrent() {
    console.log('Zooming to current');
    currentlevel = maplayers[mapStatus['level']];
    map.fitBounds(currentlevel.getBounds(),{pan: {duration:2.0}});
}

function clickedFeature(e) {
    lid = e.target._leaflet_id;    
    console.log('Was:'+thisfeature+' Clicked:'+lid);
    map.fitBounds(e.target.getBounds(), {padding: [50, 50]});
    clickedprops = e.target.feature.properties;
    activateSidelink('allData');
    getAllData(); // populate the selected data
    if (lid == thisfeature) {
        resetHighlight(e);
        onClickDownLevel();
        thisfeature = null;
    } else {
        thisfeature = e.target._leaflet_id;
        thise = e;
        refreshLayer();        
    }
    info.update();
}

function getTopoLayer(topoData,k) {
    var tLayer = new L.TopoJSON(topoData, {
        style:styleX        
    });
    maplayers[k] = tLayer;
    maplayers[k].eachLayer(handleLayer);
    clearLoad(k);
}

// get the layer, then add it to the map
function addTopoLayer(topoData,k){
    console.log("Add topo layer!");
    if (k.length==7) {
        console.log('why?');
    }
    getTopoLayer(topoData,k);
    maplayers[k].addTo(map);
    topoLayer = maplayers[k];
}

function handleLayer(layer){
    console.log('handling layer');
    layer.setStyle({
        color:'#655',
        weight:1
    });
    layer.on({
	mouseover: highlightFeature,
	mouseout: resetHighlight,
	click: clickedFeature,
        // contextmenu: function(e){
        //     alert('hi.');
        // }
    });
}

function populateFields(i) {
    $("#choosefields").html('<select class="form-control fieldselector"></select>');
    for (j in fields[i]) {
        console.log(j)
        if (("Omit" in tables[i]) && (j in tables[i]["Omit"])) {
            console.log("Omitting:", fields[i][j]);
        } else {
            $("#choosefields select").append("<option value=" + j + ">" + fields[i][j] +"</option>");
        }
    }
    $('.fieldselector').on("change", function (e) { refreshLayer(); info.update(null) });
    $('.fieldselector').addClass('selectpicker');$('.selectpicker').selectpicker('render');
}

function populateTables() {
    orderedtables = _.sortBy(tables, function (x) {return Number(x['Order'])});
    for (i in orderedtables) {
        t = orderedtables[i];
        $("#choosetable select").append("<option value=" + t['number'] + ">" + t["Title"] +"</option>");
    }
    //$('.selector').on("change", function (e) { refreshLayer(); info.update(null)});
    $('.selector').on("change", function (e) { populateFields($('.selector :selected').val()); info.update(null); refreshLayer(); });
    $('.selector').addClass('selectpicker');$('.selectpicker').selectpicker('render');
    populateFields(0); // initialize the first variable in the table
}

/********************************************************
 * Legend Handling *
 ********************************************************/


legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
	grades = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90,100],
	labels = ['<strong id="legendheader"> Percent </strong>'],
	from, to;

    for (var i = 0; i < grades.length-1; i++) {
	from = grades[i];
	to = grades[i + 1];

	labels.push(
	    '<i style="background:' + getColor({'pct':from + 1}) + '"></i> ' +
		from + (to ? '&ndash;' + to : '+'));
    }

    div.innerHTML = labels.join('<br>');
    return div;
};

legend.update = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
	grades = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90,100],
	labels = ['<strong id="legendheader"> Percent </strong>'],
	from, to;

    for (var i = 0; i < grades.length-1; i++) {
	from = grades[i];
	to = grades[i + 1];

	labels.push(
	    '<i style="background:' + getColor({'pct':from + 1}) + '"></i> ' +
		from + (to ? '&ndash;' + to : '+'));
    }

    div.innerHTML = labels.join('<br>');
    return div;
};

/********************************************************
 * Utility Functions *
 ********************************************************/

function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

function getMyOpacity() {
    return parseFloat($('path.leaflet-clickable').css('fillOpacity'));
}

function getOpacity() {
    return opacity_value;
}


function setMyOpacity(x) {
    refreshLayer();
    //return $('path.leaflet-clickable').css('fillOpacity',x);
    
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Closure
(function() {
  /**
   * Decimal adjustment of a number.
   *
   * @param {String}  type  The type of adjustment.
   * @param {Number}  value The number.
   * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
   * @returns {Number} The adjusted value.
   */
  function decimalAdjust(type, value, exp) {
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // If the value is not a number or the exp is not an integer...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  }

  // Decimal round
  if (!Math.round10) {
    Math.round10 = function(value, exp) {
      return decimalAdjust('round', value, exp);
    };
  }
  // Decimal floor
  if (!Math.floor10) {
    Math.floor10 = function(value, exp) {
      return decimalAdjust('floor', value, exp);
    };
  }
  // Decimal ceil
  if (!Math.ceil10) {
    Math.ceil10 = function(value, exp) {
      return decimalAdjust('ceil', value, exp);
    };
  }
})();


/********************************************************
 * Data Loading *
 ********************************************************/

loadData('fields');
loadData('tables');
loadData('data');

/* Load Topo Layers */
// 584kb
$.getJSON(serverpath+'shape/Provinces.json')
    .done(function (data) {addTopoLayer(data,'Province'); refreshLayer();  zoomToCurrent();});

// 673kb
// $.getJSON(serverpath+'shape/Districts.json')
//     .done(function (data) {getTopoLayer(data,'District'); refreshLayer();});

$.getJSON(serverpath+'data/adLookup.json')
    .done(function (data) {adLookup = data; refreshLayer()});

legend.addTo(map);
info.setPosition('topright');
info.addTo(map);
