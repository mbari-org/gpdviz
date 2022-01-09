const debug = window.location.search.match(/.*debug=.*\bmap\b.*/)

export {setupLLMap}

import * as L from 'leaflet'
import * as esri from 'esri-leaflet/dist/esri-leaflet'
import * as esriVector from 'esri-leaflet-vector/dist/esri-leaflet-vector'
import localConfig from './localConfig.js'
import Charter from './charter.js'

// TODO remove moment dependency
import moment from 'moment'

import cloneDeep from 'lodash/cloneDeep'
import each from 'lodash/each'
import indexOf from 'lodash/indexOf'
import ldMap from 'lodash/map'

console.debug('localConfig=', localConfig)

function setupLLMap(
  mapid,
  center,
  zoom,
  hoveredPoint,
  mouseOutside,
  clickHandler,
  includeGoogleMap
) {
  if (debug)
    console.debug(
      `setupLLMap: mapid='${mapid}'`,
      `center=`,
      center,
      `zoom=`,
      zoom
    )

  const byStrId = {}

  const osmLayer = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  )

  const esriOceansLayer = esri.basemapLayer('Oceans')

  const esriImagery = esriVector.vectorBasemapLayer('ArcGIS:Imagery', {
    apikey: localConfig.esriApikey,
  })

  // these work, but not really needed:
  // const esriStreets = esriVector.vectorBasemapLayer('ArcGIS:Streets', {
  //   apikey: localConfig.esriApikey,
  // })
  // const esriNavigation = esriVector.vectorBasemapLayer('ArcGIS:Navigation', {
  //   apikey: localConfig.esriApikey,
  // })

  // as seen in https://ihcantabria.github.io/Leaflet.CanvasLayer.Field/example_ScalarField_Geotiff_WCS.html
  const dark = L.tileLayer(
    'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_nolabels/{z}/{x}/{y}.png',
    {
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
    }
  )

  const empty = L.tileLayer('', {opacity: 0})

  const baseLayers = {
    'ESRI Oceans': esriOceansLayer,
    'ArcGIS:Imagery': esriImagery,
    // 'ArcGIS:Streets': esriStreets,
    // 'ArcGIS:Navigation': esriNavigation,
    'Dark Layer (CARTO)': dark,
    'OpenStreetMap': osmLayer,
    'Empty': empty,
  }
  if (includeGoogleMap) {
    baseLayers['Google satellite'] = L.gridLayer.googleMutant({
      type: 'satellite', // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
    })
  }

  const map = L.map(
    mapid
    // {
    //   maxZoom: 12,
    //   layers: [baseLayers[0]]
    // }
  )

  esriOceansLayer.addTo(map)

  if (map) {
    map.setView(center, zoom)
  }

  const markersLayer = new L.LayerGroup();
  const markersLayerMG = new L.LayerGroup();
  markersLayer.addTo(map);

  const controlLayers = L.control.layers(baseLayers).addTo(map)

  let overlayGroupByStreamId = {}

  const selectionGroup = new L.LayerGroup().addTo(map)
  let selectionLatLon = null

  // TODO setMagnifyingGlass
  // TODO setMeasure

  const selectionIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })

  // popupEvents:
  {
    map.on('popupopen', function(e) {
      const strid = e.popup && e.popup._strid;
      const str = strid && byStrId[strid].str;
      const charter = str && byStrId[strid].charter;
      console.warn("popupopen: str=", str, "has-charter=", !!charter);
      if (charter) {
        charter.activateChart();
      }
    });
    map.on('popupclose', function(e) {
      const strid = e.popup && e.popup._strid;
      const str = strid && byStrId[strid].str;
      //console.debug("popupclose: str=", str);
      if (str && byStrId[strid].charter) {
        const charter = byStrId[str.strid].charter;
        //console.debug("popupclose: charter=", charter);
        charter.deactivateChart();
      }
      setTimeout(function() {
        //vm.hoveredPoint = {};
        addSelectionPoint();
      });
    });

    map.on('click', function (e) {
      const shiftKey = e.shiftKey  // e.originalEvent.shiftKey;
      const altKey   = e.altKey  // e.originalEvent.altKey;
      const metaKey  = e.metaKey  // e.originalEvent.metaKey;

      if (debug) console.debug("MAP CLICK: e=", e
        ,"latlng=",   e.latlng
        ,"shiftKey=", shiftKey
        ,"altKey=",   altKey
        ,"metaKey=",  metaKey
      );

      clickHandler({
        lat:       e.latlng.lat,
        lon:       e.latlng.lng,
        shiftKey:  shiftKey,
        altKey:    altKey,
        metaKey:   metaKey
      });
    });
  }

  function markerCreator(geojson, mapStyle) {
    //console.debug(":::::: geojson=", geojson);
    return function() {
      return L.geoJSON(geojson, {
        style: mapStyle,
        pointToLayer: function (feature, latlng) {
          if (!mapStyle.radius) {
            mapStyle.radius = 5;
          }
          return L.circleMarker(latlng, mapStyle);
        }
      });
    }
  }

  function addMarker(strid, createMarker) {
    let marker = createMarker();
    marker.addTo(map);
    byStrId[strid].marker = marker;
    markersLayer.addLayer(marker);

    let group = overlayGroupByStreamId[strid];
    if (!group) {
      group = new L.LayerGroup().addTo(map);
      overlayGroupByStreamId[strid] = group;
      controlLayers.addOverlay(group, strid);
    }
    group.addLayer(marker);

    marker = createMarker();
    markersLayerMG.addLayer(marker);
  }

  function clearMarkers() {
    selectionGroup.clearLayers();
    selectionLatLon = null;

    markersLayer.clearLayers();
    markersLayerMG.clearLayers();
    each(overlayGroupByStreamId, function(group) {
      controlLayers.removeLayer(group);
      map.removeLayer(group);
    });
    overlayGroupByStreamId = {};
  }

  function sensorSystemAdded(center, zoom) {
    console.debug('sensorSystemAdded: center=', center)
    clearMarkers();
    setView(center, zoom)
  }

  function sensorSystemDeleted() {
    clearMarkers();
  }

  function addDataStream(str) {
    // console.debug("addDataStream: str=", cloneDeep(str));

    // REVIEW the following from previous code:
    // initialize observations to empty (stream addition not expected to include any)
    // str.observations = {};

    if (!str.observations) {
      str.observations = {};
    }

    byStrId[str.strid] = {
      str:      str,
      geoJsons: {}
    };
  }

  // TODO
  function deleteDataStream(strid) {
    console.debug("TODO deleteDataStream: strid=", strid)
  }

  function addVariableDef(strid, vd) {
    const str = byStrId[strid] && byStrId[strid].str;
    if (!str) {
      console.warn("addVariableDef: unknown stream by strid=", strid);
      return;
    }

    const variable = {
      name:       vd.name,
      units:      vd.units,
      chartStyle: vd.chartStyle
    };

    if (!str.variables) {
      str.variables = [];
    }
    str.variables.push(variable);
    console.debug("addVariableDef: variable=", cloneDeep(variable));
  }

  function addGeoJson(strid, timeMs, geoJson) {
    // console.debug(`addGeoJson: strid=${strid} timeMs=${timeMs} geoJson=`, geoJson)
    const str = byStrId[strid] && byStrId[strid].str;
    if (!str) {
      console.warn("addGeoJson: unknown stream by strid=", strid);
      return;
    }

    const geoJsonStr = JSON.stringify(geoJson)
    const geoJsonKey = timeMs + "->" + geoJsonStr;
    if (byStrId[strid].geoJsons[geoJsonKey]) {
      console.warn("addGeoJson: already added: strid=", strid, "geoJsonKey=", geoJsonKey);
      return;
    }

    let mapStyle
    if (geoJson.properties && geoJson.properties.style) {
      mapStyle = geoJson.properties.style;
    }
    else {
      mapStyle = str.mapStyle ? cloneDeep(str.mapStyle) : {};
    }

    //console.debug("addGeoJson: timeMs=", timeMs, "geoJson=", geoJson, "mapStyle=", mapStyle);

    byStrId[strid].geoJsons[geoJsonKey] = geoJson;

    addMarker(strid, markerCreator(geoJson, mapStyle));
  }

  function addObsScalarData(strid, timeMs, scalarData) {
    const str = byStrId[strid] && byStrId[strid].str;
    if (!str) {
      console.warn("addObsScalarData: unknown stream by strid=", strid);
      return;
    }
    let charter = byStrId[strid].charter;
    if (!charter) {
      console.log("addObsScalarData: creating charter for strid=", strid);
      charter = byStrId[strid].charter = createCharter(str);
    }

    const indexes = ldMap(scalarData.vars, function (varName) {
      return indexOf(ldMap(str.variables, "name"), varName);
    });
    //console.debug("& indexes=", indexes);
    each(scalarData.vals, function (v, valIndex) {
      const varIndex = indexes[valIndex];
      charter.addChartPoint(varIndex, timeMs, v);
    });

    if (!byStrId[strid].marker) {
      console.warn("addObsScalarData: not marker for strid=", strid);
      return;
    }
    const chartId = "chart-container-" + str.strid;

    // TODO review flags for this
    const useChartPopup = !!str.chartStyle
    // const useChartPopup = str.chartStyle && str.chartStyle.useChartPopup;

    if (useChartPopup) {
      if (byStrId[str.strid].popupInfo) return;
    }
    else if (byStrId[str.strid].absChartUsed) return;

    if (str.chartHeightPx === undefined) {
      str.chartHeightPx = 370;
      if (str.chartStyle && str.chartStyle.height) {
        str.chartHeightPx = str.chartStyle.height;
      }
      //console.debug(str.strid, "str.chartHeightPx=", str.chartHeightPx);
    }

    if (useChartPopup) {
      console.warn("setting popup for stream ", str.strid);
      console.warn(`setting popup chartId=${chartId}`);

      const chartHeightStr = getSizeStr(str.chartHeightPx);
      const minWidthPx = str.chartStyle && str.chartStyle.minWidthPx || 500;
      const minWidthStr = minWidthPx + 'px';

      const chartContainer = '<div id="' + chartId +
        '" style="min-width:' + minWidthStr + ';height:' + chartHeightStr + ';margin:0 auto"></div>';

      const popupInfo = L.popup({
        //autoClose: false, closeOnClick: false
        minWidth: minWidthPx + 50
      });
      popupInfo._strid = str.strid;

      popupInfo.setContent(chartContainer);

      byStrId[str.strid].marker.bindPopup(popupInfo);
      byStrId[str.strid].popupInfo = popupInfo;
    }

    else {
      byStrId[str.strid].absChartUsed = true;
      byStrId[str.strid].marker.on('click', function (e) {

        const idElm = document.getElementById(chartId)
        console.debug("CLICK: idElm=", idElm, " visible=", idElm && idElm.is(":visible"));
        // TODO handle the $ stuff
        // idElm.stop();
        // if (idElm.is(":visible")) {
        //   idElm.fadeOut(700);
        //   setTimeout(charter.deactivateChart, 700);
        // }
        // else {
        //   charter.activateChart();
        //   idElm.fadeIn('fast');
        // }
      });

      // TODO handle the $ stuff
      // $(document).keyup(function (e) {
      //   if (e.keyCode === 27) {
      //     const idElm = $("#" + chartId);
      //     //console.debug("ESC: idElm=", idElm);
      //     idElm.fadeOut(700);
      //     setTimeout(charter.deactivateChart, 700);
      //   }
      // });
    }
  }

  function createCharter(str) {
    return Charter(str, function(point) {
      if (point && point.x) {
        const isoTime = moment.utc(point.x).format();
        //console.debug("hovered point=", point, isoTime);
        hoveredPoint({
          strid:   str.strid,
          x:       point.x,
          y:       point.y,
          isoTime: isoTime
        });
      }
    }, mouseOutside);
  }

  function addSelectionPoint(p) {
    // console.debug("addSelectionPoint: p=", p);
    if (!p) {
      selectionGroup.clearLayers();
      selectionLatLon = null;
      return;
    }

    const newLatLon = [p[0], p[1]];

    if (selectionLatLon &&
      selectionLatLon[0] === newLatLon[0] &&
      selectionLatLon[0] === newLatLon[0]) {
      return;
    }

    selectionGroup.clearLayers();
    selectionLatLon = newLatLon;

    // console.debug("addSelectionPoint: p=", p);

    if (true) {
      // ad hoc for front tracking
      const circle = L.circle(newLatLon, {
        radius: 300,
        stroke: 2,
        color: "gray",
        weight: 1,
        fillOpacity: 0.1
      }).addTo(map);
      selectionGroup.addLayer(circle);
    }

    const marker = L.marker(newLatLon, {
      keyboard: false,
      icon: selectionIcon,
      riseOnHover: true,
      opacity: 0.9
    }).addTo(map);
    selectionGroup.addLayer(marker);
  }

  function setView(center, zoom) {
    map.setView([center[0], center[1]], zoom)
  }

  function setZoom(zoom) {
    map.setZoom(zoom);
  }

  prepareAdjustMapUponWindowResize(mapid, map)




  return {
    sensorSystemAdded,
    sensorSystemDeleted,
    addDataStream,
    deleteDataStream,
    addVariableDef,
    addGeoJson,
    addObsScalarData,
    addSelectionPoint,
    setView,
  }
}

