package models

import play.api.libs.json.{Json, OWrites, Reads}

case class MovePiece(fromX: Int, toX: Int, fromY: Int, toY: Int) {
  def toVec: Vector[Int] = {
    Vector(this.fromX, this.fromY, this.toX, this.toY)
  }
}

object MovePiece {
  implicit val fromToImplicitReads: Reads[MovePiece] = Json.reads[MovePiece]
  implicit val fromToImplicitWrites: OWrites[MovePiece] = Json.writes[MovePiece]
}