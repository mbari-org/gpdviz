package gpdviz.model.test2ts

import gpdviz.model.{LatLon, ScalarData}

//case class TsLatLon(lat: Double, lon: Double)
//
//case class TsScalarData(vars: List[String], vals: List[Double], position: Option[TsLatLon] = None)

case class TsSensorSystem(
    sysid:         String,
    name:          Option[String] = None,
    description:   Option[String] = None,
    pushEvents:    Boolean = true,
    center:        Option[LatLon] = None,
    zoom:          Option[Int] = None,
    clickListener: Option[String] = None,
    streams:       Map[String, TsDataStream] = Map.empty,
)

case class TsDataStream(
    strid:        String,
    name:         Option[String] = None,
    description:  Option[String] = None,
    mapStyle:     Option[String] = None,
    zOrder:       Int = 0,
    chartStyle:   Option[String] = None,
    variables:    Option[List[TsVariableDef]] = None,
    observations: Option[Map[String, List[TsObsData]]] = None,
)

case class TsVariableDef(
    name:       String,
    units:      Option[String] = None,
    chartStyle: Option[String] = None,
)

case class TsObsData(
    feature:    Option[String] = None,
    geometry:   Option[String] = None,
    scalarData: Option[ScalarData] = None,
)
