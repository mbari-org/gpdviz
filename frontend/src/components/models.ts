import { IDataStream, IScalarData, JsonValue } from 'components/genmodel'

export interface LLMap {
  sensorSystemAdded(center: number[], zoom: number): void

  setView(center: number[], zoom?: number): void

  addDataStream(str: IDataStream): void

  addGeoJson(strid: string, timeMs: number, geoJson: JsonValue): void

  addObsScalarData(strid: string, timeMs: number, scalarData: IScalarData): void

  addSelectionPoint(p?: number[]): void
}
