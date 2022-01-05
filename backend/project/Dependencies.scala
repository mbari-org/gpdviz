import sbt._

object Dependencies {
  lazy val slick = "com.typesafe.slick" %% "slick" % "3.2.1"
  lazy val slickHikaricp = "com.typesafe.slick" %% "slick-hikaricp" % "3.2.1"

  lazy val slickPg = "com.github.tminglei" %% "slick-pg" % "0.15.4"
  lazy val slickPgSprayJson = "com.github.tminglei" %% "slick-pg_spray-json" % "0.15.4"

  lazy val akkaHttp = "com.typesafe.akka" %% "akka-http" % "10.0.10"
  lazy val akkaHttpSprayJson = "com.typesafe.akka" %% "akka-http-spray-json" % "10.0.10"
  lazy val akkaHttpTestKit = "com.typesafe.akka" %% "akka-http-testkit" % "10.0.10"
  lazy val akkaHttpCors = "ch.megard" %% "akka-http-cors" % "0.2.2"
  lazy val akkaHttpSwagger = "com.github.swagger-akka-http" %% "swagger-akka-http" % "0.11.0"

  lazy val eriGeometry = "com.esri.geometry" % "esri-geometry-api" % "1.2.1"

  lazy val pprint = "com.lihaoyi" %% "pprint" % "0.5.2"
  lazy val upickle = "com.lihaoyi" %% "upickle" % "0.4.4"

  lazy val scalaLogging = "com.typesafe.scala-logging" %% "scala-logging" % "3.7.2"

  lazy val scalaTest = "org.scalatest" %% "scalatest" % "3.0.3"
}
