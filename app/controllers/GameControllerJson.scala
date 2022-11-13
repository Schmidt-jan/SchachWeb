package controllers

import Schach.GameFieldModule
import Schach.aview.Tui
import Schach.controller.controllerComponent.ControllerInterface
import Schach.model.figureComponent.Figure
import com.google.inject.{Guice, Injector}
import models.{ConvertPawn, MovePiece}
import play.api.libs.json.{JsError, JsObject, JsValue, Json, OWrites, Reads}
import play.api.mvc._

import javax.inject.Inject

class GameControllerJson @Inject()(cc: ControllerComponents) extends AbstractController(cc) {
  val injector: Injector = Guice.createInjector(new GameFieldModule)
  val controller: ControllerInterface = injector.getInstance(classOf[ControllerInterface])
  var response: Vector[Figure] = Vector.empty

  def gameNew: Action[AnyContent] = Action {
    controller.createGameField()
    Ok(gameFieldToJson).as("application/json")
  }

  def status: Action[AnyContent] = Action {
    Ok(gameFieldToJson)
  }

  def figureMove: Action[JsValue] = Action(parse.json) { implicit request : Request[JsValue] =>
    val moveResult = request.body.validate[MovePiece]
    moveResult.fold(
      errors => {
        BadRequest(Json.obj("status" -> "error", "message" -> JsError.toJson(errors)))
      },
      move => {
        controller.movePiece(move.toVec)
        Ok(gameFieldToJson).as("application/json")
      })
  }

  def gameSave: Action[AnyContent] = Action {
    NotImplemented
  }

  def gameLoad: Action[AnyContent] = Action {
    NotImplemented
  }

  def gameSaveToFile: Action[AnyContent] = Action {
    NotImplemented
  }

  def gameLoadFromFile: Action[AnyContent] = Action {
    NotImplemented
  }

  def gameUndo: Action[AnyContent] = Action {
    controller.undo()
    Ok(gameFieldToJson).as("application/json")
  }

  def gameRedo: Action[AnyContent] = Action {
    controller.redo()
    Ok(gameFieldToJson).as("application/json")
  }

  def printGameStatus(): String = {
    controller.getGameStatus() match {
      case 0 => "RUNNING"
      case 1 => "PLAYER " + {
        if (controller.getPlayer().getRed == 0) "Black"
        else "WHITE"
      } + "IS CHECKED"
      case 2 => {
        if (controller.getPlayer().getRed == 0) "BLACK "
        else "WHITE "
      } + "IS CHECKMATE"
      case 3 => "INVALID MOVE"
      case 4 => "PAWN HAS REACHED THE END"
      case 5 => "INVALID CONVERSION"
    }
  }

  def convertPawn(toFigure: String): Action[JsValue] = Action(parse.json) { implicit request : Request[JsValue] =>
    val conversionResult = request.body.validate[ConvertPawn]
    conversionResult.fold(
      errors => {
        BadRequest(Json.obj("status" -> "error", "message" -> JsError.toJson(errors)))
      },
      move => {
        controller.convertPawn(move.toFigure)
        Ok(gameFieldToJson).as("application/json")
      })
  }


  def getPoint(input: Char): Int = {
    input match {
      case 'A' => 0
      case 'B' => 1
      case 'C' => 2
      case 'D' => 3
      case 'E' => 4
      case 'F' => 5
      case 'G' => 6
      case 'H' => 7
      case '1' => 0
      case '2' => 1
      case '3' => 2
      case '4' => 3
      case '5' => 4
      case '6' => 5
      case '7' => 6
      case '8' => 7
      case _ => -1
    }
  }

  def gameFieldToJson: JsObject = {
    val figures = controller.getGameField
    val player = if (controller.getPlayer.getRed == 0) "BLACK" else "WHITE"

    Json.obj(
      "currentPlayer" -> player,
      "status" -> printGameStatus,
      "gameField" ->
        figures
          .filter(element => !element.checked)
          .map { t =>
          Json.obj(
            "figure" -> t.getClass.getSimpleName,
            "color" -> { if (t.color.getRed == 0) "BLACK" else "WHITE" },
            "x" -> t.x,
            "y" -> t.y)
        }
    )
  }
}