function getSizeStr(size) {
  return typeof size === 'number' ? size + 'px' : size;
}

function prepareAdjustMapUponWindowResize(mapid, map) {
  const mapContainer = document.getElementById(mapid)
  // console.debug('mapContainer=', mapContainer);
  const minHeight = 350
  const marginBottom = 5

  function updateWindowSize() {
    const rect = mapContainer.getBoundingClientRect()
    if (debug)
      console.debug(
        'getBoundingClientRect=',
        rect.top,
        rect.right,
        rect.bottom,
        rect.left,
        'window.innerHeight=',
        window.innerHeight,
        ' - rect.top=',
        rect.top
      )

    let restWindowHeight = window.innerHeight - rect.top - marginBottom
    if (debug) console.debug('restWindowHeight=', restWindowHeight)

    if (restWindowHeight < minHeight) {
      restWindowHeight = minHeight
    }
    updateMapSize(restWindowHeight)
  }

  function updateMapSize(windowHeight) {
    if (windowHeight) {
      mapContainer.style.setProperty('height', `${windowHeight}px`)
    }
    L.Util.requestAnimFrame(function () {
      map.invalidateSize({debounceMoveend: true})
    }, map)
  }

  setTimeout(function () {
    updateWindowSize()
    window.addEventListener('resize', updateWindowSize)
  }, 0)
}
