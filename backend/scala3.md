Upon a quick inspection:

- Slick: [not yet](https://github.com/slick/slick/issues/2177)
- Akka-http and related: [not yet](https://github.com/akka/akka-http/pull/3901),
  but possibly via for3Use213
- 

```
sbt:gpdviz> migrate-libs root
[info]
[info]
[info] Starting to migrate libDependencies for root
[info]
[info] X             : Cannot be updated to scala 3
[info] Valid         : Already a valid version for Scala 3
[info] To be updated : Need to be updated to the following version
[info]
[info] com.typesafe.slick:slick:3.3.3                                      -> X : Contains Macros and is not yet published for Scala 3.
[info] "com.github.swagger-akka-http" %% "swagger-scala-module" % "2.5.2"  -> Valid
[info] "com.fasterxml.jackson.module" %% "jackson-module-scala" % "2.13.1" -> Valid
[info] "org.scalatest" %% "scalatest" % "3.2.10" % "test"                  -> Valid
[info] "com.typesafe.akka" %% "akka-stream-testkit" % "2.6.18"             -> Valid
[info] "com.lihaoyi" %% "pprint" % "0.7.1"                                 -> Valid
[info] "io.swagger.core.v3" % "swagger-jaxrs2-jakarta" % "2.1.12"          -> Valid : Java libraries are compatible.
[info] "com.esri.geometry" % "esri-geometry-api" % "1.2.1"                 -> Valid : Java libraries are compatible.
[info] "jakarta.ws.rs" % "jakarta.ws.rs-api" % "3.0.0"                     -> Valid : Java libraries are compatible.
[info] "com.outr" %% "scribe" % "3.6.7"                                    -> Valid : Other versions are avaialble for Scala 3: "3.6.8"
[info] com.github.tminglei:slick-pg_spray-json:0.20.2                      -> "com.github.tminglei" %% "slick-pg_spray-json" % "0.20.2" cross CrossVersion.for3Use2_13 : It's only safe to use the 2.13 version if it's inside an application.
[info] com.typesafe.slick:slick-hikaricp:3.3.3                             -> "com.typesafe.slick" %% "slick-hikaricp" % "3.3.3" cross CrossVersion.for3Use2_13 : It's only safe to use the 2.13 version if it's inside an application.
[info] com.typesafe.akka:akka-http-spray-json:10.2.7                       -> "com.typesafe.akka" %% "akka-http-spray-json" % "10.2.7" cross CrossVersion.for3Use2_13 : It's only safe to use the 2.13 version if it's inside an application.
[info] com.typesafe.akka:akka-http-testkit:10.2.7                          -> "com.typesafe.akka" %% "akka-http-testkit" % "10.2.7" cross CrossVersion.for3Use2_13 : It's only safe to use the 2.13 version if it's inside an application.
[info] com.github.tminglei:slick-pg:0.20.2                                 -> "com.github.tminglei" %% "slick-pg" % "0.20.2" cross CrossVersion.for3Use2_13 : It's only safe to use the 2.13 version if it's inside an application.
[info] com.typesafe.akka:akka-http:10.2.7                                  -> "com.typesafe.akka" %% "akka-http" % "10.2.7" cross CrossVersion.for3Use2_13 : It's only safe to use the 2.13 version if it's inside an application.
[info] com.github.swagger-akka-http:swagger-enumeratum-module:2.3.0        -> "com.github.swagger-akka-http" %% "swagger-enumeratum-module" % "2.3.0" cross CrossVersion.for3Use2_13 : It's only safe to use the 2.13 version if it's inside an application.
[info] com.github.swagger-akka-http:swagger-akka-http:2.6.0                -> "com.github.swagger-akka-http" %% "swagger-akka-http" % "2.6.0" cross CrossVersion.for3Use2_13 : It's only safe to use the 2.13 version if it's inside an application.
[info] ch.megard:akka-http-cors:1.1.2                                      -> "ch.megard" %% "akka-http-cors" % "1.1.2" cross CrossVersion.for3Use2_13 : It's only safe to use the 2.13 version if it's inside an application.
[info] com.scalatsi:scala-tsi:0.6.0                                        -> "com.scalatsi" %% "scala-tsi" % "0.6.0" cross CrossVersion.for3Use2_13 : It's only safe to use the 2.13 version if it's inside an application.
```

---

```
sbt:gpdviz> migrate-scalacOptions root
[info]
[info] Starting to migrate the scalacOptions in root / [Compile,Test]
[info] Some scalacOptions are set by sbt plugins and don't need to be modified, removed or added.
[info] The sbt plugin should adapt its own scalacOptions for Scala 3
[info]
[info] X       : the option is not available is Scala 3
[info] Renamed : the option has been renamed
[info] Valid   : the option is still valid
[info] Plugin  : the option is related to a plugin, previously handled by migrate-libs
[info]
[info] In configuration Compile:
[info] -Yrangepos -> X
[info] -Xplugin:/Users/carueda/Library/Caches/Coursier/v1/https/repo1.maven.org/maven2/org/scalameta/semanticdb-scalac_2.13.7/4.4.31/semanticdb-scalac_2.13.7-4.4.31.jar -> Plugin
[info] -P:semanticdb:synthetics:on                                                                                                                                       -> Plugin
[info] -P:semanticdb:targetroot:/Users/carueda/github/mbari-org/gpdviz/backend/target/scala-2.13/meta                                                                    -> Plugin
[info]
[info] In configuration Test:
[info] -Yrangepos -> X
[info] -Xplugin:/Users/carueda/Library/Caches/Coursier/v1/https/repo1.maven.org/maven2/org/scalameta/semanticdb-scalac_2.13.7/4.4.31/semanticdb-scalac_2.13.7-4.4.31.jar -> Plugin
[info] -P:semanticdb:synthetics:on                                                                                                                                       -> Plugin
[info] -P:semanticdb:targetroot:/Users/carueda/github/mbari-org/gpdviz/backend/target/scala-2.13/test-meta                                                               -> Plugin
```

---

```
> migrate-syntax root
```
