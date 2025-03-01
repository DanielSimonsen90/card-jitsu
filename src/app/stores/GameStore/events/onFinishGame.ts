import LoggerService from "@/services/LoggerService";
import CreateEventHandler from "./_CreateEventHandler";

const Logger = LoggerService.createGameEventLogger('finishGame');

export default CreateEventHandler('finishGame', function (winner) {
  Logger.warn('Not implemented');
});