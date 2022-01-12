scalaVersion     := "2.13.7"
version          := "0.5.1"
organization     := "org.mbari"
organizationName := "mbari"

val jacksonVersion = "2.13.1"
val swaggerVersion = "2.1.12"

val swaggerDependencies = Seq(
  "jakarta.ws.rs" % "jakarta.ws.rs-api" % "3.0.0",
  "com.github.swagger-akka-http" %% "swagger-akka-http" % "2.6.0",
  "com.github.swagger-akka-http" %% "swagger-scala-module" % "2.5.2",
  "com.github.swagger-akka-http" %% "swagger-enumeratum-module" % "2.3.0",
  "com.fasterxml.jackson.module" %% "jackson-module-scala" % jacksonVersion,
  "io.swagger.core.v3" % "swagger-jaxrs2-jakarta" % swaggerVersion
)

lazy val root = (project in file("."))
  .enablePlugins(BuildInfoPlugin)
  .enablePlugins(ScalaTsiPlugin)
  .settings(
    name := "gpdviz",
    buildInfoKeys := Seq[BuildInfoKey](version),
    buildInfoPackage := "gpdviz",
    libraryDependencies ++= Seq(
      "com.typesafe.slick" %% "slick" % "3.3.3",
      "com.typesafe.slick" %% "slick-hikaricp" % "3.3.3",
      "com.github.tminglei" %% "slick-pg" % "0.20.2",
      "com.github.tminglei" %% "slick-pg_spray-json" % "0.20.2",
      "com.typesafe.akka" %% "akka-http" % "10.2.7",
      "com.typesafe.akka" %% "akka-http-spray-json" % "10.2.7",
      "com.typesafe.akka" %% "akka-http-testkit" % "10.2.7",
      "com.typesafe.akka" %% "akka-stream-testkit" % "2.6.18",
      "ch.megard" %% "akka-http-cors" % "1.1.2",
      "com.esri.geometry" % "esri-geometry-api" % "1.2.1",
      "com.lihaoyi" %% "pprint" % "0.7.1",
      "com.outr" %% "scribe" % "3.6.7",
      "org.scalatest" %% "scalatest" % "3.2.10" % Test,
    ) ++ swaggerDependencies,

    // The classes that you want to generate typescript interfaces for
    typescriptExports := Seq(
      "SensorSystem",
      "SensorSystemSummary",
      "DataStreamSummary",
      "VariableDefSummary",
      "ObservationsSummary",
      "VmSensorSystem",
      "VmVariableDef",
      "VmDataStream",
      "VmObsData",
      "Notif",
      "SensorSystemAdded",
      "DataStreamAdded",
      "VariableDefAdded",
      "ObservationsAdded",
      "DataStreamDeleted",
      "SensorSystemUpdated",
      "SensorSystemRefresh",
      "SensorSystemDeleted"
    ),
    // The output file which will contain the typescript interfaces
    typescriptOutputFile := baseDirectory.value / "genmodel.ts",
    // Include the package(s) of the classes here
    // Optionally import your own TSType implicits to override default default generated
    typescriptGenerationImports := Seq(
      "gpdviz.model._",
      "gpdviz._",
      "gpdviz.model.forts._",
      "ForTypescript._",
    )
  )
