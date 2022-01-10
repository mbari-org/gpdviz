import { LLMap } from 'src/map/LLMap'
import {
  IDataStream,
  ILatLon,
  IObsData,
  ISensorSystem,
  IVmDataStream,
  IVmObsData,
  IVmVariableDef,
  JsonValue,
  Notif,
} from 'components/genmodel'

import { positionsByTime } from 'src/map/PositionsByTime'

import each from 'lodash/each'
import keys from 'lodash/keys'
import sortBy from 'lodash/sortBy'
import { Ref } from 'vue'

const debug = /.*debug=.*\bdebug\b.*/.exec(window.location.search)

export class ChartDiv {
  constructor(
    public id: string,
    public heightStr: string,
    public minWidthStr: string
  ) {}
}

// ss: Ref<ISensorSystem> in the type and
// this.ss = ref<ISensorSystem>({sysid, pushEvents: true, streams: {}})
// in the constructor, make Typescript unhappy :(
//    "Type instantiation is excessively deep and possibly infinite"

export class VModel {
  sysid: string
  llmap: LLMap
  ss: Ref<ISensorSystem | null>

  absoluteCharts: Ref<ChartDiv[]>

  constructor(
    sysid: string,
    ss: Ref<ISensorSystem | null>,
    absoluteCharts: Ref<ChartDiv[]>,
    llmap: LLMap
  ) {
    this.sysid = sysid
    this.ss = ss
    this.absoluteCharts = absoluteCharts
    this.llmap = llmap
    console.debug(`constructed VModel: sysid='${sysid}'`)
  }

  handleNotification(notif: Notif) {
    console.debug('VModel: handleNotification: notif=', notif)
    switch (notif.type) {
      case 'SensorSystemAdded': {
        const { name, description, center, zoom, clickListener } = notif
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
        const { str } = notif
        this.dataStreamAdded(str)
        break
      }
      case 'DataStreamDeleted': {
        // TODO
        break
      }
      case 'VariableDefAdded': {
        const { strid, vd } = notif
        this.variableDefAdded(strid, vd)
        break
      }
      case 'ObservationsAdded': {
        const { strid, obss } = notif
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
    console.debug(
      'addAbsoluteChartIfSo: strid=',
      strid,
      'chartStyle=',
      chartStyle
    )
    // if (strid !== 'boundary_polygon') return
    //
    //
    // let obj: { [member: string]: JsonValue } | null = null
    //
    // let useChartPopup = false
    // if (chartStyle) {
    //   obj = chartStyle as { [member: string]: JsonValue }
    //   useChartPopup = obj['useChartPopup'] === true
    // }
    //
    // console.debug('useChartPopup=', useChartPopup)
    // if (useChartPopup) {
    //   return
    // }
    //
    // let chartHeightStr = '270px'
    // let minWidthStr = '500px'
    // if (obj) {
    //   const getValueStr = (name: string, defaultValue: string) => {
    //     const value = obj && obj[name]
    //     if (typeof value === 'string') {
    //       return value
    //     } else if (typeof value === 'number') {
    //       return `${value}px`
    //     } else {
    //       return defaultValue
    //     }
    //   }
    //   chartHeightStr = getValueStr('height', chartHeightStr)
    //   minWidthStr = getValueStr('minWidth', minWidthStr)
    // }
    //
    // const chartId = 'chart-container-' + strid
    // this.absoluteCharts.value.push(
    //   new ChartDiv(chartId, chartHeightStr, minWidthStr)
    // )
    //
    // console.debug(
    //   `strid=${strid} chartHeightStr=${chartHeightStr} minWidthStr=${minWidthStr}`
    // )
  }

  addStreamToMap(str: IDataStream) {
    // TODO remove selective logging
    // if (str.strid === 'boundary_polygon')
    //   console.debug('addStreamToMap: str=', cloneDeep(str))
    this.llmap.addDataStream(str)
  }

  addObservationsToMap(
    strid: string,
    obsMap: { [key: string]: IObsData[] },
    str: IDataStream | undefined = undefined
  ) {
    // TODO remove selective logging
    // if (strid === 'boundary_polygon')
    //   console.debug('addObservationsToMap:', 'obsMap=', cloneDeep(obsMap))

    const sortedTimeIsos = sortBy(keys(obsMap))

    each(sortedTimeIsos, (timeIso) => {
      const obss = obsMap[timeIso]

      if (str) {
        this.addObservationsToStream(str, timeIso, obss)
      }

      const timeMs = new Date(timeIso).getTime()
      each(obss, (obs) => {
        //console.warn('OBS=', JSON.stringify(obs, null, '  '))
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

  addObservationsToStream(str: IDataStream, timeIso: string, obss: IObsData[]) {
    if (!str.observations) {
      str.observations = {}
    }
    str.observations[timeIso] = obss
  }

  refreshSystem() {
    if (!this.ss.value) return
    const vss: ISensorSystem = this.ss.value
    // console.debug('refreshSystem: vss=', vss)

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

  sensorSystemAdded(
    name?: string,
    description?: string,
    center?: ILatLon,
    zoom?: number,
    clickListener?: string
  ) {
    this.ss.value = {
      sysid: this.sysid,
      name,
      description,
      pushEvents: true,
      streams: {},
      center,
      zoom,
      clickListener,
    }
    // console.warn('center=', center)
    if (center) {
      const c = [center.lat, center.lon]
      this.llmap.sensorSystemAdded(c, zoom || 11)
    }
  }

  sensorSystemDeleted() {
    this.ss.value = { sysid: this.sysid, pushEvents: true, streams: {} }
    this.llmap.sensorSystemDeleted()
  }

  dataStreamAdded(str: IVmDataStream) {
    const ss = this.ss.value
    if (!ss) return

    ss.streams[str.strid] = str
    this.addAbsoluteChartIfSo(str.strid, str.chartStyle)
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
    } else {
      console.warn(`variableDefAdded: undefined strid=${strid}`)
    }
  }

  observationsAdded(strid: string, obss: { [key: string]: IVmObsData[] }) {
    const ss = this.ss.value
    if (!ss) return

    const stream = ss.streams[strid]
    if (stream) {
      this.addObservationsToMap(strid, obss, stream)
    } else {
      console.warn(`observationsAdded: undefined strid=${strid}`)
    }
  }
}
