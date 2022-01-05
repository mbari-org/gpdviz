package gpdviz.model.test2ts

import spray.json._

import com.scalatsi._

object helpScalaTsi {
  // This explicit definition is to help scala-tsi with the recursive definition of A and B
  implicit val jsArrayTSI: TSNamedType[JsValue] = {
//    implicit val aReference: TSType[JsValue] = TSType.external[JsArray]("IJsArray")
    TSType.fromSealed[JsValue]
  }
}
import helpScalaTsi._

case class FooWithJsValue(
    foo:     String,
    jsValue: JsValue,
)
