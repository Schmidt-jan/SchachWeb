package controllers

import Schach.GameFieldModule
import Schach.aview.Tui
import Schach.controller.controllerComponent.ControllerInterface
import Schach.model.figureComponent.Figure
import com.google.inject.{Guice, Injector}
import play.api.libs.Files
import play.api.libs.json.{JsObject, Json}
import play.api.mvc._

import scala.concurrent.ExecutionContext.Implicits.global
import java.io.File
import java.nio.file.Paths
import javax.inject.Inject
import scala.io.Source


class GameController @Inject()(cc: ControllerComponents) extends AbstractController(cc) {
  val injector: Injector = Guice.createInjector(new GameFieldModule)
  val controller: ControllerInterface = injector.getInstance(classOf[ControllerInterface])
  val tui = new Tui(controller)
  controller.notifyObservers
  var response: Vector[Figure] = Vector.empty

  def rules: Action[AnyContent] = Action {
    Ok(views.html.rules())
  }

  def instructions: Action[AnyContent] = Action {
    Ok(views.html.instruction())
  }

  def tuiGame(cmd: String): Action[AnyContent] = Action {
    if (cmd.nonEmpty)
      tui.interactWithUser(cmd)


    val player = if (controller.getPlayer().getRed == 0) "BLACK" else "WHITE"
    Ok(views.html.game(controller.gameField, printGameStatus(), player));
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

  def gameSaveToFile: Action[AnyContent] = Action {
    controller.saveGame()
    Ok.sendFile(inline = false, content = new File("save.json"), fileName = _ => Option("save.json"))
  }

  def gameLoadFromFile: Action[MultipartFormData[Files.TemporaryFile]] = Action(parse.multipartFormData) { request =>
    request.body.files.map { file =>
      file.ref.moveTo(new File("save.json"))
    }
    controller.loadGame()
    Ok(createResponse)
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
      case 1 => "CHECKED"
      case 2 => "CHECKMATE"
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
