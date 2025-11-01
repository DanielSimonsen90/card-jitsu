import CreateEventHandler from "./_CreateEventHandler";

export default CreateEventHandler('gainRedraw', function (amount, winner, state) {
  const players = (() => {
    switch (state) {
      case 'all': return this.players;
      case 'losers': return this.players.filter(p => p !== winner);
      case 'winner': return [winner];
    }
  })();

  this.gainRedraw(amount, players);
})