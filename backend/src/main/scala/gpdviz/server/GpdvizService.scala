package gpdviz.server

import akka.http.scaladsl.server.{Directives, Route}
import ch.megard.akka.http.cors.scaladsl.CorsDirectives.cors
import gpdviz.model._
import io.swagger.v3.oas.annotations.enums.ParameterIn
import io.swagger.v3.oas.annotations.{Operation, Parameter}
import io.swagger.v3.oas.annotations.media.{Content, Schema}
import io.swagger.v3.oas.annotations.parameters.RequestBody
import io.swagger.v3.oas.annotations.responses.ApiResponse
import jakarta.ws.rs.{Consumes, GET, POST, PUT, DELETE, Path, Produces}
import jakarta.ws.rs.core.MediaType

trait GpdvizService
    extends SsService
    with OneSsService
    with OneStrService
    with VariableDefService
    with ObsService
    with StaticAndAjaxService
    with RootIndexService {

  def routes: Route = {
    cors()(SwaggerSpecService.routes) ~
      swaggerUi ~
      staticAndAjaxRoute ~
      rootIndexRoute ~
      variableDefRoute ~ obsRoute ~ oneStrRoute ~ oneSsRoute ~ ssRoute
  }

  private val swaggerUi: Route =
    path("api-docs") { getFromResource("swaggerui/index.html") } ~
      getFromResourceDirectory("swaggerui")
}

@Produces(Array(MediaType.APPLICATION_JSON))
@Path("/ss")
trait SsService extends GpdvizServiceImpl with Directives {
  def ssRoute: Route = {
    ssAdd ~ ssList
  }

  @POST
  @Consumes(Array(MediaType.APPLICATION_JSON))
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(
    summary = "Register sensor system",
    description = "Register sensor system",
    operationId = "registerSystem",
    tags = Array("sensor system"),
    requestBody = new RequestBody(
      required = true,
      content = Array(new Content(schema = new Schema(implementation = classOf[SensorSystemAdd]))),
    ),
    responses = Array(
      new ApiResponse(
        responseCode = "201",
        content =
          Array(new Content(schema = new Schema(implementation = classOf[SensorSystemSummary]))),
      ),
      new ApiResponse(responseCode = "400", description = "Bad Request"),
      new ApiResponse(responseCode = "409", description = "Sensor system already registered"),
    ),
  )
  def ssAdd: Route = path("api" / "ss") {
    (post & entity(as[SensorSystemAdd])) { ssr =>
      complete {
        addSensorSystem(ssr)
      }
    }
  }

  @GET
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(
    summary = "List all registered sensor systems",
    description = "List all registered sensor systems",
    operationId = "listSystems",
    tags = Array("sensor system"),
    responses = Array(
      new ApiResponse(
        responseCode = "201",
        description = "Echo Enum",
        content = Array(
          new Content(schema = new Schema(implementation = classOf[Array[SensorSystemSummary]])),
        ),
      ),
    ),
  )
  def ssList: Route = path("api" / "ss") {
    cors() {
      get {
        encodeResponse {
          complete {
            db.listSensorSystems()
          }
        }
      }
    }
  }
}

@Produces(Array(MediaType.APPLICATION_JSON))
@Path("/ss")
trait OneSsService extends GpdvizServiceImpl with Directives {

  def oneSsRoute: Route = {
    strAdd ~ ssGet ~ ssUpdate ~ ssDelete
  }

  @Path("/{sysid}")
  @POST
  @Consumes(Array(MediaType.APPLICATION_JSON))
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(
    summary = "Add a data stream",
    description = "Add a data stream",
    operationId = "registerStream",
    tags = Array("sensor system", "data stream"),
    parameters = Array(
      new Parameter(
        name = "sysid",
        description = "sensor system id",
        in = ParameterIn.PATH,
        required = true,
        schema = new Schema(implementation = classOf[String]),
      ),
    ),
    requestBody = new RequestBody(
      required = true,
      content = Array(new Content(schema = new Schema(implementation = classOf[DataStreamAdd]))),
    ),
    responses = Array(
      new ApiResponse(responseCode = "404", description = "Undefined sensor system"),
    ),
  )
  def strAdd: Route = pathPrefix("api" / "ss" / Segment) { sysid =>
    (post & entity(as[DataStreamAdd])) { strr =>
      complete {
        addDataStream(sysid, strr)
      }
    }
  }

  @Path("/{sysid}")
  @GET
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(
    summary = "Get a sensor system",
    description = "Get a sensor system",
    operationId = "getSystem",
    tags = Array("sensor system"),
    parameters = Array(
      new Parameter(
        name = "sysid",
        description = "sensor system id",
        in = ParameterIn.PATH,
        required = true,
        schema = new Schema(implementation = classOf[String]),
      ),
    ),
    responses = Array(
      new ApiResponse(
        responseCode = "202",
        content = Array(new Content(schema = new Schema(implementation = classOf[SensorSystem]))),
      ),
      new ApiResponse(responseCode = "404", description = "Undefined sensor system"),
    ),
  )
  def ssGet: Route = pathPrefix("api" / "ss" / Segment) { sysid =>
    cors() {
      get {
        encodeResponse {
          complete {
            getSensorSystem(sysid)
          }
        }
      }
    }
  }

