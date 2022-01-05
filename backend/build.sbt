import Dependencies._

scalaVersion     := "2.12.8"
version          := "0.5.1"
organization     := "org.mbari"
organizationName := "mbari"

lazy val root = (project in file("."))
  .enablePlugins(BuildInfoPlugin)
  .enablePlugins(ScalaTsiPlugin)
  .settings(
    name := "gpdviz",
    buildInfoKeys := Seq[BuildInfoKey](version),
    buildInfoPackage := "gpdviz",
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
