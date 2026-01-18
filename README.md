# BitWin - Bitcoin Price Prediction Game

A real-time Bitcoin price prediction game built with React and AWS Amplify Gen2. Guess whether the Bitcoin price will go up or down within 60 seconds and compete on the global leaderboard.

## Documentation

| Document                                 | Description                               |
| ---------------------------------------- | ----------------------------------------- |
| [Development Guide](docs/DEVELOPMENT.md) | How to set up and run the project locally |
| [Architecture](docs/ARCHITECTURE.md)     | System design and data flow diagrams      |

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



## License

This project is licensed under the MIT-0 License. See the [LICENSE](LICENSE) file for details.
