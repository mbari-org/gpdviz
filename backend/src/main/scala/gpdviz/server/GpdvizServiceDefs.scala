package gpdviz.server

import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport
import com.cloudera.science.geojson.GeoJsonProtocol
import gpdviz.model._
import io.swagger.v3.oas.annotations.media.Schema
import spray.json.{DefaultJsonProtocol, JsObject, RootJsonFormat}

// generic error for now
case class GnError(
    code:      Int,
    msg:       String,
    sysid:     Option[String] = None,
    strid:     Option[String] = None,
    varName:   Option[String] = None,
    timestamp: Option[String] = None,
)

object GnErrorF {

  def sensorSystemDefined(sysid: String): GnError =
    GnError(409, "sensor system already defined", sysid = Some(sysid))

  def sensorSystemUndefined(sysid: String): GnError =
    GnError(404, "sensor system undefined", sysid = Some(sysid))

  def dataStreamDefined(sysid: String, strid: String): GnError =
    GnError(409, "data stream already defined", sysid = Some(sysid), strid = Some(strid))

  def dataStreamUndefined(sysid: String, strid: String): GnError =
    GnError(404, "data stream undefined", sysid = Some(sysid), strid = Some(strid))

  def malformedTimestamp(
      sysid: String,
      strid: String,
      timestamp: Option[String] = None,
      msg: Option[String] = None,
  ): GnError =
    GnError(
      400,
      "malformed ISO-8601 string for timestamp" + msg.map(": " + _).getOrElse(""),
      sysid = Some(sysid),
      strid = Some(strid),
      timestamp = timestamp,
    )
}

case class SensorSystemAdd(
    sysid:       String,
    name:        Option[String] = None,
    description: Option[String] = None,
    @Schema(required = false, implementation = classOf[Boolean])
    pushEvents:    Option[Boolean] = None,
    center:        Option[LatLon] = None,
    zoom:          Option[Int] = None,
    clickListener: Option[String] = None,
)

case class SensorSystemUpdate(
    pushEvents: Option[Boolean] = None,
    center:     Option[LatLon] = None,
    zoom:       Option[Int] = None,
)

case class DataStreamAdd(
    strid:       String,
    name:        Option[String] = None,
    description: Option[String] = None,
    @Schema(required = false, implementation = classOf[JsObject])
    mapStyle:  Option[JsObject] = None,
    zOrder:    Option[Int] = None,
    variables: Option[List[VariableDef]] = None,
    @Schema(required = false, implementation = classOf[JsObject])
    chartStyle: Option[JsObject] = None,
)

case class ObservationsAdd(observations: Map[String, List[ObsData]])

trait GpdvizJsonImplicits extends DefaultJsonProtocol with SprayJsonSupport with GeoJsonProtocol {
  implicit val _llFormat: RootJsonFormat[LatLon] = jsonFormat2(LatLon)

  implicit val _sdFormat: RootJsonFormat[ScalarData] = jsonFormat3(ScalarData)
  implicit val _odFormat: RootJsonFormat[ObsData] = jsonFormat3(ObsData)
  implicit val _oaFormat: RootJsonFormat[ObservationsAdd] = jsonFormat1(ObservationsAdd)
  implicit val _osFormat: RootJsonFormat[ObservationsSummary] = jsonFormat5(ObservationsSummary)

  implicit val _vdFormat: RootJsonFormat[VariableDef] = jsonFormat3(VariableDef)
  implicit val _vdsFormat: RootJsonFormat[VariableDefSummary] = jsonFormat4(VariableDefSummary)

  implicit val _dsAddFormat: RootJsonFormat[DataStreamAdd] = jsonFormat7(DataStreamAdd)
  implicit val _dssFormat: RootJsonFormat[DataStreamSummary] = jsonFormat2(DataStreamSummary)
  implicit val _dsFormat: RootJsonFormat[DataStream] = jsonFormat8(DataStream)

  implicit val _ssAddFormat: RootJsonFormat[SensorSystemAdd] = jsonFormat7(SensorSystemAdd)
  implicit val _ssUpdFormat: RootJsonFormat[SensorSystemUpdate] = jsonFormat3(SensorSystemUpdate)
  implicit val _sssFormat: RootJsonFormat[SensorSystemSummary] = jsonFormat7(SensorSystemSummary)
  implicit val _ssFormat: RootJsonFormat[SensorSystem] = jsonFormat8(SensorSystem)

  implicit val _dbErrorFormat: RootJsonFormat[GnError] = jsonFormat6(GnError)
}
