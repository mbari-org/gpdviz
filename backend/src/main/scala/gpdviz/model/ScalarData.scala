package gpdviz.model

case class ScalarData(vars: List[String], vals: List[Double], position: Option[LatLon] = None)
