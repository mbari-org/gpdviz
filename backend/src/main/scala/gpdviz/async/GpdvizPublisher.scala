package gpdviz.async

import gpdviz.Notif

trait GpdvizPublisher {
  def details: String

  def publish(notif: Notif): Unit
}
