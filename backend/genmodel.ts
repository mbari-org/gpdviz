// DO NOT EDIT: generated file by scala-tsi

export interface IDataStreamAdded {
  sysid: string
  str: IVmDataStream
}

export interface IDataStreamAdded {
  sysid: string
  str: IVmDataStream
  type: "DataStreamAdded"
}

export interface IDataStreamDeleted {
  sysid: string
  strid: string
  type: "DataStreamDeleted"
}

export interface IDataStreamDeleted {
  sysid: string
  strid: string
}

export interface IDataStreamSummary {
  sysid: string
  strid: string
}

export interface ILatLon {
  lat: number
  lon: number
}

export interface IObservationsAdded {
  sysid: string
  strid: string
  obss: { [ key: string ]: IVmObsData[] }
}

export interface IObservationsAdded {
  sysid: string
  strid: string
  obss: { [ key: string ]: IVmObsData[] }
  type: "ObservationsAdded"
}

export interface IObservationsSummary {
  sysid: string
  strid: string
  time?: string
  added?: number
  removed?: number
}

export interface IScalarData {
  vars: string[]
  vals: number[]
  position?: ILatLon
}

export interface ISensorSystemAdded {
  sysid: string
  name?: string
  description?: string
  center?: ILatLon
  zoom?: number
  clickListener?: string
}

export interface ISensorSystemAdded {
  sysid: string
  name?: string
  description?: string
  center?: ILatLon
  zoom?: number
  clickListener?: string
  type: "SensorSystemAdded"
}

export interface ISensorSystemDeleted {
  sysid: string
  type: "SensorSystemDeleted"
}

export interface ISensorSystemDeleted {
  sysid: string
}

export interface ISensorSystemRefresh {
  sysid: string
}

export interface ISensorSystemRefresh {
  sysid: string
  type: "SensorSystemRefresh"
}

export interface ISensorSystemSummary {
  sysid: string
  name?: string
  description?: string
  pushEvents?: boolean
  center?: ILatLon
  zoom?: number
  streamIds: string[]
}

export interface ISensorSystemUpdated {
  sysid: string
  type: "SensorSystemUpdated"
}

export interface ISensorSystemUpdated {
  sysid: string
}

export interface IVariableDefAdded {
  sysid: string
  strid: string
  vd: IVmVariableDef
  type: "VariableDefAdded"
}

export interface IVariableDefAdded {
  sysid: string
  strid: string
  vd: IVmVariableDef
}

export interface IVariableDefSummary {
  sysid: string
  strid: string
  name: string
  units?: string
}

export interface IVmDataStream {
  strid: string
  name?: string
  description?: string
  mapStyle?: string
  zOrder: number
  variables?: IVmVariableDef[]
  chartStyle?: string
  observations?: { [ key: string ]: IVmObsData[] }
}

export interface IVmObsData {
  feature?: string
  geometry?: string
  scalarData?: IScalarData
}

export interface IVmSensorSystem {
  sysid: string
  name?: string
  description?: string
  streams: IVmDataStream[]
  center?: ILatLon
  zoom?: number
  clickListener?: string
}

export interface IVmVariableDef {
  name: string
  units?: string
  chartStyle?: string
}

export type Notif = (ISensorSystemDeleted | IVariableDefAdded | IObservationsAdded | ISensorSystemRefresh | ISensorSystemAdded | IDataStreamDeleted | ISensorSystemUpdated | IDataStreamAdded)
