import { IDataStream, IScalarData, JsonValue } from 'components/genmodel'
import { setupLLMap } from 'src/map/llmap_js'

// convenience while llmap_js.js is morphed into TS under the LLMap class below.
interface ILLMap {
  sensorSystemAdded(center: number[], zoom: number): void

  setView(center: number[], zoom?: number): void

  addDataStream(str: IDataStream): void

  addGeoJson(strid: string, timeMs: number, geoJson: JsonValue): void

  addObsScalarData(strid: string, timeMs: number, scalarData: IScalarData): void

  addSelectionPoint(p?: number[]): void
}

export class LLMap {
  //extends ILLMap {
  _llmap: ILLMap

  constructor(center: number[], zoom: number) {
    // TODO
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const hoveredPoint = () => {}
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const clickHandler = () => {}
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

  sensorSystemAdded(center: number[], zoom: number) {
    this._llmap.sensorSystemAdded(center, zoom)
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
