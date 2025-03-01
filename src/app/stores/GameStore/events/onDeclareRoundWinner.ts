import LoggerService from "@/services/LoggerService";
import CreateEventHandler from "./_CreateEventHandler";

const Logger = LoggerService.createGameEventLogger('declareRoundWinner');

export default CreateEventHandler('declareRoundWinner', function (winState, winner, card) {
  if (!winner || !card) {
    Logger.info('No winner or card provided');
    return;
  }

  Logger.info(`${winner.name} wins with ${card.color} ${card.type} with value ${card.value}. This means that you ${winState === 'win' ? 'won' : 'lost'}!`);
});