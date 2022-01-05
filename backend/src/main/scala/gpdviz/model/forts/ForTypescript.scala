package gpdviz.model.forts

// module only for typescript generation purposes.

import com.cloudera.science.geojson.Feature
import com.esri.core.geometry.Geometry
import spray.json.JsValue
//
import com.scalatsi.TypescriptType._
import com.scalatsi._

// https://github.com/scala-tsi/scala-tsi/discussions/214#discussioncomment-1911846

object CommonTypes {
  private val JsonValueRef = TSTypeReference("JsonValue")
  final val JsonPrimitive: TypescriptType = TSString | TSNumber | TSBoolean | TSNull
  final val JsonObject: TypescriptType = TSIndexedInterface("member", TSString, JsonValueRef)
  final val JsonValue: TypescriptNamedType =
    TSAlias(JsonValueRef.name, JsonPrimitive | JsonValueRef.array | JsonObject)
}

object ForTypescript {
  implicit val JsValueTsType: TSType[JsValue] = TSType(CommonTypes.JsonValue)
  implicit val FeatureTsType: TSType[Feature] = TSType(CommonTypes.JsonValue)
  implicit val GeometryTsType: TSType[Geometry] = TSType(CommonTypes.JsonValue)
}