  @Path("/{sysid}")
  @PUT
  @Consumes(Array(MediaType.APPLICATION_JSON))
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(
    summary = "Update a sensor system",
    description = "Update a sensor system",
    operationId = "updateSystem",
    tags = Array("sensor system"),
    parameters = Array(
      new Parameter(
        name = "sysid",
        description = "sensor system id",
        in = ParameterIn.PATH,
        required = true,
        schema = new Schema(implementation = classOf[String]),
      ),
    ),
    requestBody = new RequestBody(
      required = true,
      description = "Properties to update. All elements are optional.",
      content =
        Array(new Content(schema = new Schema(implementation = classOf[SensorSystemUpdate]))),
    ),
    responses = Array(
      new ApiResponse(
        responseCode = "201",
        content =
          Array(new Content(schema = new Schema(implementation = classOf[SensorSystemSummary]))),
      ),
      new ApiResponse(responseCode = "404", description = "Undefined sensor system"),
    ),
  )
  def ssUpdate: Route = pathPrefix("api" / "ss" / Segment) { sysid =>
    (put & entity(as[SensorSystemUpdate])) { ssu =>
      complete {
        updateSensorSystem(sysid, ssu)
      }
    }
  }

  @Path("/{sysid}")
  @DELETE
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(
    summary = "Unregister a sensor system",
    description = "Unregister a sensor system",
    operationId = "deleteSystem",
    tags = Array("sensor system"),
    parameters = Array(
      new Parameter(
        name = "sysid",
        description = "sensor system id",
        in = ParameterIn.PATH,
        required = true,
        schema = new Schema(implementation = classOf[String]),
      ),
    ),
    responses = Array(
      new ApiResponse(
        responseCode = "201",
        content =
          Array(new Content(schema = new Schema(implementation = classOf[SensorSystemSummary]))),
      ),
      new ApiResponse(responseCode = "404", description = "Undefined sensor system"),
    ),
  )
  def ssDelete: Route = pathPrefix("api" / "ss" / Segment) { sysid =>
    delete {
      complete {
        deleteSensorSystem(sysid)
      }
    }
  }
}

//@Api(produces = "application/json", tags = Array("data stream"))
@Produces(Array(MediaType.APPLICATION_JSON))
@Path("/ss")
trait OneStrService extends GpdvizServiceImpl with Directives {
  def oneStrRoute: Route = {
    strGet ~ strDelete
  }

  @Path("/{sysid}/{strid}")
  @GET
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(
    summary = "Get a data stream",
    description = "Get a data stream",
    operationId = "getStream",
    tags = Array("data stream"),
    parameters = Array(
      new Parameter(
        name = "sysid",
        description = "sensor system id",
        in = ParameterIn.PATH,
        required = true,
        schema = new Schema(implementation = classOf[String]),
      ),
      new Parameter(
        name = "strid",
        description = "data stream id",
        in = ParameterIn.PATH,
        required = true,
        schema = new Schema(implementation = classOf[String]),
      ),
    ),
    responses = Array(
      new ApiResponse(
        responseCode = "202",
        content = Array(new Content(schema = new Schema(implementation = classOf[DataStream]))),
      ),
      new ApiResponse(responseCode = "404", description = "Undefined sensor system or data stream"),
    ),
  )
  def strGet: Route = {
    pathPrefix("api" / "ss" / Segment / Segment) { case (sysid, strid) =>
      cors() {
        get {
          encodeResponse {
            complete {
              getDataStream(sysid, strid)
            }
          }
        }
      }
    }
  }

  @Path("/{sysid}/{strid}")
  @DELETE
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(
    summary = "Delete a data stream",
    description = "Delete a data stream",
    operationId = "deleteStream",
    tags = Array("data stream"),
    parameters = Array(
      new Parameter(
        name = "sysid",
        description = "sensor system id",
        in = ParameterIn.PATH,
        required = true,
        schema = new Schema(implementation = classOf[String]),
      ),
      new Parameter(
        name = "strid",
        description = "data stream id",
        in = ParameterIn.PATH,
        required = true,
        schema = new Schema(implementation = classOf[String]),
      ),
    ),
    responses = Array(
      new ApiResponse(
        responseCode = "201",
        content =
          Array(new Content(schema = new Schema(implementation = classOf[DataStreamSummary]))),
      ),
      new ApiResponse(responseCode = "404", description = "Undefined sensor system or data stream"),
    ),
  )
  def strDelete: Route = {
    pathPrefix("api" / "ss" / Segment / Segment) { case (sysid, strid) =>
      delete {
        complete {
          deleteDataStream(sysid, strid)
        }
      }
    }
  }
}

//@Api(produces = "application/json", tags = Array("variable definition"))
@Produces(Array(MediaType.APPLICATION_JSON))
@Path("/ss")
trait VariableDefService extends GpdvizServiceImpl with Directives {
  def variableDefRoute: Route = {
    vdAdd
  }

