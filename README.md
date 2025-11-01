# Card Jitsu 🃏❄️🔥💧

A digital recreation of the classic Card Jitsu game from Club Penguin, built with Angular 19 as a **learning experience transitioning from React to Angular**. This project showcases modern Angular development patterns through an event-driven architecture and custom decorators that eliminate common boilerplate code.

Battle against computer opponents using elemental cards in this strategic rock-paper-scissors variant where Fire melts Ice, Ice freezes Water, and Water extinguishes Fire.

**🌐 Live Demo**: [https://angular-card-jitsu.netlify.app/](https://angular-card-jitsu.netlify.app/)

## 🎮 Game Concept

Card Jitsu is a turn-based strategy card game where players compete using cards with three elemental types (Fire, Water, Ice) and various power values (1-20). The objective is to win rounds by either:

- **Elemental Advantage**: Fire beats Ice, Ice beats Water, Water beats Fire
- **Higher Value**: When elements match, the higher card value wins
- **Collection Victory**: First to collect one card of each element with different colors, OR three of the same element with different colors, wins the game

### Game Flow
1. **Deal Phase**: Each player receives 5 cards from their deck
2. **Play Phase**: Players simultaneously select a card to play (with optional redraws. This does not count as a one-turn action)
3. **Check Phase**: Cards are revealed and a round winner is determined
4. **Repeat**: Continue until a player achieves the winning condition

## ⬆️ Custom Decorators - Eliminating Angular Boilerplate

I found Angular's state management to be an excessive amount of boilerplate and developed custom decorators to eliminate unnecessary verbosity in signal handling and event subscriptions.

### @StoreState Decorator

**Problem Solved**: Angular's signal syntax creates verbose boilerplate code with repetitive `.set()` and `.update()` calls throughout state management.

**Solution**: The `@StoreState` decorator transforms regular object properties into reactive signals behind the scenes, providing a clean `store.__state` API that behaves like BehaviorSubjects but with cleaner syntax.

```typescript
// Instead of Angular's verbose signal boilerplate:
gameState = signal<GameState>('idle');
players = signal<Player[]>([]);

// You get clean property access:
@StoreState<State>({
  gameState: 'idle',
  players: [],
  lastWinner: null,
})
export class GameStore extends BaseStore<State> {
  // Access via: this.__state.gameState = 'play'
  // Automatically triggers reactive updates!
}
```

**How it Works**: 
- Automatically converts state properties into Angular signals
- Provides clean getter/setter access that looks like regular properties
- Maintains full reactivity and type safety
- Eliminates the need for `.set()` and `.update()` calls

**Example Implementation**: See [`GameStore.ts`](src/app/stores/GameStore/GameStore.ts) for a real-world usage.

### @AutoSubscribeWithCallback Decorator

**Problem Solved**: Components subscribing to BroadcastService events require repetitive `ngOnInit`/`ngOnDestroy` boilerplate for proper subscription management.

**Solution**: Automatically handles event subscriptions and cleanup, reducing component code and preventing memory leaks.

```typescript
// Instead of manual subscription management:
export class PlayerCardComponent implements OnInit, OnDestroy {
  isCardPlayable = true;
  private subscription: Subscription;
  
  ngOnInit() {
    this.subscription = this.gameStore.on('declareRoundWinner', (state, winner) => {
      this.isCardPlayable = state !== 'win';
      this.updateCardVisuals();
    });
  }
  
  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
  
  updateCardVisuals() {
    // Custom component logic
  }
}

// You get automatic subscription management:
@AutoSubscribeWithCallback(PlayerCardComponent, 'declareRoundWinner', 
  (component, state, winner) => {
    component.isCardPlayable = state !== 'win';
    component.updateCardVisuals();
  }
)
export class PlayerCardComponent {
  isCardPlayable = true;
  // Subscriptions automatically managed - no ngOnInit/ngOnDestroy needed!
  
  updateCardVisuals() {
    // Custom component logic
  }
}
```

**How it Works**:
- Automatically hooks into Angular lifecycle methods (`ngOnInit`/`ngOnDestroy`)
- Establishes event subscriptions when component initializes
- Cleans up all subscriptions when component is destroyed
- Provides type-safe access to component properties within callbacks

**Example Implementation**: See [`AutoSubscribeWithCallback.ts`](src/app/decorators/AutoSubscribeWithCallback.ts) for the decorator source code.

## 🏗️ Architecture Overview

The application follows a modular, service-oriented architecture with custom state management and an event-driven communication system.

### Core Components

- **GameStore**: Central state management using `@StoreState` decorator
- **BroadcastService**: Event-driven communication hub
- **CardService**: Card generation, validation, and manipulation
- **ElementalService**: Elemental type logic and win condition checking
- **AiPlayerService**: Simple random card selection (not strategic AI)
- **TimerService**: Round timing and timeout handling

## 🔄 GameStore Event/Action Infrastructure

The GameStore uses a sophisticated event-driven architecture that separates actions from their handlers, providing a clean and maintainable state management solution.

### Core Events & Actions

#### Game State Events
- **`updateGameState`**: Central state transition handler
  - `'idle'` → Game initialization
  - `'deal'` → Deal cards to players
  - `'play'` → Start new round, begin timer
  - `'check'` → Evaluate round, declare winner
  - `'finish'` → Game completion

#### Player Actions
- **`playCard`**: Handle card selection and validation
- **`redrawCard`**: Process card redraw mechanics
- **`gainRedraw`**: Award redraw opportunities
- **`declareRoundWinner`**: Process round completion

#### Settings & Configuration
- **`settingsChanged`**: React to user preference updates



## 🔒 Data Persistence & Privacy

> **🔒 Complete Privacy**: All data stays on your device. Nothing is transmitted to external servers.

All user data, settings, and preferences are stored locally using `localStorage`. The application works completely offline and respects user privacy by never sending data externally.

**What's Stored Locally:**
- Player profiles and preferences
- Game settings and UI configuration  
- No game state persistence between sessions (for fairness)

## 🛠️ Technical Stack

- **Framework**: Angular 19 with Standalone Components
- **State Management**: Custom Store Pattern with Reactive Decorators
- **Styling**: SCSS with modular component architecture
- **Build Tool**: Angular CLI with ESBuild
- **Deployment**: Netlify with SSR support
- **Package Manager**: npm

## 🎯 Key Features

- **Turn-based Gameplay**: Smooth mechanics with visual feedback and timing systems
- **Computer Opponents**: Simple randomized card selection for single-player experience
- **Card Management**: Dynamic deck building and card redraw mechanics
- **Event-Driven Architecture**: Reactive state management with custom decorators
- **Responsive Design**: Mobile-friendly interface with touch controls
- **Local Persistence**: User preferences saved locally with complete privacy
- **Visual Polish**: Smooth animations and intuitive UI/UX

## 📁 Project Structure

```
src/
├── app/
│   ├── components/                        # UI Components
│   │   ├── app/                          # Root application component
│   │   ├── authentication/               # User authentication
│   │   ├── game/                         # Game-specific components
│   │   ├── main/                         # Main menu and navigation
│   │   └── shared/                       # Reusable UI components
│   ├── decorators/                       # Custom Angular decorators
│   │   ├── StoreState.ts                 # State management decorator
│   │   └── AutoSubscribeWithCallback.ts  # Event subscription decorator
│   ├── services/                         # Business logic services
│   │   ├── AiPlayerService/              # Simple computer opponent
│   │   ├── BroadcastService/             # Event communication
│   │   ├── CardService/                  # Card management
│   │   ├── ElementalService/             # Game rules engine
│   │   ├── LoggerService/                # Debugging and logging
│   │   └── TimerService/                 # Round timing
│   ├── stores/                           # State management
│   │   ├── GameStore/                    # Game state and events
│   │   ├── SettingsStore/                # User preferences
│   │   └── UserStore/                    # Player data
│   ├── models/                           # TypeScript interfaces
│   └── styles/                           # Global styles and themes
├── public/                               # Static assets
│   ├── assets/
│   │   ├── cards/                        # Card images
│   │   ├── mascots/                      # Character images
│   │   └── pfps/                         # Profile pictures
## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Angular CLI (optional, included in project)

### Installation

```bash
# Clone the repository
git clone https://github.com/DanielSimonsen90/card-jitsu.git
cd card-jitsu

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm start
# or
ng serve

# Navigate to http://localhost:4200
```

The application will automatically reload when you modify source files.

### Building

```bash
# Build for production
npm run build

# Build and serve with SSR
npm run serve:ssr:card-jitsu
```

### Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
ng test --watch
```



## 🔧 Development Scripts

```bash
npm start          # Start development server
npm run build      # Production build
npm run watch      # Development build with file watching
npm test           # Run unit tests
npm run prod       # Deploy to Netlify production
```

## 🌟 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Original Card Jitsu game concept by Disney/Club Penguin
- Built as a learning project transitioning from React to Angular
- Showcases modern Angular patterns and custom decorator architecture
- Created by [DanielSimonsen90](https://github.com/DanielSimonsen90)
