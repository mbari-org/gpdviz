import { IDataStream, IScalarData, JsonValue } from 'components/genmodel'
import { setupLLMap } from 'src/map/llmap_js'
import { positionsByTime } from 'src/map/PositionsByTime'

// convenience while llmap_js.js is morphed into TS under the LLMap class below.
interface ILLMap {
  sensorSystemAdded(center: number[], zoom: number): void

  sensorSystemDeleted(): void

  setView(center: number[], zoom?: number): void

  addDataStream(str: IDataStream): void

  addGeoJson(strid: string, timeMs: number, geoJson: JsonValue): void

  addObsScalarData(strid: string, timeMs: number, scalarData: IScalarData): void

  addSelectionPoint(p?: number[]): void
}

export interface ClickEvent {
  lat: number
  lon: number
  shiftKey: boolean
  altKey: boolean
  metaKey: boolean
}

export class LLMap {
  _llmap: ILLMap

  _clickListener?: (clickEvent: ClickEvent) => void

  constructor(center: number[], zoom: number) {
    this._clickListener = undefined

    const hoveredPoint = (p?: { [key: string]: unknown }) => {
      if (p) {
        const strid = p['strid'] as string
        const x = p['x'] as number
        //val y = p("y").asInstanceOf[Double].toLong
        //val isoTime = p("isoTime").asInstanceOf[String]
        //console.log("hoveredPoint: p=" + p + " x=" +x+ " strid=" + strid)

        const latLon = positionsByTime.get(strid, x)
        if (latLon) {
          this._llmap.addSelectionPoint([latLon.lat, latLon.lon])
        }
      }
    }

    const clickHandler = (clickEvent: ClickEvent) => {
      if (this._clickListener) {
        this._clickListener(clickEvent)
      }
    }
    // TODO
    const includeGoogleMap = false
    const mouseOutside = () => this._llmap?.addSelectionPoint()

    this._llmap = setupLLMap(
      'mapid',
      center,
      zoom,
      hoveredPoint,
      mouseOutside,
      clickHandler,
      includeGoogleMap
    )
  }

  setClickListener(listener: (clickEvent: ClickEvent) => void) {
    this._clickListener = listener
  }

  sensorSystemAdded(center: number[], zoom: number) {
    this._llmap.sensorSystemAdded(center, zoom)
  }

  sensorSystemDeleted() {
    this._llmap.sensorSystemDeleted()
  }

  setView(center: number[], zoom?: number) {
    this._llmap.setView(center, zoom)
  }

  addDataStream(str: IDataStream) {
    this._llmap.addDataStream(str)
  }

  addGeoJson(strid: string, timeMs: number, geoJson: JsonValue) {
    this._llmap.addGeoJson(strid, timeMs, geoJson)
  }

  addObsScalarData(strid: string, timeMs: number, scalarData: IScalarData) {
    this._llmap.addObsScalarData(strid, timeMs, scalarData)
  }

  addSelectionPoint(p?: number[]) {
    this._llmap.addSelectionPoint(p)
  }
}
