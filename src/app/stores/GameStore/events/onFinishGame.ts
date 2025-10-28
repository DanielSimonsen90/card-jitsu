import LoggerService from "@/services/LoggerService";
import CreateEventHandler from "./_CreateEventHandler";

const Logger = LoggerService.createGameEventLogger('finishGame');

export default CreateEventHandler('finishGame', function (winner) {
  this.resetGame();

  if (winner) Logger.info(`${winner.name} has won the game!`);
  else Logger.info(`Game cancelled, no winner.`);
});