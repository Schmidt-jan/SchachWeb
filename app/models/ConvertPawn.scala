package models

import play.api.libs.json.{Json, OWrites, Reads}

case class ConvertPawn(toFigure: String) {
}

object ConvertPawn {
  implicit val fromToImplicitReads: Reads[ConvertPawn] = Json.reads[ConvertPawn]
  implicit val fromToImplicitWrites: OWrites[ConvertPawn] = Json.writes[ConvertPawn]
}