  @Path("/{sysid}/{strid}/vd")
  @POST
  @Consumes(Array(MediaType.APPLICATION_JSON))
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(
    summary = "Add variable definition",
    description = "Add variable definition",
    operationId = "addVariableDef",
    tags = Array("variable definition"),
    parameters = Array(
      new Parameter(
        name = "sysid",
        description = "sensor system id",
        in = ParameterIn.PATH,
        required = true,
        schema = new Schema(implementation = classOf[String]),
      ),
      new Parameter(
        name = "strid",
        description = "data stream id",
        in = ParameterIn.PATH,
        required = true,
        schema = new Schema(implementation = classOf[String]),
      ),
    ),
    requestBody = new RequestBody(
      required = true,
      content = Array(new Content(schema = new Schema(implementation = classOf[VariableDef]))),
    ),
    responses = Array(
      new ApiResponse(
        responseCode = "201",
        content =
          Array(new Content(schema = new Schema(implementation = classOf[VariableDefSummary]))),
      ),
      new ApiResponse(responseCode = "404", description = "Undefined sensor system or data stream"),
    ),
  )
  def vdAdd: Route = {
    pathPrefix("api" / "ss" / Segment / Segment / "vd") { case (sysid, strid) =>
      (post & entity(as[VariableDef])) { vd =>
        complete {
          addVariableDef(sysid, strid, vd)
        }
      }
    }
  }
}

//@Api(produces = "application/json", tags = Array("observation"))
@Produces(Array(MediaType.APPLICATION_JSON))
@Path("/ss")
trait ObsService extends GpdvizServiceImpl with Directives {
  def obsRoute: Route = {
    obsAdd
  }

  @Path("/{sysid}/{strid}/obs")
  @POST
  @Consumes(Array(MediaType.APPLICATION_JSON))
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(
    summary = "Add observations",
    description = "Add observations",
    operationId = "addObservations",
    tags = Array("variable definition"),
    parameters = Array(
      new Parameter(
        name = "sysid",
        description = "sensor system id",
        in = ParameterIn.PATH,
        required = true,
        schema = new Schema(implementation = classOf[String]),
      ),
      new Parameter(
        name = "strid",
        description = "data stream id",
        in = ParameterIn.PATH,
        required = true,
        schema = new Schema(implementation = classOf[String]),
      ),
    ),
    requestBody = new RequestBody(
      required = true,
      content = Array(new Content(schema = new Schema(implementation = classOf[ObservationsAdd]))),
    ),
    responses = Array(
      new ApiResponse(
        responseCode = "201",
        content =
          Array(new Content(schema = new Schema(implementation = classOf[ObservationsSummary]))),
      ),
      new ApiResponse(responseCode = "404", description = "Undefined sensor system or data stream"),
      new ApiResponse(responseCode = "400", description = "Malformed ISO-8601 timestamp"),
    ),
  )
  def obsAdd: Route = {
    pathPrefix("api" / "ss" / Segment / Segment / "obs") { case (sysid, strid) =>
      (post & entity(as[ObservationsAdd])) { obssr =>
        complete {
          addObservations(sysid, strid, obssr)
        }
      }
    }
  }
}

trait StaticAndAjaxService extends GpdvizServiceImpl with Directives {
  def staticAndAjaxRoute: Route = {
    val staticRoute = {
      val index = (get & path(Segment ~ Slash)) { sysid =>
        complete {
          getSensorSystemIndex(sysid)
        }
      }

      val jsStuff = pathSuffix("gpdviz-fastopt.js" / Segments) { _ =>
        getFromResource("gpdviz-fastopt.js")
      } ~ pathSuffix("gpdviz-fastopt.js.map" / Segments) { _ =>
        getFromResource("gpdviz-fastopt.js.map")
      } ~ pathSuffix("gpdviz-jsdeps.js" / Segments) { _ =>
        getFromResource("gpdviz-jsdeps.js")
      }

      val staticFile = (get & path(Segment / Remaining)) { case (sysid, rest) =>
        getFromResource("web/" + rest)
      }

      val staticWeb = get {
        getFromResourceDirectory("web")
      }

      val staticRoot = get {
        getFromResourceDirectory("")
      }

      index ~ staticFile ~ jsStuff ~ staticWeb ~ staticRoot
    }

    staticRoute

//    val ajax = {
//      import scala.concurrent.ExecutionContext.Implicits.global
//      val apiImpl = new ApiImpl(db)
//      val autowireServer = new AutowireServer(apiImpl)
//      post {
//        path("ajax" / Segments) { s =>
//          entity(as[String]) { e =>
//            complete {
//              autowireServer.route[gpdviz.Api](apiImpl)(
//                autowire.Core.Request(
//                  s,
//                  upickle.default.read[Map[String, String]](e)
//                )
//              )
//            }
//          }
//        }
//      }
//    }
//
//    ajax ~ staticRoute
  }
}
