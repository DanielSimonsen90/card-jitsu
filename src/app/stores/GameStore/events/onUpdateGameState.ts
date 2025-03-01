import CreateEventHandler from "./_CreateEventHandler";

export default CreateEventHandler('updateGameState', function (gameState) {
  this.Logger.groupCollapsed('[EVENT] updateGameState', gameState);

  switch (gameState) {
    // The store was initialized
    case 'idle': break;

    // Game has started and needs to deal cards to the players
    case 'deal': this.dealCards(); break;

    // The game is now in progress and we're waiting for players to pick their active card
    case 'play': this.startNewRound(); break;

    // All players have picked their active card, and a winner must be determined.
    // Once a winner has been determined, go back to play for another round.
    case 'check': this.findAndDeclareRoundWinner(); break;

    // The game has finished and a winner has been declared
    case 'finish': this.broadcastService.emit('finishGame', this.state.lastWinner); break;

    // Invalid game state
    default: throw new Error(`Invalid game state: ${gameState}`);
  }

  this.Logger.groupEnd();
})