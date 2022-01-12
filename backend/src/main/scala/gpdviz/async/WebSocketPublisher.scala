package gpdviz.async

import akka.http.scaladsl.model.ws.TextMessage
import akka.stream.scaladsl.{Flow, Sink, Source}
import akka.stream.{Materializer, OverflowStrategy}
import gpdviz._

class WebSocketPublisher()(implicit materializer: Materializer) extends GpdvizPublisher {

  def details: String = "WebSockets"

  private val (wsActor, wsSource) = Source
    .actorRef[Notif](1024, OverflowStrategy.fail)
    .preMaterialize()

  // client connection was was not consistently successful (.. "terminated abruptly");
  // not sure whether it's a bug or bad setup here, but this helped:
  // https://github.com/akka/akka-http/issues/3039#issuecomment-610125754
  wsSource.runWith(Sink.ignore)

  def publish(notif: Notif): Unit = wsActor ! notif

  def wsHandler(sysid: String): Flow[Any, TextMessage.Strict, Any] = {
    scribe.warn(s"wsHandler: sysid=$sysid")
    Flow.fromSinkAndSource(
      Sink.ignore,
      wsSource
        .filter(_.sysid == sysid)
        // .map(notif => {
        //   println(s"notif=$notif")
        //   notif
        // })
        .map(notif => TextMessage.Strict(notif.toJsonString)),
    )
  }
}
