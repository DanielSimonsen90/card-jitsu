import LoggerService from "@/services/LoggerService";
import CreateEventHandler from "./_CreateEventHandler";
import { ROUND_END_DELAY_SECONDS } from "../GameStore";

const Logger = LoggerService.createGameEventLogger('declareRoundWinner');

export default CreateEventHandler('declareRoundWinner', async function (winState, winner, card) {
  if (!winner || !card) {
    Logger.info('No winner!')
    if (!card) Logger.info('No winner due to no card.');
  } else Logger.info(`${winner.name} wins with ${card.color} ${card.type} with value ${card.value}. This means that you ${winState === 'win' ? 'won' : 'lost'}!`);

  await new Promise(resolve => setTimeout(resolve, ROUND_END_DELAY_SECONDS * 1000));

  this.checkGameWinner();
});