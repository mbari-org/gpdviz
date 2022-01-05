package gpdviz.model

import com.cloudera.science.geojson.Feature
import com.esri.core.geometry.Geometry
import io.swagger.annotations.ApiModelProperty
import spray.json.JsValue

import scala.annotation.meta.field

case class SensorSystem(
    sysid:         String,
    name:          Option[String] = None,
    description:   Option[String] = None,
    pushEvents:    Boolean = true,
    center:        Option[LatLon] = None,
    zoom:          Option[Int] = None,
    clickListener: Option[String] = None,
    streams:       Map[String, DataStream] = Map.empty,
)

case class DataStream(
    strid:       String,
    name:        Option[String] = None,
    description: Option[String] = None,
    @(ApiModelProperty @field)(dataType = "object")
    mapStyle: Option[JsValue] = None,
    zOrder:   Int = 0,
    @(ApiModelProperty @field)(dataType = "object")
    chartStyle:   Option[JsValue] = None,
    variables:    Option[List[VariableDef]] = None,
    observations: Option[Map[String, List[ObsData]]] = None,
)

case class VariableDef(
    name:  String,
    units: Option[String] = None,
    @(ApiModelProperty @field)(dataType = "object")
    chartStyle: Option[JsValue] = None,
)

case class ObsData(
    @(ApiModelProperty @field)(dataType = "object")
    feature: Option[Feature] = None,
    @(ApiModelProperty @field)(dataType = "object")
    geometry:   Option[Geometry] = None,
    scalarData: Option[ScalarData] = None,
)

case class SensorSystemSummary(
    sysid:       String,
    name:        Option[String] = None,
    description: Option[String] = None,
    pushEvents:  Option[Boolean] = None,
    center:      Option[LatLon] = None,
    zoom:        Option[Int] = None,
    streamIds:   Set[String] = Set.empty,
)

case class DataStreamSummary(sysid: String, strid: String)

case class VariableDefSummary(
    sysid: String,
    strid: String,
    name:  String,
    units: Option[String] = None,
)

case class ObservationsSummary(
    sysid:   String,
    strid:   String,
    time:    Option[String] = None,
    added:   Option[Int] = None,
    removed: Option[Int] = None,
)

case class LatLon(lat: Double, lon: Double)

case class ScalarData(vars: List[String], vals: List[Double], position: Option[LatLon] = None)

case class VmSensorSystem(
    sysid:         String,
    name:          Option[String] = None,
    description:   Option[String] = None,
    streams:       List[VmDataStream] = List.empty,
    center:        Option[LatLon] = None,
    zoom:          Option[Int] = None,
    clickListener: Option[String] = None,
)

case class VmVariableDef(
    name:       String,
    units:      Option[String] = None,
    chartStyle: Option[String] = None,
)

case class VmDataStream(
    strid:        String,
    name:         Option[String] = None,
    description:  Option[String] = None,
    mapStyle:     Option[String] = None,
    zOrder:       Int = 0,
    variables:    Option[List[VmVariableDef]] = None,
    chartStyle:   Option[String] = None,
    observations: Option[Map[String, List[VmObsData]]] = None,
)

case class VmObsData(
    feature:    Option[String],
    geometry:   Option[String],
    scalarData: Option[ScalarData],
)
