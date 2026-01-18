# BitWin System Architecture

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    FRONTEND                                         │
│                              (React + Vite App)                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │  AuthModal  │  │    Game     │  │  PriceCard  │  │ Leaderboard │                 │
│  │  Component  │  │  Component  │  │  Component  │  │  Component  │                 │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                 │
│         │                │                │                │                        │
│         ▼                ▼                ▼                ▼                        │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                         Amplify Data Client (GraphQL)                       │    │
│  │                              aws-amplify/data                               │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         │ HTTPS
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                   AWS CLOUD                                         │
│                                                                                     │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                            AWS COGNITO                                       │   │
│  │                     (User Pool + Identity Pool)                              │   │
│  │                                                                              │   │
│  │  ┌─────────────┐    ┌─────────────────┐    ┌─────────────────────────────┐   │   │
│  │  │   Sign Up   │───▶│   Pre-SignUp    │───▶│     Post-Confirmation       │   │   │
│  │  │   Sign In   │    │    Trigger      │    │         Trigger             │   │   │
│  │  └─────────────┘    │  (Auto-confirm) │    │                             │   │   │
│  │                     └─────────────────┘    └──────────────┬──────────────┘   │   │
│  └───────────────────────────────────────────────────────────┼──────────────────┘   │
│                                                              │                      │
│                                                              ▼                      │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                               │  │
│  │                    POST-CONFIRMATION LAMBDA                                   │  │
│  │                   amplify/auth/post-confirmation                              │  │
│  │  ┌──────────────────────────────────────────────────────────────────────────┐ │  │
│  │  │  • Triggered after successful sign-up                                    │ │  │
│  │  │  • Creates Player record with Cognito userId as primary key              │ │  │
│  │  │  • Initializes score = 0, activeGuess = null                             │ │  │
│  │  └──────────────────────────────────────────────────────────────────────────┘ │  │
│  │                                         │                                     │  │
│  └─────────────────────────────────────────┼─────────────────────────────────────┘  │
│                                            │                                        │
│                                            ▼                                        │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                           AWS APPSYNC                                         │  │
│  │                        (GraphQL API)                                          │  │
│  │                                                                               │  │
│  │   ┌─────────────────────────────────────────────────────────────────────────┐ │  │
│  │   │                         QUERIES (Read-only)                             │ │  │
│  │   │  • Player.get(id) ──────────────────────────────────────▶ DynamoDB      │ │  │
│  │   │  • Player.listByLeaderboardGroupAndScore() ─────────────▶ DynamoDB GSI  │ │  │
│  │   └─────────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                               │  │
│  │   ┌─────────────────────────────────────────────────────────────────────────┐ │  │
│  │   │                    CUSTOM MUTATIONS (Lambda-backed)                     │ │  │
│  │   │                                                                         │ │  │
│  │   │  placeGuess(playerId, direction) ───────▶ PLACE-GUESS LAMBDA            │ │  │
│  │   │  resolveGuess(playerId) ────────────────▶ RESOLVE-GUESS LAMBDA          │ │  │
│  │   └─────────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                               │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                           │                              │                          │
│                           ▼                              ▼                          │
│  ┌────────────────────────────────────┐  ┌────────────────────────────────────────┐ │
│  │      PLACE-GUESS LAMBDA            │  │       RESOLVE-GUESS LAMBDA             │ │
│  │  amplify/functions/place-guess     │  │   amplify/functions/resolve-guess      │ │
│  │                                    │  │                                        │ │
│  │  1. Validate no active guess       │  │  1. Get player & active guess          │ │
│  │  2. Fetch BTC price ──────────┐    │  │  2. Validate 60s has passed            │ │
│  │  3. Store guess with timestamp│    │  │  3. Fetch current BTC price ──────┐    │ │
│  │  4. Return guess details      │    │  │  4. Compare prices                │    │ │
│  │                               │    │  │  5. If unchanged: restart timer   │    │ │
│  └───────────────────────────────┼────┘  │  6. If changed: update score      │    │ │
│                                  │       │  7. Clear active guess            │    │ │
│                                  │       └────────────────────────────────┼───────┘ │
│                                  │                                        │         │
│                                  ▼                                        ▼         │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                           EXTERNAL API                                        │  │
│  │                                                                               │  │
│  │              Coinbase API: https://api.coinbase.com/v2/prices/BTC-USD/spot    │  │
│  │                                                                               │  │
│  │                         Returns: { data: { amount: "104523.45" } }            │  │
│  │                                                                               │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
│                           │                              │                          │
│                           ▼                              ▼                          │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                           AWS DYNAMODB                                        │  │
│  │                                                                               │  │
│  │   ┌─────────────────────────────────────────────────────────────────────────┐ │  │
│  │   │                         PLAYER TABLE                                    │ │  │
│  │   │                                                                         │ │  │
│  │   │  Primary Key: id (Cognito userId)                                       │ │  │
│  │   │                                                                         │ │  │
│  │   │  ┌────────────────┬──────────────────┬─────────┬────────────────────┐   │ │  │
│  │   │  │      id        │      email       │  score  │    activeGuess     │   │ │  │
│  │   │  ├────────────────┼──────────────────┼─────────┼────────────────────┤   │ │  │
│  │   │  │ abc-123-def    │ user@example.com │    5    │ null               │   │ │  │
│  │   │  │ xyz-456-uvw    │ test@email.com   │   -2    │ {"direction":"up", │   │ │  │
│  │   │  │                │                  │         │  "priceAtGuess":   │   │ │  │
│  │   │  │                │                  │         │   104523.45,       │   │ │  │
│  │   │  │                │                  │         │  "guessedAt":...}  │   │ │  │
│  │   │  └────────────────┴──────────────────┴─────────┴────────────────────┘   │ │  │
│  │   │                                                                         │ │  │
│  │   │  GSI: byScore (leaderboardGroup, score DESC)                            │ │  │
│  │   │  - Used for leaderboard queries                                         │ │  │
│  │   └─────────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                               │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Sequences

