package controllers

import Schach.{GameFieldModule, Schach}
import _root_.Schach.aview.Tui
import _root_.Schach.controller.controllerComponent.ControllerInterface
import _root_.Schach.model.figureComponent.Figure
import _root_.Schach.util.Observer
import akka.actor.{Actor, ActorRef, ActorSystem, Props}
import com.google.inject.{Guice, Injector}
import models.{ConvertPawn, MovePiece}
import play.api.libs.json.{JsError, JsObject, JsValue, Json, OWrites, Reads}
import play.api.libs.streams.ActorFlow
import play.api.mvc._
import play.mvc.Action.Simple

import javax.inject.Inject

class GameControllerJson @Inject()(cc: ControllerComponents)(implicit system: ActorSystem) extends AbstractController(cc) {
  val controller = Schach.controller;
  var response: Vector[Figure] = Vector.empty

  def gameNew: Action[AnyContent] = Action {
    controller.createGameField()
    Ok(gameFieldToJson).as("application/json")
  }

  def status: Action[AnyContent] = Action {
    Ok(gameFieldToJson)
  }

  def figureMove: Action[JsValue] = Action(parse.json) { implicit request: Request[JsValue] =>
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
      case 1 => "CHECKED"
      case 2 => "CHECKMATE"
      case 3 => "INVALID MOVE"
      case 4 => "PAWN HAS REACHED THE END"
      case 5 => "INVALID CONVERSION"
    }
  }

  def convertPawn: Action[JsValue] = Action(parse.json) { implicit request: Request[JsValue] =>
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
      "type" -> "GameField",
      "data" -> Json.obj(
          "currentPlayer" -> player,
          "status" -> printGameStatus,
          "gameField" ->
            figures
              .filter(element => !element.checked)
              .map { t =>
                Json.obj(
                  "figure" -> t.getClass.getSimpleName,
                  "color" -> {
                    if (t.color.getRed == 0) "BLACK" else "WHITE"
                  },
                  "x" -> t.x,
                  "y" -> t.y)
              }
        )
    )
  }

  def statusUpdateToJson: JsObject = {
    Json.obj(
      "type" -> "StatusUpdate",
      "data" -> Json.obj(
        "currentPlayer" -> { if (controller.getPlayer.getRed == 0) "BLACK" else "WHITE" },
        "status" -> printGameStatus()
      )
    );
  }

  def ws = WebSocket.accept[JsValue, JsValue] { requestHeader =>
    ActorFlow.actorRef { actorRef =>
      SimpleWebSocketActor.props(actorRef)
    }
  }

  object SimpleWebSocketActor {
    def props(clientActorRef: ActorRef) = Props(new SimpleWebSocketActor(clientActorRef))
  }

  class SimpleWebSocketActor(clientActorRef: ActorRef) extends Actor with Observer {
    controller.add(this);
    controller.notifyObservers

    def receive = {
      case jsValue: JsValue =>
        val clientMessage = getMessageType(jsValue)

        clientMessage match {
          case "NewGame" => {
            controller.createGameField()
            clientActorRef ! (statusUpdateToJson)
          }
          case "GetGame" => {
            clientActorRef ! (gameFieldToJson)
          }
          case "MovePiece" => {
            var move = (jsValue \ "data").as[MovePiece]
            controller.movePiece(move.toVec)
          }
          case "ConvertPawn" => {
            var toFigure = (jsValue \ "data").as[String]
            controller.convertPawn(toFigure);
          }
          case "KeepAlive" =>
        }
    }

    def sendResponse(): Unit = {
      controller.getGameStatus() match {
        case 3 | 5 => clientActorRef ! (statusUpdateToJson)
        case _ =>  clientActorRef ! (gameFieldToJson)
      }
    }

    def getMessageType(json: JsValue): String = (json \ "type").as[String]

    override def update: Unit = {
      sendResponse()
    }

  }
}
