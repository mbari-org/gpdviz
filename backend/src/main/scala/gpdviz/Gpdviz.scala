package gpdviz

import fansi.Color._
import gpdviz.config.configFile
import gpdviz.data.DbFactory
import gpdviz.server.GpdvizServer

import scala.concurrent.ExecutionContext.Implicits.global

object Gpdviz {
  def main(args: Array[String]): Unit = {
    if (args.contains("generate-conf")) {
      generateConf(args)
    } else if (args.contains("create-tables")) {
      createTables(args)
    } else if (args.contains("add-some-data")) {
      addSomeData(args)
    } else if (args.contains("import")) {
      importJson(args)
    } else if (args.contains("run-server")) {
      if (!configFile.canRead) {
        System.err.println(Red(s"cannot access $configFile"))
      } else new GpdvizServer().run(keyToStop = !args.contains("-d"))
    } else {
      System.err.println(s"""
           |Usage:
           |   gpdviz generate-conf [--overwrite]
           |   gpdviz create-tables [--drop-first]
           |   gpdviz add-some-data
           |   gpdviz run-server [-d]
        """.stripMargin)
    }
  }

  private def generateConf(args: Array[String]): Unit = {
    if (configFile.exists() && !args.contains("--overwrite")) {
      System.err.println(s"$configFile exists.  Use --overwrite to overwrite")
    } else {
      val conf = scala.io.Source
        .fromInputStream(
          getClass.getClassLoader.getResource("params_template.conf").openStream(),
        )
        .mkString
      import java.nio.charset.StandardCharsets
      import java.nio.file.Files
      val bytes = conf.getBytes(StandardCharsets.UTF_8)
      configFile.getParentFile.mkdirs()
      Files.write(configFile.toPath, bytes)
      println(s"\nConfiguration generated: ${Yellow(configFile.toString)}\n")
    }
  }

  private def createTables(args: Array[String]): Unit = {
    val dbFactory: DbFactory = new DbFactory
    val db = dbFactory.openDb
    dbFactory.createTablesSync(db, dropFirst = args.contains("--drop-first"))
    db.close()
  }

  private def addSomeData(args: Array[String]): Unit = {
    val dbFactory: DbFactory = new DbFactory
    val db = dbFactory.openDb
    dbFactory.addSomeDataSync(db)
    db.close()
  }

  private def importJson(args: Array[String]): Unit = {
    import java.nio.file.Paths
    import java.time.ZoneOffset
    import java.time.format.DateTimeFormatter

    import gpdviz.model.SensorSystem
    import gpdviz.server.GpdvizJsonImplicits

    import scala.concurrent.Await
    import scala.concurrent.duration._
    import scala.util.Failure
    import scala.util.control.NonFatal

    val dataDir = "data/old"

    object getSensorSystemByFilename extends GpdvizJsonImplicits {
      def apply(filename: String): Option[SensorSystem] = {
        val ssPath = Paths.get(dataDir, filename)
        val ssFile = ssPath.toFile
        if (ssFile.exists()) try {
          import spray.json._
          val contents = scala.io.Source.fromFile(ssFile).mkString
          val ss = contents.parseJson.convertTo[SensorSystem]
          Option(replaceTimeMs2iso(ss))
        } catch {
          case NonFatal(e) =>
            println(s"WARN: error trying to load $ssFile: $e")
            None
        }
        else None
      }

      def replaceTimeMs2iso(ss: SensorSystem): SensorSystem = {
        val streams = ss.streams.view.mapValues { ds =>
          val newObss = ds.observations.map { obss =>
            obss.map { case (time, list) =>
              val instant = java.time.Instant.ofEpochMilli(time.toDouble.toLong)
              if (time.startsWith("1")) {
                val odt = java.time.OffsetDateTime.ofInstant(
                  instant,
                  ZoneOffset.of("-00:00"),
                )
                odt.format(DateTimeFormatter.ISO_INSTANT) → list
              } else time → list
            }
          }
          ds.copy(observations = newObss)
        }
        ss.copy(streams = streams.toMap)
      }
    }

    val dataPath = Paths.get(dataDir)
    val files = dataPath.toFile.listFiles.filter(_.getName.endsWith(".ss.json"))
    val systems: Seq[SensorSystem] = files.toSeq flatMap { f =>
      getSensorSystemByFilename(f.getName)
    }

    if (systems.nonEmpty) {
      val dbFactory: DbFactory = new DbFactory
      val db = dbFactory.openDb
      systems foreach { ss =>
        println(s"Importing ${ss.sysid} ...")
        Await.ready(
          db.addSensorSystem(ss) andThen { case Failure(e) =>
            println(s"error adding ${ss.sysid}", e)
          },
          10.seconds,
        )
      }
      db.close()
    } else println(s"No models found under $dataDir")
  }
}
