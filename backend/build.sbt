scalaVersion     := "2.12.8"
//scalaVersion     := "2.13.7"
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
      "com.typesafe.slick" %% "slick" % "3.2.1",
      "com.typesafe.slick" %% "slick-hikaricp" % "3.2.1",
      "com.github.tminglei" %% "slick-pg" % "0.15.4",
      "com.github.tminglei" %% "slick-pg_spray-json" % "0.15.4",
      "com.typesafe.akka" %% "akka-http" % "10.0.10",
      "com.typesafe.akka" %% "akka-http-spray-json" % "10.0.10",
      "com.typesafe.akka" %% "akka-http-testkit" % "10.0.10",
      "ch.megard" %% "akka-http-cors" % "0.2.2",
      "com.github.swagger-akka-http" %% "swagger-akka-http" % "0.11.0",
      "com.esri.geometry" % "esri-geometry-api" % "1.2.1",
      "com.lihaoyi" %% "pprint" % "0.5.2",
      "com.outr" %% "scribe" % "3.6.7",
      "org.scalatest" %% "scalatest" % "3.0.3" % Test,
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
