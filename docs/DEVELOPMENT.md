# Local Development Guide

This guide explains how to set up and run the BitWin project locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20 or higher) - [Download](https://nodejs.org/)
- **npm** (v9 or higher) - Comes with Node.js
- **AWS Account** - [Create Account](https://aws.amazon.com/)
- **AWS CLI** - [Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd bit-win
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure AWS Credentials

Make sure your AWS credentials are configured. You can do this by running:

```bash
aws configure
```

## Running the Application

### Start the Amplify Sandbox (Backend)

The Amplify sandbox creates a personal cloud environment for development. This deploys the backend resources (Cognito, AppSync, DynamoDB, Lambda functions) to your AWS account.

```bash
npx ampx sandbox
```

This command will:

- Deploy all backend resources to AWS
- Generate the `amplify_outputs.json` file with configuration
- Watch for changes and hot-reload the backend

Keep this terminal running while developing.

### Start the Frontend Development Server

In a new terminal window:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

| Command            | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Start the Vite development server    |
| `npm run build`    | Build the production bundle          |
| `npm run preview`  | Preview the production build locally |
| `npm run lint`     | Run ESLint to check for code issues  |
| `npm run test`     | Run tests in watch mode              |
| `npm run test:ui`  | Run tests with Vitest UI             |
| `npm run test:run` | Run tests once (CI mode)             |

## Project Structure

```
bit-win/
├── amplify/                    # AWS Amplify backend
│   ├── auth/                   # Authentication configuration
│   │   ├── pre-sign-up/        # Auto-confirm users
│   │   ├── post-confirmation/  # Create Player on sign-up
│   │   └── resource.ts
│   ├── data/                   # Data schema and API
│   │   └── resource.ts
│   ├── functions/              # Lambda functions
│   │   ├── place-guess/        # Place guess mutation
│   │   └── resolve-guess/      # Resolve guess mutation
│   └── backend.ts              # Backend entry point
├── src/                        # Frontend source code
│   ├── api/                    # API functions
│   ├── components/             # React components
│   ├── hooks/                  # Custom React hooks
│   ├── contexts/               # React contexts
│   ├── constants/              # App constants
│   └── main.tsx                # App entry point
├── docs/                       # Documentation
├── public/                     # Static assets
└── package.json
```

## Development Workflow

### Making Backend Changes

1. Edit files in the `amplify/` directory
2. The sandbox will automatically detect changes and redeploy
3. Wait for the deployment to complete before testing

### Making Frontend Changes

1. Edit files in the `src/` directory
2. Vite will hot-reload the changes automatically
3. Changes appear instantly in the browser

## Useful Links

- [AWS Amplify Gen2 Documentation](https://docs.amplify.aws/gen2/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Material UI Documentation](https://mui.com/)
