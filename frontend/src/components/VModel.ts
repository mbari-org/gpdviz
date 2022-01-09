import { LLMap } from 'src/map/LLMap'
import {
  ISensorSystem,
  IDataStream,
  IObsData,
  Notif,
  JsonValue, ILatLon, IVmDataStream, IVmVariableDef, IVmObsData,
} from 'components/genmodel'

import { positionsByTime } from 'src/map/PositionsByTime'

// import {Ref, ref} from 'vue'

import each from 'lodash/each'
import keys from 'lodash/keys'
import cloneDeep from 'lodash/cloneDeep'
import sortBy from 'lodash/sortBy'
import {Ref} from 'vue';

const debug = /.*debug=.*\bdebug\b.*/.exec(window.location.search)

// ss: Ref<ISensorSystem> in the type and
// this.ss = ref<ISensorSystem>({sysid, pushEvents: true, streams: {}})
// in the constructor, make Typescript unhappy :(
//    "Type instantiation is excessively deep and possibly infinite"

export class VModel {
  sysid: string
  llmap: LLMap
  // ss: Ref<ISensorSystem>
  ss: Ref<ISensorSystem | null>

  constructor(sysid: string, ss: Ref<ISensorSystem | null>, llmap: LLMap) {
    this.sysid = sysid
    this.llmap = llmap
    // this.ss = ref<ISensorSystem>({sysid, pushEvents: true, streams: {}})
    // this.ss = { sysid, pushEvents: true, streams: {} }
    this.ss = ss
    console.debug(`constructed VModel: sysid='${sysid}'`)
  }

  handleNotification(notif: Notif) {
    console.debug('VModel: handleNotification: notif=', notif)
    switch (notif.type) {
      case 'SensorSystemAdded': {
        const {name, description, center, zoom, clickListener} = notif
        this.sensorSystemAdded(name, description, center, zoom, clickListener)
        break
      }
      case 'SensorSystemDeleted': {
        this.sensorSystemDeleted()
        break
      }
      case 'SensorSystemUpdated': {
        // TODO (nothing done in previous version)
        break
      }
      case 'DataStreamAdded': {
        const {str} = notif
        this.dataStreamAdded(str)
        break
      }
      case 'DataStreamDeleted': {
        // TODO
        break
      }
      case 'VariableDefAdded': {
        const {strid, vd} = notif
        this.variableDefAdded(strid, vd)
        break
      }
      case 'ObservationsAdded': {
        const {strid, obss} = notif
        this.observationsAdded(strid, obss)
        break
      }
      case 'SensorSystemRefresh': {
        window.location.reload()
        break
      }
    }
  }

  addAbsoluteChartIfSo(strid: string, chartStyle?: JsonValue) {
    if (debug)
      console.debug('addStreamToMap: strid=', strid, 'chartStyle=', chartStyle)
  }

  addStreamToMap(str: IDataStream) {
    // TODO remove selective logging
    if (str.strid === 'boundary_polygon')
      console.debug('addStreamToMap: str=', cloneDeep(str))
    this.llmap.addDataStream(str)
  }

  addObservationsToMap(
    strid: string,
    obsMap: { [key: string]: IObsData[] }
  ) {
    // TODO remove selective logging
    if (strid === 'boundary_polygon')
      console.debug('addObservationsToMap:', 'obsMap=', cloneDeep(obsMap))

    const sortedTimeIsos = sortBy(keys(obsMap))

    each(sortedTimeIsos, (timeIso) => {
      const obss = obsMap[timeIso]
      const timeMs = new Date(timeIso).getTime()
      each(obss, (obs) => {
        if (obs.feature) {
          this.llmap.addGeoJson(strid, timeMs, obs.feature)
        }
        if (obs.geometry) {
          this.llmap.addGeoJson(strid, timeMs, obs.geometry)
        }
        if (obs.scalarData) {
          // if (strid === 'boundary_polygon')
          //   console.debug('call addObsScalarData:', cloneDeep(obs.scalarData))
          this.llmap.addObsScalarData(strid, timeMs, obs.scalarData)

          if (obs.scalarData.position) {
            positionsByTime.set(strid, timeMs, obs.scalarData.position)
          }
        }
      })
    })
  }

  refreshSystem() {
    if (!this.ss.value) return
    const vss: ISensorSystem = this.ss.value
    console.debug('refreshSystem: vss=', vss)

    if (vss.center) {
      const c = [vss.center.lat, vss.center.lon]
      this.llmap.setView(c, vss.zoom)
    }

    each(vss.streams, (str, strid) => {
      this.addAbsoluteChartIfSo(strid, str.chartStyle)
      this.addStreamToMap(str)
      if (str.observations) {
        this.addObservationsToMap(str.strid, str.observations)
      }
    })
  }

  sensorSystemAdded(name?: string, description?: string, center?: ILatLon, zoom?: number, clickListener?: string) {
    this.ss.value = {sysid: this.sysid, name, description, pushEvents: true, streams: {}, center, zoom, clickListener}
    // console.warn('center=', center)
    if (center) {
      const c = [center.lat, center.lon]
      this.llmap.sensorSystemAdded(c, zoom || 11)
    }
  }

  sensorSystemDeleted() {
    this.ss.value = {sysid: this.sysid, pushEvents: true, streams: {}}
    this.llmap.sensorSystemDeleted()
  }

  dataStreamAdded(str: IVmDataStream) {
    const ss = this.ss.value
    if (!ss) return

    ss.streams[str.strid] = str
    // TODO addAbsoluteChartIfSo(str.strid, str.chartStyle)
    this.addStreamToMap(str)
  }

  variableDefAdded(strid: string, vd: IVmVariableDef) {
    const ss = this.ss.value
    if (!ss) return

    const stream = ss.streams[strid]
    if (stream) {
      const newVariables = stream.variables || []
      newVariables.push(vd)
      const updatedStream = stream
      updatedStream.variables = newVariables

      const updatedStreams = ss.streams || {}
      updatedStreams[strid] = updatedStream
    }
    else {
      console.debug(`addVariableDef: undefined strid=${strid}`)
    }
  }

  observationsAdded(strid: string, obss: { [ key: string ]: IVmObsData[] }) {
    this.addObservationsToMap(strid, obss)
  }

}