### 1. User Sign-Up Flow

```
User ──▶ AuthModal ──▶ Cognito SignUp ──▶ Pre-SignUp Lambda (auto-confirm)
                                      ──▶ Post-Confirmation Lambda ──▶ DynamoDB (Create Player)
```

**Steps:**

1. User enters email and password in the AuthModal component
2. Frontend calls Cognito `signUp` API
3. Pre-SignUp Lambda trigger auto-confirms the user (no email verification required)
4. Post-Confirmation Lambda trigger creates a Player record in DynamoDB
5. User is automatically signed in

### 2. Place Guess Flow

```
User clicks "UP/DOWN" ──▶ Game Component ──▶ AppSync Mutation
                                          ──▶ place-guess Lambda
                                              ├──▶ DynamoDB (Get Player, validate)
                                              ├──▶ Coinbase API (Get BTC price)
                                              └──▶ DynamoDB (Update activeGuess)
                                          ──▶ Return to Frontend (start 60s timer)
```

**Steps:**

1. User clicks the UP or DOWN button in the Game component
2. Frontend calls the `placeGuess` GraphQL mutation
3. Lambda validates the player exists and has no active guess
4. Lambda fetches current Bitcoin price from Coinbase API
5. Lambda stores the guess with timestamp in the Player record
6. Frontend receives the response and starts a 60-second countdown timer

### 3. Resolve Guess Flow

```
Timer expires ──▶ useGuess Hook ──▶ AppSync Mutation
                                 ──▶ resolve-guess Lambda
                                     ├──▶ DynamoDB (Get Player + activeGuess)
                                     ├──▶ Coinbase API (Get current BTC price)
                                     ├──▶ Compare prices
                                     │    ├── Same price: Update guessedAt (restart timer)
                                     │    └── Different: Update score (+1/-1), clear guess
                                     └──▶ DynamoDB (Update Player)
                                 ──▶ Return result to Frontend
```

