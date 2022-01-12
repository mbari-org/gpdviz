package gpdviz.async

import akka.NotUsed
import akka.actor.{ActorRef, ActorSystem, Props}
import akka.http.scaladsl.model.ws.TextMessage
import akka.stream.Materializer
import org.reactivestreams.{Publisher => RPublisher}
import akka.stream.scaladsl.{Flow, Sink, Source}
import gpdviz._

import scala.concurrent.{ExecutionContext, ExecutionContextExecutor}

class WebSocketPublisher()(implicit
    materializer:     Materializer,
    executionContext: ExecutionContextExecutor,
    system:           ActorSystem,
) extends Publisher {

  def details: String = "WebSockets"

  def publish(notif: Notif): Unit = {
    system.eventStream publish notif
  }

  // Some refs:
  // - https://stackoverflow.com/a/41359874/830737 -- possible mechanism to track connected clients
  // - https://stackoverflow.com/a/35313963/830737
  // - https://groups.google.com/d/msg/akka-user/aA7RD2On_K0/6SJDgOPpAAAJ

  def wsHandler(sysid: String): Flow[Any, TextMessage.Strict, NotUsed] = {
    val dataSource: Source[Notif, ActorRef] =
      Source.fromPublisher[Notif](MyActorPublisher.props(sysid))
    Flow.fromSinkAndSource(
      Sink.ignore,
      dataSource map { notif =>
        TextMessage.Strict(notif.toJsonString)
      },
    )
  }
}

class MyActorPublisher(sysid: String) extends RPublisher[Notif] {
  override def preStart: Unit = context.system.eventStream.subscribe(self, classOf[Notif])

  override def receive: Receive = { case notif: Notif =>
    if (isActive && totalDemand > 0) {
      // Pushes the message onto the stream
      if (sysid == notif.sysid)
        onNext(notif)
    }

  // case x => println("RECEIVE: " + x + " " +x.getClass.getName)
  }
}

object MyActorPublisher {
  def props(sysid: String)(implicit ctx: ExecutionContext): Props = Props(
    new MyActorPublisher(sysid),
  )
}
