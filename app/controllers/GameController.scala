package controllers

import Schach.GameFieldModule
import Schach.aview.Tui
import Schach.controller.controllerComponent.ControllerInterface
import Schach.model.figureComponent.Figure
import com.google.inject.{Guice, Injector}
import play.api.libs.json.{JsObject, Json}
import play.api.mvc._

import javax.inject.Inject


class GameController @Inject()(cc: ControllerComponents) extends AbstractController(cc) {
  val injector: Injector = Guice.createInjector(new GameFieldModule)
  val controller: ControllerInterface = injector.getInstance(classOf[ControllerInterface])
  val tui = new Tui(controller)
  controller.notifyObservers
  var response: Vector[Figure] = Vector.empty

  def tuiGame(cmd: String): Action[AnyContent] = Action {
    if (cmd.nonEmpty)
      tui.interactWithUser(cmd)

    Ok(createResponse)
  }

  def gameNew: Action[AnyContent] = Action {
    controller.createGameField()
    Ok(createResponse)
  }

  def figureMove(from: String, to: String): Action[AnyContent] = Action {
    if (from.length != 2)
      BadRequest("Length of 'from' needs to be 2")
    if (to.length != 2)
      BadRequest("Length of 'to' needs to be 2")

    val fromX = getPoint(from.charAt(0))
    val fromY = getPoint(from.charAt(1))
    val toX = getPoint(to.charAt(0))
    val toY = getPoint(to.charAt(1))
    val fromTo = Vector(fromX, fromY, toX, toY)

    controller.movePiece(fromTo)
    Ok(createResponse)
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
    Ok(createResponse)
  }

  def gameRedo: Action[AnyContent] = Action {
    controller.redo()
    Ok(createResponse)
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

  def convertPawn(toFigure: String): Action[AnyContent] = Action {
    controller.convertPawn(toFigure)
    Ok(createResponse)
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
      "gameField" -> Json.arr(
        figures.map { t =>
          Json.obj(
            "color" -> player,
            "checked" -> t.checked,
            "x" -> t.x,
            "y" -> t.y)
        }
      )
    )
  }

  def createResponse: String = {
    val player = if (controller.getPlayer().getRed == 0) "BLACK" else "WHITE"
    val status = printGameStatus()
    val gameField = controller.gameFieldToString

    val response = "It's your turn : " + player + "\n" +
      "Status: " + status + "\n" +
      gameField
    response
  }
}