**Steps:**

1. After 60 seconds, the frontend timer triggers resolution
2. Frontend calls the `resolveGuess` GraphQL mutation
3. Lambda retrieves the player's active guess from DynamoDB
4. Lambda fetches the current Bitcoin price from Coinbase
5. Lambda compares the current price with the price at guess time:
   - **Price unchanged**: Timer restarts (guess timestamp updated)
   - **Price changed**: Score updated (+1 if correct, -1 if wrong), guess cleared
6. Frontend displays the result to the user

### 4. Leaderboard Flow

```
Leaderboard Component ──▶ AppSync Query (GSI: byScore)
                      ──▶ DynamoDB (Scan by leaderboardGroup, sort by score DESC)
                      ──▶ Return top players
```

**Steps:**

1. Leaderboard component mounts and calls the query
2. AppSync queries DynamoDB using the `byScore` Global Secondary Index
3. Results are sorted by score in descending order
4. Top players are displayed in the leaderboard

## Tech Stack

### Frontend

- **React 19** - UI framework
- **Vite** - Build tool
- **Material UI** - Component library
- **AWS Amplify Client** - GraphQL client and auth

### Backend (AWS Amplify Gen2)

- **AWS Cognito** - Authentication (User Pool + Identity Pool)
- **AWS AppSync** - GraphQL API
- **AWS Lambda** - Serverless functions for business logic
- **AWS DynamoDB** - NoSQL database

### External APIs

- **Coinbase API** - Real-time Bitcoin price data

## Project Structure

```
amplify/
├── auth/
│   ├── resource.ts                 # Auth configuration
│   ├── pre-sign-up/
│   │   ├── handler.ts              # Auto-confirm users
│   │   └── resource.ts
│   └── post-confirmation/
│       ├── handler.ts              # Create Player record
│       └── resource.ts
├── data/
│   └── resource.ts                 # Schema + custom mutations
├── functions/
│   ├── place-guess/
│   │   ├── handler.ts              # Place guess logic
│   │   └── resource.ts
│   └── resolve-guess/
│       ├── handler.ts              # Resolve guess logic
│       └── resource.ts
└── backend.ts                      # Backend configuration

src/
├── api/
│   ├── auth.ts                     # Sign in/up functions
│   ├── guess.ts                    # Guess API (calls mutations)
│   ├── bitcoinPrice.ts             # Price formatting utilities
│   └── leaderboard.ts              # Leaderboard queries
├── components/
│   ├── AuthModal/                  # Authentication UI
│   ├── Game/                       # Main game component
│   ├── PriceCard/                  # Bitcoin price display
│   ├── ScoreCard/                  # User score display
│   ├── Leaderboard/                # Leaderboard display
│   └── NavigationBar/              # Navigation header
├── hooks/
│   ├── useAuth.ts                  # Authentication state
│   ├── useGuess.ts                 # Guess logic and timer
│   ├── useBitcoinPrice.ts          # Price polling
│   ├── usePlayerScore.ts           # Player score state
│   └── useLeaderboard.ts           # Leaderboard data
└── constants/
    └── game.ts                     # Game constants (60s duration)
```

## Database Schema

### Player Table

| Field              | Type        | Description                             |
| ------------------ | ----------- | --------------------------------------- |
| `id`               | String (PK) | Cognito user ID                         |
| `email`            | String      | User's email address                    |
| `score`            | Integer     | Current score (can be negative)         |
| `activeGuess`      | JSON        | Current active guess or null            |
| `leaderboardGroup` | String      | Partition key for GSI (always "GLOBAL") |

### ActiveGuess Structure

```json
{
  "direction": "up" | "down",
  "priceAtGuess": 104523.45,
  "guessedAt": "2025-01-18T12:00:00.000Z"
}
```

### Global Secondary Index: byScore

- **Partition Key**: `leaderboardGroup`
- **Sort Key**: `score` (descending)
