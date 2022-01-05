import Dependencies._

scalaVersion     := "2.12.8"
version          := "0.1.0-SNAPSHOT"
organization     := "org.mbari"
organizationName := "mbari"

lazy val root = (project in file("."))
  .enablePlugins(ScalaTsiPlugin)
  .settings(
    name := "gpdviz",
    libraryDependencies ++= Seq(
      slick,
      slickHikaricp,
      slickPg,
      slickPgSprayJson,
      akkaHttp,
      akkaHttpSprayJson,
      akkaHttpTestKit,
      akkaHttpCors,
      akkaHttpSwagger,
      eriGeometry,
      scalaLogging,
      pprint,
      upickle,
      scalaTest % Test,
    ),

    // The classes that you want to generate typescript interfaces for
    typescriptExports := Seq(
//      "SensorSystem",
//      "Feature",
//      "Geometry",
//      "JsValue",
      // alas, scala-tsi would hang forever dealing with the above

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
//      "com.cloudera.science.geojson._",
//      "com.esri.core.geometry._",
//      "spray.json._",
    )
  )
