import CreateEventHandler from "./_CreateEventHandler";

export default CreateEventHandler('settingsChanged', function (settings, changedKey) {
  switch (changedKey) {
    case 'redraw': {
      this.players = this.players.map(player => ({
        ...player,
        availableRedraws: settings.redraw.defaultRedraws
      }));
      break;
    }
  }
})