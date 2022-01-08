import { LLMap } from 'src/map/LLMap'
import {
  ISensorSystem,
  IDataStream,
  IObsData,
  Notif,
  JsonValue,
} from 'components/genmodel'
// import {Ref, ref} from 'vue'

import each from 'lodash/each'
import keys from 'lodash/keys'
import cloneDeep from 'lodash/cloneDeep'
import sortBy from 'lodash/sortBy'

const debug = /.*debug=.*\bdebug\b.*/.exec(window.location.search)

// ss: Ref<ISensorSystem> in the type and
// this.ss = ref<ISensorSystem>({sysid, pushEvents: true, streams: {}})
// in the constructor, make Typescript unhappy :(
//    "Type instantiation is excessively deep and possibly infinite"

export class VModel {
  sysid: string
  llmap: LLMap
  // ss: Ref<ISensorSystem>
  ss: ISensorSystem

  constructor(sysid: string, llmap: LLMap) {
    this.sysid = sysid
    this.llmap = llmap
    // this.ss = ref<ISensorSystem>({sysid, pushEvents: true, streams: {}})
    this.ss = { sysid, pushEvents: true, streams: {} }
    console.debug(`constructed VModel: sysid='${sysid}'`)
  }

  handleNotification(notif: Notif) {
    console.debug('VModel: handleNotification: notif=', notif)
    switch (notif.type) {
      case 'SensorSystemAdded':
        // TODO
        break
      case 'SensorSystemDeleted':
        // TODO
        break
      case 'SensorSystemUpdated':
        // TODO
        break
      case 'SensorSystemRefresh':
        // TODO
        break
      case 'DataStreamAdded':
        // TODO
        break
      case 'DataStreamDeleted':
        // TODO
        break
      case 'VariableDefAdded':
        // TODO
        break
      case 'ObservationsAdded':
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
    str: IDataStream,
    obsMap: { [key: string]: IObsData[] }
  ) {
    // TODO remove selective logging
    if (str.strid === 'boundary_polygon')
    console.debug('addObservationsToMap:', 'obsMap=', cloneDeep(obsMap))

    const sortedTimeIsos = sortBy(keys(obsMap))

    each(sortedTimeIsos, timeIso => {
      const obss = obsMap[timeIso]
      const timeMs = new Date(timeIso).getTime()
      each(obss, obs => {
        if (obs.feature) {
          this.llmap.addGeoJson(str.strid, timeMs, obs.feature)
        }
        if (obs.geometry) {
          this.llmap.addGeoJson(str.strid, timeMs, obs.geometry)
        }
        if (obs.scalarData) {
          // if (str.strid === 'boundary_polygon')
          //   console.debug('call addObsScalarData:', cloneDeep(obs.scalarData))
          this.llmap.addObsScalarData(str.strid, timeMs, obs.scalarData)

          // TODO
          // scalarData.position foreach { position ⇒
          //   PositionsByTime.set(str.strid, timeMs, position)
          // }
        }
      })
    })
  }

  refreshSystem(vss: ISensorSystem) {
    console.debug('refreshSystem: vss=', vss)
    this.ss = vss
    // this.ss.value = vss

    if (vss.center) {
      const c = [vss.center.lat, vss.center.lon]
      this.llmap.setView(c, vss.zoom)
    }

    each(vss.streams, (str, strid) => {
      this.addAbsoluteChartIfSo(strid, str.chartStyle)
      this.addStreamToMap(str)
      if (str.observations) {
        this.addObservationsToMap(str, str.observations)
      }
    })
  }
}
