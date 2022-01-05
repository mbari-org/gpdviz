const debug = window.location.search.match(/.*debug=.*\bmap\b.*/)

export { setupLLMap }

import * as L from 'leaflet'
import * as esri from 'esri-leaflet/dist/esri-leaflet'
import * as esriVector from 'esri-leaflet-vector/dist/esri-leaflet-vector'
import localConfig from './localConfig.js'

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

  const esriImagery = esriVector.vectorBasemapLayer('ArcGIS:ArcGIS:Imagery', {
    apikey: localConfig.esriApikey,
  })

  const esriStreets = esriVector.vectorBasemapLayer('ArcGIS:Streets', {
    apikey: localConfig.esriApikey,
  })

  // as seen in https://ihcantabria.github.io/Leaflet.CanvasLayer.Field/example_ScalarField_Geotiff_WCS.html
  const dark = L.tileLayer(
    'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_nolabels/{z}/{x}/{y}.png',
    {
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
    }
  )

  const empty = L.tileLayer('', { opacity: 0 })

  const baseLayers = {
    'ArcGIS:Streets': esriStreets,
    'Dark Layer (CARTO)': dark,
    'Empty': empty,
    'OpenStreetMap': osmLayer,
    'ESRI Oceans': esriOceansLayer,
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

  if (map) {
    map.setView(center, zoom)
  }

  const circle = L.circle([36.82, -122.0], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500,
  }).addTo(map)

  // esriImagery.addTo(map);
  esriOceansLayer.addTo(map)

  // esriStreets.addTo(map);

  function sensorSystemAdded(center, zoom) {
    console.debug('sensorSystemAdded: center=', center)
    // clearMarkers();
    setView(center, zoom)
  }

  function setView(center, zoom) {
    map.setView([center[0], center[1]], zoom)
  }

  prepareAdjustMapUponWindowResize(mapid, map)

  return {
    sensorSystemAdded,
    // sensorSystemDeleted,
    // addDataStream,
    // deleteDataStream,
    // addVariableDef,
    // addGeoJson,
    // addObsScalarData,
    // addSelectionPoint,
    setView,
  }
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
      map.invalidateSize({ debounceMoveend: true })
    }, map)
  }

  setTimeout(function () {
    updateWindowSize()
    window.addEventListener('resize', updateWindowSize)
  }, 0)
}
