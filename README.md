# BitWin - Bitcoin Price Prediction Game

A real-time Bitcoin price prediction game built with React and AWS Amplify Gen2. Guess whether the Bitcoin price will go up or down within 60 seconds and compete on the global leaderboard.

## How It Works

1. **Sign Up / Sign In** - Create an account with your email
2. **Make a Prediction** - Guess if Bitcoin's price will go UP or DOWN
3. **Wait 60 Seconds** - The timer counts down while the market moves
4. **See the Result** - Correct guess: +1 point, Wrong guess: -1 point
5. **Climb the Leaderboard** - Compete with other players globally

## Features

- **Real-time Bitcoin Price** - Live price data from Coinbase API
- **Secure Authentication** - Amazon Cognito user authentication
- **Serverless Backend** - AWS Lambda functions for game logic
- **Global Leaderboard** - DynamoDB-powered rankings
- **Modern UI** - Material UI components with responsive design

## Quick Start

```bash
# Install dependencies
npm install

# Start the Amplify sandbox (backend)
npx ampx sandbox

# In a new terminal, start the frontend
npm run dev
```

The app will be available at `http://localhost:5173`

## Documentation

| Document                                 | Description                               |
| ---------------------------------------- | ----------------------------------------- |
| [Development Guide](docs/DEVELOPMENT.md) | How to set up and run the project locally |
| [Architecture](docs/ARCHITECTURE.md)     | System design and data flow diagrams      |

## Tech Stack

### Frontend

- React 19
- Vite
- Material UI
- TypeScript

### Backend (AWS Amplify Gen2)

- AWS Cognito (Authentication)
- AWS AppSync (GraphQL API)
- AWS Lambda (Serverless Functions)
- AWS DynamoDB (Database)

## Project Structure

```
bit-win/
├── amplify/                    # AWS Amplify backend
│   ├── auth/                   # Authentication & triggers
│   ├── data/                   # GraphQL schema
│   └── functions/              # Lambda functions
├── src/                        # React frontend
│   ├── api/                    # API functions
│   ├── components/             # UI components
│   ├── hooks/                  # Custom hooks
│   └── contexts/               # React contexts
├── docs/                       # Documentation
└── package.json
```

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Build for production     |
| `npm run test`  | Run tests                |
| `npm run lint`  | Run ESLint               |

## Deploying to AWS

For detailed instructions on deploying your application, refer to the [AWS Amplify deployment documentation](https://docs.amplify.aws/react/start/quickstart/#deploy-a-fullstack-app-to-aws).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This project is licensed under the MIT-0 License. See the [LICENSE](LICENSE) file for details.
