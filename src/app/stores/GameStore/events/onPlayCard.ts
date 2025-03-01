import LoggerService from "@/services/LoggerService";
import CreateEventHandler from "./_CreateEventHandler";

const Logger = LoggerService.createGameEventLogger('playCard');

export default CreateEventHandler('playCard', function (player, card) {
  Logger.warn('Not implemented');
})