import CreateEventHandler from "./_CreateEventHandler";

export default CreateEventHandler('declareRoundWinner', function (winState, winner, card) {
  // TODO: Check for gameWinner
  
  this.Logger.info('Updating gameState back to "play"');
  this.gameState = 'play';
});