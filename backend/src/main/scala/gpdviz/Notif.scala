package gpdviz

import gpdviz.model.{LatLon, ScalarData, VmDataStream, VmObsData, VmVariableDef}
import gpdviz.server.GpdvizJsonImplicits
import spray.json._

object MyJsonProtocol extends GpdvizJsonImplicits {
  implicit val fVmObsData: RootJsonFormat[VmObsData] = jsonFormat3(VmObsData.apply)
  implicit val fObservationsAdded: RootJsonFormat[ObservationsAdded] = jsonFormat4(
    ObservationsAdded,
  )

  implicit val fSensorSystemAdded: RootJsonFormat[SensorSystemAdded] = jsonFormat7(
    SensorSystemAdded,
  )
  implicit val fVmVariableDef: RootJsonFormat[VmVariableDef] = jsonFormat3(VmVariableDef)
  implicit val fVariableDefAdded: RootJsonFormat[VariableDefAdded] = jsonFormat4(VariableDefAdded)
  implicit val fVmDataStream: RootJsonFormat[VmDataStream] = jsonFormat8(VmDataStream)
  implicit val fDataStreamDeleted: RootJsonFormat[DataStreamDeleted] = jsonFormat3(
    DataStreamDeleted,
  )
  implicit val fSensorSystemUpdated: RootJsonFormat[SensorSystemUpdated] = jsonFormat2(
    SensorSystemUpdated,
  )
  implicit val fSensorSystemRefresh: RootJsonFormat[SensorSystemRefresh] = jsonFormat2(
    SensorSystemRefresh,
  )
  implicit val fSensorSystemDeleted: RootJsonFormat[SensorSystemDeleted] = jsonFormat2(
    SensorSystemDeleted,
  )
  implicit val fDataStreamAdded: RootJsonFormat[DataStreamAdded] = jsonFormat3(DataStreamAdded)
}

import MyJsonProtocol._

sealed trait Notif {
  def sysid: String
  def toJsonString: String
}

case class SensorSystemAdded(
    sysid:         String,
    name:          Option[String],
    description:   Option[String],
    center:        Option[LatLon],
    zoom:          Option[Int],
    clickListener: Option[String],
    `type`:        String = "SensorSystemAdded",
) extends Notif {
  def toJsonString: String = this.toJson.compactPrint
}

case class DataStreamAdded(
    sysid:  String,
    str:    VmDataStream,
    `type`: String = "DataStreamAdded",
) extends Notif {
  def toJsonString: String = this.toJson.compactPrint
}

case class VariableDefAdded(
    sysid:  String,
    strid:  String,
    vd:     VmVariableDef,
    `type`: String = "VariableDefAdded",
) extends Notif {
  def toJsonString: String = this.toJson.compactPrint
}

case class ObservationsAdded(
    sysid:  String,
    strid:  String,
    obss:   Map[String, List[VmObsData]],
    `type`: String = "ObservationsAdded",
) extends Notif {
  def toJsonString: String = this.toJson.compactPrint
}

case class DataStreamDeleted(
    sysid:  String,
    strid:  String,
    `type`: String = "DataStreamDeleted",
) extends Notif {
  def toJsonString: String = this.toJson.compactPrint
}

case class SensorSystemUpdated(
    sysid:  String,
    `type`: String = "SensorSystemUpdated",
) extends Notif {
  def toJsonString: String = this.toJson.compactPrint
}

case class SensorSystemRefresh(
    sysid:  String,
    `type`: String = "SensorSystemRefresh",
) extends Notif {
  def toJsonString: String = this.toJson.compactPrint
}

case class SensorSystemDeleted(
    sysid:  String,
    `type`: String = "SensorSystemDeleted",
) extends Notif {
  def toJsonString: String = this.toJson.compactPrint

}
