package gpdviz.config

case class GpdvizCfg(
    serverName:    String = "my_gpdviz",
    externalUrl:   String = "http://localhost:5050",
    httpInterface: String = "0.0.0.0",
    httpPort:      Int = 5050,
    map:           MapCfg = MapCfg(),
    pusher:        Option[PusherCfg] = None,
) {
  object gpdviz {
    val version: String = "0.5.0" // from reference.conf
  }
}

case class MapCfg(
    center:          LatLonCfg = LatLonCfg(36.79, -122.02),
    zoom:            Int = 11,
    googleMapApiKey: Option[String] = None,
)

case class LatLonCfg(
    lat: Double,
    lon: Double,
)

case class PusherCfg(
    appId:  String,
    key:    String,
    secret: String,
)
