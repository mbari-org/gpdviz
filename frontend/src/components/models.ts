export interface SysSimple {
  sysid: string
  name: string
  streamIds: string[]
}

export interface System {
  sysid: string
  description?: string
  pushEvents: boolean
  center?: {
    lat: number
    lon: number
  }
}

export interface DataStream {
  strid: string

  observations: Map<string, DataStream[]>
}

export interface LLMap {
  sensorSystemAdded(center: number[], zoom: number): void
}
